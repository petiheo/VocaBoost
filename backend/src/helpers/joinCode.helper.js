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

module.exports = {
    generateUniqueJoinCode
};