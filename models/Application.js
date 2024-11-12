const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Reference to the job the user is applying for
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'jobs',  // This refers to the 'jobs' model (ensure it's defined correctly)
    required: true 
  },
  
  // Reference to the user applying for the job
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'userpractice',  // This refers to the 'userpractice' model (ensure it's defined correctly)
    required: true 
  },

  // Application status can be 'Pending', 'Accepted', or 'Rejected'
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  },

  // The date when the user applied for the job
  appliedDate: { 
    type: Date, 
    default: Date.now 
  },

  // Optional field to store a resume URL
  resumeUrl: { 
    type: String 
  },

  // Optional field for the cover letter or application message
  coverLetter: {
    type: String 
  }
});

// Ensure that each user can only apply once for each job
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

// Creating the Application model using the schema
const Application = mongoose.model('Application', applicationSchema);

// Exporting the Application model
module.exports = Application;
