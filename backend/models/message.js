const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Chat = require("./chat");

const Message = sequelize.define("Message", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chatId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  senderName:{type: DataTypes.STRING , allowNull: false},
  content: { type: DataTypes.TEXT, allowNull: false },
  documentUrl: { type: DataTypes.JSON, allowNull: false },
}, { timestamps: true });


Message.belongsTo(User, { foreignKey: "senderId" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

module.exports = Message;
