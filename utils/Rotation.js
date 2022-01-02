/**
 * @author afmika
 */

module.exports = {
    id : () => [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ],

    // x, y, z, w
    _rotzw : (cost, sint) => [
        [cost, -sint, 0, 0],
        [sint, cost, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ],

    _rotyw : (cost, sint) => [
        [cost, 0, -sint, 0],
        [0, 1, 0, 0],
        [sint, 0, cost, 0],
        [0, 0, 0, 1]
    ],

    _rotyz : (cost, sint) => [
        [cost, 0, 0, -sint],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [sint, 0, 0,  cost],
    ],

    _rotxw : (cost, sint) => [
        [1, 0, 0, 0],
        [0, cost, -sint, 0],
        [0, sint, cost, 0],
        [0, 0, 0, 1]
    ],

    _rotxz : (cost, sint) => [
        [1, 0, 0, 0],
        [0, cost, 0, -sint],
        [0, 0, 1, 0],
        [0, sint, 0, cost]
    ],

    _rotxy : (cost, sint) => [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, cost, -sint],
        [0, 0, sint, cost]
    ]
};

