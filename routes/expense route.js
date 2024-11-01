const express = require("express");

const Controller = require("../controller/expense controller");
const { Authenticate } = require("../middleware/Authentication");
const Purchase = require("../controller/purchase controller")
const uploadFile = require("../middleware/multer") 


const Routes = express.Router();


Routes.post("/expenseAdd",Authenticate, uploadFile , Controller.expenseadd)


Routes.post("/expenseFetch",Authenticate , Controller.fetchExpense)

Routes.get("/report/monthly/download",Authenticate,Controller.downloadFetchMonth)
Routes.get("/report/yearly/download",Authenticate,Controller.downloadFetchYearly)


Routes.get("/report/monthly",Authenticate,Controller.monthly)
Routes.get("/report/yearly",Authenticate,Controller.yearly)
Routes.get("/leaderboard", Authenticate , Controller.leaderboard)
Routes.delete("/deleteExpense/:id",Authenticate,Controller.deleteExpense)
Routes.get("/editFetch/:id",Authenticate,Controller.editFetch)


Routes.put("/update/:id",Authenticate,uploadFile,Controller.UpdateExpense)


Routes.get("/expense/premium",Authenticate,Purchase.premiumPurchase)

Routes.post("/expense/verify",Authenticate,Purchase.verify)



module.exports = Routes