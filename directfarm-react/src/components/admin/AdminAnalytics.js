import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import '../../styles/AdminDashboard.css';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444'
};

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                fontSize: '0.85rem'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#94a3b8' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ margin: '0.25rem 0 0 0', color: entry.color || '#10b981', fontWeight: 600 }}>
                        {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

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
            <div className="admin-loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading Platform Analytics...</span>
            </div>
        );
    }

    if (!data) return null;

    const pieData = (data.orderStats || []).map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count,
        color: STATUS_COLORS[item._id] || '#64748b'
    })).filter(item => item.value > 0);

    return (
        <motion.div
            className="analytics-wrapper"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="charts-grid">
                {/* User Growth Chart */}
                <div className="chart-card-premium">
                    <div className="chart-header">
                        <div>
                            <h3>User Growth Trajectory</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Registered farmers & buyers platform-wide</span>
                        </div>
                        <span style={{ padding: '0.25rem 0.65rem', background: '#ecfdf5', color: '#047857', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <i className="fas fa-arrow-up" style={{ marginRight: '0.3rem' }}></i>+24% vs last Qtr
                        </span>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.userGrowth}>
                                <defs>
                                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <Tooltip content={<CustomTooltip suffix=" Users" />} />
                                <Area type="monotone" dataKey="users" name="Total Users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#userGrowthGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="chart-card-premium">
                    <div className="chart-header">
                        <div>
                            <h3>Revenue Overview (Last 6 Months)</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total completed transaction value</span>
                        </div>
                        <span style={{ padding: '0.25rem 0.65rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <i className="fas fa-rupee-sign" style={{ marginRight: '0.2rem' }}></i>Direct Transactions
                        </span>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <Tooltip content={<CustomTooltip prefix="₹" />} />
                                <Bar dataKey="revenue" name="Gross Revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="chart-card-premium full-width">
                    <div className="chart-header">
                        <div>
                            <h3>Order Status Breakdown</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time distribution of marketplace orders</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ height: 260 }}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={90}
                                            innerRadius={50}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip suffix=" Orders" />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                    No order data available
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {data.orderStats.map((stat) => {
                                const color = STATUS_COLORS[stat._id] || '#64748b';
                                return (
                                    <div
                                        key={stat._id}
                                        style={{
                                            padding: '1.2rem',
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                            borderLeft: `4px solid ${color}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize', fontWeight: 600 }}>
                                            {stat._id} Orders
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                                            {stat.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAnalytics;
