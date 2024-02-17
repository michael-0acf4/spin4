const System = require("./System");
const Matrix = require("./Matrix");

module.exports = class Interpreter {
  constructor(code) {
    this.code = code || "";
    this.clean();

    this.system = new System();
    this.loop_stack = [];

    this.bin_operator = {
      "+": (x, y) => x + y,
      "-": (x, y) => x - y,
      "/": (x, y) => {
        if (y == 0) {
          throw this.error(true, "division by 0");
        }
        return Math.floor(x / y);
      },
      "*": (x, y) => x * y,
      "_": (x, y) => null,
    };
  }

  /**
   * Remove comments, tabs, ..etc
   */
  clean() {
    this.code = this.code.replace(/[ \n\t\r]|"(.*?)"/gi, "");
  }

  /**
   * @param {boolean} isLogical
   * @param {string} msg
   */
  error(isLogical, msg) {
    const prefix = isLogical ? "Logic" : "Syntax";
    throw Error(prefix + ": " + msg);
  }

  beginRotationAt(cursor, debug_fun = undefined) {
    const planes = ["xy", "xz", "xw", "yz", "yw", "zw"];
    const indices = "012345", rotation_str = "<>";
    const orientation_map = { "<": true, ">": false };

    const operator = this.code[cursor++];
    const accumulator_func = this.bin_operator[operator];
    if (accumulator_func == undefined) {
      throw this.error(
        false,
        `Operator <${operator}> unrecognized, cursor = ${cursor - 1}`,
      );
    }

    let list = [],
      c = this.code[cursor];

    while (c != ")") {
      if (indices.includes(c)) {
        // is a number
        list.push(parseInt(c));
      } else {
        // is either > or <
        if (rotation_str.includes(c)) {
          if (list.length == 0) {
            throw this.error(
              false,
              `Expected a plane index 0 .. 5 but got directly a ${c}, cursor = ${
                cursor - 1
              }`,
            );
          }
          for (let axis_index of list) {
            let plane = planes[axis_index];
            let makeMinus = orientation_map[c];
            this.system.apply(Matrix.rotHalfPI(plane, makeMinus));

            let active_axis = this.system.readActivePlane();
            // update the accumulator vector
            if (operator !== "_") {
              this.system.accumulator = this.system.accumulator.map((v, i) => {
                return accumulator_func(v, active_axis[i].isReversed ? -1 : 1);
              });
            }
            if (debug_fun) {
              let ostr = (makeMinus ? "-" : "+") + "90deg";
              let vecs = `[${
                active_axis.map((it, i) => it.isReversed ? -1 : 1).join(", ")
              }]`;
              let accs = `[${this.system.accumulator.join(", ")}]`;
              debug_fun([
                "[rot]",
                `rotate ${axis_index} (${plane}) ${ostr}, ${operator} ${vecs} -> acc = ${accs}`,
              ]);
            }
          }
        } else {
          throw this.error(
            false,
            `Unrecognized token or axis index <${c}>, cursor = ${cursor}`,
          );
        }

        // reset the list
        list = [];
      }
      c = this.code[++cursor];
    }
    if (list.length > 0) {
      throw this.error(
        false,
        `Missing rotation operator < or > for axis ${
          list[0]
        }, cursor = ${cursor}`,
      );
    }
    return cursor + 1;
  }

  /**
   * * `[>]`/`[<]` : rotate the stack to the right/left
   * * `[x]`, `[y]`, `[xy]` or `[yx]` : pop the stack and put the value(s) in the accumulator
   * * `[.n]` : prints the top stack value as a number
   * * `[.c]` : prints the top stack value as a char
   * * `[,n]` : number input (int32)
   * * `[,c]` : char input
   */
  async beginStackOperation(cursor, debug_fun = undefined) {
    const first_tk = this.code[cursor++];
    const second_tk = this.code[cursor++];

    if ("<>".includes(first_tk)) {
      // roll
      if (first_tk == ">") this.system.rotateStackRight();
      if (first_tk == "<") this.system.rotateStackLeft();
      if (debug_fun) {
        debug_fun(["[stk]", "rotate " + first_tk]);
      }
      if (second_tk !== "]") {
        throw this.error(
          false,
          `Unrecognized token ${
            this.code[cursor]
          }, expected to be <]>, cursor ${cursor}`,
        );
      }
      return cursor;
    }

    // stdout
    if (first_tk == ".") {
      switch (second_tk) {
        case "n":
          await this.system.outputAsNumber();
          if (debug_fun) {
            debug_fun(["\n[---]", "stdout : " + this.system.peek()]);
          }
          break;
        case "c":
          await this.system.outputAsChar();
          if (debug_fun) {
            debug_fun(["\n[---]", "stdout : " + this.system.peekAsChar()]);
          }
          break;
        default:
          throw this.error(
            false,
            `Unrecognized token ${this.code[cursor]}, cursor ${cursor}`,
          );
      }
    }

    // stdin
    if (first_tk == ",") {
      switch (second_tk) {
        case "n":
          await this.system.inputAsNumber();
          break;
        case "c":
          await this.system.inputAsChar();
          break;
        default:
          throw this.error(
            false,
            `Unrecognized token ${this.code[cursor]}, cursor ${cursor}`,
          );
      }
    }

    // [x], [y], [xy] or [yx]
    // this is a little bit awful but it does the job
    const components = "xy";
    let components_count = 0;
    if (components.includes(first_tk)) {
      const value = this.system.stack.pop() || 0;
      this.system.accumulator[components.indexOf(first_tk)] = value;
      if (debug_fun) {
        debug_fun([
          "[stk]",
          `pop value ${value}, set acc ${first_tk} as ${value}`,
        ]);
      }
      components_count++;
    }

    if (components.includes(second_tk)) {
      const value = this.system.stack.pop() || 0;
      this.system.accumulator[components.indexOf(second_tk)] = value;
      if (debug_fun) {
        debug_fun([
          "[stk]",
          `pop value ${value}, set acc ${second_tk} as ${value}`,
        ]);
      }
      components_count++;
    }

    // we can be 100% sure there isn't anything more to process

    // x or y only
    if (components_count == 1) cursor--;

    if (this.code[cursor] != "]") {
      throw this.error(
        false,
        `Unrecognized token ${
          this.code[cursor]
        }, expected to be <]>, cursor ${cursor}`,
      );
    }
    return cursor + 1;
  }

  /**
   * * Syntax ?x} or ?y}
   */
  endLoopAt(cursor, debug_fun = undefined) {
    // ? skipped
    const components = "xy";
    const which_component = this.code[cursor++]; // x or y
    const end_loop = this.code[cursor++]; // }

    if (!components.includes(which_component)) {
      throw this.error(
        false,
        `Unrecognized token ${which_component}, expected to be only x or y, cursor ${cursor}`,
      );
    }
    if (end_loop != "}") {
      throw this.error(
        false,
        `Unrecognized token ${end_loop}, expected to be <}>, cursor ${cursor}`,
      );
    }
    const pos = components.indexOf(which_component);
    let message = "";
    if (this.system.accumulator[pos] == 0) {
      message = `stop loop n.${this.loop_stack.length}`;
      this.loop_stack.pop();
    } else {
      message = `repeat loop n.${this.loop_stack.length}`;
      cursor = this.loop_stack[this.loop_stack.length - 1];
    }

    if (debug_fun) {
      debug_fun(["[ < ]", message]);
    }

    return cursor;
  }

  async run(debug_fun = undefined) {
    let cursor = 0;
    while (cursor < this.code.length) {
      const c = this.code[cursor];
      let pass = false;
      if (c == "(") {
        cursor = this.beginRotationAt(cursor + 1, debug_fun);
        pass = true;
      }

      if (c == "[") {
        cursor = await this.beginStackOperation(cursor + 1, debug_fun);
        pass = true;
      }

      if (c == "{") {
        this.loop_stack.push(cursor + 1);
        let n = this.loop_stack.length;
        pass = true;
        if (debug_fun) {
          debug_fun(["[ > ]", `start loop n.${n}`]);
        }
        cursor++;
      }

      if (c == "?") { // ?x} end loop
        cursor = this.endLoopAt(cursor + 1, debug_fun);
        pass = true;
      }

      // operation on the accumulator
      if ("+-/*".includes(c)) {
        const result = this.bin_operator[c](...this.system.accumulator);
        if (result !== null) {
          this.system.stack.push(result);
        }
        if (debug_fun) {
          debug_fun(["[acc]", "binary operation " + c]);
        }
        pass = true;
        cursor++;
      }

      if ("xy".includes(c)) {
        const components = "xy";
        const pos = components.indexOf(c);
        const extracted = this.system.accumulator[pos];
        this.system.stack.push(extracted);
        if (debug_fun) {
          debug_fun(["[acc]", `push ${c} = ${extracted} to the stack`]);
        }
        pass = true;
        cursor++;
      }

      if (!pass) {
        throw this.error(
          false,
          `Unrecognized token <${c}>, cursor = ${cursor}`,
        );
      }
    }
  }
};
