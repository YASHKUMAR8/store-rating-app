import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Settings from './Settings'; 
const StoreCard = ({ store, onRatingSubmit }) => {
    const [currentRating, setCurrentRating] = useState(store.user_submitted_rating || 0);

    const handleRatingChange = (newRating) => {
        setCurrentRating(newRating);
        onRatingSubmit(store.id, newRating);
    };
    
    return (
        <div className="store-card">
            <h3>{store.name}</h3>
            <p className="store-address">{store.address}</p>
            <div className="rating-section">
                <div className="overall-rating">
                    <strong>Overall Rating:</strong>
                    <span className="rating-value">{parseFloat(store.overall_rating).toFixed(2)}</span>
                </div>
                <div className="user-rating">
                    <strong>Your Rating:</strong>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={star <= currentRating ? 'star filled' : 'star'}
                                onClick={() => handleRatingChange(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const UserDashboard = ({ user, handleLogout }) => {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showSettings, setShowSettings] = useState(false); 

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const token = getToken();
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get('http://localhost:3001/api/stores', config);
                setStores(response.data);
            } catch (error) {
                setIsError(true);
                setMessage('Could not fetch stores.');
            }
        };
        fetchStores();
    }, []);
    const handleRatingSubmit = async (storeId, rating) => {
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:3001/api/ratings', { storeId, rating }, config);

            const updatedStores = stores.map(s => s.id === storeId ? {...s, user_submitted_rating: rating} : s);
            setStores(updatedStores);

            const response = await axios.get('http://localhost:3001/api/stores', config);
            setStores(response.data);

            setMessage('Rating submitted successfully!');
            setIsError(false);
            setTimeout(() => setMessage(''), 3000); 

        } catch (error) {
            setIsError(true);
            setMessage('Failed to submit rating.');
            setTimeout(() => setMessage(''), 3000); 
        }
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-dashboard-container">
            <header className="dashboard-header">
                <h2>Welcome, {user.name}!</h2>
                <div>
                    <button onClick={() => setShowSettings(true)} className="settings-btn">Settings</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>
            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search stores by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}

            <div className="store-list">
                {filteredStores.length > 0 ? (
                    filteredStores.map(store => (
                        <StoreCard key={store.id} store={store} onRatingSubmit={handleRatingSubmit} />
                    ))
                ) : (
                    <p>No stores found. An administrator needs to add some!</p>
                )}
            </div>

            {showSettings && <Settings user={user} closeSettings={() => setShowSettings(false)} />}
        </div>
    );
};

export default UserDashboard;

