# Basics
[ok] push raw value to one of the two stack
[ok] push register value to one of the two stack
[ok] pop from stack and push to another
[ok] pop
[ok] main binary operations
  - pop both and operate
[ok] roll the a given stack

[?] swap the two first value of a given stack
[?] Loop work by doing some op (rot push etc) and stops as soon as given stack top value evaluates to 0\\
[?] stdin

# Intro
Spin4 is an esoteric programming language that consist of spinning a 4D space in order to compute stuff.
- An accumulator vector (composed with 2 registers X and Y)
    - we accumulate values along the way by doing an addition, substraction, multiplication or integer division
    - we can operate on both of them using addition substraction integer division...etc
- A single working stack
    - its content is pushed by extracting the current accumulator value one component at a time ie. push the value of X or Y
    - can be rotated
    - we can pop the last value
    - we can peek at the last value (print)

# Syntax

## Rotation 90deg `>` or -90deg `<` on a plane
There is a total of 6 possible rotation for each axis.
- xy as `0`
- xz as `1`
- xw as `2`
- yz as `3`
- yw as `4`
- zw as `5`
* We begin a rotation or a group of ordered rotations by using the the symbols `(` and `)`
- Case 1 : No operators... well technically we have to use the `do nothing` operator `_`
Example : We just want to rotate 90deg/xy, 90deg yz and -90deg/zw
We get `(_03>5<)`, in this case the accumulator vector remains [0, 0] intially as we did nothing

- Case 2 : Doing addition/substraction/... as we are rotating
Example : adding `(+03<5>)`
    - Rotate 0 90deg, add according to the orientation of the congruent plane to initial-xy
        - acc = [0, 0] `+` [+1, +1] = [1, 1]
    - Rotate 3 90deg, add according to the orientation of the congruent plane to initial-xy
        - acc = [1, 1] `+` [-1, +1] = [0, 2]
    - Rotate 5 -90deg, add according to the orientation of the congruent plane to initial-xy
        - acc = [0, 2] `+` [-1, -1] = [-1, 1]
In other words, after this instruction the accumulator vector becomes [-1, 1]

* Example :
1. What is the accumulator vector value after `(-01>3<)` or `(-0>1>3<)` ?
    - acc = [0, 0] `-` [+1, +1] = [1, 1]
    - acc = [1, 1] `-` [+1, -1] = [0, 2]
    - acc = [0, 2] `-` [+1, -1] = [-1, 1]

2. Does something like `(+01>(-11<)) ` make sense ?
=> No because in the pattern `(op x)`, op has to be an operator and x has to be a series of rotation not another object.  

## Basics on the accumulator vector
Say for example, acc = [2, 4]
* Arithmetic operators `+`, `-`, `/`, `*`
    - For example the + in the code `... +/ ...` adds up 2 and 4 in the accumulator, the result is stored in the stack

- For example the `x` in the code `(-01>3<)x` extract the x component of the accumulator and store it in the stack
- We can pull values from the stack and put them in the accumulator
    - `[x]` or `[y]` : pop the stack and put the value in the register and overwrites the value of the corresponding component
    - `[yx]` : pop the stack, put the first value in y, pop the stack, put the value in x
    - `[xy]` : same as above but in the reverse order

# General overview
## Operators :
- `+`, `-`, `/`, `*`, `_` : add, sub, mult, int div, do nothing (can be directly used on the accumulator vector)
- `(op x)`
    - op can be any of the above
    - x has to be a series of ordered rotation : for example `(+ 1>1<01>)` is equivalent to `(+01>)`
- pushing the register value in the stack : just write `x` or `y`
    Example :
    - `(+03<5>)x` push the value -1 to the stack, accumulator vector is `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)yx` push the value 1 then -1 to the stack, accumulator vector is `[-1, 1]`
        - stack := ... 1 -1
    - `(+03<5>)*` push the value -1 ie. `x=-1 * y=1` to the stack, accumulator vector is `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)x+y` push the value -1 then 0 then 1, accumulator vector is `[-1, 1]`
        - stack := ... -1 0 1
    - `(+03<5>)yx/+x` push the value 1, -1, -1, 0, then -1, accumulator vector is `[-1, 1]`
        - stack := ... 1 -1 -1 0 -1
- `[>>>..]`/`[<<..<]` : rotate the stack to the right/left
- `[x]`, `[y]`, `[xy]` or `[yx]` : pop the stack and put the value(s) in the accumulator
- `[.n]` : prints the top stack value as a number
- `[.c]` : prints the top stack value as a char
- `[,n]` : number input (int32)
- `[,c]` : char input
- Loop : start = `{`, end = `?t}` where t is either accumulator `x` or `y`, breaks if the value of t is 0.
    Example :
    - `{(+50>)?x}y` stops as soon as the accumulator x-component is 0 then pushes y-component value to the stack