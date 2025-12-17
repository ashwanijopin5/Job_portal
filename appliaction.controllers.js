import { Application } from "../models/application.modal.js"
import { Job } from "../models/job.modal.js"


export const applyjob = async (req, res) => {
    try {

        const userid = req.id
        const jobId = req.params.id
        if (!jobId) {
            return res.status(400).json({
                message: "job id is required",
                success: false
            })
        }

        // check is user has alerady applied

        const exisitingApplication = await Application.findOne({ job: jobId, applicant: userid })

        if (exisitingApplication) {
            return res.status(400).json({
                message: "you have alerady applied",
                success: false
            })
        }

        //check if job exisit
        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).json({
                message: "job not found",
                success: false
            })
        }

        const newApplication = await Application.create({

            job: jobId,
            applicant: userid
        })
        job.applications.push(newApplication._id)

        await job.save()

        return res.status(201).json({
            message: "job applied succesfully",
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}


export const getAppliedjobs = async (req, res) => {
    try {
        const userId = req.id
        const application = await Application.find({ applicant: userId }).sort({createdAt:-1}).populate({
            path:"job",
            options:{sort:{createdAt:-1}},
            populate:{
                path:"company",
            options:{sort:{createdAt:-1}}
            }
        })
        
  if(!application){
    return res.status(404).json({
        message:"no application",
        success:false
    })
  }

  return res.status(200).json({
    application,
    success:true
  })

    } catch (error) {
        console.log(error);

    }
}
//kitne user ne aapliedkiya h. this is for admkin
export const getApplicant=async (req,res) => {
    try {
        const jobId=req.params.id;
        const job=await Job.findById(jobId).populate({
            path:"applications",
            options:{sort:{createdAt:-1}},
            populate:{
                path:"applicant",
                
            }
        })

        if(!job){
            return res.status(404).json({
                message:"job not found",
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

//update stauts

export const updateStatus=async (req,res) => {
    try {
        
        const {status}=req.body;
        const applicationId=req.params.id;
        if(!status){
               return res.status(400).json({
                message:"status is required",
                success:false
            })
        }

        //find application by applicant id

        const applicaion=await Application.findOne({_id:applicationId})
        if(!applicaion){
               return res.status(404).json({
                message:"application not found",
                success:false
            })
        }

        //update status

        applicaion.status=status.toLowerCase();
        await applicaion.save()

           return res.status(200).json({
                message:"status updated successfully",
                success:true
            })
    } catch (error) {
        console.log(error);
        
    }
}