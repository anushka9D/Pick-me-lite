import React, { useState } from 'react';
import axios from 'axios';
import './css/login.css';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';


function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  function handleSubmit(e) {
    e.preventDefault();
  
    const request = {
      email,
      password
    };
  
    axios.post('http://localhost:4003/api/auth/login', request)
      .then(response => {
        Swal.fire({
          title: "Login Successful!",
          text: `Welcome back, ${email}`,
          icon: "success"
        });
  
        Cookies.set('token', response.data.token, {
          expires: 1 / 24,  // 1 hour
          secure: true,
          sameSite: 'Strict'
        });

        const token = Cookies.get('token');
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;
  
        // Role-based redirect
        switch (role) {
          case 'admin':
            window.location.href = '/admin-panel';
            break;
          case 'user':
            window.location.href = '/home';
            break;
          case 'restaurant':
            window.location.href = '/restaurant_dashboard';
            break;
          case 'dilevery':
            window.location.href = '/delivery-panel';
            break;
          default:
            console.warn('Unknown role:', role);
            window.location.href = '/';
        }
        
      })
      .catch(error => {
        console.error('Login error:', error.response?.data || error.message);
        Swal.fire({
          icon: "error",
          title: "Invalid Credentials",
          text: "Login failed! Please check your credentials."
        });
      });
  };
  

  return (
    <div className="login-main">
    <div className="login-container">
      <div className="logo">Eats Now</div>

      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <i className="fas fa-envelope input-icon"></i>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <i className="fas fa-lock input-icon"></i>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i
            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
            id="togglePassword"
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>

        <div className="remember-forgot">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>
          <a href="/" className="forgot-password">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="login-btn">
          Sign In
        </button>
      </form>

      <div className="social-login">
        <p className="social-text">Or sign in with</p>
        <div className="social-icons">
          <a href="#" className="social-icon google">
            <i className="fab fa-google"></i>
          </a>
        </div>
      </div>

      <div className="signup-link">
        Don't have an account? <a href="/">Sign up here</a>
      </div>
    </div>
    </div>
  );
};

export default Login;
