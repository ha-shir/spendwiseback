import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addIncome,
  getbyid,
  deleteIncome,
  updateIncome,
} from "../controller/incomecontroller.js";

const router = express.Router();

// 🔐 ALL income routes protected by auth middleware
router.post("/addIncome/:id", auth, addIncome);
router.get("/getbyid/:id", auth, getbyid);
router.delete("/:id", auth, deleteIncome);
router.put("/:id", auth, updateIncome);

export default router;
