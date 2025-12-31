
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/AdminDashboard.css'; // Reuse basic styles

const FarmerAnalytics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await apiService.getFarmerAnalytics();
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
        <div className="dashboard-page">
            <div className="analytics-container">
                <h2 className="analytics-title">My Farm Analytics</h2>

                <div className="stats-summary-cards">
                    <div className="stat-card">
                        <div className="stat-icon revenue"><i className="fas fa-rupee-sign"></i></div>
                        <div className="stat-info">
                            <h3>Total Income (6 Months)</h3>
                            <p>₹{data.totalIncome?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    {/* Income Chart */}
                    <div className="chart-card full-width">
                        <h3>Monthly Income Trend</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data.incomeChart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()} `} />
                                    <Legend />
                                    <Area type="monotone" dataKey="income" stroke="#82ca9d" fill="#82ca9d" name="Income (₹)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="chart-card">
                        <h3>Top Selling Products</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerAnalytics;
