use crate::{mat::Mat4x4, program::Program};

#[test]
fn four_rotation_seq_returns_to_initial_state() {
    let mut program = Program::new();
    program.load_string("  ( _ 0000< 1111  >2222 3333 <4 444>5555>  )");
    program.run().unwrap();

    assert_eq!(program.system.core, Mat4x4::identity());
}

#[test]
fn rotation_works() {
    let mut program = Program::new();
    program.load_string("  ( _ 0>1<0>  )");
    program.run().unwrap();

    assert_eq!(program.system.core, Mat4x4::new(
        -1, 0, 0, 0, 
         0, 0, 1, 0, 
         0, 1, 0, 0, 
         0, 0, 0, 1
    )); 
}