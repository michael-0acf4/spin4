const Interpreter = require("./utils/Interpreter");
const fs = require ('fs');

const [, , filename] = process.argv;

const content = fs.readFileSync (filename).toString ();

const engine = new Interpreter (content);
engine.run ((arr) => {
    console.log(...arr);
});

console.log('Final stack ', engine.system.stack);