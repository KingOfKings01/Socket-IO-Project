const express = require("express");
const {
  loginUser,
  createUser,
} = require("../controller/userController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/sing-in", createUser);

module.exports = router;