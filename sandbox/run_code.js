const Interpreter = require("../utils/Interpreter");
const fs = require ('fs');

const content = fs.readFileSync ('./sandbox/code/stack-op.txt').toString ();

const engine = new Interpreter (content);
engine.run ((arr) => {
    console.log(...arr);
});

console.log('Final stack ', engine.system.stack);