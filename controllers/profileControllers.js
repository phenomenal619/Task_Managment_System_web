const pool = require("../utils/db"); // Import the PostgreSQL pool connection

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Query to get the user's profile
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);

    // Check if the user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    const user = result.rows[0];
    res.status(200).json({ user, status: true, msg: "Profile found successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}
