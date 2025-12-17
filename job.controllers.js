
import { Job } from "../models/job.modal.js";


export const postJob = async (req, res) => {

    try {

        const { title, description, requirments, salary, location, jobType, position, companyId }
            = req.body

        const userid = req.id

        if (!title || !description || !requirments || !salary || !location || !jobType  || !position || !companyId) {

            return res.status(400).json({
                message: "somthing is missing",
                success: false
            })
        }
        const job = await Job.create({
            title,
            description,
            requirments: requirments?requirments.split(","):[],
            salary: Number(salary),
            location,
            jobType,
            position,
            company:companyId,
            createdBy: userid
        })
        return res.status(200).json({
            message: "job is created successfully",
            job,
            success: true
        })

    } catch (error) {
        console.log(error);

    }
}

export const getAllJob = async (req, res) => {
    try {
        //keywords to get a data
        
        const keyword = req.query.keyword || "";
        // console.log(keyword)
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },

            ]
        }

        const jobs=await Job.find(query).sort({createdAt:-1})
        // console.log(jobs)

        if(!jobs){
            return res.status(404).json({
                message:"job is not found",
                success:false
            })
        }
        return res.status(200).json({
           jobs,
           success:true
            
        })

    } catch (error) {
        console.log(error);

    }
}

export const getJObById=async (req,res) => {
    
    try {
        const jobId=req.params.id
        const job=await Job.findById(jobId).populate({
            path:"applications"
        })
        if(!job){
            return res.status(404).json({
                message:"job is not found",
                success:false
            })
        }
        return res.status(200).json({
            job,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}

//admin ne kitanio job post ki h

export const getAdminjobs=async (req,res) => {
    try {
        const adminId=req.id;
        const jobs = await Job.find({createdBy:adminId}).populate({
            path:'company'
           
        }).sort({ createdAt:-1})
       if(!jobs){
        return res.status(404).json({
            message:"no job is found",
            success:false
        })
       } 

       return res.status(200).json({
        jobs,
        success:true
       })
    } catch (error) {
        console.log(error);
        
    }
}