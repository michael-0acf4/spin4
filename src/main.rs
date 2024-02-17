use std::io::Write;

use spin4::program::Program;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    file: Option<String>,

    #[arg(short, long, default_value_t = false)]
    debug: bool,
}

pub fn load_program() -> String {
    print!(">> ");
    std::io::stdout().flush().ok();
    let mut line = String::new();
    std::io::stdin().read_line(&mut line).ok();
    line  
}

fn main() {
    let args = Args::parse();
    
    match args.file {
        Some(path) => {
            let mut program = Program::new();
            let output = program
                .load_file(path)
                .and_then(|_| program.run());
    
            if let Err(e) = output {
                eprintln!("{}", e.to_string());
                return;
            }
            if args.debug {
                program.system.display();
            }
        },
        None => {
            println!(r#"Welcome to spin4 interactive mode, type "clear" to reset."#);
            let mut program = Program::new();
            loop {
                let text = load_program();
                if text.trim() == "clear" {
                    program = Program::new();
                    continue;
                }
                program.load_string(&text);
                if let Err(e) = program.run() {
                    println!("=======");
                    print!("{}", e.to_string());
                } else {
                    println!("\n=======");
                    program.system.display();
                }
                println!("\n=======\n");
            }
        },
    }


}
