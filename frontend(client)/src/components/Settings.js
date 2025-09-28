import React, { useState } from 'react';
import './Settings.css'; 
import axios from 'axios'; 

const Settings = ({ user, closeSettings }) => {
    const [view, setView] = useState('details');

    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        address: user.address || ''
    });
    const [detailsMessage, setDetailsMessage] = useState('');

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isPasswordError, setIsPasswordError] = useState(false);


    const handleDetailsChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        console.log('Updated details:', formData);
        setDetailsMessage('Settings saved successfully!');
        setTimeout(() => setDetailsMessage(''), 2500);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsPasswordError(false);
        setPasswordMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setIsPasswordError(true);
            setPasswordMessage("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put('http://localhost:3001/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }, config);
            
            setPasswordMessage('Password changed successfully!');
            setTimeout(() => {
                closeSettings(); 
            }, 2000);

        } catch (error) {
            setIsPasswordError(true);
            setPasswordMessage(error.response?.data?.message || 'Failed to change password.');
        }
    };


    return (
        <div className="settings-modal-overlay" onClick={closeSettings}>
            <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>

                {view === 'details' ? (
                    <>
                        <header className="settings-modal-header">
                            <h2>Account Settings</h2>
                            <button onClick={closeSettings} className="close-btn">&times;</button>
                        </header>
                        <div className="settings-modal-body">
                            {detailsMessage && <p className="success-message">{detailsMessage}</p>}
                            <form onSubmit={handleDetailsSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleDetailsChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleDetailsChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <textarea id="address" name="address" value={formData.address} onChange={handleDetailsChange} />
                                </div>
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" className="secondary-btn" onClick={() => setView('password')}>
                                    Change Password
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        <header className="settings-modal-header">
                            <h2>Change Password</h2>
                            <button onClick={closeSettings} className="close-btn">&times;</button>
                        </header>
                        <div className="settings-modal-body">
                            {passwordMessage && <p className={isPasswordError ? 'error-message' : 'success-message'}>{passwordMessage}</p>}
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                                </div>
                                <button type="submit" className="save-btn">Update Password</button>
                                <button type="button" className="secondary-btn" onClick={() => setView('details')}>
                                    Back to Details
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Settings;