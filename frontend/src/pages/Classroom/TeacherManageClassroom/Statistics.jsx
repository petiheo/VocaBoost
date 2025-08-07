import {
  Completion,
  LowPerformance,
  Time,
  TotalLearner,
} from "../../../assets/Classroom";
import {
  AssignSubMenu,
  ClassroomTitle,
  TeacherClassroomMenuTab,
} from "../../../components";

const learners = [
  { name: "Anna Nguyen", progress: 60, avgScore: "86%", lastActive: "Today" },
  {
    name: "Anna Nguyen",
    progress: 35,
    avgScore: "86%",
    lastActive: "Yesterday",
  },
  {
    name: "Anna Nguyen",
    progress: 90,
    avgScore: "86%",
    lastActive: "5 minutes ago",
  },
  { name: "Anna Nguyen", progress: 70, avgScore: "86%", lastActive: "now" },
  { name: "Anna Nguyen", progress: 20, avgScore: "86%", lastActive: "Today" },
  { name: "Anna Nguyen", progress: 55, avgScore: "86%", lastActive: "Today" },
  { name: "Anna Nguyen", progress: 40, avgScore: "86%", lastActive: "Today" },
];

export default function Statistic() {
  return (
    <div className="statistics">
      <ClassroomTitle />

      <AssignSubMenu />
      <section className="summary">
        <div className="card pink">
          <h4>Total Learners</h4>
          <img
            src={TotalLearner}
            alt="total-learner"
            style={{ width: "50px" }}
          />
          <p>32</p>
        </div>
        <div className="card green">
          <h4>Completion Rate</h4>
          <img
            src={Completion}
            alt="completion-rate"
            style={{ width: "50px" }}
          />
          <p>86%</p>
        </div>
        <div className="card red">
          <h4>Low performer</h4>
          <img
            src={LowPerformance}
            alt="low-performance"
            style={{ width: "50px" }}
          />
          <p>5</p>
        </div>
        <div className="card blue">
          <h4>Avg. Study Time</h4>
          <img src={Time} alt="avg-time" style={{ width: "50px" }} />
          <p>15m</p>
        </div>
      </section>

      <section className="weekly-progress">
        <h4>Weekly Average Progress</h4>
        <div className="chart-placeholder">[Chart goes here]</div>
      </section>

      <section className="student-list">
        <h4>Learner Performance</h4>
        <table>
          <thead>
            <tr className="student-row">
              <th>Learner</th>
              <th>Progress</th>
              <th>Avg. Score</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {learners.map((learner, index) => (
              <tr className="student-row" key={index}>
                <td>{learner.name}</td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="fill"
                      style={{ width: `${learner.progress}%` }}
                    ></div>
                  </div>
                </td>
                <td>{learner.avgScore}</td>
                <td>{learner.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
