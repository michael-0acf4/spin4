# spin4
spin4 is an esoteric programming language that uses 4D rotations for computations. Its main philosophy is to write programs by rotating the 4D space which encodes a state, this state is then used to increment or decrement the registers. The register values can be put on the stack, the later can also be rotated in one direction.

# Why ?
Yes.

# spin4 interpeter
The current spin4 interpeter is not optimised and serves only as a proof of concept.
Installation
```
cargo install spin4
```

```
Usage: spin4 [OPTIONS] --file <FILE>

Options:
  -f, --file <FILE>  
  -d, --debug        
  -h, --help         Print help
  -V, --version      Print version
```

# Basic overview
Ultimately, a spin4 program has
- An accumulator vector with 2 components: register X and Y
    - We accumulate values as we perform *rotations* by doing addition, substraction, multiplication or integer division
    - We can operate on its component X, 
    - The value of the stack is incremented/decremented as we rotate in the 4D-space
- A single stack:
    - We can push the value of the accumulator one component at a time i.e. push the value of X or Y
    - We can perform a push with the standard input
    - It can be rotated left or right
    - We can pop the top element to one of the registers
    - We can display the top element

# Examples
## Hello World
Hello World program in spin4
```
{(+1>)x?y}(+0000>)*[<][<][y]y[>][>][x]x*[>][>][y]y[<][<][x]+[x]+[.c][x]x+[x]+[x]+[x]+[<][yx]y[>]-(+1054<5401>012111<)x(+0>)x[.c][<][<][<][<][yx]xy[>][>][>][>]+[xy]y+[.c][.c][x]x[<][<][<][y]y[>][>][>]+[.c][x]x+[>][>][x]x[<][y]x[<][<][<][<][<][<][.c][<][<][.c]y[.c][y][xy][yx][xy][y][.c][xy][.c][yx][.c]
```

## Fibonacci sequence
As a tradition, here is the Fibonacci sequence in spin4. This program takes a positive integer n as an input (stdin) and then prints a list of the n first Fibonacci numbers.
```
[,n](+00>)y*[y]*[x]*[>][x](-00<)(+0>)xxx[.n][<][.c][>][.n][xy]xy{[xy]+x[xy]xy[<][.c][>][.n][>][>][yx]y-[yx]yx[>][>][>]?y}
```
# Concepts
## Rotation < for -π/2 and > for +π/2
In 4D, we can form a total of 6 planes from the base vectors, a plane of rotation is the equivalent concept to the center of rotation in 2D i.e. there is always an invariant plane under a 4D rotation.
- xy as `0` (xy-plane is invariant)
- xz as `1` (xz-plane is invariant)
- xw as `2` (xw-plane is invariant)
- yz as `3` (yz-plane is invariant)
- yw as `4` (yw-plane is invariant)
- zw as `5` (zw-plane is invariant)

* We start a rotation or a sequence of rotations with the syntax `(main_operator seq_of_rotation)`
* What happens to the accumulator after a rotation ?
    - The accumulator vector state is changed: X and Y increment/decrement
    - The system becomes oriented in some way
    - Conceptually speaking, in order to compute the next state of the accumulator vector,
    spin4 takes the two only base vectors which generate the same plane as $\vec{u} = (1 \space 0  \space 0  \space 0)^T$ and $\vec{v} = (0 \space 1 \space 0 \space 0)^T$.
    Suppose for example that we have the columns $(0 \space -1 \space 0 \space 0)^T$ and $(1 \space 0 \space 0 \space 0)^T$ in the system matrix, the orientation signature becomes `[-1, 1]`, we can then compute the next accumulator state `current_acc + [-1, 1]`.

    The easiest implementation for computing the signature is to iterate through each column pair combination $(\vec{u}', \vec{v}')$ that satisfies the projections $\vec{u}.\vec{v}'=0$ and $\vec{u}'.\vec{v}=0$, which basically guarantees that the generated plane is congruent to the initial.

    A nice trick is to notice that a $\pm \pi / 2$ rotation applied on the identity matrix or a signed permutation of its columns will always result on a [generalized permutation matrix](https://en.wikipedia.org/wiki/Generalized_permutation_matrix) whose non-zero entries are `-1`, `1`, we can simply extract the relevant entries with some algebra.

$$T_{t} \leftarrow R_{Index, Dir} T_{t-1}$$

$$(Acc_X \space Acc_Y)_{t+1} \leftarrow
    \begin{pmatrix}1 & 0 & 0 & 0 \\\ 0 & 1 & 0 & 0\end{pmatrix}
    T_{t}
    \begin{pmatrix}1 \\\ 1 \\\ 1 \\\ 1\end{pmatrix}$$


## Instructions
- Arithmetic operators `+`, `-`, `/`, `*`, `_` (no op).
- Rotation sequence `(Op Seq)`
    - `Op` can be any of the above binary operator
    - `Seq` is a sequence of ordered rotation\
For example `(+1>1<01>)` is equivalent to `(+01>)`

- `x` or `y` : push a specific component of the accumulator to the stack.\
    Examples :
    - `(+03<5>)x` => push -1 to the stack, accumulator `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)yx` => push 1 then -1 to the stack, accumulator `[-1, 1]`
        - stack := ... 1 -1
    - `(+03<5>)*` => push -1 (or x=-1 * y=1) to the stack, accumulator `[-1, 1]`
        - stack := ... -1
    - `(+03<5>)x+y` => push -1 then 0 then 1, accumulator vector is `[-1, 1]`
        - stack := ... -1 0 1
    - `(+03<5>)yx/+x` => push 1, -1, -1, 0, then -1, accumulator `[-1, 1]`
        - stack := ... 1 -1 -1 0 -1
- `[>]`/`[<]` : rotate stack right/left
- `[x]`, `[y]`, `[xy]` or `[yx]` : pop the stack then put the value(s) in the corresponding accumulator component in order
- `[.n]` : print the top element as a number
- `[.c]` : print the top element as a char
- `[,n]` : number input (int32)
- `[,c]` : char input
- Loop `{ .. ?t}`: t is either `x` or `y`, it checks a single accumulator component and breaks if the value is 0.

    Example :
    - `{(+50>)?x}y` stops as soon as the accumulator x component is 0 then pushes y component value to the stack


## More examples..
- Example 1 : The `no op` operator `_`

    In some case, we just want to do a sequence of rotation and do nothing along the way.
    In the expression `(_03>5<)`, the accumulator vector remains `[0, 0]`.

- Example 2 : Doing addition/substraction/... as we are rotating.
    
    Consider the following program `(+03<5>)`
    - Rotate 0 (90deg), perform addition according to the orientation of the congruent plane to the initial xy
        - acc = [0, 0] `+` [+1, +1] = [1, 1]
    - Rotate 3 (90deg), perform addition according to the orientation of the congruent plane to the initial xy
        - acc = [1, 1] `+` [-1, +1] = [0, 2]
    - Rotate 5 (-90deg), perform addition according to the orientation of the congruent plane to the initial xy
        - acc = [0, 2] `+` [-1, -1] = [-1, 1]
The accumulator vector then becomes [-1, 1]

- Example 3 :

    Let `acc = [2, 4]`

    The `+` in a program `.. + ..` computes 2 + 4, the result is stored in the stack.

- Example 4:

    The `x` in the expression `(-01>3<)x` extracts the `x` component of the accumulator and store it in the stack.

# Links
* [Spin4 Wiki](https://esolangs.org/wiki/Spin4)
