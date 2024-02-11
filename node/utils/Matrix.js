const Rotation = require ('./Rotation');

module.exports = class Matrix {

    /**
     * @param {string} axis_str xy
     * @param {boolean} inverse true := 90deg, -90deg otherwise 
     */
    static rotHalfPI (axis_str = 'xy', inverse = false) {
        let mat = Rotation['_rot' + axis_str];
        if (mat === undefined)
            mat = Rotation['_rot' + axis_str.split('').reverse().join('')]; // reverse str, ex : given yx but it should be xy
        if (mat === undefined)
            throw Error ('Rotation matrix ' + axis_str + ' does not exist');
        // t = +- pi/2
        const cost = 0, sint = inverse ? -1 : 1;
        return mat (cost, sint);
    }

    static debug (mat, msg = '') {
        console.log(msg + '[');
        for (let row of mat)
            console.log('', row);
        console.log(']');
    }

    /**
     * @param {number[][]} A 
     * @param {number[][]} B
     * @returns {number[][]}
     */
    static mult (A, B) {
        const dim = A.length;
        const res = new Array(dim);
        for (let i = 0; i < dim; i++) {
            res[i] = new Array(dim);
            for (let j = 0; j < dim; j++) {
                let s = 0;
                for (let k = 0; k < dim; k++)
                    s += A[i][k] * B[k][j];
                res[i][j] = s;
            }
        }
        return res;
    }
}