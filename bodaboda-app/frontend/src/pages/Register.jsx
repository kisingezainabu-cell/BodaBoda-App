import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        user_type: '',
        vehicle_make: '',
        vehicle_model: '',
        license_plate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            if (formData.user_type === 'driver') {
                navigate('/driver-dashboard');
            } else {
                navigate('/rider-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-container">
                <h3>Create Your Account</h3>
                {error && <div className="message error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input name="username" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="full_name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone_number" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Account Type</label>
                        <select name="user_type" onChange={handleChange} required>
                            <option value="">Select Account Type</option>
                            <option value="rider">Rider</option>
                            <option value="driver">Driver</option>
                        </select>
                    </div>

                    {formData.user_type === 'driver' && (
                        <div id="driver-fields">
                            <div className="form-group">
                                <label>Vehicle Make</label>
                                <input name="vehicle_make" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Vehicle Model</label>
                                <input name="vehicle_model" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>License Plate</label>
                                <input name="license_plate" onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full">Register</button>
                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Register;
