const bcrypt = require("bcrypt");
const { createAccessToken } = require("../utils/token");
const { validateEmail } = require("../utils/validation");
const pool = require("../utils/db"); // Import the PostgreSQL pool connection

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please fill all the fields" });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ msg: "Please send string values only" });
    }
    if (password.length < 4) {
      return res.status(400).json({ msg: "Password length must be at least 4 characters" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    // Check if email is already registered
    const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ msg: "This email is already registered" });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

    res.status(200).json({ msg: "Congratulations!! Account has been created for you.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ status: false, msg: "Please enter all details!!" });
    }

    // Retrieve the user by email
    const { rows: userResult } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.length === 0) {
      return res.status(400).json({ status: false, msg: "This email is not registered!!" });
    }

    const user = userResult[0];

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, msg: "Password incorrect!!" });
    }

    // Generate and send the access token
    const token = createAccessToken({ id: user.id });
    delete user.password; // Remove password from user object before sending response

    res.status(200).json({ token, user, status: true, msg: "Login successful.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}
