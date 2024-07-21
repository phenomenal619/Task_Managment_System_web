const pool = require("../db");

// Create a new task
const createTask = async (userId, description) => {
  const result = await pool.query(
    'INSERT INTO tasks (user_id, description) VALUES ($1, $2) RETURNING *',
    [userId, description]
  );
  return result.rows[0];
};

// Get all tasks for a user
const getTasksByUserId = async (userId) => {
  const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
  return result.rows;
};

// Get a single task by ID
const getTaskById = async (taskId, userId) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
  return result.rows[0];
};

// Update a task by ID
const updateTaskById = async (taskId, userId, description) => {
  const result = await pool.query(
    'UPDATE tasks SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
    [description, taskId, userId]
  );
  return result.rows[0];
};

// Delete a task by ID
const deleteTaskById = async (taskId, userId) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
};

module.exports = {
  createTask,
  getTasksByUserId,
  getTaskById,
  updateTaskById,
  deleteTaskById
};
