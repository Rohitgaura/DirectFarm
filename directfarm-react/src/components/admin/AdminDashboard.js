
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import '../../styles/AdminDashboard.css';
import AdminAnalytics from './AdminAnalytics';


const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'stats') {
                const response = await apiService.getAdminStats();
                if (response.success) setStats(response.data);
            } else if (activeTab === 'users') {
                const response = await apiService.getAllUsers();
                if (response.success) setUsers(response.data);
            } else if (activeTab === 'products') {
                const response = await apiService.getAllProducts();
                if (response.success) setProducts(response.data);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData, activeTab]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
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

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
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

    const renderStats = () => (
        <div className="admin-stats-grid">
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stat-icon users"><i className="fas fa-users"></i></div>
                <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{stats?.users?.total || 0}</p>
                    <div className="stat-breakdown">
                        <span><i className="fas fa-tractor"></i> {stats?.users?.farmers || 0} Farmers</span>
                        <span><i className="fas fa-shopping-basket"></i> {stats?.users?.buyers || 0} Buyers</span>
                    </div>
                </div>
            </motion.div>

            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="stat-icon products"><i className="fas fa-leaf"></i></div>
                <div className="stat-info">
                    <h3>Total Products</h3>
                    <p>{stats?.products || 0}</p>
                </div>
            </motion.div>

            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="stat-icon orders"><i className="fas fa-shopping-cart"></i></div>
                <div className="stat-info">
                    <h3>Total Orders</h3>
                    <p>{stats?.orders || 0}</p>
                </div>
            </motion.div>

            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="stat-icon revenue"><i className="fas fa-rupee-sign"></i></div>
                <div className="stat-info">
                    <h3>Total Revenue</h3>
                    <p>₹{stats?.revenue?.toLocaleString() || 0}</p>
                </div>
            </motion.div>
        </div>
    );

    const renderUsers = () => (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar">{user.name.charAt(0)}</div>
                                    <span>{user.name}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button className="action-btn delete" onClick={() => handleDeleteUser(user._id)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProducts = () => (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Farmer</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id}>
                            <td>
                                <div className="product-cell">
                                    {product.images && product.images[0] && (
                                        <img src={product.images[0]} alt={product.name} />
                                    )}
                                    <span>{product.name}</span>
                                </div>
                            </td>
                            <td>{product.farmerId?.name || 'Unknown'}</td>
                            <td>₹{product.pricePerKg}/{product.unit}</td>
                            <td>{product.category}</td>
                            <td>{product.quantity} {product.unit}</td>
                            <td>
                                <button className="action-btn delete" onClick={() => handleDeleteProduct(product._id)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={`admin-dashboard ${!isSidebarOpen ? 'collapsed' : ''}`}>
            <div className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="admin-logo" onClick={toggleSidebar} title="Toggle Sidebar">
                    <i className="fas fa-bars"></i>
                    <span>Admin Panel</span>
                </div>
                <nav className="admin-nav">
                    <button
                        className={activeTab === 'stats' ? 'active' : ''}
                        onClick={() => setActiveTab('stats')}
                        title="Dashboard"
                    >
                        <i className="fas fa-chart-line"></i> <span>Dashboard</span>
                    </button>
                    <button
                        className={activeTab === 'analytics' ? 'active' : ''}
                        onClick={() => setActiveTab('analytics')}
                        title="Analytics"
                    >
                        <i className="fas fa-chart-pie"></i> <span>Analytics</span>
                    </button>
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                        title="Users"
                    >
                        <i className="fas fa-users"></i> <span>Users</span>
                    </button>
                    <button
                        className={activeTab === 'products' ? 'active' : ''}
                        onClick={() => setActiveTab('products')}
                        title="Products"
                    >
                        <i className="fas fa-box"></i> <span>Products</span>
                    </button>
                </nav>
            </div>

            <div className="admin-content">
                <header className="admin-header">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <div className="admin-user">
                        <span>Super Admin</span>
                        <div className="admin-avatar">A</div>
                    </div>
                </header>

                <div className="admin-main">
                    {isLoading ? (
                        <div className="admin-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'stats' && renderStats()}
                            {activeTab === 'analytics' && <AdminAnalytics />}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'products' && renderProducts()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
