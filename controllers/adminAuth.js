import Admin from "../modals/admin.js";
import slot from "../modals/slot.js";
import bcrypt from "bcryptjs";
import { dbConnection } from "../helpers/dbConnection.js";
import jwt from 'jsonwebtoken'; // Importing jwt directly
import 'dotenv/config'

export const adminLogin = async (req, res) => {
  dbConnection();
  const { email, password } = req.body;

  try {
    console.log(">>>>>>>>>> api hit");
    const admin = await Admin.findOne({ email: email });
    // console.log("admin=>>>>>>>", admin);
    if (!admin) {
      return res.status(401).json({ message: "admin not found" });
    }
    const newPassword = bcrypt.compareSync(password, admin.password);
    if (!newPassword) {
      return res.status(401).json({ message: "incorrect password" });
    }
    const token = jwt.sign({ adminId: admin._id }, process.env.jwtSecretKey, { expiresIn: '7d' });

    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addSlot = async (req, res) => {
  dbConnection();

  try {
    const { date, booked } = req.body;

    // Create a new slot instance using the Slot model
    const newSlot = new slot({ date, booked });

    // Save the new slot to the database
    await newSlot.save();

    res.status(201).json(newSlot);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the slot." });
  }
};

export const fatchSlot = async (req, res) => {
  try {
    const events = await slot.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events." });
  }
};

export const deleteSlot = async (req, res) => {
  dbConnection();

  const eventId = req.query.eventId;
  // console.log("event id->>>>>>>>>>>>>>>", eventId)

  try {
    await slot.findByIdAndDelete(eventId);
    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event." });
  }
};

export const updateSlot = async (req, res) => {
  dbConnection();

  // console.log("???????????????????? api hit update slot");
  const eventId = req.query.eventId;
  // console.log("event id->>>>>>>>>>>>>>>", eventId);
  try {
    // Find the slot by ID
    const Slot = await slot.findById(eventId);

    if (!Slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Update the booked status to true
    Slot.pending = true;
    await Slot.save();

    return res.json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePendingSlot = async (req, res) => {
  //? jb event pending hoga usko confirm krne k liye
  dbConnection();

  // console.log("???????????????????? api hit updatepending slot");
  const eventId = req.query.eventId;
  console.log("event id->>>>>>>>>>>>>>>", eventId);
  try {
    // Find the slot by ID
    const Slot = await slot.findById(eventId);

    if (!Slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Update the booked status to true
    Slot.pending = false;
    Slot.booked = true;

    await Slot.save();

    return res.json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateNameInSlot = async (req, res) => {
  dbConnection();

  console.log("api hit for name change");
  const eventId = req.query.eventId;
  // console.log("event id->>>>>>>>>>>>>>>", eventId)
  const { name, email } = req.body;

  try {
    const Slot = await slot.findById(eventId);

    if (!Slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    Slot.studentName = name;
    Slot.studentEmail = email;
    await Slot.save();
    return res.json({ message: "Slot name added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateNotConfirm = async (req, res) => {
  dbConnection();

  //? jb event pending hoga usko confirm krne k liye
  // console.log("???????????????????? api hit updatepending slot");
  const eventId = req.query.eventId;
  console.log("event id->>>>>>>>>>>>>>>", eventId);
  try {
    // Find the slot by ID
    const Slot = await slot.findById(eventId);

    if (!Slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Update the booked status to true
    Slot.pending = false;
    Slot.booked = false;
    (Slot.studentEmail = ""), (Slot.studentName = "");

    await Slot.save();

    return res.json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
