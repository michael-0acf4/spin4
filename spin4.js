const Interpreter = require ('./utils/Interpreter');
const fs = require ('fs');

const [, , filename, option, addit_opt] = process.argv;

const content = fs.readFileSync (filename).toString ();

const engine = new Interpreter (content);

function help () {
    console.log('node spin4 your_file [--debug-step|--debug]');
}

(async () => {
    // cmdline options
    let list_options = [];
    if (option) list_options.push (option);
    if (addit_opt) list_options.push (addit_opt);

    const valid_options = ['--debug-step', '--debug', '--code'];
    for (let opt of list_options) {
        if (!valid_options.includes(opt)) {
            console.error ('Error parameters');
            help ();
            return;
        }
    }

    // run
    try {
        await engine.run ((arr) => {
            if (list_options.includes ('--debug-step')) {
                console.log(...arr);
            }
        });
        
        // additional infos
        if (list_options.includes ('--debug-step') || list_options.includes ('--debug')) {
            console.log();
            console.log('Final stack ', engine.system.stack);
            console.log('Final acc', engine.system.accumulator);
            console.log('Core tensor', '\n' + engine.system.core_tensor.map(it => it.join(' ')).join('\n'));
        }
    
        if (list_options.includes ('--code')) {
            console.log('\nClean code', engine.code);
        }
    } catch (err) {
        console.error (err);
    }
}) ();
