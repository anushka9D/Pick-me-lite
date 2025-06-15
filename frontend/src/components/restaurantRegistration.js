import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./css/restaurantRegistration.css";

function RestaurantRegistration() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    email: "",
    password: "",
    description: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!/^0\d{9}$/.test(formData.contact)) newErrors.contact = "Contact must be a 10-digit number starting with 0";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email address";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:4003/api/restaurants/register", formData);
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your restaurant account has been created',
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="container">
      <div className="formContainer">
        <h2 className="title">Restaurant Registration</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label className="label">
              <i className="fas fa-utensils icon"></i>
              Restaurant Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter restaurant name"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="formGroup">
            <label className="label">
              <i className="fas fa-map-marker-alt icon"></i>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input"
              placeholder="Enter restaurant address"
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>

          <div className="formGroup">
            <label className="label">
              <i className="fas fa-phone icon"></i>
              Contact Number
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="input"
              placeholder="Enter contact number"
            />
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>

          <div className="formGroup">
            <label className="label">
              <i className="fas fa-envelope icon"></i>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="Enter restaurant email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="formGroup">
            <label className="label">
              <i className="fas fa-lock icon"></i>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="Create password"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="formGroup">
            <label className="label">
              <i className="fas fa-file-alt icon"></i>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input description"
              placeholder="Describe your restaurant"
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <button type="submit" className="submitButton">
            Register Restaurant
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestaurantRegistration;