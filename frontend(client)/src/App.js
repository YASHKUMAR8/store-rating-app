import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import './App.css';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const isExpired = Date.now() >= decodedUser.exp * 1000;
        if (!isExpired) {
          setUser(decodedUser); 
        } else {
          localStorage.removeItem('token'); 
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token'); 
      }
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (user) {
    switch (user.role) {
      case 'System Administrator':
        return <AdminDashboard user={user} handleLogout={handleLogout} />;
      case 'Normal User':
        return <UserDashboard user={user} handleLogout={handleLogout} />;
      case 'Store Owner':
        return <StoreOwnerDashboard user={user} handleLogout={handleLogout} />;
      default:
        return (
          <div className="auth-page-container">
            <h2>Welcome!</h2>
            <p>Your role is: {user.role}</p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        );
    }
  } else {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }
}

const AuthPage = ({ onLoginSuccess }) => {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div className="auth-page-container">
      <h1>Store Rating Platform</h1>
      <nav className="page-nav">
        <button onClick={() => setCurrentPage('login')} className={currentPage === 'login' ? 'active' : ''}>Login</button>
        <button onClick={() => setCurrentPage('register')} className={currentPage === 'register' ? 'active' : ''}>Register</button>
      </nav>
      {currentPage === 'login' ? <Login onLoginSuccess={onLoginSuccess} /> : <Register />}
    </div>
  );
};

export default App;

