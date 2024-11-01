const express = require("express");

const Controller = require("../controller/user controller")
const Password =  require("../controller/password controller")

const Routes = express.Router();


Routes.post("/signup",Controller.signUp)
Routes.post("/login",Controller.login)


Routes.post("/passwordreset", Password.emailVerify)

Routes.get("/passwordreset/:id",Password.resetPassword)

Routes.post("/passwordreset/final",Password.newPassword)




module.exports = Routes