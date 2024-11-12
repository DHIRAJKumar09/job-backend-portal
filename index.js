const express = require('express');
const cors = require('cors');
const mongoose  = require('mongoose');
const applicationRoutes = require('./Routes/ApplicationRoutes')
const UserRoute = require('./Routes/UserRoutes');
const JobsRoute = require('./Routes/JobsRoutes');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{console.log("database in connected")})
.catch((error)=>{
    console.log(error);
   
});
app.use(cors());
app.use(express.json());
app.use('/api/users',UserRoute);
app.use('/api/jobs',JobsRoute);
app.use('/api/applications', applicationRoutes);
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
