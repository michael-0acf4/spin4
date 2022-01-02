const Rotation = require("./Rotation");
const Matrix = require("./Matrix");
const Vec4D = require("./Vec4D");

module.exports = class System {
    constructor () {
        this.stack = [];
        this.accumulator = [0, 0];
        this.core_tensor = Rotation.id ();
        // intial xy-plane
        this.projection_plane = [new Vec4D(1, 0, 0, 0), new Vec4D(0, 1, 0, 0)];
    }

    /**
     * @param {number[][]} mat 
     */
    apply (mat) {
        this.core_tensor = Matrix.mult (mat, this.core_tensor);
    }

    /**
     * @param {string?} axis x, y, z or w
     * @returns JSON {axis : string, vec : Vec4D}
     */
    extractColumn (axis = 'x') {
        const poss_axis = 'xyzw';
        axis = axis.toLowerCase();
        if (poss_axis.includes (axis)) {
            let index = poss_axis.indexOf (axis);
            return {
                axis : axis,
                vec : new Vec4D(
                    this.core_tensor[0][index],
                    this.core_tensor[1][index],
                    this.core_tensor[2][index],
                    this.core_tensor[3][index]
                )
            };
        }
        return null;
    }

    /**
     * * Since the cross product doesnt work in higher dim like 4D
     * * We must use the dot product to identify the congruent plane to the initial-xy-plane
     *  which is by definition the only reference that could give us the current two-stacks + orientation datas
     * * We are using +-pi/2 rotations which means that a plane must be congruent to the initial-xy-plane no
     *  matter how many times we rotate the system, by identifying the vectors generating this plane
     *  we can tell the axis and the orientation (up/down := top stack / stack reversed)
     * @param {debug_mode?} boolean
     * @returns [{isReversed : boolean, axis : string, vec : Vec4D}, {isReversed : boolean, axis : string, vec : Vec4D}]
     */
    readActivePlane (debug_mode = false) {
        const current_planes = [
            'xy', 'yx', 
            'xz', 'zx', 
            'xw', 'wx',
            'yw', 'wy',
            'zw', 'wz',
            'yz', 'zy'
        ];
        const init_x = this.projection_plane [0];
        const init_y = this.projection_plane [1];
        let plane_count = 0;
        let ans = null;
        for (let plane of current_planes) {
            // extract the column from the core tensor
            const axis_a = this.extractColumn (plane[0]);
            const axis_b = this.extractColumn (plane[1]);

            const dot_a = axis_a.vec.dot (init_x);
            const dot_b = axis_b.vec.dot (init_y);
            // 100% sure they are either perpendicular or colinear
            // => colinear means the dot product is not 0 in our particular setup that only uses 90deg rotations
            // if dot < 0 then the given axis is in the opposite direction of y^ or x^
            if (dot_a != 0 && dot_b != 0) {
                ans = [
                    {isReversed : dot_a < 0, ... axis_a}, 
                    {isReversed : dot_b < 0, ... axis_b}
                ];
                if (debug_mode) {
                    console.log('Plane found u, v = ', axis_a.axis, ',' , axis_b.axis);
                    plane_count++;
                } else 
                    break;
            }
        }
        if (debug_mode)
            console.log('Count', plane_count, 'plane, expected to be 1');
        return ans;
    }

    /**
     * Extract the relevant stack given an axis
     * @param {number} index 
     */
    filterByInitialPlaneVecIndex (index) {
        if (index < 0 || index > this.projection_plane.length)
            throw Error ('Invalid index given');
        let v = this.projection_plane [index];
        const res = this.readActiveStacks (false);
        for (let extracted of res) {
            if (v.dot(extracted.vec) != 0)
                return extracted;
        }
        return null; // should never happen within a proper context call
    }

    /**
     * Rotate the stack array in-place (O(n) time / O(1) space)
     */
    rotateStackRight () {
        const arr = this.stack;
        let temp = arr[0];
        for (let i = 0; i < arr.length; i++) {
            let next = (i + 1) % arr.length;
            let temp2 = arr[next];
            arr[next] = temp;
            temp = temp2;
        }
    }

    /**
     * Rotate the stack array in-place (O(n) time / O(1) space)
     */
    rotateStackLeft () {
        const arr = this.stack;
        let temp = arr[arr.length - 1];
        for (let i = arr.length - 1; i >= 0; i--) {
            let prev = i - 1 + (i == 0 ? arr.length : 0);
            let temp2 = arr[prev];
            arr[prev] = temp;
            temp = temp2;
        }
    }

    /**
     * @returns Stack top value
     */
    peek () {
        return this.stack[this.stack.length - 1];
    }

    /**
     * @returns Stack top value as a char
     */
    peekAsChar () {
        let n = this.stack[this.stack.length - 1];
        return String.fromCharCode (n);
    }
}