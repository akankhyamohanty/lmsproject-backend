const db = require('../../config/db');

const DepartmentModel = {
    // Fetch all departments with HOD names
    getAll: async (instituteId) => {
        // We use "AS" to rename the DB columns to match what the React frontend expects
        const query = `
            SELECT 
                d.id, 
                d.department_name AS name, 
                d.head AS hod_id, 
                d.lead_role, 
                d.category, 
                d.type, 
                d.description, 
                d.room_number AS roomNumber,
                CONCAT(u.first_name, ' ', u.last_name) AS hod_name 
            FROM departments d
            LEFT JOIN users u ON d.head = u.id
            WHERE d.institute_code = ?
            ORDER BY d.id DESC
        `;
        const [rows] = await db.query(query, [instituteId]);
        return rows;
    },

    // Create a new department
    create: async (instituteId, data) => {
        const query = `
            INSERT INTO departments 
            (institute_code, department_name, head, lead_role, category, type, description, room_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            instituteId,
            data.name,
            data.hodId || null,
            data.leadRole || null,
            data.category,
            data.type || 'Academic',
            data.description || null,
            data.roomNumber || null
        ]);
        return result.insertId;
    },

    // Update an existing department
    update: async (id, instituteId, data) => {
        const query = `
            UPDATE departments 
            SET department_name = ?, head = ?, lead_role = ?, category = ?, 
                description = ?, room_number = ?, type = ?
            WHERE id = ? AND institute_code = ?
        `;
        const [result] = await db.query(query, [
            data.name,
            data.hodId || null,
            data.leadRole || null,
            data.category,
            data.description || null,
            data.roomNumber || null,
            data.type || 'Academic',
            id,
            instituteId
        ]);
        return result.affectedRows;
    },

    // Delete a department
    delete: async (id, instituteId) => {
        const [result] = await db.query(
            'DELETE FROM departments WHERE id = ? AND institute_code = ?',
            [id, instituteId]
        );
        return result.affectedRows;
    }
};

module.exports = DepartmentModel;