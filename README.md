# Spin4
Spin4 is an esoteric programming language based on 4D rotations in order to do computations.

# Why ?
Why not? Someone had to do it.

# afSpin4 Interpeter
The current afSpin4 interpeter is definitely not optimised but serves only as a proof of concept.
```
node afspin4 examples/hello-world-ez.txt
node afspin4 examples/hello-world-ez.txt --debug
node afspin4 examples/hello-world-ez.txt --debug-step
```

# Basic overview
- An accumulator vector with 2 components : register X and Y
    - We accumulate values along the way by doing addition, substraction, multiplication or integer division
    - We can operate on both components X, Y
    - The value of the stack is incremented/decremented as we rotate in the 4D-space
- A single stack
    - We can push the value of the accumulator one component at a time ie. push the value of X or Y
    - We can push directly with the standard input (interpreted as a number)
    - It can be rotated (left / right)
    - We can pop the top element
    - We can display the top element as a number or as an ASCII character.

# Examples
## Hello World
Hello World program in Spin4
```
{(+1>)x?y}(+0000>)*[<][<][y]y[>][>][x]x*[>][>][y]y[<][<][x]+[x]+[.c]
[x]x+[x]+[x]+[x]+[<][yx]y[>]-(+1054<5401>012111<)x(+0>)x[.c][<][<][<]
[<][yx]xy[>][>][>][>]+[xy]y+[.c][.c][x]x[<][<][<][y]y[>][>][>]+[.c][x]
x+[>][>][x]x[<][y]x[<][<][<][<][<][<][.c][<][<][.c]y[.c][y][xy][yx][xy]
[y][.c][xy][.c][yx][.c]
```
## Fibonacci sequence
As a tradition, here is the Fibonacci sequence in Spin4. This program takes a positive integer n as an input (stdin) and then print the n-first Fibonacci number.
```
[,n](+00>)y*[y]*[x]*[>][x](-00<)(+0>)xxx[.n][<][.c][>][.n][xy]xy
{[xy]+x[xy]xy[<][.c][>][.n][>][>][yx]y-[yx]yx[>][>][>]?y}
```

# Main instructions
- Arithmetic operators `+`, `-`, `/`, `*`, `_` : add, sub, mult, int div, do nothing
- `(op x)`
    - op can be any of the above arithmetic operators
    - x is a sequence of ordered rotation : for example `(+ 1>1<01>)` is equivalent to `(+01>)`
- `x` or `y` : push a specific component of the accumulator to the stack
    Example :
    - `(+03<5>)x` push -1 to the stack, accumulator vector is `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)yx` push 1 then -1 to the stack, accumulator vector is `[-1, 1]`
        - stack := ... 1 -1
    - `(+03<5>)*` push -1 ie. `x=-1 * y=1` to the stack, accumulator vector is `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)x+y` push -1 then 0 then 1, accumulator vector is `[-1, 1]`
        - stack := ... -1 0 1
    - `(+03<5>)yx/+x` push 1, -1, -1, 0, then -1, accumulator vector is `[-1, 1]`
        - stack := ... 1 -1 -1 0 -1
- `[>]`/`[<]` : rotate the stack to the right/left
- `[x]`, `[y]`, `[xy]` or `[yx]` : pop the stack and put the value(s) in the accumulator components/accumulator
- `[.n]` : prints the top element as a number
- `[.c]` : prints the top element as a char
- `[,n]` : number input (int32)
- `[,c]` : char input
- Loop : start = `{` / end = `?t}`, t is either `x` or `y` ie. it checks a single accumulator component and breaks if the value is 0.
    Example :
    - `{(+50>)?x}y` stops as soon as the accumulator x component is 0 then pushes y component value to the stack

# Main concept
## Rotation 90deg `>` or -90deg `<`
In 4D, we can form a total of 6 planes from the base vectors, a plane of rotation is the equivalent concept to the center of rotation in 2D ie. there is always an invariant plane under a 4D rotation.
- xy as `0` (xy-plane is invariant)
- xz as `1` (xz-plane is invariant)
- xw as `2` (xw-plane is invariant)
- yz as `3` (yz-plane is invariant)
- yw as `4` (yw-plane is invariant)
- zw as `5` (zw-plane is invariant)

* We start a rotation or a sequence of rotations with the syntax `(main_operator seq_of_rotation)`
* What happens to the accumulator after a rotation ?
    - The accumulator vector state is changed : X, Y increments/decrements
    - The system becomes oriented in some way
    - Conceptually speaking, in order to compute the next state of the accumulator vector,
    Spin4 takes the two only base vectors which generate the same plane as `[1, 0, 0, 0]` and `[0, 1, 0, 0]`
    Say for example that we have `[-1, 0, 0, 0]` and `[0, 1, 0, 0]` in the system matrix, the orientation signature becomes `[-1, 1]`, we can then compute the next accumulator state `current_acc + [-1, 1]`

- Case 1 : The `do nothing` operator `_`
Example : 
    In some case, we just want to do a sequence of rotation and do nothing along the way.
    In the expression `(_03>5<)`, the accumulator vector remains [0, 0]

- Case 2 : Doing addition/substraction/... as we are rotating
Example : `(+03<5>)`
    - Rotate 0 (90deg), add according to the orientation of the congruent plane to the initial xy
        - acc = [0, 0] `+` [+1, +1] = [1, 1]
    - Rotate 3 (90deg), add according to the orientation of the congruent plane to the initial xy
        - acc = [1, 1] `+` [-1, +1] = [0, 2]
    - Rotate 5 (-90deg), add according to the orientation of the congruent plane to the initial xy
        - acc = [0, 2] `+` [-1, -1] = [-1, 1]
The accumulator vector then becomes [-1, 1]
 
1. What is the state of the accumulator after `(-01>3<)` or `(-0>1>3<)` ?
    - acc = [0, 0] `-` [+1, +1] = [1, 1]
    - acc = [1, 1] `-` [+1, -1] = [0, 2]
    - acc = [0, 2] `-` [+1, -1] = [-1, 1]

2. Does something like `(+01>(-11<)) ` make sense ?
=> No because in the pattern `(op x)`, op has to be an arithmetic operator and x has to be a series of rotation.  

## Basics on the accumulator vector
Say for example, acc = [2, 4]
* Arithmetic operators `+`, `-`, `/`, `*`
    - For example the + in the code `... +/ ...` adds up 2 and 4 in the accumulator, the result is stored in the stack

- For example the `x` in the expression `(-01>3<)x` extracts the x component of the accumulator and store it in the stack
- We can pull values from the stack and put them in the accumulator
    - `[x]` or `[y]` : pop the stack and put the value in the register and overwrites the value of the corresponding component
    - `[yx]` : pop the stack, put the first value in y, pop the stack, put the value in x
    - `[xy]` : same as above but in the reverse order