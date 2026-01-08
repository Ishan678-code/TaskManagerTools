import express from 'express';
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter=express.Router();

//creating public routes
userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);


//creating private routes-by adding auth middleware
userRouter.get('/me',authMiddleware,getCurrentUser);
userRouter.put('/profile',authMiddleware,updateProfile);
userRouter.put('/password',authMiddleware,updatePassword);

export default userRouter;
