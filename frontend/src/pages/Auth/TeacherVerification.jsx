
import { useState } from "react";

import Logo from "../../components/Logo";
import { UploadPattern } from "../../assets/icons";
import AccountPageInput from "../../components/AccountPageInput";
import { RedAsterisk } from "../../assets/Auth";

export default function TeacherVerification() {
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        } else {
            setPreviewImage(null);
        }
    };
    return (


        <div className="teacher-verification">
            <div className="teacher-verification__header">
                <Logo />
            </div>

            <div className="teacher-verification__form-wrapper">
                <h1 className="teacher-verification__title">Teacher Verification</h1>

                <div className="teacher-verification__grid">
                    {/* Left side form */}
                    <div className="teacher-verification__form-left">
                        <AccountPageInput
                            label="Full name"
                            labelIcon={RedAsterisk}
                            name="fullname"
                            type="text"
                            placeholder="Your full name"
                            required
                        />

                        <AccountPageInput
                            label="School"
                            labelIcon={RedAsterisk}
                            name="school"
                            type="text"
                            placeholder="University of Science, VNU-HCM"
                            required
                        />
                        <AccountPageInput
                            label="School Email"
                            labelIcon = {RedAsterisk}
                            name="email"
                            type="text"
                            placeholder="example@hcmus.edu.vn"
                            required
                        />
                        <AccountPageInput
                            label="Additional notes"
                            name="notes"
                            type="text"
                            placeholder="Type here..."
                        />
                    </div>

                    {/* Right side upload */}
                    <div className="teacher-verification__form-right">
                        <label className="teacher-verification__upload-label">Upload:</label>
                        <p className="teacher-verification__upload-description">
                            Upload your teacher ID card or any official document that verifies your teaching position.
                        </p>

                        <div className="teacher-verification__upload-box" >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="teacher-verification__upload-input"
                            />
                            <div className="teacher-verification__upload-icon">
                                <img src={UploadPattern} alt="uppload-pattern" />
                            </div>
                            <p className="teacher-verification__upload-title">Upload a file</p>
                            <p className="teacher-verification__upload-subtext">Drag and drop file here</p>

                            {previewImage && (
                                <div className="teacher-verification__preview">
                                    <img src={previewImage} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="teacher-verification__upload-notes">
                            Make sure:
                            <ul>
                                <li>The document clearly shows your full name and school name.</li>
                                <li>The document is issued by your school (e.g., ID card, employment letter, teacher contract).</li>
                                <li>Sensitive information (like ID numbers) can be blurred if necessary.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="teacher-verification__submit">
                    <AccountPageInput type="submit" value="Submit" />
                </div>
            </div>
        </div>
    );
}
