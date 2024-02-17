use std::{fs, path::Path};
use anyhow::{bail, Context, Result};
use core::fmt::Debug;
use crate::{mat::{rot_plane, Axis}, sys_types::BinOperator, system::System};

pub struct Program {
    source: Vec<char>,
    pos: usize,
    pub system: System,
}

static PLANE_DEF: &[(Axis, Axis); 6] = &[
    (Axis::X, Axis::Y),
    (Axis::X, Axis::Z),
    (Axis::X, Axis::W),
    (Axis::Y, Axis::Z),
    (Axis::Y, Axis::W),
    (Axis::Z, Axis::W),
];

fn strip_source(s: &str) -> Vec<char> {
    s.chars()
        .filter(|c| !c.is_whitespace())
        .collect::<Vec<_>>()
}

impl Program {
    pub fn new() -> Self {
        Self { 
            source: vec![],
            system: System::new(),
            pos: 0
        }
    }

    pub fn reset(&mut self) {
        self.system = System::new();
        self.pos = 0;
    }

    pub fn load_string(&mut self, s: &str) {
        self.source = strip_source(s);
    }

    pub fn load_file<P: AsRef<Path> + Debug + Clone>(&mut self, path: P) -> Result<()> {
        let raw_source = fs::read_to_string(path.clone())
            .with_context(|| format!("loading file {:?}", path))?;
        self.source = strip_source(&raw_source);
        Ok(())
    }

    pub fn run(&mut self) -> Result<()> {
        let mut loop_stack = vec![];
        while !self.is_eof() {
            match self.curr() {
                '(' => self.handle_rotation()?,
                '[' => self.handle_brackets()?,
                'x' | 'y' => self.handle_push()?, 
                '+' | '-' | '*' | '/' => self.handle_acc_binop(self.curr().try_into()?)?,
                '{' => {
                    self.next_char('{')?;
                    let loop_start = self.pos;
                    loop_stack.push(loop_start);
                },
                '"' => self.handle_comment()?,
                '?' => {
                    self.next_char('?')?;
                    let stop = match self.curr() {
                        'x' => self.system.acc_x == 0,
                        'y' => self.system.acc_y == 0,
                        other => bail!(format!("expected x or y, got {other} instead"))
                    };
                    // ?x} or ?y}
                    if stop {
                        self.next_char_either(&['x', 'y'])?;
                        self.next_char('}')?;
                        loop_stack.pop();
                    } else {
                        match loop_stack.last() {
                            Some(pos) => self.jump(pos.to_owned()),
                            None => bail!("invalid loop ending at position {} {}", self.pos, self.curr()),
                        }
                    }
                }
                _ => self.next()
            }
        }
        Ok(())
    }


    fn handle_rotation(&mut self) -> Result<()> {
        self.next_char('(')?;

        let op = self.curr();
        self.next();

        let mut planes = vec![];
        while self.curr() != ')' {
            let c = self.curr();
            self.next();

            if c >= '0' && c <= '5' {
                planes.push(c);
            } else {
                match c {
                    '<' | '>' => {
                        if planes.len() == 0 {
                            bail!(format!("Expected a plane index 0 .. 5 but got directly a {:?}, at pos {}", c, self.pos));
                        }
                        for plane in planes.iter() {
                            let ascii_index = plane.clone() as usize;
                            let offset = '0' as usize;
                            let (u, v) = PLANE_DEF[ascii_index - offset].clone();
                            let rot4x4 = rot_plane(u, v, c.try_into()?)?;
                            self.system.apply(rot4x4, op.try_into()?)?;
                        }
                        planes.clear();
                    },
                    _ => bail!(format!("Unrecognized token or axis index {:?}, at pos {}", c, self.pos))
                }
            }
        }

        if !planes.is_empty() {
            bail!(format!("Unrecognized token or axis index {:?}, at pos {}", self.curr(), self.pos))
        }

        self.next_char(')')?;
        Ok(())
    }

    /// `[>]`/`[<]` : rotate the stack to the right/left\
    /// `[x]`, `[y]`, `[xy]` or `[yx]` : pop the stack and put the value(s) in the corresponding accumulator\
    /// `[.n]` : print the top stack value as a number\
    /// `[.c]` : print the top stack value as a char\
    /// `[,n]` : number input (int32)\
    /// `[,c]` : char input\
    fn handle_brackets(&mut self) -> Result<()> {
        self.next_char('[')?;

        let fst = self.next_char_either(&['.', ',', '<', '>', 'x', 'y'])?;
        match fst {
            '.' | ',' => {
                let snd = self.next_char_either(&['n', 'c'])?;
                self.system.process_io(fst.try_into()?, snd.try_into()?)?;
            },
            '<' | '>' => self.system.rotate_stack(fst.try_into()?),
            'x' | 'y' => {
                let snd = self.next_char_either(&['x', 'y', ']'])?;
                match snd {
                    'x' | 'y' => {
                        self.system.pop_to(fst.try_into()?);
                        self.system.pop_to(snd.try_into()?);
                    },
                    _ => {
                        self.system.pop_to(fst.try_into()?);
                        return Ok(()); // ] is already consumed
                    }
                }
            }
            impossible => panic!("fatal: token {impossible} unexpected")
        }

        self.next_char(']')?;
        Ok(())
    }

    fn handle_push(&mut self) -> Result<()> {
        let acc = self.next_char_either(&['x', 'y'])?;
        self.system.push_from(acc.try_into()?);
        Ok(())
    }

    fn handle_acc_binop(&mut self, op: BinOperator) -> Result<()> {
        self.next(); // consume op
        self.system.push_acc_op(op)?;
        Ok(())
    }

    fn handle_comment(&mut self) -> Result<()> {
        self.next_char('"')?;
        while self.curr() != '"' {
            self.next();
        }
        self.next_char('"')?;
        Ok(())
    }

    fn is_eof(&self) -> bool {
        self.pos >= self.source.len()
    }

    fn curr(&self) -> char {
        self.source[(self.source.len() - 1).min(self.pos)] as char
    }

    fn jump(&mut self, pos: usize) {
        self.pos = pos;
    }

    fn next(&mut self) {
        self.pos += 1;
    }

    fn next_char(&mut self, c: char) -> Result<()> {
        if self.curr() != c {
            bail!(format!("{:?} was expected at pos {}, got {:?} instead", c, self.pos, self.curr()));
        }
        self.next();
        Ok(())
    }

    fn next_char_either(&mut self, chars: &[char]) -> Result<char> {
        if !chars.contains(&self.curr()) {
            let choices = chars
                .iter()
                .map(|s| s.to_string())
                .collect::<Vec<_>>()
                .join(", ");
            bail!(format!("{} was expected at pos {}, got {:?} instead", choices, self.pos, self.curr()));
        }
        let ret = self.curr();
        self.next();
        Ok(ret)
    }
}
