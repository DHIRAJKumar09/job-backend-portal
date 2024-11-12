const express = require('express');
const router = express.Router();
const job = require('../models/JobsModel');
const  Application = require('../models/Application');
const applicationController = require('../Controller/applicationController')
const verifyToken = require('../Middleware/VerifyToken');
const JobsModel = require('../models/JobsModel');

router.post('/apply/:jobId', verifyToken, applicationController.applyForJob);
router.get('/user/applications', verifyToken, applicationController.getUserApplications);

router.get('/job/:jobId/applications', verifyToken, applicationController.getJobApplications);

router.put('/update-status/:applicationId', verifyToken, applicationController.updateApplicationStatus);
router.get('/applied-job', verifyToken, async (req, res) => {
    try {
     
        const userId = req.user.id;
     
        const applications = await Application.find({ userId }).populate('jobId','title company description location');
        const validApplications = applications
        .filter(app => app.jobId !== null) // Filter out null job references
        .map(app => ({
            job: {
                _id: app.jobId._id,
                title: app.jobId.title,
                company: app.jobId.company,
                location: app.jobId.location,
                description: app.jobId.description,
            },
            status: app.status,
            appliedDate: app.appliedDate,
        }));

    res.json(validApplications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applied jobs' });
    }
});

router.get('/new-jobs', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const allJobs = await JobsModel.find();
        // console.log(allJobs);
      
        const appliedJobIds = await Application.find({ userId }).select('jobId');
     
        const appliedJobIdsList = appliedJobIds.map(app => app.jobId.toString());
      
        // const newJobs = await JobsModel.find({ _id: { $nin: appliedJobIdsList } });
        const newJobs = await JobsModel.find({_id:{$nin:appliedJobIdsList}});
        
        if(newJobs.length === 0 || !newJobs){
            return res.status(400).json({
                message:"No New Jobs Found",
             
            })
        }
  
        res.status(200).json(newJobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching new jobs' });
    }
});


module.exports = router;