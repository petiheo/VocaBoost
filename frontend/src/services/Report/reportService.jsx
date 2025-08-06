import api from "../../lib/api";

const reportService = {
    reportContent: async (wordId, reason) => {
        if (!wordId || !reason) return;
        const res = await api.post("/user/report", { wordId, reason });
        return res.data;
    },
};

export default reportService;
