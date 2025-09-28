import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Settings from './Settings'; 

const AdminDashboard = ({ user, handleLogout }) => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [stores, setStores] = useState([]);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({ stores: '', users: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'Normal User' });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    const [showSettings, setShowSettings] = useState(false);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken();
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [statsRes, storesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:3001/api/stats', config),
                    axios.get('http://localhost:3001/api/stores', config),
                    axios.get('http://localhost:3001/api/users', config)
                ]);
                setStats(statsRes.data);
                setStores(storesRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                handleApiError(error, 'Failed to load dashboard data.');
            }
        };
        fetchData();
    }, []);

    const handleApiError = (error, defaultMessage) => {
        setIsError(true);
        setMessage(error.response?.data?.message || defaultMessage);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleSuccessMessage = (newMessage) => {
        setIsError(false);
        setMessage(newMessage);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleFilterChange = (e, type) => {
        setFilters({ ...filters, [type]: e.target.value });
    };

    const handleNewUserChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.post('http://localhost:3001/api/users/add', newUser, config);
            handleSuccessMessage(response.data.message);
            const [usersRes, statsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/users', config),
                axios.get('http://localhost:3001/api/stats', config)
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setNewUser({ name: '', email: '', password: '', address: '', role: 'Normal User' }); 
        } catch (error) {
            handleApiError(error, 'Failed to add user.');
        }
    };
    
    const filteredStores = stores.filter(s => 
        s.name.toLowerCase().includes(filters.stores.toLowerCase()) || 
        s.email.toLowerCase().includes(filters.stores.toLowerCase())
    );
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(filters.users.toLowerCase()) || 
        u.email.toLowerCase().includes(filters.users.toLowerCase()) ||
        u.role.toLowerCase().includes(filters.users.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <div>
                    <button onClick={() => setShowSettings(true)} className="settings-btn">Settings</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}

            <div className="dashboard-grid">
                <div className="dashboard-card stat-card"><h3>Total Users</h3><p className="stat-number">{stats.totalUsers}</p></div>
                <div className="dashboard-card stat-card"><h3>Total Stores</h3><p className="stat-number">{stats.totalStores}</p></div>
                <div className="dashboard-card stat-card"><h3>Total Ratings</h3><p className="stat-number">{stats.totalRatings}</p></div>

                <div className="dashboard-card add-user-card">
                    <h3>Add New User</h3>
                    <form onSubmit={handleAddUser}>
                        <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Full Name (20-60 chars)" required />
                        <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} placeholder="Email Address" required />
                        <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Password (e.g., Password@1)" required />
                        <textarea name="address" value={newUser.address} onChange={handleNewUserChange} placeholder="Address (optional)" />
                        <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                            <option value="Normal User">Normal User</option>
                            <option value="System Administrator">System Administrator</option>
                            <option value="Store Owner">Store Owner</option>
                        </select>
                        <button type="submit">Add User</button>
                    </form>
                </div>

                <div className="dashboard-card list-card">
                    <h3>All Stores</h3>
                    <input type="text" className="filter-input" placeholder="Filter stores by name or email..." value={filters.stores} onChange={(e) => handleFilterChange(e, 'stores')} />
                    <div className="item-list">
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead>
                            <tbody>
                                {filteredStores.map(store => (<tr key={store.id}><td>{store.name}</td><td>{store.email}</td><td>{store.address}</td><td>{parseFloat(store.overall_rating).toFixed(2)}</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card list-card">
                    <h3>All Users</h3>
                    <input type="text" className="filter-input" placeholder="Filter users by name, email, or role..." value={filters.users} onChange={(e) => handleFilterChange(e, 'users')} />
                    <div className="item-list">
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr></thead>
                            <tbody>
                                {filteredUsers.map(user => (<tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.address}</td><td>{user.role}</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showSettings && <Settings user={user} closeSettings={() => setShowSettings(false)} />}
        </div>
    );
};

export default AdminDashboard;

