const classroomModel = require('../models/classroom.model');

const generateUniqueJoinCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Check if code exists
        const existing = await classroomModel.isJoinCodeUnique(code);
            
        if (!existing) {
            isUnique = true;
        }
    }
    
    return code;
}

function computeAssignmentStatus(startDate, dueDate) {
    const now = new Date();
    const start = new Date(startDate);
    const due = dueDate ? new Date(dueDate) : null;

    if (now < start) return 'pending';
    if (due && now > due) return 'overdue';
    return 'assigned';
}

module.exports = {
    generateUniqueJoinCode,
    computeAssignmentStatus,
};