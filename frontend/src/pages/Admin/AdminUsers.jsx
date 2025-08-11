import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback, memo } from 'react';
import { AdminSubMenu, Footer, Header } from '../../components';

// Memoized UserItem component
const UserItem = memo(function UserItem({ user }) {
  return (
    <div className="request-card">
      <div className="request-info">
        <h3>{user.username}</h3>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
      </div>
      <div className="request-actions">
        <button className="btn btn-primary">Unban</button>
        <button className="btn btn-danger">Ban</button>
      </div>
    </div>
  );
});

const AdminUsers = memo(function AdminUsers() {
    // Memoized users data to prevent recreating on every render
    const users = useMemo(() => [
        { id: 123, username: 'Mia Nguyen', email: 'janesmith@gmail.com' },
        { id: 124, username: 'Alex Nguyen', email: 'janesmith@gmail.com' },
        { id: 125, username: 'Maria Grande', email: 'janesmith@gmail.com' },
        { id: 126, username: 'Billie Eilish', email: 'janesmith@gmail.com' },
        { id: 127, username: 'Brad Pitt', email: 'janesmith@gmail.com' },
        { id: 128, username: 'Phi Hùng', email: 'janesmith@gmail.com' },
        { id: 129, username: 'Hoàng Phan', email: 'janesmith@gmail.com' },
        { id: 130, username: 'Quang Nghị', email: 'janesmith@gmail.com' },
        { id: 131, username: 'Hiệp Thắng', email: 'johndoe@gmail.com' }
    ], []);

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Memoized search handler
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // Memoized navigation handler
    const handleNavigationChange = useCallback((e) => {
        navigate(e.target.value);
    }, [navigate]);

    // Memoized filtering computation - expensive operation
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users; // Show all if no search term
        
        const searchLower = searchTerm.toLowerCase();
        return users.filter(user => {
            const username = user.username || '';
            const email = user.email || '';
            const id = user.id?.toString() || '';
            
            return username.toLowerCase().includes(searchLower) ||
                   email.toLowerCase().includes(searchLower) ||
                   id.includes(searchLower);
        });
    }, [users, searchTerm]);

    

  return (
    <div className="teacher-request-page">
      <Header />
      <main className="main-content">
        <AdminSubMenu />

        <section className="requests-section">
        <div className="requests-header">
          <h1>Users</h1>
          <div className="pending-request__filter-dropdown">
              <span>All lists: {filteredUsers.length}</span>
              <select
                  value="/admin-users"
                  onChange={handleNavigationChange}
              >
                  <option value="/teacher-request">Teacher's Request</option>
                  <option value="/admin-users">Users</option>
              </select>
          </div>
        </div>
        <div className="find-user-bar">
          <input 
              type="text" 
              placeholder="Enter content you want to find"
              value={searchTerm}
              onChange={handleSearchChange}
          />
        </div>

        <table className="requests-table">
          <thead>
              <tr className='request-table__tr'>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Verify</th>
                  <th>Status</th>
              </tr>
          </thead>
          <tbody>
              {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                          <div className="btn">
                              <button className="btn verify"
                              // onClick={() => handleApproveJoinRequest(item.learner_id)}
                              >Verifed</button>
                          </div>
                      </td>
                      <td>
                          <button className="review-btn" onClick={() => navigate("/admin-teacher-verification")}>-</button>
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
});

export default AdminUsers;
