use anyhow::{anyhow, Result};

pub enum Reg {
    X, Y
}

impl TryFrom<char> for Reg {
    type Error = anyhow::Error;
    fn try_from(value: char) -> Result<Reg> {
        match value {
            'x' => Ok(Reg::X),
            'y' => Ok(Reg::Y),
            _ => Err(anyhow!("{value} is not a valid register"))
        }
    }
}

#[derive(PartialEq)]
pub enum PointerDir {
    Left, Right
}

impl TryFrom<char> for PointerDir {
    type Error = anyhow::Error;
    fn try_from(value: char) -> Result<PointerDir> {
        match value {
            '<' => Ok(PointerDir::Left),
            '>' => Ok(PointerDir::Right),
            _ => Err(anyhow!("{value} is not a valid direction"))
        }
    }
}

pub enum InOut {
    Stdin, Stdout
}

impl TryFrom<char> for InOut {
    type Error = anyhow::Error;
    fn try_from(value: char) -> Result<InOut> {
        match value {
            ',' => Ok(InOut::Stdin),
            '.' => Ok(InOut::Stdout),
            _ => Err(anyhow!("{value} is not a valid I/O command"))
        }
    }
}

pub enum InOutType {
    Char, Num
}

impl TryFrom<char> for InOutType {
    type Error = anyhow::Error;
    fn try_from(value: char) -> Result<InOutType> {
        match value {
            'c' => Ok(InOutType::Char),
            'n' => Ok(InOutType::Num),
            _ => Err(anyhow!("{value} is not a valid I/O command"))
        }
    }
}


pub struct Stack {
    pub dir: PointerDir,
    pub items: Vec<i32>
}


pub enum BinOperator {
    Add, Sub, Mult, Div, Noop
}

impl TryFrom<char> for BinOperator {
    type Error = anyhow::Error;
    fn try_from(value: char) -> Result<BinOperator> {
        match value {
            '+' => Ok(BinOperator::Add),
            '-' => Ok(BinOperator::Sub),
            '*' => Ok(BinOperator::Mult),
            '/' => Ok(BinOperator::Div),
            '_' => Ok(BinOperator::Noop),
            _ => Err(anyhow!("{value} is not a valid operator"))
        }
    }
}

impl BinOperator {
    pub fn compute(&self, a: i32, b: i32) -> Result<i32> {
        match self {
            BinOperator::Add => Ok(a + b),
            BinOperator::Sub => Ok(a - b),
            BinOperator::Mult => Ok(a * b),
            BinOperator::Div => a.checked_div(b).ok_or(anyhow!("cannot divide {a} by 0")),
            BinOperator::Noop => Ok(a),
        }
    }
}
