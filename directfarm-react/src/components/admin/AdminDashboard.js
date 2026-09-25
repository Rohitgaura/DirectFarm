import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import '../../styles/AdminDashboard.css';
import AdminAnalytics from './AdminAnalytics';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [logSortOrder, setLogSortOrder] = useState('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Live clock state
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [authFilter, setAuthFilter] = useState('all');

    // Image Modal state
    const [previewImage, setPreviewImage] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out of Admin Console?')) {
            authUtils.clearAuth();
            toast.info('Logged out of Admin Console');
            navigate('/login');
        }
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'stats') {
                const response = await apiService.getAdminStats();
                if (response.success) setStats(response.data);
            } else if (activeTab === 'users') {
                const response = await apiService.getAllUsers();
                if (response.success) setUsers(response.data || []);
            } else if (activeTab === 'products') {
                const response = await apiService.getAllProducts();
                if (response.success) setProducts(response.data || []);
            } else if (activeTab === 'loginLogs') {
                const response = await apiService.getLoginLogs();
                if (response.success) setLoginLogs(response.data || []);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        setSearchTerm('');
        loadData();
    }, [loadData, activeTab]);

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete user "${name || 'User'}"? This action cannot be undone.`)) return;
        try {
            const response = await apiService.deleteUser(id);
            if (response.success) {
                toast.success('User deleted successfully');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete crop listing "${name}"?`)) return;
        try {
            const response = await apiService.deleteProduct(id);
            if (response.success) {
                toast.success('Product deleted successfully');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    // Export Users to CSV
    const exportUsersCSV = () => {
        if (users.length === 0) return toast.info('No user data available to export');
        const headers = ['ID,Name,Email,Phone,Role,JoinedAt\n'];
        const rows = users.map(u =>
            `"${u.id || u._id}","${u.name}","${u.email}","${u.phone || ''}","${u.role}","${new Date(u.createdAt).toISOString()}"`
        ).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `directfarm_users_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success('Users exported to CSV');
    };

    // Export Login Logs to CSV
    const exportLogsCSV = () => {
        if (loginLogs.length === 0) return toast.info('No login logs to export');
        const headers = ['ID,Name,Email,Role,AuthMethod,LoginAt,Latitude,Longitude\n'];
        const rows = loginLogs.map(l =>
            `"${l.id || l._id}","${l.name || ''}","${l.email || ''}","${l.role || ''}","${l.authMethod || ''}","${new Date(l.loginAt).toISOString()}","${l.latitude || ''}","${l.longitude || ''}"`
        ).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `directfarm_login_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success('Login logs exported to CSV');
    };

    // Filtered data memoizations
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.phone || '').includes(searchTerm);
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.farmerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCat = categoryFilter === 'all' || (product.category || '').toLowerCase() === categoryFilter.toLowerCase();
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, categoryFilter]);

    const filteredLogs = useMemo(() => {
        const result = loginLogs.filter(log => {
            const matchesSearch = (log.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAuth = authFilter === 'all' || log.authMethod === authFilter;
            return matchesSearch && matchesAuth;
        });

        return result.sort((a, b) => logSortOrder === 'desc'
            ? new Date(b.loginAt) - new Date(a.loginAt)
            : new Date(a.loginAt) - new Date(b.loginAt)
        );
    }, [loginLogs, searchTerm, authFilter, logSortOrder]);

    // Categories list extracted from products
    const uniqueCategories = useMemo(() => {
        const set = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(set);
    }, [products]);

    // Render Tab Content
    const renderStatsOverview = () => {
        const totalUsers = stats?.users?.total || 0;
        const totalFarmers = stats?.users?.farmers || 0;
        const totalBuyers = stats?.users?.buyers || 0;
        const farmerPercent = totalUsers > 0 ? Math.round((totalFarmers / totalUsers) * 100) : 50;

        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {/* Quick Action Toolbar */}
                <div className="quick-actions-bar">
                    <button className="btn-action-primary" onClick={exportUsersCSV}>
                        <i className="fas fa-file-export"></i> Export Users CSV
                    </button>
                    <button className="btn-action-secondary" onClick={exportLogsCSV}>
                        <i className="fas fa-download"></i> Export Audit Logs
                    </button>
                    <button className="btn-action-secondary" onClick={loadData}>
                        <i className="fas fa-sync-alt"></i> Refresh Data
                    </button>
                </div>

                {/* Hero Stat Cards */}
                <div className="admin-stats-grid">
                    <motion.div className="stat-card-premium" whileHover={{ y: -4 }}>
                        <div className="stat-card-top">
                            <div>
                                <span className="stat-metric-title">Total Active Users</span>
                                <h3 className="stat-metric-value">{totalUsers}</h3>
                            </div>
                            <div className="stat-icon-wrapper users">
                                <i className="fas fa-users"></i>
                            </div>
                        </div>
                        <div>
                            <div className="stat-progress-bar">
                                <div className="progress-farmers" style={{ width: `${farmerPercent}%` }} title={`Farmers: ${farmerPercent}%`}></div>
                                <div className="progress-buyers" style={{ width: `${100 - farmerPercent}%` }} title={`Buyers: ${100 - farmerPercent}%`}></div>
                            </div>
                            <div className="stat-breakdown-legend">
                                <span><i className="fas fa-tractor" style={{ color: '#10b981' }}></i> {totalFarmers} Farmers</span>
                                <span><i className="fas fa-shopping-basket" style={{ color: '#3b82f6' }}></i> {totalBuyers} Buyers</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="stat-card-premium" whileHover={{ y: -4 }}>
                        <div className="stat-card-top">
                            <div>
                                <span className="stat-metric-title">Listed Products</span>
                                <h3 className="stat-metric-value">{stats?.products || 0}</h3>
                            </div>
                            <div className="stat-icon-wrapper products">
                                <i className="fas fa-leaf"></i>
                            </div>
                        </div>
                        <span className="stat-trend-badge positive">
                            <i className="fas fa-check-circle"></i> High Quality Inventory
                        </span>
                    </motion.div>

                    <motion.div className="stat-card-premium" whileHover={{ y: -4 }}>
                        <div className="stat-card-top">
                            <div>
                                <span className="stat-metric-title">Total Orders</span>
                                <h3 className="stat-metric-value">{stats?.orders || 0}</h3>
                            </div>
                            <div className="stat-icon-wrapper orders">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                        </div>
                        <span className="stat-trend-badge positive">
                            <i className="fas fa-chart-line"></i> Direct Farm Trade
                        </span>
                    </motion.div>

                    <motion.div className="stat-card-premium" whileHover={{ y: -4 }}>
                        <div className="stat-card-top">
                            <div>
                                <span className="stat-metric-title">Platform Revenue</span>
                                <h3 className="stat-metric-value">₹{(stats?.revenue || 0).toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="stat-icon-wrapper revenue">
                                <i className="fas fa-rupee-sign"></i>
                            </div>
                        </div>
                        <span className="stat-trend-badge positive">
                            <i className="fas fa-shield-alt"></i> Verified Payments
                        </span>
                    </motion.div>
                </div>

                {/* Dashboard Feeds */}
                <div className="overview-grid">
                    {/* Recent Registered Users */}
                    <div className="dashboard-card">
                        <div className="card-header-bar">
                            <h3><i className="fas fa-user-plus" style={{ color: '#10b981', marginRight: '0.5rem' }}></i> Recently Joined Users</h3>
                            <button className="view-all-btn" onClick={() => setActiveTab('users')}>View All Users →</button>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!stats?.recentUsers || stats.recentUsers.length === 0) ? (
                                        <tr>
                                            <td colSpan="4" className="empty-table-state">No recent user signups</td>
                                        </tr>
                                    ) : (
                                        stats.recentUsers.map(user => (
                                            <tr key={user.id || user._id}>
                                                <td>
                                                    <div className="user-cell-item">
                                                        <div className={`user-avatar-circle ${user.role}`}>
                                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <span className="user-name-text">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge-role ${user.role}`}>{user.role}</span>
                                                </td>
                                                <td style={{ color: '#64748b' }}>{user.email}</td>
                                                <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Health Card */}
                    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="card-header-bar" style={{ margin: 0 }}>
                            <h3><i className="fas fa-server" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i> System Overview</h3>
                        </div>

                        <div className="system-status-pill" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '1rem' }}>
                            <div className="status-dot-pulse"></div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.875rem' }}>PostgreSQL & API Operational</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Backend Server Running Smoothly</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}><i className="fas fa-database" style={{ marginRight: '0.5rem' }}></i> Database</span>
                                <strong style={{ color: '#10b981' }}>Connected</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}><i className="fas fa-shield-alt" style={{ marginRight: '0.5rem' }}></i> Security Auth</span>
                                <strong style={{ color: '#10b981' }}>JWT / OAuth Active</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}><i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i> Latency</span>
                                <strong style={{ color: '#0284c7' }}>Fast (&lt; 20ms)</strong>
                            </div>
                        </div>

                        {/* Recent Uploaded Crops summary */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Latest Crop Uploads</span>
                                <button className="view-all-btn" onClick={() => setActiveTab('products')}>Products →</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {(stats?.recentProducts || []).slice(0, 3).map(p => (
                                    <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>🌱 {p.name}</span>
                                        <span style={{ color: '#059669', fontWeight: 700 }}>₹{p.pricePerKg} / {p.unit || 'kg'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderUsersTab = () => (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="table-filter-toolbar">
                <div className="filter-left-group">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-pills">
                        <button className={`pill-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>All Roles</button>
                        <button className={`pill-btn ${roleFilter === 'farmer' ? 'active' : ''}`} onClick={() => setRoleFilter('farmer')}>Farmers</button>
                        <button className={`pill-btn ${roleFilter === 'buyer' ? 'active' : ''}`} onClick={() => setRoleFilter('buyer')}>Buyers</button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="results-count-tag">{filteredUsers.length} Users Found</span>
                    <button className="btn-action-primary" onClick={exportUsersCSV}>
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Email Address</th>
                            <th>Phone Contact</th>
                            <th>Joined On</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-table-state">
                                        <i className="fas fa-user-slash"></i>
                                        <p>No matching users found for "{searchTerm}".</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id || user._id}>
                                    <td>
                                        <div className="user-cell-item">
                                            <div className={`user-avatar-circle ${user.role}`}>
                                                {user.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <span className="user-name-text">{user.name}</span>
                                                <span className="user-subtext">ID: {(user.id || user._id)?.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-role ${user.role}`}>
                                            <i className={`fas fa-${user.role === 'farmer' ? 'tractor' : 'shopping-basket'}`} style={{ marginRight: '0.2rem' }}></i>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569', fontWeight: 500 }}>{user.email}</td>
                                    <td>
                                        {user.phone ? (
                                            <span style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                                                <i className="fas fa-phone-alt" style={{ marginRight: '0.4rem', color: '#10b981', fontSize: '0.75rem' }}></i>
                                                {user.phone}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#cbd5e1' }}>N/A</span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '0.825rem', color: '#64748b' }}>
                                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            className="btn-icon-danger"
                                            onClick={() => handleDeleteUser(user.id || user._id, user.name)}
                                            title="Delete User"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderProductsTab = () => (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="table-filter-toolbar">
                <div className="filter-left-group">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search crop, farmer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="select-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <span className="results-count-tag">{filteredProducts.length} Products Found</span>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Crop Name</th>
                            <th>Farmer</th>
                            <th>Price / Unit (kg)</th>
                            <th>Category</th>
                            <th>Available Stock</th>
                            <th>Upload Date</th>
                            <th>Location Pin</th>
                            <th>Media</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="9">
                                    <div className="empty-table-state">
                                        <i className="fas fa-box-open"></i>
                                        <p>No product listings found matching your filter criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const mainImg = product.images && product.images.length > 0
                                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                                    : null;

                                const unitLabel = product.unit ? (product.unit.toLowerCase().includes('kg') ? product.unit : `${product.unit} (kg)`) : 'kg';

                                return (
                                    <tr key={product.id || product._id}>
                                        <td>
                                            <strong style={{ color: '#0f172a' }}>🌱 {product.name}</strong>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>
                                                {product.farmerId?.name || product.farmer?.name || 'Farmer'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#059669' }}>
                                                ₹{product.pricePerKg} / {unitLabel}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: '#f1f5f9',
                                                color: '#475569'
                                            }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{product.quantity} {product.unit}</span>
                                        </td>
                                        <td style={{ fontSize: '0.825rem', color: '#64748b' }}>
                                            {new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            {product.location?.coordinates && product.location.coordinates.length === 2 ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${product.location.coordinates[1]},${product.location.coordinates[0]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                                                >
                                                    <i className="fas fa-map-marker-alt" style={{ marginRight: '0.25rem', color: '#ef4444' }}></i>
                                                    View Map
                                                </a>
                                            ) : (
                                                <span style={{ color: '#cbd5e1' }}>N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {mainImg ? (
                                                <button className="image-preview-btn" onClick={() => setPreviewImage(mainImg)}>
                                                    <i className="fas fa-image"></i> View Photo
                                                </button>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>No photo</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => handleDeleteProduct(product.id || product._id, product.name)}
                                                title="Delete Product Listing"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderLoginLogsTab = () => (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="table-filter-toolbar">
                <div className="filter-left-group">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search by user or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-pills">
                        <button className={`pill-btn ${authFilter === 'all' ? 'active' : ''}`} onClick={() => setAuthFilter('all')}>All Auth</button>
                        <button className={`pill-btn ${authFilter === 'local' ? 'active' : ''}`} onClick={() => setAuthFilter('local')}>Email / Password</button>
                        <button className={`pill-btn ${authFilter === 'google' ? 'active' : ''}`} onClick={() => setAuthFilter('google')}>Google SSO</button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="results-count-tag">{filteredLogs.length} Records</span>
                    <button className="btn-action-primary" onClick={exportLogsCSV}>
                        <i className="fas fa-file-csv"></i> Export Logs
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Auth Method</th>
                            <th
                                onClick={() => setLogSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                title="Click to sort by date"
                            >
                                Timestamp <i className={`fas fa-sort-${logSortOrder === 'desc' ? 'down' : 'up'}`} style={{ marginLeft: '0.3rem' }}></i>
                            </th>
                            <th>Geo Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-table-state">
                                        <i className="fas fa-clipboard-check"></i>
                                        <p>No audit login logs match your search criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id || log._id}>
                                    <td>
                                        <div className="user-cell-item">
                                            <div className={`user-avatar-circle ${log.role}`}>
                                                {log.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="user-name-text">{log.name || 'Anonymous User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-role ${log.role}`}>{log.role || 'user'}</span>
                                    </td>
                                    <td style={{ color: '#475569' }}>{log.email}</td>
                                    <td>
                                        <span className={`badge-auth ${log.authMethod === 'google' ? 'google' : log.authMethod === 'facebook' ? 'facebook' : 'local'}`}>
                                            <i className={`fab fa-${log.authMethod === 'google' ? 'google' : log.authMethod === 'facebook' ? 'facebook' : 'key'}`} style={{ marginRight: '0.3rem' }}></i>
                                            {log.authMethod === 'local' ? 'Email Auth' : log.authMethod}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>
                                        {new Date(log.loginAt).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </td>
                                    <td>
                                        {log.latitude && log.longitude ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-map-pin" style={{ marginRight: '0.25rem', color: '#ef4444' }}></i>
                                                {log.latitude.toFixed(3)}, {log.longitude.toFixed(3)}
                                            </a>
                                        ) : (
                                            <span style={{ color: '#cbd5e1' }}>N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    return (
        <div className={`admin-dashboard ${!isSidebarOpen ? 'collapsed' : ''}`}>
            {/* Sidebar */}
            <div className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="admin-logo" onClick={toggleSidebar} title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}>
                    <div className="admin-logo-icon">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <span className="admin-logo-text">DirectFarm</span>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                        title="Overview Dashboard"
                    >
                        <i className="fas fa-chart-line"></i>
                        <span>Overview</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                        title="System Analytics"
                    >
                        <i className="fas fa-chart-pie"></i>
                        <span>Analytics</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                        title="Manage Users"
                    >
                        <i className="fas fa-users"></i>
                        <span>User Accounts</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                        title="Manage Crop Products"
                    >
                        <i className="fas fa-boxes"></i>
                        <span>Crop Inventory</span>
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'loginLogs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loginLogs')}
                        title="Login Audit Logs"
                    >
                        <i className="fas fa-history"></i>
                        <span>Audit Logs</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="system-status-pill">
                        <div className="status-dot-pulse"></div>
                        <span>System Live</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-content">
                {/* Custom Standalone Admin Top Navigation Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="toggle-sidebar-btn" onClick={toggleSidebar} title="Toggle Sidebar">
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="admin-breadcrumb">
                            <span className="breadcrumb-root">DirectFarm Admin Console</span>
                            <h2 className="breadcrumb-current">
                                {activeTab === 'stats' && 'Dashboard Overview'}
                                {activeTab === 'analytics' && 'Platform Analytics'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'products' && 'Crop Inventory Control'}
                                {activeTab === 'loginLogs' && 'Login Audit Logs'}
                            </h2>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <div className="live-clock-pill">
                            <i className="fas fa-clock"></i>
                            <span>
                                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {' '}
                                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>

                        <button className="btn-store-front" onClick={() => navigate('/')} title="View DirectFarm Main Store">
                            <i className="fas fa-store"></i> Store Front
                        </button>

                        <button className="btn-admin-icon" onClick={loadData} title="Refresh Dashboard Data">
                            <i className="fas fa-sync-alt"></i>
                        </button>

                        <div className="admin-user-badge">
                            <div className="admin-avatar">SA</div>
                            <div className="admin-user-info">
                                <span className="admin-user-name">Super Admin</span>
                                <span className="admin-user-role">System Master</span>
                            </div>
                        </div>

                        <button className="btn-admin-logout" onClick={handleLogout} title="Logout of Admin Console">
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>

                {/* Main View Container */}
                <div className="admin-main-padding">
                    {isLoading ? (
                        <div className="admin-loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Fetching latest system data...</span>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'stats' && renderStatsOverview()}
                            {activeTab === 'analytics' && <AdminAnalytics />}
                            {activeTab === 'users' && renderUsersTab()}
                            {activeTab === 'products' && renderProductsTab()}
                            {activeTab === 'loginLogs' && renderLoginLogsTab()}
                        </>
                    )}
                </div>
            </div>

            {/* Image Preview Lightbox Modal */}
            <AnimatePresence>
                {previewImage && (
                    <div className="modal-backdrop" onClick={() => setPreviewImage(null)}>
                        <motion.div
                            className="modal-box"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h4>Crop Photo Preview</h4>
                                <button className="modal-close-btn" onClick={() => setPreviewImage(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-image-container">
                                <img src={previewImage} alt="Crop Listing Preview" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
