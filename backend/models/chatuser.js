const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Chat = require("./chat");

const ChatUser = sequelize.define("ChatUser", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chatId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

User.belongsToMany(Chat, { through: ChatUser , foreignKey: "userId" });
Chat.belongsToMany(User, { through: ChatUser , foreignKey: "chatId"   });

module.exports = ChatUser;
