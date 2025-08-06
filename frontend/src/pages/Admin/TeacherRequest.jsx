import { useNavigate } from 'react-router-dom';
import { Line } from '../../assets/Classroom';
import { AdminSubMenu, Footer, Header } from '../../components';

const TeacherRequest = () => {
    const requests = [
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
    ];

    const navigate = useNavigate();

    return (
        <div className="teacher-request-page">
            <Header />
            <main className="main-content">
                <AdminSubMenu />

                <section className="requests-section">
                    <div className="requests-header">
                        <h1>Teacher's Request</h1>
                        <div className="pending-request__filter-dropdown">
                            <span>All lists: </span>
                            <select
                                value={location.pathname}
                                onChange={(e) => navigate(e.target.value)}
                            >
                                <option value="/teacher-request">Teacher's Request</option>
                                <option value="/teacher-request">General</option>
                            </select>
                        </div>
                    </div>
                    <div className="find-user-bar">
                        <input type="text" placeholder="Enter user's email you want to find" />
                    </div>

                    <table className="requests-table">
                        <thead>
                            <tr className='request-table__tr'>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request, index) => (
                                <tr key={index}>
                                    <td>{request.id}</td>
                                    <td>{request.username}</td>
                                    <td>{request.email}</td>
                                    <td>
                                        <div className="btn">
                                            <button className="btn approve"
                                            // onClick={() => handleApproveJoinRequest(item.learner_id)}
                                            >Approve</button>
                                            <button className="btn decline"
                                            // onClick={() => handleRejectJoinRequest(item.learner_id)}
                                            >Decline</button>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="review-btn" onClick={() => navigate("/admin-teacher-verification")}>Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TeacherRequest;