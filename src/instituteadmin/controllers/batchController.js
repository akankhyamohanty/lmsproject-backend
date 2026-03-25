const BatchModel = require('../models/batchModel');

exports.getBatches = async (req, res) => {
  try {
    const batches = await BatchModel.getAll(req.user.code);
    res.json({ success: true, batches });
  } catch (err) {
    console.error("💥 SQL ERROR IN getBatches:", err); // 👈 This will reveal the crash!
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await BatchModel.getById(req.params.id, req.user.code);
    if (!batch) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, batch });
  } catch (err) {
    console.error("💥 SQL ERROR IN getBatchById:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { sections, studentIds, ...mainData } = req.body;
    const batchData = { ...mainData, institute_code: req.user.code };
    const batchId = await BatchModel.create(batchData, sections, studentIds);
    res.status(201).json({ success: true, batchId });
  } catch (err) {
    console.error("💥 SQL ERROR IN createBatch:", err);
    res.status(500).json({ success: false, message: "Creation failed" });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    await BatchModel.delete(req.params.id, req.user.code);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("💥 SQL ERROR IN deleteBatch:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};