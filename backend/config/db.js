import mongoose from "mongoose";

export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://awasthiishan021_db_user:ishanawasthi2025@cluster0.8btc7zh.mongodb.net/')
    .then(()=>console.log('DB connected'));
}