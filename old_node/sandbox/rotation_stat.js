const Matrix = require("../utils/Matrix");
const System = require("../utils/System");

function shouldBeASinglePlane() {
  const system = new System();
  const rot = ["xy", "zw", "yx", "xz", "yz", "xw"];
  const rot_count = {}; // stat
  for (let t = 0; t < 1000; t++) {
    const r = Math.floor(Math.random() * rot.length);
    const reverse = Math.random() < 0.5;
    const mat = Matrix.rotHalfPI(rot[r], reverse);
    system.apply(mat);

    // stats
    if (rot_count[rot[r]] === undefined) {
      rot_count[rot[r]] = { _90deg: 0, _m90deg: 0, total: 0 };
    }
    rot_count[rot[r]]._90deg += reverse ? 0 : 1;
    rot_count[rot[r]]._m90deg += reverse ? 1 : 0;
    rot_count[rot[r]].total++;
  }

  console.log(rot_count);
  const debug = true;
  console.log(system.readActivePlane(debug));
}

shouldBeASinglePlane();
