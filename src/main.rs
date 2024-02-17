use spin4::program::Program;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    file: String,

    #[arg(short, long, default_value_t = false)]
    debug: bool,
}

fn main() {
    let args = Args::parse();
    
    let mut program = Program::new();
    let output = program
        .load_file(args.file)
        .and_then(|_| program.run());

    if let Err(e) = output {
        eprintln!("{}", e.to_string());
        return;
    }

    if args.debug {
        program.system.display();
    }
}
