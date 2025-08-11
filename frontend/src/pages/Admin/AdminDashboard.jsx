import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback, memo } from 'react';
import { AdminSubMenu, Footer, Header } from '../../components';
import { AnalyticsIcon, ApproveIcon, UsersIcon } from '../../assets/Admin';

// Memoized QuickActionCard component
const QuickActionCard = memo(function QuickActionCard({ action, onClick }) {
  return (
    <div className="action-card" onClick={onClick}>
      <div className="action-icon">{action.icon}</div>
      <div className="action-content">
        <h4>{action.title}</h4>
        <p>{action.description}</p>
      </div>
    </div>
  );
});

// Memoized StatCard component  
const StatCard = memo(function StatCard({ value, label, className }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
});

const AdminDashboard = memo(function AdminDashboard() {
    const navigate = useNavigate();

    // Memoized stats to prevent recreating on every render
    const stats = useMemo(() => ({
        users: 250,
        serverLoad: 32.5,
        teacherRequests: 14,
        moderateContent: 3
    }), []);

    // Memoized navigation handlers
    const navigateToUsers = useCallback(() => navigate('/admin-users'), [navigate]);
    const navigateToTeacherRequests = useCallback(() => navigate('/teacher-request'), [navigate]);
    const navigateToAnalytics = useCallback(() => navigate('/admin-dashboard'), [navigate]);

    // Memoized quick actions to prevent recreating on every render
    const quickActions = useMemo(() => [
        {
            title: 'Ban/Unban Account',
            description: 'Manage users access',
            icon: <img src={UsersIcon} alt="Users Icon" className='icon' />,
            action: navigateToUsers
        },
        {
            title: 'Approve Teacher Requests',
            description: 'Review teaching applications',
            icon: <img src={ApproveIcon} alt="Approve Icon" className='icon' />,
            action: navigateToTeacherRequests
        },
        {
            title: 'View system analytics',
            description: 'Review system performance and usage',
            icon: <img src={AnalyticsIcon} alt="Analytics Icon" className='icon' />,
            action: navigateToAnalytics
        }
    ], [navigateToUsers, navigateToTeacherRequests, navigateToAnalytics]);

    return (
        <div className="dashboard">
            <Header />
            <main className="main-content">
                <AdminSubMenu />

                <section className="dashboard__section">
                    <div className="dashboard__header">
                        <h1>System Overview</h1>
                    </div>

                    <div className="dashboard__stats">
                        <StatCard 
                            value={stats.users} 
                            label="Users" 
                            className="stat-card--users" 
                        />

                        <StatCard 
                            value={`${stats.serverLoad}%`} 
                            label="Server load" 
                            className="stat-card--server" 
                        />

                        <div className="stat-card stat-card--requests">
                            <div className="stat-number">{stats.teacherRequests}</div>
                            <div className="stat-label">Teacher request</div>
                            <div className="stat-subtitle">{stats.teacherRequests} requests to review</div>
                        </div>

                        <div className="stat-card stat-card--content">
                            <div className="stat-number">{stats.moderateContent}</div>
                            <div className="stat-label">Moderate Content</div>
                            <div className="stat-subtitle">{stats.moderateContent} reports to review</div>
                        </div>
                    </div>

                    <div className="dashboard__actions">
                        <div className="activity-log-card">
                            <h3>Activity log</h3>
                            <div className="activity-chart">
                                <div className="chart-bars">
                                    <div className="bar" style={{height: '60%'}}></div>
                                    <div className="bar" style={{height: '80%'}}></div>
                                    <div className="bar" style={{height: '40%'}}></div>
                                    <div className="bar" style={{height: '90%'}}></div>
                                    <div className="bar" style={{height: '70%'}}></div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            {quickActions.map((action, index) => (
                                <QuickActionCard
                                    key={index}
                                    action={action}
                                    onClick={action.action}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
});

export default AdminDashboard;