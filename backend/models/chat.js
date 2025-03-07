const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Chat = sequelize.define("Chat", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true }, // Group name
  latestMessage: { type: DataTypes.STRING, allowNull: true }, // Latest message in the chat
}, { timestamps: true });

module.exports = Chat;
