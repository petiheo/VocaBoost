import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../../components/Layout/Logo";
import { UploadPattern } from "../../assets/icons";
import AccountPageInput from "../../components/Forms/AccountPageInput";
import { RedAsterisk } from "../../assets/Auth";
import teacherService from "../../services/Teacher/teacherService";
import LoadingCursor from "../../components/UI/LoadingCursor";
import authService from "../../services/Auth/authService";

export default function TeacherVerification() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    schoolEmail: "",
    additionalNotes: "",
  });

  // File and preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Authentication check
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = authService.getToken();
      if (!token) {
        setError("Please login first to submit teacher verification.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
        return;
      }

      // Validate token
      try {
        const validation = await authService.validateToken();
        if (!validation || !validation.success) {
          setError("Your session has expired. Please login again.");
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
        }
      } catch (error) {
        setError("Authentication failed. Please login again.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first to submit teacher verification");
      }

      // Validation
      if (
        !formData.fullName ||
        !formData.institution ||
        !formData.schoolEmail
      ) {
        throw new Error(
          "Please fill in all required fields (Full name, School, and School Email)"
        );
      }

      if (!selectedFile) {
        throw new Error("Please upload a verification document");
      }

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName);
      submitData.append("institution", formData.institution);
      submitData.append("schoolEmail", formData.schoolEmail);
      submitData.append("additionalNotes", formData.additionalNotes);
      submitData.append("credentials", selectedFile);

      const result = await teacherService.submitVerification(submitData);

      if (result.success) {
        setSuccess("Teacher verification request submitted successfully!");
        // Navigate to a success page or back to profile after 2 seconds
        setTimeout(() => {
          navigate("/homepage");
        }, 2000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      let errorMessage = "Failed to submit verification request";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        errorMessage = Array.isArray(error.response.data.details)
          ? error.response.data.details.map((d) => d.message || d).join(", ")
          : error.response.data.details;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="teacher-verification">
      <LoadingCursor loading={isLoading} />
      <div className="teacher-verification__header">
        <Logo />
      </div>

      <div className="teacher-verification__form-wrapper">
        <h1 className="teacher-verification__title">Teacher Verification</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="teacher-verification__success">{success}</div>
        )}

        {error && <div className="teacher-verification__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="teacher-verification__grid">
            {/* Left side form */}
            <div className="teacher-verification__form-left">
              <AccountPageInput
                label="Full name"
                labelIcon={RedAsterisk}
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />

              <AccountPageInput
                label="School"
                labelIcon={RedAsterisk}
                name="institution"
                type="text"
                placeholder="University of Science, VNU-HCM"
                value={formData.institution}
                onChange={handleInputChange}
                required
              />
              <AccountPageInput
                label="School Email"
                labelIcon={RedAsterisk}
                name="schoolEmail"
                type="email"
                placeholder="example@hcmus.edu.vn"
                value={formData.schoolEmail}
                onChange={handleInputChange}
                required
              />
              <AccountPageInput
                label="Additional notes"
                name="additionalNotes"
                type="text"
                placeholder="Type here..."
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />
            </div>

            {/* Right side upload */}
            <div className="teacher-verification__form-right">
              <label className="teacher-verification__upload-label">
                Upload:
              </label>
              <p className="teacher-verification__upload-description">
                Upload your teacher ID card or any official document that
                verifies your teaching position.
              </p>

              <div className="teacher-verification__upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="teacher-verification__upload-input"
                />
                <div className="teacher-verification__upload-icon">
                  <img src={UploadPattern} alt="uppload-pattern" />
                </div>
                <p className="teacher-verification__upload-title">
                  Upload a file
                </p>
                <p className="teacher-verification__upload-subtext">
                  Drag and drop file here
                </p>

                {previewImage && (
                  <div className="teacher-verification__preview">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="teacher-verification__upload-notes">
                Make sure:
                <ul>
                  <li>
                    The document clearly shows your full name and school name.
                  </li>
                  <li>
                    The document is issued by your school (e.g., ID card,
                    employment letter, teacher contract).
                  </li>
                  <li>
                    Sensitive information (like ID numbers) can be blurred if
                    necessary.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="teacher-verification__submit">
            <AccountPageInput
              type="submit"
              value={isLoading ? "Submitting..." : "Submit"}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
