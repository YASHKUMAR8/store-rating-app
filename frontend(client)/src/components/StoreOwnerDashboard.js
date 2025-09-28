import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Settings from './Settings'; 

const StoreOwnerDashboard = ({ user, handleLogout }) => {
    const [storeData, setStoreData] = useState(null);
    const [message, setMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false); 

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('http://localhost:3001/api/my-store', config);
                setStoreData(response.data);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Could not fetch your store data.');
            }
        };
        fetchStoreData();
    }, []); 
    if (!storeData) {
        return (
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h2>Store Dashboard</h2>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </header>
                <p>{message || "Loading your store information..."}</p>
            </div>
        );
    }

    const { storeDetails, ratings } = storeData;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>{storeDetails.name} - Dashboard</h2>
                <div>
                    <button onClick={() => setShowSettings(true)} className="settings-btn">Settings</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card stat-card">
                    <h3>Your Store's Average Rating</h3>
                    <p className="stat-number">{parseFloat(storeDetails.overall_rating).toFixed(2)}</p>
                </div>
                 <div className="dashboard-card stat-card">
                    <h3>Total Ratings Received</h3>
                    <p className="stat-number">{ratings.length}</p>
                </div>
                <div className="dashboard-card list-card">
                    <h3>Ratings Submitted by Users</h3>
                    <div className="item-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>User Who Rated</th>
                                    <th>Rating Given</th>
                                    <th>Date of Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ratings.length > 0 ? (
                                    ratings.map((r, index) => (
                                    <tr key={index}>
                                        <td>{r.user_name}</td>
                                        <td className="stars">{"★".repeat(r.rating)}<span className="star">{"★".repeat(5 - r.rating)}</span></td>
                                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3">Your store has not received any ratings yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {showSettings && <Settings user={user} closeSettings={() => setShowSettings(false)} />}
        </div>
    );
};

export default StoreOwnerDashboard;

