use std::{fs, path::Path};
use anyhow::{bail, Context, Result};
use core::fmt::Debug;
use crate::system::System;

struct Program {
    source: Vec<u8>,
    system: System,
    stack: Vec<f32>
}

impl Program {
    pub fn new() -> Self {
        Self { 
            source: vec![],
            system: System::new(),
            stack: vec![],
        }
    }

    pub fn reset(&mut self) {
        self.system = System::new();
        self.stack = vec![];
    }

    pub fn load_file<P: AsRef<Path> + Debug + Clone>(&mut self, path: P) -> Result<()> {
        self.source = fs::read_to_string(path.clone())
            .with_context(|| format!("loading file {:?}", path))?
            .as_bytes()
            .to_owned();
        Ok(())
    }

    pub fn run(&self) -> Result<()> {
        let mut pos: usize = 0;
        while pos < self.source.len() {
            match self.source[pos] as char {
                '(' => {
                    pos += 1;
                    let _op = self.source[pos] as char;
                    todo!("rotate and update x, y reg on the go")
                },
                '{' => todo!("loop closing after ?x|y}}"),
                '[' => todo!("pop, io"),
                'x' | 'y' => todo!("push x, y"), 
                _ => {}
            }
        }
        Ok(())
    }
}
