const express = require('express');
const router = express.Router();
const JobModel = require('../models/JobsModel');
const Application = require('../models/Application');
const verifyToken = require('../Middleware/VerifyToken'); // Middleware to verify token
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;

router.get('/search', async (req, res) => {
    
   try{
        const {keywords,location,category,page=1,limit=10} = req.query;
        console.log(req.query);
        const query ={};
        if(keywords) {
            query.$or =[
                {title:{$regex:keywords,$options:'i'}},
                {description:{$regex:keywords,$options:'i'}},
            ]
        }
        if(location){
            query.location = {$regex:location,$options:'i'}
        }
        if(category){
            query.category = {$regex:category,$options:'i'}
        }
        const skip = (page-1)*limit;
       const jobs = await JobModel.find(query)
       .skip(skip)
       .limit(parseInt(limit))
       .sort({postedDate:-1})

       const totalJobs = await JobModel.countDocuments(query);
       const totalPage = Math.ceil(totalJobs/limit);
       console.log(jobs,totalJobs,totalPage);
       res.json({jobs,totalJobs,totalPage})

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
  router.get('/applications/stats', verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
  
      // Start of today
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
      // Start of the current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
      // Start of the current year
      const startOfYear = new Date(today.getFullYear(), 0, 1);
  
      const [todayCount, monthCount, yearCount, dailyCounts] = await Promise.all([
        Application.countDocuments({
          userId: new ObjectId(userId),
          appliedDate: { $gte: startOfToday }
        }),
        
        Application.countDocuments({
          userId: new ObjectId(userId),
          appliedDate: { $gte: startOfMonth }
        }),
  
        Application.countDocuments({
          userId: new ObjectId(userId),
          appliedDate: { $gte: startOfYear }
        }),
  
        // Aggregate applications by day
        Application.aggregate([
          { $match: { userId: new ObjectId(userId) } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedDate" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } } // Sort by date
        ]),
      ]);
  
      res.json({
        todayCount,
        monthCount,
        yearCount,
        dailyCounts // Array of daily counts for charting
      });
    } catch (error) {
      console.error("Error fetching application stats:", error);
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
  
  
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, company, description, location, category } = req.body;

        // Validate category
        if (!['IT', 'Health', 'Marketing', 'Finance', 'Design'].includes(category)) {
            return res.status(400).json({ message: 'Invalid or missing category' });
        }

        const newJob = new JobModel({
            title,
            company,
            description,
            location,
            category,
            postedBy: req.user.id,
        });

        const savedJob = await newJob.save();
        res.status(201).json({
            message:"job successfully save",
            success:true,
            savedJob,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await JobModel.find();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get jobs by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;

    // Validate category
    const validCategories = ['IT', 'Health', 'Marketing', 'Finance', 'Design'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid Category' });
    }

    try {
        const jobs = await JobModel.find({ category }).sort({ postedDate: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await JobModel.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job is not available' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update job by ID
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedJob = await JobModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a job by ID
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedJob = await JobModel.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Apply for a job
router.post('/apply/:jobId', verifyToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Find job by ID
        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check for existing application
        const alreadyApplied = await Application.findOne({ jobId, userId });
        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied to this job' });
        }

        // Save new application
        const newApplication = new Application({ jobId, userId, status: 'Pending' });
        await newApplication.save();

        // Push application reference to job's applications
        job.applications.push(newApplication._id);
        await job.save();

        res.status(201).json({ message: 'Application successful', application: newApplication });
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ message: 'Error applying to job' });
    }
});

router.get('/new-jobs', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const appliedJobIds = await Application.find({ userId }).select('jobId');
        const appliedJobIdsList = appliedJobIds.map(app => app.jobId.toString());

        const newJobs = await JobModel.find({ _id: { $nin: appliedJobIdsList } });
        res.status(200).json(newJobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching new jobs' });
    }
});
// Get jobs user applied to
router.get('/applied-job', verifyToken, async (req, res) => {
    try {
     
        const userId = req.user.id;
        const applications = await Application.find({ userId }).populate('jobId', 'title company location description');
        const appliedJobs = applications.map(app => app.jobId);
        res.json(appliedJobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applied jobs' });
    }
});
// Search jobs based on keywords, location, or category
// Search jobs with pagination
// Search jobs endpoint

module.exports = router;
