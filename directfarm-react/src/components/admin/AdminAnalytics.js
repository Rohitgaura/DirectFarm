import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/AdminDashboard.css'; // Reuse basic styles

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await apiService.getAdminAnalytics();
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="analytics-loading">
                <i className="fas fa-spinner fa-spin"></i> Loading Analytics...
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="analytics-container">
            <h2 className="analytics-title">System Analytics</h2>

            <div className="charts-grid">
                {/* User Growth Chart */}
                <div className="chart-card">
                    <h3>User Growth Trend</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="chart-card">
                    <h3>Revenue Overview (Last 6 Months)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="chart-card full-width">
                    <h3>Order Status Distribution</h3>
                    <div className="stats-summary">
                        {data.orderStats.map((stat) => (
                            <div key={stat._id} className={`stat-item ${stat._id}`}>
                                <span className="stat-label">{stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}</span>
                                <span className="stat-value">{stat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
