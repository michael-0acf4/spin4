const Matrix = require("../utils/matrix");
const System = require("../utils/System");
const rotation = require("../utils/rotation");

const rot = Matrix.rotHalfPI("yx");

const m1 = Matrix.rotHalfPI("xy");
Matrix.debug(m1, "xy");
const m2 = Matrix.rotHalfPI("xz");
Matrix.debug(m2, "xz");
const pr = Matrix.mult(m1, m2);
Matrix.debug(pr, "prod");

const system = new System();
system.apply(pr);

"xyzw".split("").forEach((a) => {
  console.log(system.extractColumn(a));
});

system.readActivePlane(true);
