import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI, customerAPI } from '../services/api';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [ordersRes, customersRes] = await Promise.all([
        orderAPI.getAll(100, 0),
        customerAPI.getAll(100, 0),
      ]);

      const orders = ordersRes.data.data || [];
      const customers = customersRes.data.data || [];

      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

      setStats({
        totalOrders: ordersRes.data.pagination?.total || 0,
        totalCustomers: customersRes.data.pagination?.total || 0,
        pendingOrders: pendingCount,
        totalRevenue: totalRevenue.toFixed(2),
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: styles.pendingBadge,
      confirmed: styles.confirmedBadge,
      shipped: styles.shippedBadge,
      delivered: styles.deliveredBadge,
      cancelled: styles.cancelledBadge,
    };
    return statusClasses[status] || '';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.firstName}!</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Orders</h3>
          <div className={styles.statValue}>{stats.totalOrders}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Customers</h3>
          <div className={styles.statValue}>{stats.totalCustomers}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Orders</h3>
          <div className={styles.statValue}>{stats.pendingOrders}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <div className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Recent Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td>{formatDate(order.order_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
