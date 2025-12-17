import { Company } from "../models/company.modal.js";
import cloudinary from "../utiles/cloudinary.js";
import getDataURi from "../utiles/datauri.js";

export const companyRegister = async (req, res) => {
    try {
        const { companyName } = req.body
        if (!companyName) {
            return res.status(404).json({
                message: "company name is reguired",
                success: false
            })
        }

        let company = await Company.findOne({ name: companyName })

        if (company) {
            return res.status(400).json({
                message: "you cant,t regster samr company",
                success: false
            })
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        })

        return res.status(201).json({
            message: "company is created "
            ,
            company,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}
//companies of logged in user
export const getCompany = async (req, res) => {
    try {
        const userId = req.id;//logged in user
        const companies = await Company.find({ userId })
        if (!companies) {
            return res.status(404).json({
                message: "companies not found",

                success: false
            })



        }

        return res.status(200).json({
            companies,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

//getcompany by id 

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId)
        if (!company) {
            return res.status(400).json({
                message: "company is not found",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body

        const file = req.file;
const fileUri=getDataURi(file);
          const cloudResponce= await cloudinary.uploader.upload(fileUri.content)
const logo=cloudResponce.secure_url;

     

        const updateData = { name, description, location, website ,logo}
        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })


        if (!company) {
            return res.status(404).json({
                message: "comapny not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "company updated succesfully",
            success: true
        })

    } catch (error) {
        console.log(error);

    }
}