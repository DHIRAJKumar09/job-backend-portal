// controllers/applicationController.js

const Application = require('../models/Application');
const JobModel = require('../models/JobsModel');
const UserModel = require('../models/user');  // Assuming you have a User model
const mongoose = require('mongoose');

// Apply for a job


const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if the job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user has already applied for this job
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create a new application
    const newApplication = new Application({
      jobId,
      userId,
      status: 'Pending',
    });

    await newApplication.save();

    // Optionally, you can add the application reference to the job
    job.applications.push(newApplication._id);
    await job.save();

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Error applying for job' });
  }
};


// Get applications of a user
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await Application.find({ userId })
      .populate('jobId', 'title company location description')
      .populate('userId', 'name email');  // Populate user details if needed

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found' });
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Error fetching user applications' });
  }
};

// Get all applications for a job
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Find all applications for a particular job
    const applications = await Application.find({ jobId })
      .populate('userId', 'name email');  // Populate user details if needed

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this job' });
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Error fetching job applications' });
  }
};

// Update application status (Accepted/Rejected)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;  // Status should be either 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

module.exports = {
  applyForJob,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
};
