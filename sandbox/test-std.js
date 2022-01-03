const readline = require('readline');

function readInput () {
    const rl = readline.createInterface ({
        input : process.stdin, output : process.stdout
    });
    return new Promise ((resolve, reject) => {
        rl.question('>', (ans) => {
            resolve (ans);
            rl.close();
        });
    });
}

function writeOutput (str) {
    const rl = readline.createInterface ({
        input : process.stdin, output : process.stdout
    });
    rl.write (str);
    rl.close ();
}

(async () => {
    console.log(await readInput ());
    writeOutput ('hello');
}) ();