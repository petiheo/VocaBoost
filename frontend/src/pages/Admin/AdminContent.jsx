import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { DropdownIcon } from '../../assets/Vocabulary';
import { AdminSubMenu, Footer, Header } from '../../components';
import { toast } from 'react-toastify';
import adminService from '../../services/Admin/adminService';

// Memoized ReportItem component to prevent unnecessary re-renders
const ReportItem = memo(function ReportItem({ report, onDelete, onKeep }) {
  return (
    <div key={report.reportId} className="admin-report__item">
      <div className="admin-report__content">
        <h3 className="admin-report__word">{report.reportedWord?.term || 'N/A'}</h3>
        <p className="admin-report__text">
          <span className="admin-report__label">Report Content:</span> {report.reason || 'N/A'}
        </p>
        <p className="admin-report__text">
          <span className="admin-report__label">User:</span> {report.reporter?.displayName || 'Anonymous'}
        </p>
        <p className="admin-report__date">Date: {new Date(report.reportedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}</p>
      </div>
      <div className="admin-report__actions">
        <button 
          className="btn-delete"
          onClick={() => onDelete(report.reportId)}
        >
          Delete
        </button>
        <button 
          className="btn-keep"
          onClick={() => onKeep(report.reportId)}
        >
          Keep
        </button>
      </div>
    </div>
  );
});

const AdminContent = memo(function AdminContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleReports, setVisibleReports] = useState(4);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 20
    });

    const fetchReports = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await adminService.getAllOpenReports(page, pagination.limit);
            console.log(' Full API Response:', response);
            
            // Try both possible structures
            let reportsData = response.data?.reports || [];
            let paginationData = response.data?.pagination;

            setReports(reportsData);
            if (paginationData) {
                setPagination({
                    currentPage: paginationData.currentPage,
                    totalPages: paginationData.totalPages,
                    totalItems: paginationData.totalItems,
                    limit: paginationData.limit
                });
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    // Fetch reports from API
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Memoized filtering computation - expensive operation
    const filteredReports = useMemo(() => {
        if (!searchTerm) return reports; // Show all if no search term
        
        const searchLower = searchTerm.toLowerCase();
        return reports.filter(report => {
            const reportedWord = report.reportedWord?.term || '';
            const reporterName = report.reporter?.displayName || '';
            const reason = report.reason || '';
            
            return reportedWord.toLowerCase().includes(searchLower) ||
                   reporterName.toLowerCase().includes(searchLower) ||
                   reason.toLowerCase().includes(searchLower);
        });
    }, [reports, searchTerm]);

    // Memoized displayed reports computation
    const displayedReports = useMemo(() => {
        return filteredReports.slice(0, visibleReports);
    }, [filteredReports, visibleReports]);

    // Memoized event handlers
    const handleDelete = useCallback(async (reportId) => {
        try {
            await adminService.approveAReport(reportId, 'Content removed by admin');
            setReports(prevReports => prevReports.filter(report => report.reportId !== reportId));
            toast.success('Report approved and content deleted successfully');
        } catch (error) {
            console.error('Error approving report:', error);
            toast.error('Failed to approve report');
        }
    }, []);

    const handleKeep = useCallback(async (reportId) => {
        try {
            await adminService.dismissAReport(reportId, 'Content kept by admin');
            setReports(prevReports => prevReports.filter(report => report.reportId !== reportId));
            toast.success('Report dismissed and content kept successfully');
        } catch (error) {
            console.error('Error dismissing report:', error);
            toast.error('Failed to dismiss report');
        }
    }, []);

    const handleSeeMore = useCallback(() => {
        setVisibleReports(prev => prev + 4);
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className="admin-report">
            <Header />
            <main className="main-content">
                <AdminSubMenu />

                <section className="admin-report__section">
                    <div className="admin-report__header">
                        <h1>Reported content</h1>
                    </div>
                    
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Enter content you want to find"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="admin-report__list">
                        {loading ? (
                            <div className="loading-message">
                                <p>Loading reports...</p>
                            </div>
                        ) : displayedReports.length > 0 ? (
                            displayedReports.map(report => (
                                <ReportItem
                                    key={report.reportId}
                                    report={report}
                                    onDelete={handleDelete}
                                    onKeep={handleKeep}
                                />
                            ))
                        ) : (
                            <div className="no-reports">
                                <p>No reports found.</p>
                            </div>
                        )}
                    </div>

                    {filteredReports.length > visibleReports && (
                        <div className="see-more-container">
                            <button className="btn-see-more" onClick={handleSeeMore}>
                                See more <img src={DropdownIcon} alt="more" />
                            </button>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
});

export default AdminContent;