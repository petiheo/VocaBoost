import { useState } from "react"
import { Header, SideBar } from "../../components/index.jsx"

export default function CreateClassroom() {
    const [privacy, setPrivacy] = useState("invite-only");

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        const classroomName = e.target["classroom-name"].value;
        const description = e.target["description"].value;
        const limit = parseInt(e.target["limit"].value);

        const data = {
            name: classroomName,
            description,
            privacy,
            limit,
        };

        // Handle API submission or further logic here...
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
                        required
                    />

                    {/* privacy button  */}
                    <div className="create-classroom__privacy-section">
                        <div className="create-classroom__privacy-section--button">
                            <label className="create-classroom__privacy-section--label">Privacy:</label>
                            <button
                                type="button"
                                onClick={() =>
                                    setPrivacy((prev) =>
                                        prev === "invite-only" ? "public" : "invite-only"
                                    )
                                }
                                className={privacy === "invite-only" ? "active" : ""}
                            >

                                {privacy === "invite-only" ? "Invite-only" : "Public"}
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
                            step={1}
                            max={100}
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
        </div>
    )
}
