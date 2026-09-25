import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import apiService from '../../services/api';
import authUtils from '../../utils/auth';
import { toast } from 'react-toastify';
import '../../styles/AdminDashboard.css';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

const isYesterday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();
};

const FarmerAnalytics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'sales'

    useEffect(() => {
        loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAnalytics = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getFarmerAnalytics();
            console.log('🌾 FarmerAnalytics response:', response);
            if (response.success && response.data) {
                setData(response.data);
            } else {
                await computeFallbackAnalytics();
            }
        } catch (error) {
            console.error('Error loading analytics, computing from products:', error);
            await computeFallbackAnalytics();
        } finally {
            setIsLoading(false);
        }
    };

    const computeFallbackAnalytics = async () => {
        try {
            const user = authUtils.getUser();
            const farmerId = user?.id || user?._id;
            const prodsRes = await apiService.getProducts({ farmerId, limit: 100 });
            if (prodsRes.success && prodsRes.data) {
                const prods = prodsRes.data;
                let totalStockKg = 0;
                let totalStockValue = 0;
                let uploadedTodayCount = 0;
                let uploadedTodayKg = 0;
                const catMap = {};

                const cropQuantityChart = prods.map(p => {
                    const qty = parseFloat(p.quantity) || 0;
                    const price = parseFloat(p.pricePerKg || p.price) || 0;
                    const val = qty * price;
                    const cat = p.category || 'Vegetables';

                    totalStockKg += qty;
                    totalStockValue += val;

                    if (isToday(p.createdAt)) {
                        uploadedTodayCount++;
                        uploadedTodayKg += qty;
                    }

                    catMap[cat] = catMap[cat] || { name: cat, quantity: 0 };
                    catMap[cat].quantity += qty;

                    return {
                        id: p.id || p._id,
                        name: p.name,
                        category: cat,
                        quantity: qty,
                        pricePerKg: price,
                        totalValue: val,
                        createdAt: p.createdAt
                    };
                });

                setData({
                    totalCrops: prods.length,
                    totalStockKg,
                    totalStockValue,
                    uploadedTodayCount,
                    uploadedTodayKg,
                    cropQuantityChart,
                    categoryQuantityChart: Object.values(catMap),
                    uploadTimelineChart: [
                        { name: 'Aug', quantityKg: totalStockKg, cropsCount: prods.length }
                    ],
                    incomeChart: [],
                    topProducts: [],
                    totalIncome: 0
                });
            }
        } catch (err) {
            console.error('Error in fallback analytics computation:', err);
            toast.error('Failed to load analytics data');
        }
    };

    if (isLoading) {
        return (
            <div className="analytics-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', paddingTop: '100px' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#10b981' }}></i>
                <p style={{ color: '#64748b', fontWeight: '600' }}>Loading Crop & Farm Analytics...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="dashboard-page" style={{ minHeight: '90vh', background: '#f8fafc', padding: '100px 1.5rem 3rem 1.5rem' }}>
            <div className="analytics-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="analytics-title" style={{ margin: '0 0 0.35rem 0', fontSize: '1.85rem', color: '#0f172a', fontWeight: '800' }}>
                            🌾 Farm Produce & Quantity Analytics
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                            Live insights into your uploaded crops, available quantities, inventory valuation, and sales
                        </p>
                    </div>

                    {/* View Switcher Tabs */}
                    <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9px',
                                border: 'none',
                                background: activeTab === 'inventory' ? '#ffffff' : 'transparent',
                                color: activeTab === 'inventory' ? '#0f172a' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                boxShadow: activeTab === 'inventory' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <i className="fas fa-boxes-stacked" style={{ color: '#10b981' }}></i>
                            Uploaded Crops & Stock
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9px',
                                border: 'none',
                                background: activeTab === 'sales' ? '#ffffff' : 'transparent',
                                color: activeTab === 'sales' ? '#0f172a' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                boxShadow: activeTab === 'sales' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <i className="fas fa-chart-line" style={{ color: '#3b82f6' }}></i>
                            Sales & Income
                        </button>
                    </div>
                </div>

                {/* 4 Main KPI Stat Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem'
                }}>
                    {/* Card 1: Total Uploaded Crops */}
                    <div style={{
                        background: '#ffffff',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: '#ecfdf5',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            flexShrink: 0
                        }}>
                            <i className="fas fa-seedling"></i>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Uploaded Crops
                            </span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
                                {data.totalCrops || 0} Crops
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '600' }}>
                                Across {data.categoryQuantityChart?.length || 1} categories
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Total Uploaded Quantity */}
                    <div style={{
                        background: '#ffffff',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            flexShrink: 0
                        }}>
                            <i className="fas fa-weight-hanging"></i>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Available Quantity
                            </span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
                                {(data.totalStockKg || 0).toLocaleString()} kg
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: '600' }}>
                                Active in warehouse / farm
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Inventory Valuation */}
                    <div style={{
                        background: '#ffffff',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            flexShrink: 0
                        }}>
                            <i className="fas fa-coins"></i>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Stock Valuation
                            </span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
                                ₹{(data.totalStockValue || 0).toLocaleString()}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '600' }}>
                                Base market asking value
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Uploaded Today */}
                    <div style={{
                        background: '#ffffff',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: '#f5f3ff',
                            color: '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            flexShrink: 0
                        }}>
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Uploaded Today
                            </span>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
                                {data.uploadedTodayCount || 0} Crops
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: '600' }}>
                                +{(data.uploadedTodayKg || 0).toLocaleString()} kg added today
                            </span>
                        </div>
                    </div>
                </div>

                {activeTab === 'inventory' ? (
                    <>
                        {/* Crop Quantity Charts Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                            gap: '1.75rem',
                            marginBottom: '2rem'
                        }}>
                            {/* Chart 1: Crop-wise Quantity Breakdown */}
                            <div style={{
                                background: '#ffffff',
                                padding: '1.5rem',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                        ⚖️ Crop-wise Uploaded Quantity (kg)
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Stock in kg</span>
                                </div>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.cropQuantityChart || []} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis type="number" tickFormatter={(val) => `${val}kg`} />
                                            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#334155' }} />
                                            <Tooltip formatter={(value) => [`${value.toLocaleString()} kg`, 'Available Quantity']} />
                                            <Legend />
                                            <Bar dataKey="quantity" fill="#10b981" radius={[0, 6, 6, 0]} name="Quantity (kg)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: Category-wise Quantity Distribution */}
                            <div style={{
                                background: '#ffffff',
                                padding: '1.5rem',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                        🍩 Uploaded Quantity by Category
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Weight distribution</span>
                                </div>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.categoryQuantityChart || []}
                                                dataKey="quantity"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={105}
                                                innerRadius={55}
                                                paddingAngle={4}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {(data.categoryQuantityChart || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value.toLocaleString()} kg`, 'Total Quantity']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Chart 3: Monthly Uploads & Volume Trend */}
                        <div style={{
                            background: '#ffffff',
                            padding: '1.5rem',
                            borderRadius: '18px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                        📈 Crop Upload Volume History (6 Months)
                                    </h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Monthly quantity (kg) of fresh produce uploaded to DirectFarm</p>
                                </div>
                            </div>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.uploadTimelineChart || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(val) => `${val}kg`} />
                                        <Tooltip formatter={(value, name) => [name === 'quantityKg' ? `${value.toLocaleString()} kg` : value, name === 'quantityKg' ? 'Quantity Uploaded' : 'Crops Uploaded']} />
                                        <Legend />
                                        <Area type="monotone" dataKey="quantityKg" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.6} name="Quantity (kg)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Table: Detailed Crop Inventory Breakdown */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '18px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                    📦 Complete Produce Inventory Breakdown
                                </h3>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                    {data.cropQuantityChart?.length || 0} active listings
                                </span>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                                            <th style={{ padding: '12px 16px' }}>Crop Name</th>
                                            <th style={{ padding: '12px 16px' }}>Category</th>
                                            <th style={{ padding: '12px 16px' }}>Upload Status / Date</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Price / kg</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Available Qty</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Asset Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data.cropQuantityChart || []).map((crop) => {
                                            const today = isToday(crop.createdAt);
                                            const yesterday = isYesterday(crop.createdAt);

                                            return (
                                                <tr key={crop.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                                                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e293b' }}>
                                                        {crop.name}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                                                            {crop.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {today ? (
                                                            <span style={{ background: '#10b981', color: '#ffffff', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                                🌱 Uploaded Today
                                                            </span>
                                                        ) : yesterday ? (
                                                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                                📅 Yesterday
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                                {new Date(crop.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                                                        ₹{crop.pricePerKg}/kg
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: '#10b981' }}>
                                                        {crop.quantity?.toLocaleString()} kg
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                                        ₹{crop.totalValue?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Sales & Income Tab */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div style={{
                            background: '#ffffff',
                            padding: '1.5rem',
                            borderRadius: '18px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                💵 Monthly Sales & Income Trend
                            </h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.incomeChart || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(val) => `₹${val}`} />
                                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Income']} />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.7} name="Income (₹)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {data.topProducts?.length > 0 && (
                            <div style={{
                                background: '#ffffff',
                                padding: '1.5rem',
                                borderRadius: '18px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                                    🏆 Top Selling Products (Units Sold)
                                </h3>
                                <div style={{ height: '280px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.topProducts} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={130} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="sales" fill="#8884d8" name="Units Sold" radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerAnalytics;
