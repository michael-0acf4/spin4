use crate::{mat::Mat4x4, program::Program, sys_types::{PointerDir, Stack}};

#[test]
fn four_rotation_seq_returns_to_initial_state() {
    let mut program = Program::new();
    program.load_string("  ( _ 0000< 1111  >2222 3333 <4 444>5555>  )");
    program.run().unwrap();

    assert_eq!(program.system.core, Mat4x4::identity());
}

#[test]
fn rotation_and_stack_works() {
    let mut program = Program::new();
    program.load_string("(+034>1<)xy(-0<)xxy");
    program.run().unwrap();

    assert_eq!(program.system.core, Mat4x4::new(
        0, 0, 0, 1,
        1, 0, 0, 0,
        0,-1, 0, 0,
        0, 0, 1, 0
    )); 

    assert_eq!(program.system.stack, Stack {
        dir: PointerDir::Right,
        items: vec![2, 4, 1, 1, 3]
    }); 
}

#[test]
fn nested_loop() {
    let mut program = Program::new();
    program.load_file("examples/basic-loop.txt").unwrap();
    program.run().unwrap();
    assert_eq!(program.system.core, Mat4x4::identity()); 
    assert_eq!(program.system.stack, Stack {
        dir: PointerDir::Right,
        items: vec![12]
    }); 
    program.system.display();
}