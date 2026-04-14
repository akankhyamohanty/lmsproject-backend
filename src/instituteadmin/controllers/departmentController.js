const DepartmentModel = require('../models/departmentModel');

const departmentController = {
    /**
     * 🔍 Get all departments
     * Uses req.instituteId from the verifyToken middleware 
     * (Handles normal login + Super Admin impersonation)
     */
    getDepartments: async (req, res) => {
        try {
            const instituteId = req.instituteId;
            
            if (!instituteId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Institute context is required." 
                });
            }

            const departments = await DepartmentModel.getAll(instituteId);
            
            res.json({ 
                success: true, 
                data: departments 
            });
        } catch (error) {
            console.error("❌ Get Departments Error:", error.message);
            res.status(500).json({ 
                success: false, 
                message: "Server error while fetching departments" 
            });
        }
    },

    /**
     * ✨ Create a new Department
     * Expected body: { name, hodId, leadRole, category, type, description, roomNumber }
     */
    createDepartment: async (req, res) => {
        try {
            const instituteId = req.instituteId;
            const { name, category, leadRole } = req.body;

            // Strict Validation
            if (!instituteId) {
                return res.status(400).json({ success: false, message: "Institute context missing" });
            }
            
            // 🚀 Require leadRole alongside name and category
            if (!name || !category || !leadRole) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Department name, category, and lead role are required" 
                });
            }

            const insertId = await DepartmentModel.create(instituteId, req.body);
            
            res.status(201).json({ 
                success: true, 
                message: "Department created successfully", 
                insertId 
            });
        } catch (error) {
            console.error("❌ Create Department Error:", error.message);
            res.status(500).json({ 
                success: false, 
                message: "Server error while creating department" 
            });
        }
    },

    /**
     * 📝 Update an existing Department
     */
    updateDepartment: async (req, res) => {
        try {
            const instituteId = req.instituteId;
            const departmentId = req.params.id;

            if (!instituteId || !departmentId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Missing required parameters for update" 
                });
            }

            const affectedRows = await DepartmentModel.update(departmentId, instituteId, req.body);
            
            if (affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Department not found or no changes were made" 
                });
            }

            res.json({ 
                success: true, 
                message: "Department updated successfully" 
            });
        } catch (error) {
            console.error("❌ Update Department Error:", error.message);
            res.status(500).json({ 
                success: false, 
                message: "Server error while updating department" 
            });
        }
    },

    /**
     * 🗑️ Delete a Department
     * Scoped to instituteId for security
     */
    deleteDepartment: async (req, res) => {
        try {
            const instituteId = req.instituteId;
            const departmentId = req.params.id;

            if (!instituteId || !departmentId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Missing required parameters for deletion" 
                });
            }

            const affectedRows = await DepartmentModel.delete(departmentId, instituteId);
            
            if (affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Department not found or you do not have permission to delete it" 
                });
            }
            
            res.json({ 
                success: true, 
                message: "Department deleted successfully" 
            });
        } catch (error) {
            console.error("❌ Delete Department Error:", error.message);
            res.status(500).json({ 
                success: false, 
                message: "Server error while deleting department" 
            });
        }
    }
};

module.exports = departmentController;