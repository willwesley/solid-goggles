const App = require('./App');

const n = process.argv.length > 3 ? process.argv[2] : 5;
const file = process.argv.length > 3 ? process.argv[3] : process.argv[2];

const app = new App(n);
app.readCircuit(file);
app.simulate();
console.log(app.printRegister());

console.log(1/(Math.sqrt(2) * 4))
