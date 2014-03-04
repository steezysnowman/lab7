
var Mongoose = require('mongoose');


var ProjectSchema = new Mongoose.Schema({
  mac: String,
  pi: String,
  time: String
});

exports.Project = Mongoose.model('Project', ProjectSchema);


