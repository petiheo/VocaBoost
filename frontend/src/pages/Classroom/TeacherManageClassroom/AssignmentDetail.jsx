import React, { useState } from "react";
import { Header, SideBar } from "../../../components";

const mockWords = [
  { word: "advocate", definition: "A person who publicly supports or recommends particularly cause or policy" },
  { word: "benevolent", definition: "well-meaning and kindly" },
  { word: "comprehensive", definition: "complete: including all or nearly all elements or aspects" },
  { word: "diligent", definition: "showing careful and persistent effort" },
  { word: "feasible", definition: "possible to do easily or conveniently" },
  { word: "advocate", definition: "A person who publicly supports or recommends particularly cause or policy" },
  { word: "advocate", definition: "A person who publicly supports or recommends particularly cause or policy" },
  { word: "advocate", definition: "A person who publicly supports or recommends particularly cause or policy" },
];

export default function AssignmentDetail() {
  const [visibleCount, setVisibleCount] = useState(5);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="assignment-detail-page">
      <div className="content">
        <div className="assignment-detail__container">
          <h1>Assignment Details</h1>

          <div className="assignment-box">
            <div className="assignment-header">
              <h2>Unit 1 Vocabulary</h2>
              <button className="remove-btn">Remove</button>
            </div>
            <div className="assignment-meta">
              <p><strong>50</strong> Total words</p>
              <p><strong>94</strong> Learner reviewed</p>
              <p><strong>Start date:</strong> Aug 7, 2025</p>
              <p><strong>Due date:</strong> Aug 14, 2025</p>
            </div>
          </div>

          <div className="word-list">
            {mockWords.slice(0, visibleCount).map((item, index) => (
              <div className="word-card" key={index}>
                <strong>{item.word}</strong>
                <p>{item.definition}</p>
              </div>
            ))}
          </div>

          {visibleCount < mockWords.length && (
            <div className="see-more">
              <button onClick={handleSeeMore}>See more ▼</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
