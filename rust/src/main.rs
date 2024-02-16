use spin4::program::Program;

fn main() {
    let mut program = Program::new();
    program.load_string(r"
    { {
        (+0>)
         (+0>)?y} 
         
         ?x}
    ");
    match program.run() {
        Ok(_) => {
            // program.system.display();
            // println!("{:?}", );
        },
        Err(e) => {
            println!("{:?}", e);
        },
    }
}
