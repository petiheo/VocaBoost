import { useState } from "react";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import classroomService from "../../services/Classroom/classroomService.js";
import { useNavigate } from "react-router-dom";

export default function CreateClassroom() {
    const [privacy, setPrivacy] = useState("private");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        const classroomName = e.target["classroom-name"].value;
        const description = e.target["description"].value;
        const limit = parseInt(e.target["limit"].value);

        const data = {
            name: classroomName,
            description,
            privacy,
            limit
        };

        // Handle API submission or further logic here...
        try {
            const res = await classroomService.createClassroom(data);
            navigate("/my-classroom");

        } catch (error) {
            setErrors({ server: error.response?.data?.error || "Classroom error." });
            console.error(errors);
        }
    };

    return (
        <div className="create-classroom">
            {/* header  */}
            <Header />
            <div className="create-classroom__content">
                {/* side bar  */}
                <SideBar />
                <form className="create-classroom__form" onSubmit={handleCreateClassroom}>
                    <h1 className="create-classroom__header">Create new classroom</h1>
                    <input
                        className="create-classroom__form--classroom-name"
                        name="classroom-name"
                        type="text"
                        placeholder="Enter classroom name"
                        required
                    />

                    <input
                        className="create-classroom__form--description"
                        name="description"
                        type="text"
                        placeholder="Description:..."
                        max={1000}
                    />

                    {/* privacy button  */}
                    <div className="create-classroom__privacy-section">
                        <div className="create-classroom__privacy-section--button">
                            <label className="create-classroom__privacy-section--label">Privacy:</label>
                            <button
                                type="button"
                                onClick={() =>
                                    setPrivacy((prev) =>
                                        prev === "private" ? "public" : "private"
                                    )
                                }
                                className={privacy === "private" ? "active" : ""}
                            >

                                {privacy === "private" ? "Private" : "Public"}
                            </button>
                        </div>
                    </div>
                    <input type="hidden" name="privacy" value={privacy} />

                    {/* limit */}
                    <div className="create-classroom__limit-wrapper">
                        <label>Limit:</label>
                        <input
                            className="create-classroom__form--limit"
                            name="limit"
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            defaultValue={50}
                            onChange={(e) => {
                                if (parseInt(e.target.value) > 100) {
                                    e.target.value = 100;
                                }
                                else if (parseInt(e.target.value) <= 0) {
                                    e.target.value = 1;
                                }
                            }}
                            required
                        />
                        <span>students</span>
                    </div>

                    <input
                        className="create-classroom__form--submit"
                        type="submit"
                        value="Create Classroom"
                    />
                </form>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    )
}
