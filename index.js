const express = require('express');
const cors = require('cors');
const mongoose  = require('mongoose');
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


app.listen(process.env.PORT,()=>{
    console.log(`app is listen at ${process.env.PORT}`);
})