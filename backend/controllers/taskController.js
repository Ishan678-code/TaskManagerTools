import Task from "../models/taskModel.js";
export const createTask=async(req,res)=>{
    try {
        const {title,description,priority,dueDate,completed}=req.body;
        const task=new Task({
            title,description,priority,dueDate,completed:completed==="Yes"||completed===true,
            owner:req.user.id
        });
        const saved=await task.save();
        return res.status(201).json({
            success:true,
            task:saved
        });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
};
//get all task for logged-in user
export const getTasks=async(req,res)=>{
    try {
        const tasks=await Task.find({owner:req.user.id}).sort({createdAt:-1});
        return res.status(201).json({
            success:true,
            tasks
        })
    } catch (error) {
         res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

//get single task by id(must belong to particular user)
export const getTaskById=async(req,res)=>{
    try {
        const task=await Task.findOne({_id:req.params.id});
        if(!task){
            return res.status(404).json({
                success:false,
                message:'task not found'
            })
        };
        res.status(200).json({
            success:true,
            task
        })
    } catch (error) {

        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

//update a task
export const updateTask=async(req,res)=>{
    try {
        const data={...req.body};
        if(data.completed!==undefined){
            data.completed=data.completed==="Yes"||data.completed===true;
        }
        const updated=await Task.findByIdAndUpdate({_id:req.params.id,owner:req.user.id},
            data,
            {new:true, runValidators:true}
        );
        if(!updated){
            return res.status(404).json({
                success:false,
                message:"Task not found "
            })
        };
        return res.status(200).json({
            success:true,
            task:updated
        });
    } catch (error) {
         res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

//delete a task function
export const deleteTask=async(req,res)=>{
    try {
        const deleted = await Task.findOneAndDelete({_id:req.params.id,owner:req.user.id})
        if(!deleted){
            return res.status(404).json({
                success:false,
                message:"Task not found"
            })
        };
         return res.status(200).json({
            success:true,
           message:"task deleted"
        });

    } catch (error) {
         res.status(400).json({
            success:false,
            message:error.message
        })
    }
}