# Quantum Simulator in JavaScript

This project is the result of work done during an independent study into Quantum Computation in the Spring 2020 semester at UCCS. It's based on weekly work suggested by Ryan O'Donnell in his course [15-859BB: Quantum Computation and Quantum Information 2018](http://www.cs.cmu.edu/~odonnell/quantum18/) at Carnegie Mellon Univeristy.

## Running it

```
npm install
node index.js [number of qubits] [circuit description]
```

The circuit description is a file with on gate instruction per line. A gate instruction consists of the gate name followed by the qubit(s) on to which to apply the gate. Supported quantum gates, where *i*, *j*, and *k* are independent qubits:

- `not i` (Pauli X)
- `z i` (Pauli Z)
- `hadamard i`
- `cnot i j` (Pauli X on qubit *j*, conditioned on qubit *i*)
- `swap i j`
- `ccnot i j k` ((Toffoli) `cnot j k` conditioned on *i*)
- `cswap i j k` (`swap j k` conditioned on *i*)

