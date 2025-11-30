import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/AdminDashboard.css'; // Reuse basic styles

const BuyerAnalytics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await apiService.getBuyerAnalytics();
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="dashboard-page">
            <div className="analytics-container">
                <h2 className="analytics-title">My Spending Analytics</h2>

                <div className="stats-summary-cards">
                    <div className="stat-card">
                        <div className="stat-icon revenue"><i className="fas fa-wallet"></i></div>
                        <div className="stat-info">
                            <h3>Total Spent (6 Months)</h3>
                            <p>₹{data.totalSpent?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon users"><i className="fas fa-piggy-bank"></i></div>
                        <div className="stat-info">
                            <h3>Estimated Savings</h3>
                            <p>₹{data.totalSaved?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    {/* Spending Trend */}
                    <div className="chart-card full-width">
                        <h3>Monthly Spending Trend</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.spendingChart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="spent" fill="#8884d8" name="Spent (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution (Mock) */}
                    <div className="chart-card">
                        <h3>Spending by Category</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default BuyerAnalytics;
