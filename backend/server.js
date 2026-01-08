import express from 'express';
import cors from 'cors';

import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js';
const app=express();
const port=process.env.PORT || 4000;


//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//connect db
connectDB();

//Routes
app.use('/api/user',userRouter);
app.use('/api/tasks',taskRouter);


//router
app.get('/',(req,res)=>{
    res.send('Api working');
})

app.listen(port,()=>{
    console.log(`server listening on ${port}`);
})