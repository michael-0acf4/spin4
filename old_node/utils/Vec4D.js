module.exports = class Vec4D {
  constructor(x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
  }

  asArray() {
    return [this.x, this.y, this.z, this.w];
  }

  dot(other) {
    const a = this.asArray(),
      b = other.asArray();
    let s = 0;
    for (let i = 0; i < 4; s += a[i] * b[i], i++);
    return s;
  }
};
