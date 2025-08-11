import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { AdminSubMenu, Footer, Header } from '../../components';
import { toast } from 'react-toastify';
import adminService from '../../services/Admin/adminService';

// Memoized UserItem component
const UserItem = memo(function UserItem({ user, onBan, onUnban }) {
  const isBanned = user.account_status === 'suspended';
  const isAdmin = user.role === 'admin';

  return (
    <div className="request-card">
      <div className="request-info">
        <h3>{user.display_name}</h3>
        <p>ID: {user.id.slice(0, 8)}...</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: <span className={`status ${user.account_status}`}>{user.account_status}</span></p>
      </div>
      <div className="request-actions">
        {!isAdmin && (
          <>
            {isBanned ? (
              <button 
                className="btn btn-success" 
                onClick={() => onUnban(user.id)}
              >
                Unban
              </button>
            ) : (
              <button 
                className="btn btn-danger" 
                onClick={() => onBan(user.id)}
              >
                Ban
              </button>
            )}
          </>
        )}
        {isAdmin && (
          <span className="admin-badge">Admin</span>
        )}
      </div>
    </div>
  );
});

const AdminUsers = memo(function AdminUsers() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 20
    });

    // Memoized search handler
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // Memoized navigation handler
    const handleNavigationChange = useCallback((e) => {
        navigate(e.target.value);
    }, [navigate]);

    // Fetch users from API
    const fetchUsers = useCallback(async (page = 1, search = '') => {
        try {
            setLoading(true);
            // Small delay to show skeleton loading
            await new Promise(resolve => setTimeout(resolve, 800));
            const response = await adminService.getAllUsers(page, pagination.limit, search);
            
            if (response.success) {
                setUsers(response.data.users || []);
                // Handle both possible response structures
                const paginationData = response.data.pagination || response.pagination;
                setPagination({
                    currentPage: paginationData?.currentPage || 1,
                    totalPages: paginationData?.totalPages || 1,
                    totalItems: paginationData?.totalItems || 0,
                    limit: paginationData?.limit || 20
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        fetchUsers(1, searchTerm);
    }, [fetchUsers, searchTerm]);

    // Debounced search to avoid too many API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== '') {
                fetchUsers(1, searchTerm);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchUsers]);

    // Memoized ban/unban handlers
    const handleBanUser = useCallback(async (userId) => {
        const reason = prompt('Enter reason for banning this user (optional):');
        if (reason === null) return; // User cancelled
        
        try {
            const response = await adminService.banUser(userId, reason);
            if (response.success) {
                toast.success('User banned successfully');
                await fetchUsers(pagination.currentPage, searchTerm);
            }
        } catch (error) {
            console.error('Error banning user:', error);
            toast.error('Failed to ban user');
        }
    }, [fetchUsers, pagination.currentPage, searchTerm]);

    const handleUnbanUser = useCallback(async (userId) => {
        if (!confirm('Are you sure you want to unban this user?')) return;
        
        try {
            const response = await adminService.unbanUser(userId);
            if (response.success) {
                toast.success('User unbanned successfully');
                await fetchUsers(pagination.currentPage, searchTerm);
            }
        } catch (error) {
            console.error('Error unbanning user:', error);
            toast.error('Failed to unban user');
        }
    }, [fetchUsers, pagination.currentPage, searchTerm]);

    

  return (
    <div className="teacher-request-page">
      <Header />
      <main className="main-content">
        <AdminSubMenu />

        <section className="requests-section">
        <div className="requests-header">
          <h1>Users</h1>
          <div className="pending-request__filter-dropdown">
              <span>Total users: {pagination.totalItems || users.length}</span>
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
          />
        </div>

        {loading ? (
            <div className="skeleton-container">
                <table className="requests-table">
                    <thead>
                        <tr className='request-table__tr'>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, index) => (
                            <tr key={index} className="skeleton-row">
                                <td><div className="skeleton skeleton-id"></div></td>
                                <td><div className="skeleton skeleton-name"></div></td>
                                <td><div className="skeleton skeleton-email"></div></td>
                                <td><div className="skeleton skeleton-badge"></div></td>
                                <td><div className="skeleton skeleton-badge"></div></td>
                                <td><div className="skeleton skeleton-action"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <>
                <table className="requests-table">
                    <thead>
                        <tr className='request-table__tr'>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isBanned = user.account_status === 'suspended';
                            const isAdmin = user.role === 'admin';
                            
                            return (
                                <tr key={user.id}>
                                    <td className="id-cell">{user.id.slice(0, 8)}...</td>
                                    <td className="name-cell">{user.display_name}</td>
                                    <td className="email-cell">
                                        <span title={user.email}>{user.email}</span>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.account_status}`}>
                                            {user.account_status}
                                        </span>
                                    </td>
                                    <td>
                                        {!isAdmin && (
                                            <div className="action-buttons">
                                                {isBanned ? (
                                                    <button 
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleUnbanUser(user.id)}
                                                    >
                                                        Unban
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleBanUser(user.id)}
                                                    >
                                                        Ban
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <span className="admin-protected">Protected</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {users.length === 0 && (
                    <div className="no-users">
                        <p>No users found.</p>
                    </div>
                )}
            </>
        )}
        </section>
      </main>
      <Footer />
    </div>
    );
});

export default AdminUsers;
