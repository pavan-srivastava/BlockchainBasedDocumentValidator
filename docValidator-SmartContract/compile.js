const path = require ('path');
const fs = require ('fs');
const solc = require ('solc');

const solPath = path.resolve(__dirname, 'contracts', 'docValidator.sol');
const src = fs.readFileSync(solPath, 'utf8');

//console.log (solc.compile(src,1));
module.exports = solc.compile(src,1).contracts[':DocValidator'];

