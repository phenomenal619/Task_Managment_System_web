const pool = require("../utils/db");  // Import the PostgreSQL pool connection

exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.id]);
    const tasks = result.rows;
    res.status(200).json({ tasks, status: true, msg: "Tasks found successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, req.user.id]);
    const task = result.rows[0];
    
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    
    res.status(200).json({ task, status: true, msg: "Task found successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.postTask = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    const result = await pool.query(
      'INSERT INTO tasks (user_id, description) VALUES ($1, $2) RETURNING *',
      [req.user.id, description]
    );
    
    const task = result.rows[0];
    res.status(200).json({ task, status: true, msg: "Task created successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.putTask = async (req, res) => {
  try {
    const { description } = req.body;
    const { taskId } = req.params;
    
    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = result.rows[0];

    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't update task of another user" });
    }

    const updatedTask = await pool.query(
      'UPDATE tasks SET description = $1 WHERE id = $2 RETURNING *',
      [description, taskId]
    );
    
    res.status(200).json({ task: updatedTask.rows[0], status: true, msg: "Task updated successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = result.rows[0];

    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't delete task of another user" });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}
