const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
  title: { type: String, required: true ,index:true },
  company: { type: String, required: true ,index:true },
  description: { type: String, required: true,index:true },
  location: { type: String, required: true,index:true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userpractice', required: true }, 
  postedDate: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }] ,
  category: { 
    type: String, 
    required: true, 
    enum: ['IT', 'Health', 'Marketing', 'Finance', 'Design'], // Only allow specific categories
    index: true // Index this field for faster querying by category
  },
});

module.exports = mongoose.model('jobs',jobsSchema);