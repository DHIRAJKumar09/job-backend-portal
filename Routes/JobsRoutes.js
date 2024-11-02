const express = require('express');
const router = express.Router();
const JobModel = require('../models/JobsModel');
const Application = require('../models/Application')
const verifyToken = require('../Middleware/VerifyToken') // Example middleware to verify token

// Middleware to ensure user is authenticated
// router.use(verifyToken); // Apply this to all routes if needed, or specify on individual routes

// Create Job
router.post('/', verifyToken, async (req, res) => {
    try {
        const job = new JobModel({
            ...req.body,
            postedBy: req.user.id  // Now req.user should be defined
        });
        const savedJob = await job.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await JobModel.find();
        res.status(200).json(jobs); // Use 200 for successful GET
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single job
router.get('/:id', async (req, res) => {
    try {
        const job = await JobModel.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job is not available" });
        }
        res.status(200).json(job); // Ensure successful response status
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update job by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedJob = await JobModel.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Ensure you send updated data
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(updatedJob); // Successful update
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a job by ID 
router.delete('/:id', async (req, res) => {
    try {
        const deletedJob = await JobModel.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted' }); // Successful deletion
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/jobs/apply/:jobId
router.post('/apply/:jobId',verifyToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log(req.user);
        const userId = req.user.id; // Assuming user ID is extracted from token in middleware
        const job = await JobModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Prevent duplicate applications
        const alreadyApplied = await Application.findOne({ jobId, userId });
        if (alreadyApplied) return res.status(400).json({ message: "Already applied to this job" });

        // Save the application
        const newApplication = new Application({ jobId, userId, status: 'Pending' });
        await newApplication.save();

        res.json({ message: "Application successful" });
    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({ message: "Error applying to job" });
    }
});

router.get('/applied-job',verifyToken,async(req,res)=>{
    try{
        const userId = req.user.id;
        const application = await Application.find({userId}).populate('jobId');
        const appliedJobs = application.map(app => app.jobId);
        res.json(appliedJobs);

    }catch(error){
        console.error("Error fetching applied jobs :",error);
        res.status(500).json({message:"Error fetching applied jobs"});

    }
})


module.exports = router;
