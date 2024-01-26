import Admin from "../modals/admin.js";
import slot from "../modals/slot.js";
import verifyModel from '../modals/otpVerify.js'
import bcrypt from "bcryptjs";
import { dbConnection } from "../helpers/dbConnection.js";
import jwt from 'jsonwebtoken'; // Importing jwt directly
import 'dotenv/config'
import {ses} from '../config.js'
import { nanoid } from 'nanoid';
import {createEmailTemplate} from '../helpers/emailVerify.js'

const generateOTP = () => {
  // Generate a random 6-digit OTP consisting of numbers
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  const numericOTP = Math.floor(Math.random() * (max - min + 1)) + min;
  return numericOTP.toString(); // Convert to string
};


export const adminLogin = async (req, res) => {
  dbConnection();
  const { email, password } = req.body;

  try {
    console.log(">>>>>>>>>> api hit");
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(401).json({ message: "admin not found" });
    }

    const isPasswordValid = bcrypt.compareSync(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "incorrect password" });
    }

    // Generate access token
    const accessToken = jwt.sign({ adminId: admin._id }, process.env.jwtSecretKey, { expiresIn: '7d' });

    // Generate refresh token
    const refreshToken = jwt.sign({ adminId: admin._id }, process.env.refreshTokenSecret, { expiresIn: '30d' });

    res.status(200).json({ message: "Login successful", token: accessToken, refreshToken });
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




export const sendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  console.log(email, "email");
  console.log(otp, "otp");

  try {
    // Check if the email already exists in the database
    const existingRecord = await verifyModel.findOne({ email });

    if (existingRecord) {
      return res.status(400).json({ error: 'Email is already in use. Please choose another one.' });
    }

    const params = createEmailTemplate(email, otp);
    const sendEmail = ses.sendEmail(params).promise();

    await sendEmail;
    await new verifyModel({ email, otp }).save(); // Save OTP to the database

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyOtp =  async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await verifyModel.findOne({ email });

    if (record && record.otp === otp) {
      // OTP match
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      // OTP mismatch
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const sendFormDetailsEmail = async (req, res) => {
  const {
    name,
    email,
    country,
    gender,
    interestedArea,
    discussionTopics,
    doubtsQuestions,
    // Add other form fields here
  } = req.body;

  try {
    // Modify the email template to include all the form details
    const params = {
      Source: 'manishtomar.uk@gmail.com',
      Destination: { ToAddresses: ['manishtomar.uk@gmail.com'] },
      Message: {
        Subject: { Data: 'New Form Submission from StudyNav UK' },
        Body: {
          Text: {
            Data: `
              Name: ${name}
              Email: ${email}
              Country: ${country}
              Gender: ${gender}
              Interested Area: ${interestedArea}
              Discussion Topics: ${discussionTopics.join(", ")}
              Doubts/Questions: ${doubtsQuestions}
            `
          },
          // Optionally, you can use HTML body
        },
      },
    };

    // Await the completion of sendEmail before sending the response
    await ses.sendEmail(params).promise();

    res.status(200).json({ message: 'Form details email sent successfully' });
  } catch (error) {
    console.error("Error sending form details email:", error);
    res.status(500).json({ error: error.message });
  }
};
