import { useState } from "react";
import { Header, SideBar, Footer } from "../../components/index.jsx";
import classroomService from "../../services/Classroom/classroomService.js";
import { useNavigate } from "react-router-dom";
import LoadingCursor from "../../components/UI/LoadingCursor";

export default function CreateClassroom() {
  // Xử lý trạng thái của classroom khi khởi tạo classroom
  const [privacy, setPrivacy] = useState("private");

  // Xử lý thông báo trang
  const [errors, setErrors] = useState({});

  //Xử lý điều hướng
  const navigate = useNavigate();

  // Xử lý cursor xoay khi bấm nút đăng nhập
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    const newErrors = {};

    if (classroomName === "") {
      newErrors.classroomName = "The classroom name is empty";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Oke");
      setErrors(newErrors);
      return;
    }

    // Handle API submission or further logic here...
    setIsLoading(true);
    try {
      const res = await classroomService.createClassroom(data);
      navigate("/my-classroom");
    } catch (error) {
      setErrors({ server: error.response?.data?.error || "Classroom error." });
      console.error(errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-classroom">
      <LoadingCursor loading={isLoading} />
      {/* header  */}
      <Header />
      <div className="create-classroom__content">
        {/* side bar  */}
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <form
          className="create-classroom__form"
          onSubmit={handleCreateClassroom}
        >
          <h1 className="create-classroom__header">Create new classroom</h1>
          <div className="classroom-name">
            <input
              className="create-classroom__form--classroom-name"
              name="classroom-name"
              type="text"
              placeholder="Enter classroom name"
            />
            {errors.classroomName && (
              <div className="input-error">{errors.classroomName}</div>
            )}
          </div>
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
              <label className="create-classroom__privacy-section--label">
                Privacy:
              </label>
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
                } else if (parseInt(e.target.value) <= 0) {
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
            value={isLoading ? "Creating..." : "Create Classroom"}
            disabled={isLoading}
          />
        </form>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
