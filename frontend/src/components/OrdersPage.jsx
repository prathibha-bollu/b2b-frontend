import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import styles from './OrdersPage.module.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [pagination.offset, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await orderAPI.getAll(
        pagination.limit,
        pagination.offset,
        statusFilter
      );

      setOrders(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
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

  const handleStatusChange = async () => {
    try {
      await orderAPI.updateStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePrevious = () => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleNext = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders & Invoices</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filterBar}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, offset: 0 }));
          }}
          className={styles.filter}
        >
          <option value="">All Orders</option>
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Order Date</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{formatDate(order.due_date)}</td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={handlePrevious}
              disabled={pagination.offset === 0}
            >
              Previous
            </button>
            <span>
              {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <button
              onClick={handleNext}
              disabled={pagination.offset + pagination.limit >= pagination.total}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showStatusModal && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Update Order Status</h2>
            <p>Order: <strong>{selectedOrder.order_number}</strong></p>

            <div className={styles.formGroup}>
              <label>New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.statusSelect}
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.submitBtn}
                onClick={handleStatusChange}
              >
                Update
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
