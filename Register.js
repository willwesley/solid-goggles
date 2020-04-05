const math = require('mathjs');

// |0>
const ket0 = math.matrix([[1], [0]]);

// |0><0|
const ket0projector = math.kron(ket0, math.transpose(ket0));

// |1>
const ket1 = math.matrix([[0], [1]]);

// |1><1|
const ket1projector = math.kron(ket1, math.transpose(ket1));

// Identity
const I = math.matrix([
  [1, 0],
  [0, 1]
]);

// Pauli X not
const X = math.matrix([
  [0, 1],
  [1, 0]
]);

// Pauli Z not
const Z = math.matrix([
  [1,  0],
  [0, -1]
]);

// Not proud of this
const ONE_OVER_SQRT_2 = 1.0/math.sqrt(2);
const ERR_THRESH = 1e-14; // or this.

// Hadamard
const H = math.matrix([
  [ONE_OVER_SQRT_2,  ONE_OVER_SQRT_2],
  [ONE_OVER_SQRT_2, -ONE_OVER_SQRT_2]
]);

class Register {
  /**
   * initializes a set of n qubits in state |0>
   */
  constructor(n=5) {
    this.n = n;

    this.phi = ket0;
    for(let i = 1; i < n; i++)
      this.phi = math.kron(this.phi, ket0);
  }

  /**
   * Pauli X nots the ith qubit
   */
  not(i) {
    this.phi = math.multiply(this.permutationMatrix(X, i), this.phi);
  }

  /**
   * Pauli Z nots the ith qubit
   */
  z(i) {
    this.phi = math.multiply(this.permutationMatrix(Z, i), this.phi);
  }

  /**
   * performs hadamard rotation on ith qubit
   */
  hadamard(i) {
    this.phi = math.multiply(this.permutationMatrix(H, i), this.phi)
      .map(v => math.abs(1 - v) < ERR_THRESH ? 1 : v); // so dirty
  }

  /**
   * controlled not (X) of the jth qubit conditioned on the ith qubit
   */
  cnot(i, j) {
    this.phi = math.multiply(this.projectedOperation(i, j, X), this.phi);
  }

  /**
   * qubit twiddling to swap the ith and jth qubits
   */
  swap(i, j) {
    this.cnot(i, j);
    this.cnot(j, i);
    this.cnot(i, j);
  }

  cswap(i, j, k) {
    this.phi = math.multiply(
      this.cswapMatrix(i, j, k),
      this.phi
    );
  }

  cswapMatrix(i, j, k) {
    return math.add(
      // off term
      this.permutationMatrix(ket0projector, i, this.n),
      // on term
      this.cswapOnTerm(i, j, k)
    )
  }

  cswapOnTerm(i, j, k) {
    const factor13 = math.add(
      this.secondTerm(i, j, ket0projector),
      this.thirdTerm(i, j, k, X),
    );
    return math.multiply(
      factor13,
      math.add(
        this.secondTerm(i, k, ket0projector),
        this.thirdTerm(i, k, j, X),
      ),
      factor13
    );
  }

  ccnot(i, j, k) {
    this.phi = math.multiply(
      this.ccnotMatrix(i, j, k),
      this.phi
    );
  }

  ccnotMatrix(i, j, k) {
    return math.add(
      // off term
      this.permutationMatrix(ket0projector, i, this.n),
      // on off term
      this.secondTerm(i, j, ket0projector),
      // on on term
      this.thirdTerm(i, j, k, X)
    );
  }

  measure() {
    const r = Math.random();
    let bucketStart = 0;
    this.phi = this.phi.map(a => {
      let ret = 0;
      const bucketEnd = bucketStart + a*a + ERR_THRESH;
      if(bucketStart <= r && r < bucketEnd) {
        ret = 1;
      }
      bucketStart = bucketEnd;
      return ret;
    });
  }

  /**
   * creates an operation on the jth qubit of an appropriate size
   * conditioned on the ith qubit
   *
   * creates two terms and adds them:
   *   first term: projection of the ith qubit to the |0> basis
   *   second term: projection of the ith qubit to the |1> basis
   *    tensored with the operation on the jth qubit
   *
   * @param i control qubit
   * @param j target qubit
   * @param U unitary op to apply to jth qubit
   * @param n size of matrix needed (defaults to just right for
   *  the register)
   */
  projectedOperation(i, j, U, n=this.n) {
    return math.add(
      this.permutationMatrix(ket0projector, i, n),
      this.secondTerm(i, j, U, n));
  }

  /**
   * Constructs the second term for the projectedOperation
   */
  secondTerm(i, j, U, n=this.n) {
    let next;
    let p = i == 1 ? ket1projector : I;
    p = j == 1 ? U : p;
    for(let k = 2; k <= n; k++) {
      next = i == k ? ket1projector : I;
      next = j == k ? U : next;
      p = math.kron(p, next);
    }
    return p;
  }

  /**
   * Constructs the second term of the on term for the cswap
   */
  thirdTerm(i, j, k, U, n=this.n) {
    let next;
    let p = i == 1 || j == 1 ? ket1projector : I;
    p = k == 1 ? U : p;
    for(let m = 2; m <= n; m++) {
      next = i == m || j == m ? ket1projector : I;
      next = k == m ? U : next;
      p = math.kron(p, next);
    }
    return p;
  }

  /**
   * Creates a matrix that will apply the supplied operation
   * to the ith qubit
   */
  permutationMatrix(op, i, n=this.n) {
    let p = i == 1 ? op : I;
    for(let j = 2; j <= n; j++)
      p = math.kron(p, i == j ? op : I);
    return p;
  }
};

module.exports = {
  Register,
  ONE_OVER_SQRT_2, ERR_THRESH,
  ket0, ket0projector,
  ket1, ket1projector,
  I, X, H
};
