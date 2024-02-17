module.exports = {
  id: () => [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],

  // x, y, z, w
  // Rxy
  _rotzw: (cost, sint) => [
    [cost, -sint, 0, 0],
    [sint, cost, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],

  // Rxz
  _rotyw: (cost, sint) => [
    [cost, 0, -sint, 0],
    [0, 1, 0, 0],
    [sint, 0, cost, 0],
    [0, 0, 0, 1],
  ],

  // Rxw
  _rotyz: (cost, sint) => [
    [cost, 0, 0, -sint],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [sint, 0, 0, cost],
  ],

  // Ryz
  _rotxw: (cost, sint) => [
    [1, 0, 0, 0],
    [0, cost, -sint, 0],
    [0, sint, cost, 0],
    [0, 0, 0, 1],
  ],

  // Ryw
  _rotxz: (cost, sint) => [
    [1, 0, 0, 0],
    [0, cost, 0, -sint],
    [0, 0, 1, 0],
    [0, sint, 0, cost],
  ],

  // Rzw
  _rotxy: (cost, sint) => [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, cost, -sint],
    [0, 0, sint, cost],
  ],
};
