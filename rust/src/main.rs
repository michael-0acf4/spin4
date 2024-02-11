use spin4::program::Program;


fn main() {
    let mut program = Program::new();
    program.load_string("  ( _ 00>1<0>  )");
    match program.run() {
        Ok(_) => {
            program.system.display();
            // println!("{:?}", );
        },
        Err(e) => {
            println!("{:?}", e);
        },
    }
}
