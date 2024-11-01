const Expenses = require("../model/expense model")
const { Op } = require('sequelize');
const { Sequelize } = require("sequelize");
const sequelize = require('../database/db');
const { uploadtos3, deleteFileFromS3 } = require('../services/aws');


module.exports.deleteExpense = async(req,res)=>{

    try {

        const result = await Expenses.findOne({ where: { id: req.params.id } });


        if(result.fileLink){
            
            const fileLink = result.fileLink
            const filename = fileLink.substring(fileLink.lastIndexOf('/') + 1);
            await deleteFileFromS3(filename)
        }

        

        await Expenses.destroy({where: {id: req.params.id,}})


          res.status(201).json({success:true,message:"expense deleted successfully"})
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error : error in delete the expense' });
    }

}


module.exports.UpdateExpense = async (req, res) => {
    try {
        const expenseData = JSON.parse(req.body.data);

        // Find the existing expense to get the current file link
        const existingExpense = await Expenses.findOne({ where: { id: req.params.id } });

        // If there's a new file to upload
        if (req.file) {
            const file = req.file;

            // Delete old file from S3 if it exists
            if (existingExpense && existingExpense.fileLink) {
                const oldFileKey = existingExpense.fileLink.split('/').pop(); // Extract key from file link
                await deleteFileFromS3(oldFileKey);
            }

            // Upload new file to S3
            const fileLink = await uploadtos3(file.originalname, file.buffer);
            expenseData.fileLink = fileLink; // Update expenseData with new file link
        }

        await Expenses.update(expenseData, { where: { id: req.params.id } });
        res.status(201).json({ success: true, message: "Expense updated successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports.editFetch = async(req,res)=>{

    try{
        
        const data = await Expenses.findByPk(req.params.id)

        res.status(201).json({success:true,message:"expense deleted successfully",content : data})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' });

    }


}

module.exports.expenseadd = async (req, res) => {
    try {

        const user = req.user;
    
        const expenseData = JSON.parse(req.body.data); 
        expenseData.userID = user.ID; 

        if (req.file) {
            const file = req.file;
            const filename = `${Date.now()}-${user.ID}-${req.file.originalname}`
            // console.log(filename)
            const fileLink = await uploadtos3(filename, file.buffer); // Call your S3 upload function
            // console.log(fileLink)
            expenseData.fileLink = fileLink; // Store the returned link in your expense data
        }

        // This should now show a proper object

        const creating = await Expenses.create(expenseData);
        res.status(201).json({ success: true, message: "Expense created successfully", json: creating });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


module.exports.fetchExpense =  async (req,res) => {
    try{
        const user = req.user
        const fetch =  await Expenses.findAll({where:{userID : user.ID,date:req.body.date},order: [['createdAt', 'DESC']]})
                res.status(201).json({success :true , message :"fetching the data success", content: fetch})
    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Monthly report controller
module.exports.monthly = async (req, res) => {
    const { month, year, page = 1, limit = 5 } = req.query; // Default page and limit
    const ID = req.user.ID;

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Fetch total count of records for pagination
        const totalRecords = await Expenses.count({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            }
        });

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Fetch paginated data
        const data = await Expenses.findAll({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            order: [['date', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalSum = await Expenses.sum('price', {
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            }
        });
        // console.log(totalSum)

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            message: "Fetching successful",
            content: data,
            totalSum : totalSum,
            totalPages: totalPages,
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




// Yearly report controller
module.exports.yearly = async (req, res) => {
    const { year, page = 1, limit = 5 } = req.query; // Default page and limit
    const ID = req.user.ID;

    try {
        const startDate = new Date(year, 0, 1); // January 1st of the given year
        const endDate = new Date(year, 12, 0); // December 31st of the given year

        // Fetch total count of records for pagination
        const totalRecords = await Expenses.count({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            }
        });

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Fetch paginated data
        const data = await Expenses.findAll({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            order: [['date', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(totalRecords / limit);

        const monthlyYear =  await getMonthlyReportForUser(ID,year)
        

        await res.status(200).json({
            success: true,
            message: "Fetching successful",
            content: data,
            monthlyYear : monthlyYear,
            totalPages: totalPages,
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports.downloadFetchYearly = async (req, res) => {
    const { year } = req.query; 
    const ID = req.user.ID;

    try {
        const startDate = new Date(year, 0, 1); // January 1st of the given year
        const endDate = new Date(year, 12, 0); // December 31st of the given year


        // Fetch paginated data
        const data = await Expenses.findAll({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            order: [['date', 'ASC']],
        });

        const monthlyYear =  await getMonthlyReportForUser(ID,year)
        

        await res.status(200).json({
            success: true,
            message: "Fetching download data successful",
            content: data,
            monthlyYear : monthlyYear
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports.downloadFetchMonth = async (req, res) => {
    const { month, year} = req.query; // Default page and limit
    const ID = req.user.ID;

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);


        const data = await Expenses.findAll({
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            },
            order: [['date', 'ASC']]

        });

        const totalSum = await Expenses.sum('price', {
            where: {
                userID: ID,
                date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            }
        });
       

       
        res.status(200).json({
            success: true,
            message: "Fetching download data successful",
            content: data,
            totalSum : totalSum
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports.leaderboard = async(req,res)=>{
    try{
        const data =  req.query

        const response = await leaderboard(data)

        res.status(200).json({success:true,message :"Data Successfully fetched",content: response})

    }catch(err){
        console.log(err)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}







async function getMonthlyReportForUser(userID, year) {
    try {
      const monthlyReport = await sequelize.query(
        `SELECT 
          MONTH(date) AS month, 
          SUM(price) AS total_expense
        FROM 
          expenses
        WHERE 
          userID = :userID
          AND YEAR(date) = :year
        GROUP BY 
          MONTH(date)
        ORDER BY 
          MONTH(date) ASC`,
        {
          replacements: { userID: userID, year: year }, // Pass dynamic values
          type: Sequelize.QueryTypes.SELECT // Specify that you're selecting data
        }
      );
  
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
  
  
  
  
      const formattedReport = monthlyReport.map(item => ({
    month: monthNames[item.month - 1], // Subtract 1 to get the correct index
    total_expense: item.total_expense
        }));
  
        return formattedReport;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    }
  }


  async function leaderboard(inputData) {
    try {
        const startDate = new Date(inputData.year, inputData.month - 1, 1); 
        const endDate = new Date(inputData.year, inputData.month, 0); 

        const query = `
           SELECT 
            u.userName,
            SUM(e.price) AS totalExpense
        FROM 
            Users u
        LEFT JOIN 
            Expenses e ON u.ID = e.userId  
        WHERE 
             e.date >= :startDate AND e.date <= :endDate  
        GROUP BY 
            u.ID, u.userName
        ORDER BY 
            totalExpense DESC;
                `;

        const replacements = { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

            return results;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}