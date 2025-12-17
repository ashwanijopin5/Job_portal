import { User } from "../models/user.modal.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataURi from "../utiles/datauri.js";
import cloudinary from "../utiles/cloudinary.js";


export const register = async (req, res) => {
    try {

        const { fullName, password, phoneNumber, email, role } = req.body;
       
        if (!fullName || !password || !phoneNumber || !email || !role) {

            return res.status(400).json({
                message: "somthing is missing",
                success: false
            })
        }

          const file=req.file;
          const fileUri=getDataURi(file);
          const cloudResponce= await cloudinary.uploader.upload(fileUri.content)

        const user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({

                message: "user is already exisit with this email",
                success: false
            })
        }


        const hasedPass = await bcrypt.hash(password, 10);


        await User.create({
            fullName,
            email,
            phoneNumber,
            password: hasedPass,
            role,
            profile:{
                profilePhoto:cloudResponce.secure_url
            }
        })

        return res.status(201).json({
            message: "account is created",
           success:true
        })

    } catch (error) {
        console.log(error)
    }
}



//login

export const login = async (req, res) => {

    try {

        const { email, password, role } = req.body
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "somthing is missing",
                success: false
            })
        }


        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "incoorect email or password",
                success: false
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "incorect password",
                success: false
            })
        }

        if (role !== user.role) {

            return res.status(400).json({
                message: "Account does not exist with current role",
                success: false
            })
        }



        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" })

        user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" }).json({
            message: `welcome back ${user.fullName}`,
            user,
            success: true
        })

    } catch (error) {
        console.log(error)
    }

}

export const logout=async (req,res) => {
    try {
        
        return res.status(200).cookie("token","",{maxAge:0}).json(
           { message:"logout successfully",
              success:true
           }
        )
    } catch (error) {
        console.log(error)
    }
}

//update profile

export const updateProfile=async (req,res) => {
    try {
        const{fullName,email,phoneNumber,bio,skills}= req.body;

 const file=req.file;
 const fileUri=getDataURi(file)
 const cloudResponce=await cloudinary.uploader.upload(fileUri.content)
        
        const skillArray=skills?skills.split(","):[];
        const userId=req.id//middalwarw authantication
        let user=await User.findById(userId)
        if(!user){
            return res.status(400).json(
                {
                    message:"user is not found",
                    success:false
                }
            )
        }

       if(fullName) user.fullName=fullName;
       if(email)  user.email=email;
      if(phoneNumber)   user.phoneNumber=phoneNumber;
       if(bio)  user.profile.bio=bio;
       if(skillArray.length)  user.profile.skills=skillArray;

       if(cloudResponce){
        user.profile.resume=cloudResponce.secure_url //save th cloudinary
        user.profile.resumeOriginalName=file.originalname ///save the file name
       }

        //resume come later here

        await user.save()


           user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

         return res.status(200).json({

            message:"profile updated succefully",
            user,
            success:true
         })

    } catch (error) {
        console.log(error)
    }
}