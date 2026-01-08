import express from "express";
import authMiddleware from "../middleware/auth.js";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/taskController.js";

const taskRouter=express.Router();

taskRouter.get('/gp',authMiddleware,getTasks);
taskRouter.post('/gp',authMiddleware,createTask);
taskRouter.get('/gp/:id',authMiddleware,getTaskById);
taskRouter.put('/gp/:id',authMiddleware,updateTask);
taskRouter.delete('/gp/:id',authMiddleware,deleteTask);

export default taskRouter;
