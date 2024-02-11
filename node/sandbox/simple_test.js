const Matrix = require ('../utils/Matrix');
const System = require('../utils/System');
const system = new System ();
/*
- xy as `0`
- xz as `1`
- xw as `2`
- yz as `3`
- yw as `4`
- zw as `5`
*/
const rot = ['xy', 'xz', 'xw', 'yz', 'yw', 'zw'];
let acc = [0, 0];
let str = '5>0>5>0>';

// remove spaces
str = str.replace(/ /g, '');

let dir_map = {'>' : true, '<' : false};
for (let i = 0; i < str.length;) {
    let c = parseInt(str[i++]);
    let dir = dir_map[str[i++]]; 
    let plane = rot[c];
    system.apply (Matrix.rotHalfPI (plane, dir));
    let temp = system.readActivePlane ();
    acc = acc.map((v, i) => v + (temp[i].isReversed ? -1 : 1));
    console.log('rotation ', plane, dir ? '90deg' : '-90deg', str[i - 1]);
    console.log('Rev ', temp.map((it, i) => (it.isReversed ? '-' : '+') + '1') );
    console.log(acc);
}
