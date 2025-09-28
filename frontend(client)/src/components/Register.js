import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: ''
    });

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setMessage(''); 
        setIsError(false);

        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', formData);
            setMessage(response.data.message); 
            setIsError(false);
        } catch (error) {
            setIsError(true);
            if (error.response && error.response.data) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Register New User</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" placeholder="Must be 20-60 characters" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} required />
                    <small>8-16 chars, 1 uppercase, 1 special character.</small>
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <textarea name="address" placeholder="Max 400 characters" onChange={handleChange}></textarea>
                </div>
                <button type="submit">Register</button>
            </form>
            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
        </div>
    );
};

export default Register;