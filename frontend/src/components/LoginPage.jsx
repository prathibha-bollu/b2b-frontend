import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'admin123',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>B2B Customer Portal</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          {(formError || error) && (
            <div className={styles.error}>
              {formError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className={styles.demo}>
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: user@example.com / user123</p>
        </div>
      </div>
    </div>
  );
};
