import express from "express";
import config from "config";
import userModel from "../../models/Users/Users.js";

const router = express.Router();

// Get all users API
router.get("/getallusers", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await userModel.find();

    // Check if users exist
    if (!users || users.length === 0) {
      return res.status(404).json({ msg: "No users found." });
    }

    // Return the list of users
    res.status(200).json({
      msg: "Users retrieved successfully.",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "An error occurred while fetching users." });
  }
});

export default router;
