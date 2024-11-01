
const { defaultValueSchemable } = require("sequelize/lib/utils");
const sequelize = require("../database/db");
const Sequelize = require("sequelize");

const Expenses = sequelize.define("expenses", {
    ID: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
    category:{
      type: Sequelize.STRING,
      allowNull:false
    },
     fileLink: {  
      type: Sequelize.STRING,  
      allowNull: true, 
  },
});

module.exports = Expenses;
