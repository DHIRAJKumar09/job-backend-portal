// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  },
  appliedDate: { 
    type: Date, 
    default: Date.now 
  },
  resumeUrl: { 
    type: String // optional field, if you allow users to upload resumes 
  },
  coverLetter: {
    type: String // optional field for a cover letter or application message
  }
});

// Ensure unique applications per user-job pair
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
