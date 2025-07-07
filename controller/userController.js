const User = require("../models/User");

// Create a new User
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const data = {
      username,
      email,
      password,
    };

    // Check if the username or email already exists
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    
    //todo: hook will be called when user is created from encrypting password.
    
    const user = await User.create(data);

    const token = User.generateToken({ id: user.id });

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  try {
    const users = await User.findAll();

    console.log(users)

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password using the instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "User not authorized" });
    }
    
    // Generate JWT token
    const token = User.generateToken({ id: user.id });
    res.status(200).json({ token , username: user.username });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" });
  }
};
