const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  postedDate: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }] 
});

module.exports = mongoose.model('jobs',jobsSchema);