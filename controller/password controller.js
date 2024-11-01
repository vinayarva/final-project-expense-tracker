
const User = require("../model/user model")

const passwordReset = require("../model/passwordreset model");
const { Sequelize } = require('sequelize')
const sequelize = require('../database/db');



const SendEmail = require("../services/Email")
const path = require('path');
const bcrypt = require("bcrypt");
const { escape } = require("querystring");



module.exports.emailVerify = async (req, res) => {
  
  try {
    const data =  req.body
    const check = await User.findOne({ where: req.body });

    if (check === null) {
      res.status(401).json({ Success: false, message: "Invalid Email" });
    } else {

        const x = await passwordReset.create({email :req.body.email})

        const email = await SendEmail(req.body.email,x.UUID)

      res
        .status(201)
        .json({ Success: true, message: "check your email for password" });
    }
  } catch (err) {
    console.log(err);
  }
};


module.exports.resetPassword = async(req,res)=>{
    try{
        const token = await passwordReset.findOne({where : {UUID : req.params.id , status : true}})
          if(token === null){
            res.status(401).sendFile(path.join(__dirname, '../views/Password reset page/linkExpire.html'))
          }else{
            res.status(200).sendFile(path.join(__dirname, '../views/Password reset page/passwordReset.html'));
          }
       
        
       
        
     


    }catch(err){
        console.log(err)
    }
}


module.exports.newPassword = async(req,res)=>{

    const t = await sequelize.transaction();

    try{

        

        const hash = await bcrypt.hash(req.body.password, 10);
        
        const userUpdate = await User.update(
          { password: hash },
          { where: { email: req.body.email }, transaction: t }  // Merge the options in one object
      );
        const StatusUpdate = await passwordReset.update({status : false},{where :{email :req.body.email},transaction: t})

        
         res.status(200).json({Success:true,message:"Successfully Updated"})
       
         await t.commit();
    }catch(err){

        await t.rollback();
        console.log(err)
        res.status(200).json({Success:false , message :"Error in the code"})
    }
}


