import express from "express";
import * as auth from "../controllers/adminAuth.js";

const router = express.Router();

// router.get("/", auth.welcome)
router.post("/adminLogin", auth.adminLogin);
router.post("/addSlot", auth.addSlot);
router.get("/fatchSlot", auth.fatchSlot);
router.delete("/deleteSlot", auth.deleteSlot);
router.put("/updateSlot", auth.updateSlot);
router.put("/updatePendingSlot", auth.updatePendingSlot); //?update the pending status
router.put("/updateNameInSlot", auth.updateNameInSlot);  //? naam update krna 
router.put("/updateNotConfirm", auth.updateNotConfirm); //? if the request is not relevent


export default router;
