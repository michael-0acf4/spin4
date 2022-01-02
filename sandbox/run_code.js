const Interpreter = require("../utils/Interpreter");
const fs = require ('fs');
const content = fs.readFileSync ('./sandbox/code.txt').toString ();
const engine = new Interpreter (content);
engine.run ((arr) => {
    console.log(...arr);
});

console.log(engine.system.stack);