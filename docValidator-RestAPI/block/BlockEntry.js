var mongoose = require('mongoose');  
var BlockEntrySchema = new mongoose.Schema({  
  docId: String,
  docTitle: String,
  fromState: String,
  toState: String,
  hash: String,
  fileLocation: String
});

mongoose.model('BlockEntry', BlockEntrySchema);
module.exports = mongoose.model('BlockEntry');