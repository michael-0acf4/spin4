const Interpreter = require("./utils/Interpreter");
const fs = require ('fs');

const [, , filename, option] = process.argv;

const content = fs.readFileSync (filename).toString ();

const engine = new Interpreter (content);

function help () {
    console.log('node spin4 your_file [--debug-step|--debug]');
}

(async () => {
    const valid_options = ['--debug-step', '--debug', undefined];
    if (!valid_options.includes (option) || filename == undefined) {
        console.error ('Error parameters');
        help ();
        return;
    }
    await engine.run ((arr) => {
        if (option == '--debug-step') {
            console.log(...arr);
        }
    });
    
    if (option == '--debug-step' || option == '--debug') {
        console.log();
        console.log('Final stack ', engine.system.stack);
        console.log('Final acc', engine.system.accumulator);
        console.log('Core tensor', '\n' + engine.system.core_tensor.map(it => it.join(' ')).join('\n'));
    }
}) ();
