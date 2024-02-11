use std::{fs, path::Path};
use anyhow::{bail, Context, Result};
use core::fmt::Debug;
use crate::{mat::{rot_plane, Axis}, system::System};

struct Program {
    source: Vec<u8>,
    system: System,
    stack: Vec<i32>,
    pos: usize
}

static PLANE_DEF: &[(Axis, Axis); 6] = &[
    (Axis::X, Axis::Y),
    (Axis::X, Axis::Z),
    (Axis::X, Axis::W),
    (Axis::Y, Axis::Z),
    (Axis::Y, Axis::W),
    (Axis::Z, Axis::W),
]; 

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

    pub fn load_file<P: AsRef<Path> + Debug + Clone>(&mut self, path: P) -> Result<()> {
        self.source = fs::read_to_string(path.clone())
            .with_context(|| format!("loading file {:?}", path))?
            .as_bytes()
            .to_owned();
        Ok(())
    }

    pub fn run(&mut self) -> Result<()> {
        while self.pos < self.source.len() {
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
            _ => Ok(())
        }
    }

    fn handle_rotation(&mut self) -> Result<()> {
        self.next_char('(')?;
        let op = self.curr();
        let mut planes = vec![];
        while self.curr() != ')' {
            let c = self.curr();
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

        todo!("rotate and update x, y reg on the go")
    }

    fn handle_loop(&mut self) -> Result<()> {
        self.next_char('{')?;
        todo!("nested")
    }

    fn curr(&self) -> char {
        self.source[self.pos] as char
    }

    fn jump(&mut self, pos: usize) {
        self.pos = pos;
    }

    fn next(&mut self) {
        self.pos += 1;
        while self.curr().is_whitespace() {
            self.next();
        }
    }

    fn next_char(&mut self, c: char) -> Result<()> {
        self.next();
        if self.curr() != c {
            bail!(format!("{:?} was expected at pos {}", c, self.pos));
        }
        Ok(())
    }
}
