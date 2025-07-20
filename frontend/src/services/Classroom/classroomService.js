import { data } from "react-router-dom";
import api from "../../lib/api";

const classroomService = {
    //1. Create classroom
    createClassroom: async (data) => {
        const res = await api.post("/classroom/create-classroom", {
            name: data.name,
            description: data.description,
            classroom_status: data.privacy,
            capacity_limit: data.limit
        });
        return res.data;
    },

    //2. My classroom 
    myClassroom: async () => {
        const res = await api.get("/classroom/my-classrooms")
        return res.data
    },

    //3. Request to join classroom 
    joinRequest: async (data) => {
        const res = await api.post("/classroom/join-request", {
            joinCode: data
        })
        return res.data;
    },

    //4. Get Pending Join Requests
    getPendingJoinRequets: async (classroomId) => {
        const res = await api.get(`/classroom/${classroomId}/join-requests`);
        return res.data;
    },

    //5. Approve Join Request
    approveJoinRequest: async ({ classroomId, learnerId }) => { // chua cap nhat data ben ApproveClassroomRequest
        const res = await api.post(`/classroom/${classroomId}/approve-request`, { learnerId });
        return res.data;
    },

    //6. Reject join request 
    rejectJoinRequest: async ({ classroomId, learnerId }) => {
        const res = await api.post(`/classroom/${classroomId}/reject-request`, { learnerId });
        return res.data;
    },

    //7. approve all join request 
    approveAllJoinRequest: async ({ classroomId }) => {
        const res = await api.post(`/classroom/${classroomId}/approve-all`);
        return res.data;
    },

    //8. get learner in classroom 
    getLearnerInClassroom: async (classroomId) => {
        const res = await api.get(`/classroom/${classroomId}/learners`)
        return res.data;
    },

    //9. remove a learner
    removeALearner: async ({ classroomId, learnerId }) => {
        const res = await api.post(`/classroom/${classroomId}/remove-learner`, { learnerId })
        return res.data;
    },

    //10. delete a classroom 
    deleteAClassroom: async (classroomId) => {
        const res = await api.delete(`/classroom/${classroomId}`);
        return res.data;
    },

    //11. Search Learners by Display Name

    //12. Invite Learner (Teacher)
    inviteLearner: async ({ classroomId, email }) => {
        const res = await api.post(`/classroom/${classroomId}/invitation`, { email });
        return res.data;
    },

    //13. Accept invitation (Learner)

    //14. Cancel Invitation (Teacher)
    cancelInvitation: async (classroomId, { email }) => {
        const res = await api.delete(`/classroom/${classroomId}/`, { email });
        return res.data;
    },

    //15. 
    //16.
    //17. Get Invitations (Teacher)
    getInvitations: async (classroomId) => {
        const res = await api.get(`/classroom/${classroomId}/invitations`);
        return res.data;
    }
    //18. 
    //19. 
    //20.
    //21.
    //22.
    //23.
};

export default classroomService;