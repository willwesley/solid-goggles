const math = require('mathjs');
const {
  Register,
  ONE_OVER_SQRT_2,
  ket0, ket0projector,
  ket1, ket1projector,
  I, X, H
} = require('../Register');

describe('Register', () => {
  describe('Register initialization', () => {
    it('creates a one hot vector for n=1 initialized to |0>', () => {
      const reg = new Register(1);

      expect(reg.phi.valueOf()).toEqual([[1], [0]])
    });

    it('creates a one hot vector for n=5 initialized to |00000> by default', () => {
      const reg = new Register();

      expect(reg.phi.valueOf()).toEqual([...Array(32).keys()].map(i => i == 0 ? [1] : [0]));
    });
  });

  describe('Permutation matrix', () => {
    it('returns op when n = 1', () => {
      const reg = new Register(1);

      const p = reg.permutationMatrix('derp', 1);

      expect(p).toEqual('derp')
    });

    it('returns op⊗I when n = 2 and i = 1', () => {
      const reg = new Register(2);

      const p = reg.permutationMatrix(X, 1);

      expect(p.valueOf()).toEqual([
        [0,0,1,0],
        [0,0,0,1],
        [1,0,0,0],
        [0,1,0,0],
      ]);
    });

    it('returns I⊗op when n = 2 and i = 2', () => {
      const reg = new Register(2);

      const p = reg.permutationMatrix(X, 2);

      expect(p.valueOf()).toEqual([
        [0,1,0,0],
        [1,0,0,0],
        [0,0,0,1],
        [0,0,1,0],
      ]);
    });
  });

  describe('Not operation (X)', () => {
    it('nots |0>', () => {
      const reg = new Register(1);

      reg.not(1);

      expect(reg.phi.valueOf()).toEqual([[0], [1]])
    });

    it('nots the second bit of |00> -> |01>', () => {
      const reg = new Register(2);

      reg.not(2);

      expect(reg.phi.valueOf()).toEqual([[0], [1], [0], [0]])
    });

    it('nots the first bit of |00> -> |10>', () => {
      const reg = new Register(2);

      reg.not(1);

      expect(reg.phi.valueOf()).toEqual([[0], [0], [1], [0]])
    });
  });

  describe('Z Gate', () => {
    it('ignores |0>', () => {
      const reg = new Register(1);

      reg.z(1);

      expect(reg.phi.valueOf()).toEqual([[1], [0]])
    });

    it('rotates |1>', () => {
      const reg = new Register(1);
      reg.not(1);

      reg.z(1);

      expect(reg.phi.valueOf()).toEqual([[0], [-1]])
    });

    it('nots the second bit of |11> -> |1-1>', () => {
      const reg = new Register(2);
      reg.not(1);
      reg.not(2);

      reg.z(2);

      expect(reg.phi.valueOf()).toEqual([[0], [0], [0], [-1]])
    });
  });

  describe('Hadamard operation (H)', () => {
    it('rotates |0> to |+>', () => {
      const reg = new Register(1);

      reg.hadamard(1);

      expect(reg.phi.valueOf()).toEqual([[ONE_OVER_SQRT_2], [ONE_OVER_SQRT_2]])
    });
    it('rotates |00> to |+0> oh my', () => {
      const reg = new Register(2);

      reg.hadamard(1);

      expect(reg.phi.valueOf()).toEqual([
        [ONE_OVER_SQRT_2], [0], [ONE_OVER_SQRT_2], [0]])
    });
    it('rotates |00> to |0+> oh my', () => {
      const reg = new Register(2);

      reg.hadamard(2);

      expect(reg.phi.valueOf()).toEqual([
        [ONE_OVER_SQRT_2], [ONE_OVER_SQRT_2], [0], [0]])
    });

    it('rotates |00000> to |00+00> oh my', () => {
      const reg = new Register();

      reg.hadamard(3);

      expect(reg.phi.valueOf()).toEqual([...Array(32).keys()]
        .map(i => (i == 0 || i == 4) ? [ONE_OVER_SQRT_2] : [0]));
    });
    it('rotates |0> to |+> and back again', () => {
      const reg = new Register(1);

      reg.hadamard(1);
      reg.hadamard(1);

      expect(reg.phi.valueOf()).toEqual([[1], [0]]);
    });
    it('EPR pair', () => {
      const reg = new Register(2);

      reg.hadamard(1);
      reg.cnot(1, 2);

      expect(reg.phi.valueOf()).toEqual([[ONE_OVER_SQRT_2], [0], [0], [ONE_OVER_SQRT_2]]);
    });
    it('Tour de lecture notes', () => {
      const ALMOST_HALF = 0.4999999999999999; // stinky stinky stinky
      const reg = new Register(2);

      reg.hadamard(1);
      reg.cnot(1, 2);
      reg.not(2);
      reg.hadamard(1);

      expect(reg.phi.valueOf()).toEqual([
        [ALMOST_HALF], [ALMOST_HALF], [-ALMOST_HALF], [ALMOST_HALF]]);
    });
  });

  describe('CNOT operation', () => {
    it('rotates |00> to |00> when i = 1, j = 2', () => {
      const reg = new Register(2);

      reg.cnot(1, 2);

      expect(reg.phi.valueOf()).toEqual([[1], [0], [0], [0]])
    });
    it('rotates |10> to |11> when i = 1, j = 2', () => {
      const reg = new Register(2);
      reg.not(1);

      reg.cnot(1, 2);

      expect(reg.phi.valueOf()).toEqual([[0], [0], [0], [1]])
    });
    it('rotates |11> to |10> when i = 1, j = 2', () => {
      const reg = new Register(2);
      reg.not(1);
      reg.not(2);

      reg.cnot(1, 2);

      expect(reg.phi.valueOf()).toEqual([[0], [0], [1], [0]])
    });
    it('rotates |100> to |101> when i = 1, j = 3', () => {
      const reg = new Register(3);
      reg.not(1);

      reg.cnot(1, 3);

      expect(reg.phi.valueOf())
        .toEqual([[0], [0], [0], [0], [0], [1], [0], [0]]);
    });
    it('rotates |100> to |110> when i = 1, j = 2', () => {
      const reg = new Register(3);
      reg.not(1);

      reg.cnot(1, 2);

      expect(reg.phi.valueOf())
        .toEqual([[0], [0], [0], [0], [0], [0], [1], [0]]);
    });
    it('rotates |111> to |011> when i = 3, j = 1', () => {
      const reg = new Register(3);
      reg.not(1);
      reg.not(2);
      reg.not(3);

      reg.cnot(3, 1);

      expect(reg.phi.valueOf())
        .toEqual([[0], [0], [0], [1], [0], [0], [0], [0]]);
    });
  });
  describe('SWAP operation', () => {
    it('rotates |01> to |10> when i = 1, j = 2', () => {
      const reg = new Register(2);
      reg.not(2);

      reg.swap(1, 2);

      expect(reg.phi.valueOf()).toEqual([[0], [0], [1], [0]])
    });
    it('rotates |10> to |01> when i = 1, j = 2', () => {
      const reg = new Register(2);
      reg.not(1);

      reg.swap(1, 2);

      expect(reg.phi.valueOf()).toEqual([[0], [1], [0], [0]])
    });
    it('rotates |101> to |011> when i = 1, j = 2', () => {
      const reg = new Register(3);
      reg.not(1);
      reg.not(3);

      reg.swap(1, 2);

      expect(reg.phi.valueOf())
        .toEqual([[0], [0], [0], [1], [0], [0], [0], [0]])
    });
    it('rotates |0001> to |0100> when i = 4, j = 2', () => {
      const reg = new Register(4);
      reg.not(4);

      reg.swap(2, 4);

      expect(reg.phi.valueOf())
        .toEqual([[0], [0], [0], [0],[1], [0], [0], [0],
                  [0], [0], [0], [0],[0], [0], [0], [0]])
    });
  });
  describe('CSWAP operation', () => {
    it('makes a CSWAP123 matrix', () => {
      const reg = new Register(3);

      const cswap123 = reg.cswapMatrix(1, 2, 3);

      expect(cswap123.valueOf()).toEqual([
        [1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1]
      ])
    });

    it('rotates |000> to |000> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);

      reg.cswap(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [1], [0], [0], [0], [0], [0], [0], [0]])
    });

    it('rotates |101> to |110> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);
      reg.not(1);
      reg.not(3);

      reg.cswap(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [0], [0], [0], [0], [0], [0], [1], [0]])
    });

    it('rotates |110> to |101> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);
      reg.not(1);
      reg.not(2);

      reg.cswap(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [0], [0], [0], [0], [0], [1], [0], [0]])
    });

    it('rotates |01110> to |11010> when i = 4, j = 1, k = 3', () => {
      const reg = new Register();
      reg.not(2);
      reg.not(3);
      reg.not(4);

      reg.cswap(4, 1, 3);

      expect(reg.phi.valueOf()).toEqual([...Array(32).keys()]
        .map(i => (i == 26) ? [1] : [0]))
    });
  });
  describe('CCNOT operation', () => {
    it('makes a Toffoli matrix', () => {
      const reg = new Register(3);

      expect(reg.ccnotMatrix(1, 2, 3).valueOf()).toEqual([
        [1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 1, 0]
      ])
    });
    it('rotates |000> to |000> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);

      reg.ccnot(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [1], [0], [0], [0], [0], [0], [0], [0]])
    });
    it('rotates |100> to |100> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);
      reg.not(1);

      reg.ccnot(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [0], [0], [0], [0], [1], [0], [0], [0]])
    });
    it('rotates |110> to |111> when i = 1, j = 2, k = 3', () => {
      const reg = new Register(3);
      reg.not(1);
      reg.not(2);

      reg.ccnot(1, 2, 3);

      expect(reg.phi.valueOf()).toEqual([
        [0], [0], [0], [0], [0], [0], [0], [1]])
    });
    it('rotates |01010> to |01011> when i = 4, j = 2, k = 5', () => {
      const reg = new Register();
      reg.not(2);
      reg.not(4);

      reg.ccnot(4, 2, 5);

      expect(reg.phi.valueOf()).toEqual([...Array(32).keys()]
        .map(i => (i == 11) ? [1] : [0]))
    });
  });

  describe('MEASURE operation', () => {
    let oldRandom = Math.random;
    beforeEach(() => {
      Math.random = jasmine.createSpy();
    });
    afterEach(() => {
      Math.random = oldRandom;
    });
    it('collapses 1/sqrt(2)|0> + 1/sqrt(2)|1> to something', () => {
      Math.random.and.returnValue(0);
      const reg = new Register(1);
      reg.hadamard(1);

      reg.measure();

      expect(reg.phi.valueOf()).toEqual([[1], [0]])
    });

    it('collapses 1/sqrt(2)|0> + 1/sqrt(2)|1> to something else', () => {
      Math.random.and.returnValue(1);
      const reg = new Register(1);
      reg.hadamard(1);

      reg.measure();

      expect(reg.phi.valueOf()).toEqual([[0], [1]])
    });
  });
});
