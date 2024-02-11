use crate::mat::{rotPlane, Axis};

pub mod mat;

fn main() {
    println!("{:?}", rotPlane(Axis::X, Axis::Y, false).unwrap());
}
