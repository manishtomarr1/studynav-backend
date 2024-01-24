import express from "express";
import morgan from "morgan";
import cors from "cors";
// import { DATABASE } from "./config.js";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import userModel from "./modals/admin.js";
import 'dotenv/config'
const app = express();
app.use(bodyParser.json());
import { dbConnection } from "./helpers/dbConnection.js";
import cron from 'node-cron';
import slotModel from './modals/slot.js'; // assuming this is the path to your slot model
// Update the route to accept data

mongoose.set("strictQuery", false);
//middlewares
app.use(express.json()); //* data will be recieved by server by doing this
app.use(morgan("dev"));
app.use(cors());

const port = process.env.PORT || 9000;


//routes middlewares
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.json({
    data: "node.js welcome you! you are now connected with me.... ",
  });
});

cron.schedule('* * * * *', async () => { // This runs every minute, adjust as needed
  try {
    const now = new Date();
    const expiredSlots = await slotModel.find({
      date: { $lt: now },
      booked: false
    });

    if (expiredSlots.length > 0) {
      await slotModel.deleteMany({
        _id: { $in: expiredSlots.map(slot => slot._id) }
      });
      console.log(`${expiredSlots.length} expired slots deleted`);
    }
  } catch (error) {
    console.error('Error in deleting expired slots:', error);
  }
});

async function createDefaultAdmin() {
  dbConnection()
  try {
    const email = process.env.email
    const existingAdmin = await userModel.findOne({ userType: "Admin" });
    if (existingAdmin) {
      console.log("Default Admin already exists.");
    } else {
      const obj = {
        userType: "Admin",
        firstName: "Manish",
        lastName: "Tomar",
        userName: "ManishTomar",
        countryCode: "+91",
        mobileNumber: "8476889763",
        email: {email},
        password: bcrypt.hashSync(process.env.password),
      };
      const findAdmin = await userModel.findOne({
        email: email,
        // userName: "Admin", 
      });
      // console.log("findAdmin----->>>>>", findAdmin); 
      if (!findAdmin) {
        const result = await userModel.create(obj);
        console.log("Default admin created.", result);
      } else {
        console.log("Default admin is already created 🔫🔫");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
} // Call the function to create the default admin
createDefaultAdmin();
app.listen(port, () => {
  console.log(`Your app is running on port ${port}🔫`);
}); //!go to package.json create type:"module" by this we can us import export
