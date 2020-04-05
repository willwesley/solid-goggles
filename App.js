const fs = require('fs');
const { Register, ONE_OVER_SQRT_2, ERR_THRESH } = require('./Register');

class AppWrapper {

  constructor(n=5) {
    this.n = n;
    this.register = new Register(n);

    this.readCircuit = this.readCircuit.bind(this);
  }

  readCircuit(filename='examplecircuit') {
    this.circuit = fs.readFileSync(filename, 'utf8')
      .split('\n').map(line => line.split(' '));
  }

  simulate() {
    this.circuit.forEach(instr => {
      switch(instr[0].toLowerCase()) {
        case 'not':
          this.register.not(instr[1]);
          break;
        case 'z':
          this.register.z(instr[1]);
          break;
        case 'hadamard':
          this.register.hadamard(instr[1]);
          break;
        case 'cnot':
          this.register.cnot(instr[1], instr[2]);
          break;
        case 'swap':
          this.register.swap(instr[1], instr[2]);
          break;
        case 'ccnot':
          this.register.ccnot(instr[1], instr[2], instr[3]);
          break;
        case 'cswap':
          this.register.cswap(instr[1], instr[2], instr[3]);
          break;
        case 'measure':
          this.register.measure();
          break;
      }
    });
  }

  printRegister() {
    const vector = this.register.phi.valueOf();
    const readout = vector.map((a, i) => {
      if(a[0] != 0) {
        return (a[0] < 0 ? 'X' : '') // placeholder for neg coeff
          + this.formatAmplitude(Math.abs(a[0])) // press up against the ABC gum
          + `|${this.asBinary(1*i)}>`; // classical bit ket label yay
      }
    }).filter(v => v != null);
    return readout.join(' + ').replace('+ X', '- ');
  }

  asBinary(i, n=this.n) {
    const padding = '0'.repeat(n);
    const padded = padding + i.toString(2);
    return padded.slice(padded.length - n);
  }

  /**
   * seems like a fine place to accumulate nasty bubble gum spitwads....
   */
  formatAmplitude(a) {
    if(ONE_OVER_SQRT_2 - ERR_THRESH < a && a < ONE_OVER_SQRT_2 + ERR_THRESH)
      return '1/√2';
    if(ONE_OVER_TWO_SQRTS_2 - ERR_THRESH < a && a < ONE_OVER_TWO_SQRTS_2 + ERR_THRESH)
      return '1/2√2';
    if(ONE_OVER_FOUR_SQRTS_2 - ERR_THRESH < a && a < ONE_OVER_FOUR_SQRTS_2 + ERR_THRESH)
      return '1/4√2';
    if(0.5 - ERR_THRESH < a && a < 0.5 + ERR_THRESH)
      return '1/2';
    if(0.25 - ERR_THRESH < a && a < 0.25 + ERR_THRESH)
      return '1/4';
    if(a == 1)
        return '';
    return a;
  }
}

const ONE_OVER_TWO_SQRTS_2 = 1/(Math.sqrt(2) * 2);
const ONE_OVER_FOUR_SQRTS_2 = 1/(Math.sqrt(2) * 4);

module.exports = AppWrapper;
