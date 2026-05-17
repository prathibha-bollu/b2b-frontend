import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../services/api';
import styles from './CustomerList.module.css';

export const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [pagination.offset, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await customerAPI.getAll(pagination.limit, pagination.offset, search);
      setCustomers(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(formData);
      setFormData({ name: '', email: '', phone: '', industry: '' });
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
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
        <h1>Customers</h1>
        {user?.role === 'admin' && (
          <button
            className={styles.createBtn}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Customer'}
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <form onSubmit={handleCreateCustomer}>
            <div className={styles.formGroup}>
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleFormChange}
              />
            </div>
            <button type="submit" className={styles.submitBtn}>Create</button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Industry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.industry || '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[customer.status]}`}>
                        {customer.status}
                      </span>
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
    </div>
  );
};
