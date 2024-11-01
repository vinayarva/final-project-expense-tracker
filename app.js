const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require("sequelize")
const path = require("path")

require('dotenv').config();

const sequelize = require('./database/db');

const User_routes = require('./routes/user route'); 
const expense_routes = require("./routes/expense route")




const User = require("./model/user model")
const PasswordReset = require("./model/passwordreset model")
const Expenses = require("./model/expense model")



const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json());

// app.use((req, res, next) => {
//     if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
//         res.setHeader('Cache-Control', 'public, max-age=86400');  
//     } else if (req.url.endsWith('.html')) {
//         res.setHeader('Cache-Control', 'no-cache'); 
//     }
//     next();
// });



app.use(User_routes)
app.use(expense_routes)

app.use((req, res) => {
    const url = req.url;
    res.sendFile(path.join(__dirname, `/public${url}`));
});


User.hasMany(Expenses,{ foreignKey : "userID"})
Expenses.belongsTo(User)



sequelize
    .sync({ alter : false }) // Adjust force to true for development, false for production
    .then(() => {
        app.listen(process.env.PORT, '0.0.0.0', () => {
            // console.log('Server is running on http://localhost:4000/');
        });
    })
    .catch((err) => {
        console.error('Error connecting to database:', err);
    });