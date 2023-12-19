import { model, Schema, ObjectId } from "mongoose";

const slotSchema = new Schema({
  date: Date, // Date and time of the slot
  booked: {
    // Whether the slot is booked or not
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  studentName: {
    type: String,
  },
  studentEmail: {
    type: String,
  },
});

export default model("slot", slotSchema); //it is the user model which is based on the schema we defined.
