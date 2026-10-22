import mongoose from "mongoose";
import Income from "../models/income.js";

/**
 * =====================================
 * ADD INCOME
 * POST /api/income/addIncome/:id
 * =====================================
 */
export const addIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, date } = req.body;

    // ✅ Validate user id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // 🔐 Check authorization (cannot add income for another user unless admin)
    if (req.user?.id !== id && req.user?.usertype !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Basic validation
    if (!source || amount === undefined || amount === null || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ message: "Valid source and numeric amount are required" });
    }

    // ✅ Create income (MATCHES MODEL)
    const income = await Income.create({
      userid: id,
      source: String(source).trim(),
      amount: Number(amount),
      date: date || Date.now(),
    });

    res.status(201).json({
      message: "Income added successfully ✅",
      income,
    });
  } catch (error) {
    console.error("Add income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * GET INCOME BY USER ID
 * GET /api/income/getbyid/:id
 * =====================================
 */
export const getbyid = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate user id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // 🔐 Check authorization
    if (req.user?.id !== id && req.user?.usertype !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Fetch income for user
    const incomeList = await Income.find({ userid: id }).sort({
      createdAt: -1,
    });

    res.status(200).json(incomeList);
  } catch (error) {
    console.error("Get income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * DELETE INCOME
 * DELETE /api/income/:id
 * =====================================
 */
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate income id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    // 🔐 Only delete own income, or admin can delete any
    const query = req.user?.usertype === "admin"
      ? { _id: id }
      : { _id: id, userid: req.user.id };

    const deletedIncome = await Income.findOneAndDelete(query);

    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found or unauthorized" });
    }

    res.status(200).json({
      message: "Income deleted successfully ✅",
      income: deletedIncome,
    });
  } catch (error) {
    console.error("Delete income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================
 * UPDATE INCOME
 * PUT /api/income/:id
 * =====================================
 */
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, date } = req.body;

    // ✅ Validate income id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    const updateFields = {};
    if (source) updateFields.source = String(source).trim();
    if (amount !== undefined && amount !== null && !isNaN(Number(amount))) {
      updateFields.amount = Number(amount);
    }
    if (date) updateFields.date = date;

    // 🔐 Only update own income, or admin can update any
    const query = req.user?.usertype === "admin"
      ? { _id: id }
      : { _id: id, userid: req.user.id };

    const updatedIncome = await Income.findOneAndUpdate(
      query,
      updateFields,
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found or unauthorized" });
    }

    res.status(200).json({
      message: "Income updated successfully ✅",
      income: updatedIncome,
    });
  } catch (error) {
    console.error("Update income error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};
