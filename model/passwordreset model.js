const sequelize = require("../database/db");
const Sequelize = require("sequelize");


const PasswordReset = sequelize.define("passwordReset", {
    ID: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  UUID: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  },
  status:{
    type: Sequelize.BOOLEAN,
    allowNull:false,
    defaultValue: true,
  }
});

module.exports = PasswordReset;
