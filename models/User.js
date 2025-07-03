const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    totalExpense: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const SALT = process.env.SALT
        const salt = await bcrypt.genSalt(parseInt(SALT));
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const SALT = process.env.SALT
          const salt = await bcrypt.genSalt(parseInt(SALT));
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Add an instance method to compare passwords
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Add a class-level method to generate JWT
User.generateToken = function (user) {
  return jwt.sign(
    { id: user.id},
    process.env.JWT_SECRET,
  );
};

// Add a class-level method to verify JWT
User.verifyToken = function (token) {
  try {
    const value = jwt.verify(token, process.env.JWT_SECRET);
    return value;
  } catch (error) {
    return null; // Handle token verification failure
  }
};

module.exports = User;