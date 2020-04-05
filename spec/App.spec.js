const mock = require('mock-require');
const mockFs = {
  readFileSync: jasmine.createSpy()
};
mock('fs', mockFs);
const AppWrapper = require('../App.js');
const { ONE_OVER_SQRT_2 } = require('../Register');

describe('App wrapper', () => {
  describe('Circuit file reading', () => {
    it('Reads from the provided file', () => {
      mockFs.readFileSync.and.returnValue('');
      const app = new AppWrapper();

      app.readCircuit('filename.extension');

      expect(mockFs.readFileSync).toHaveBeenCalledWith('filename.extension', 'utf8');
    });

    it('Parses the circuit from the provided file', () => {
      mockFs.readFileSync.and.returnValue('some pile\nof\ntokens to parse');
      const app = new AppWrapper();

      app.readCircuit('filename.extension');

      expect(app.circuit).toEqual([
        ['some', 'pile'], ['of'], ['tokens', 'to', 'parse']
      ]);
    });
  });

  describe('Circuit simulation', () => {
    it('simulates a circuit with a NOT (X)', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['NOT', '1']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 16) ? [1] : [0]))
    });

    it('simulates a circuit with a Z', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['NOT', '1'],
        ['Z', '1']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 16) ? [-1] : [0]))
    });

    it('simulates a circuit with a hadamard', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['hadamard', '5']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 0 || i == 1) ? [ONE_OVER_SQRT_2] : [0]))
    });

    it('simulates a circuit with a CNOT', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['not', '1'],
        ['cNot', '1', '2']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 24) ? [1] : [0]))
    });

    it('simulates a circuit with a SWAP', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['not', '1'],
        ['swap', '1', '2']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 8) ? [1] : [0]))
    });

    it('simulates a circuit with a controlled controlled not', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['not', '1'],
        ['not', '2'],
        ['ccnot', '1', '2', '3']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 28) ? [1] : [0]))
    });

    it('simulates a circuit with a controlled swap', () => {
      const app = new AppWrapper();
      app.circuit = [
        ['not', '1'],
        ['not', '2'],
        ['cswap', '1', '2', '3']
      ];

      app.simulate();

      expect(app.register.phi.valueOf())
        .toEqual([...Array(32).keys()]
          .map(i => (i == 20) ? [1] : [0]))
    });
  });

  describe('Read out', () => {
    it('Should read out |0> on a single, initialized, qubit', () => {
      const app = new AppWrapper(1);

      const readout = app.printRegister();

      expect(readout).toEqual('|0>');
    });

    it('Should read out |1> on a single, rotated to |1>, qubit', () => {
      const app = new AppWrapper(1);
      app.circuit = [
        ['not', '1']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('|1>');
    });

    it('Should read out |00> on a 2 qubit, initialized, register', () => {
      const app = new AppWrapper(2);

      const readout = app.printRegister();

      expect(readout).toEqual('|00>');
    });

    it('Should read out |10> on a 2 qubit register rotated to |10>', () => {
      const app = new AppWrapper(2);
      app.circuit = [
        ['not', '1']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('|10>');
    });

    it('Should read out 1/sqrt(2)|0> + 1/sqrt(2)|1> on a single hadamarded qubit', () => {
      const app = new AppWrapper(1);
      app.circuit = [
        ['hadamard', '1']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('1/√2|0> + 1/√2|1>');
    });

    it('Should read out 1/2|00> + 1/2|01> - 1/2|10> + 1/2|11> based on the lecture notes thing', () => {
      const app = new AppWrapper(2);
      app.circuit = [
        ['hadamard', '1'],
        ['cnot', '1', '2'],
        ['not', '2'],
        ['hadamard', '1']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('1/2|00> + 1/2|01> - 1/2|10> + 1/2|11>');
    });
  });

  describe('measurement', () => {
    let oldRandom = Math.random;
    beforeEach(() => {
      Math.random = jasmine.createSpy();
    });
    afterEach(() => {
      Math.random = oldRandom;
    });
    it('collapses neatly', () => {
      Math.random.and.returnValue(.2);
      const app = new AppWrapper(2);
      app.circuit = [
        ['hadamard', '1'],
        ['cnot', '1', '2'],
        ['not', '2'],
        ['hadamard', '1'],
        ['measure']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('|00>');
    });

    it('collapses nicely', () => {
      Math.random.and.returnValue(.6);
      const app = new AppWrapper(2);
      app.circuit = [
        ['hadamard', '1'],
        ['cnot', '1', '2'],
        ['not', '2'],
        ['hadamard', '1'],
        ['measure']
      ];
      app.simulate();

      const readout = app.printRegister();

      expect(readout).toEqual('|10>');
    });
  });
});
