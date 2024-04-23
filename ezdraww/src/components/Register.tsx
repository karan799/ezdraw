import React, { useState } from 'react';
import axios from 'axios';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { email, password });
      setSuccessMessage('Registration successful');
      // Optionally, redirect to login page or dashboard
    } catch (error:any) {
      setErrorMessage(error.response);
    }
  };

  return (
    <div className="container-fluid" style={{ height: '100vh', background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="col-md-6">
        <div className="card p-4">
          <h2 className="text-center mb-4">Register</h2>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <form onSubmit={handleSubmit}>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Register</button>
          </form>
          <div className="mt-3 text-center">
            <p>Already have an account? <a href="/login" className="text-primary">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
