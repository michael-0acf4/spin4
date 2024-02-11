use std::{fs, path::Path};
use anyhow::{bail, Context, Result};
use core::fmt::Debug;
use crate::{mat::{rot_plane, Axis}, system::System};

pub struct Program {
    source: Vec<char>,
    pos: usize,
    pub system: System,
    pub stack: Vec<i32>,
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
            stack: vec![],
            pos: 0
        }
    }

    pub fn reset(&mut self) {
        self.system = System::new();
        self.stack = vec![];
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
        while !self.is_eof() {
            self.next_state()?;
        }
        Ok(())
    }

    fn next_state(&mut self) -> Result<()> {
        match self.curr() {
            '(' => self.handle_rotation(),
            '{' => self.handle_loop(),
            '[' => todo!("pop, io"),
            'x' | 'y' => todo!("push x, y"), 
            _ => {
                self.next();
                Ok(())
            }
        }
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
                            let rot4x4 = rot_plane(u, v, if c == '<' { true } else { false })?;
                            self.system.apply(rot4x4);
                            let pair = self.system.active_plane_signature();
                            self.system.apply_signature(pair, op);
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

    fn handle_loop(&mut self) -> Result<()> {
        let outer_pos = self.pos;
        self.next_char('{')?;
        self.next_state()?; // ensure nested loop handling
        // ?x} or ?y}
        if self.curr() == '?' {
            self.next();
            let stop = match self.curr() {
                'x' => self.system.acc_x == 0,
                'y' => self.system.acc_y == 0,
                other => bail!(format!("expected x or y, got {other} omstead"))
            };
            if !stop {
                self.jump(outer_pos);
            }
        }
        self.next_char('}')?;
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
}
