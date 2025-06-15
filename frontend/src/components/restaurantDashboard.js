import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { FaTachometerAlt, FaBox, FaClock ,FaToggleOn,FaToggleOff, FaEdit, FaUtensils, FaUser, FaSignOutAlt,FaDollarSign,FaCheckCircle,FaTimesCircle, FaTrashAlt, } from 'react-icons/fa';
import { GiTakeMyMoney } from "react-icons/gi";
import { MdDeliveryDining } from "react-icons/md";
import './css/restaurantDashboard.css';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

const RestaurantDashboard = () => {

  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'; // No token, redirect to login
      return;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'restaurant') {
        window.location.href = '/login'; // Not a restaurant role, redirect
      }
    } catch (error) {
      console.error('Invalid token:', error);
      window.location.href = '/login'; // Malformed token
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats] = useState({
    balance: 0.00,
    completedOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    reviews: 0
  });

  // --------------------------------------------- Function to menuItem ----------------------------------------------------------

  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: 'true'
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // New state for the selected file

  const handleMenuItemChange = (e) => {
    setMenuItem({
      ...menuItem,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // Store the file in state
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuItemSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      Swal.fire('Error!', 'Please select an image.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage); // Use the stored file

      formData.append('name', menuItem.name);
      formData.append('description', menuItem.description);
      formData.append('price', menuItem.price);
      formData.append('category', menuItem.category);
      formData.append('isAvailable', menuItem.isAvailable);

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post('http://localhost:4003/api/menuItem/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Swal.fire('Success!', 'Menu item added successfully', 'success');
      setMenuItem({ name: '', description: '', price: '', category: '', isAvailable: 'true' });
      setPreviewImage(null);
      setSelectedImage(null); // Reset the file state
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to add item', 'error');
    }
  };

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Function to fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4003/api/menuItem/restaurant', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      Swal.fire('Error!', 'Failed to fetch menu items', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Call fetchMenuItems when component mounts or when activeTab changes to 'items'
  useEffect(() => {
    if (activeTab === 'items') {
      fetchMenuItems();
    }
  }, [activeTab]);
  
  // Function to toggle menu item availability
  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'true' ? 'false' : 'true';
      await axios.patch(`http://localhost:4003/api/menuItem/${itemId}/availability`, 
        { isAvailable: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setMenuItems(menuItems.map(item => 
        item._id === itemId ? { ...item, isAvailable: newStatus } : item
      ));
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Item is now ${newStatus === 'true' ? 'available' : 'unavailable'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Error updating item availability:', error);
      Swal.fire('Error!', 'Failed to update item availability', 'error');
    }
  };
  
  // Function to delete menu item
  const deleteMenuItem = async (itemId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });
      
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:4003/api/menuItem/${itemId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Remove from local state
        setMenuItems(menuItems.filter(item => item._id !== itemId));
        
        Swal.fire(
          'Deleted!',
          'Your menu item has been deleted.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Swal.fire('Error!', 'Failed to delete menu item', 'error');
    }
  };

  const [recentMenuItems, setRecentMenuItems] = useState([]);

// Add this function to fetch recent menu items
const fetchRecentMenuItems = async () => {
  try {
    const response = await axios.get('http://localhost:4003/api/menuItem/restaurant', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Get only the 5 most recent items
    setRecentMenuItems(response.data.slice(0, 5));
  } catch (error) {
    console.error('Error fetching recent menu items:', error);
  }
};

// Call this function when the dashboard tab is active
useEffect(() => {
  if (activeTab === 'dashboard') {
    fetchRecentMenuItems();
  }
}, [activeTab]);


// Add this state for editing
const [editingItem, setEditingItem] = useState(null);
const [editFormData, setEditFormData] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  isAvailable: 'true'
});
const [editImagePreview, setEditImagePreview] = useState(null);
const [editSelectedImage, setEditSelectedImage] = useState(null);

// Function to open edit modal with item data
const openEditModal = (item) => {
  setEditingItem(item);
  setEditFormData({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    isAvailable: item.isAvailable
  });
  setEditImagePreview(`http://localhost:4003${item.image}`);
  setEditSelectedImage(null);
};

// Handle edit form input changes
const handleEditChange = (e) => {
  setEditFormData({
    ...editFormData,
    [e.target.name]: e.target.value
  });
};

// Handle edit image upload
const handleEditImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setEditSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Submit edit form
const handleEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const formData = new FormData();
    formData.append('name', editFormData.name);
    formData.append('description', editFormData.description);
    formData.append('price', editFormData.price);
    formData.append('category', editFormData.category);
    formData.append('isAvailable', editFormData.isAvailable);
    
    if (editSelectedImage) {
      formData.append('image', editSelectedImage);
    }
    
    const response = await axios.put(
      `http://localhost:4003/api/menuItem/${editingItem._id}`, 
      formData, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Update local state with the edited item
    setMenuItems(menuItems.map(item => 
      item._id === editingItem._id ? response.data.menuItem : item
    ));
    
    Swal.fire('Success!', 'Menu item updated successfully', 'success');
    closeEditModal();
  } catch (error) {
    Swal.fire('Error!', error.response?.data?.message || 'Failed to update item', 'error');
  }
};

// Close edit modal
const closeEditModal = () => {
  setEditingItem(null);
  setEditFormData({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: 'true'
  });
  setEditImagePreview(null);
  setEditSelectedImage(null);
};

  //----------------------------------------------  Function to profile  -----------------------------------------------------------

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    email: '',
    password: '',
    description: '',
    isAvailable:'',
    previousEmail: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const res = await axios.get(`http://localhost:4003/api/restaurants/single`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = res.data;
      setFormData({
        ...data,
        previousEmail: data.email
      });
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      }
    };
  
    fetchRestaurantData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
    setErrors({}); // Clear previous errors

    if (!validateForm()) return;

  try {
    const response =await axios.put('http://localhost:4003/api/restaurants/update',formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    Swal.fire({
      icon: 'success',
      title: 'Restaurant profile updated successfully!',
      text: 'Your restaurant account has been Updated',
    });
    
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Profile Update Failed',
      text: 'Something went wrong',
    });
  }
  };

  //----------------------------------------------  Function to delete  -----------------------------------------------------------
  
  const handleDelete = async (e) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the restaurant permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete('http://localhost:4003/api/restaurants/delete',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        Swal.fire('Deleted!', 'The restaurant has been deleted.', 'success');
        window.location.href = '/';

      } catch (error) {
        Swal.fire('Error!', error.response?.data?.error || 'Something went wrong.', 'error');
      }
    }
  };


  // ------------------------------------------------ Function to logout--------------------------------------------------------------

  const handleLogout = () => {
    Cookies.remove('token');
    window.location.href = '/login';
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>Eats Now Admin</h2>
          </div>
          
          <ul className="nav-menu">
            <li className="nav-item">
              <a 
                href="#!" 
                className={`nav-link ${activeTab === 'dashboard' ? 'active-nav' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <FaTachometerAlt className="nav-icon" />
                My Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#!" 
                className={`nav-link ${activeTab === 'orders' ? 'active-nav' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FaBox className="nav-icon" />
                My Orders
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#!" 
                className={`nav-link ${activeTab === 'items' ? 'active-nav' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                <FaUtensils className="nav-icon" />
                My Items
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className='nav-link'>
                <GiTakeMyMoney className="nav-icon" />
                Payments Details
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className='nav-link'>
                <MdDeliveryDining className="nav-icon" />
                Dilivery Details
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#!" 
                className={`nav-link ${activeTab === 'profile' ? 'active-nav' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="nav-icon" />
                My Profile
              </a>
            </li>
          </ul>

          <button onClick={handleDelete} className="deleteButton"> <FaTrashAlt /> Delete Restaurant</button>
          
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        {/* ------------------------------------------------ Active Tab section ---------------------------------------------------- */}

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <>
              <h1>Dashboard Overview</h1>
              <div className="stats-grid">
                <div className="stat-card balance">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <FaDollarSign />
                    </div>
                    <h3>Account Balance</h3>
                  </div>
                  <div className="stat-value">Rs.{stats.balance}</div>
                </div>

                <div className="stat-card orders">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <FaCheckCircle />
                    </div>
                    <h3>Completed Orders</h3>
                  </div>
                  <div className="stat-value">{stats.completedOrders}</div>
                </div>

                <div className="stat-card pending">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <FaClock />
                    </div>
                    <h3>Pending Orders</h3>
                  </div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                </div>

                <div className="stat-card rejected">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <FaTimesCircle />
                    </div>
                    <h3>Rejected Orders</h3>
                  </div>
                  <div className="stat-value">{stats.rejectedOrders}</div>
                </div>
              </div>

              <div className="stat-card">
                <h3>Recent Reviews</h3>
                <p>Total Reviews: {stats.reviews}</p>
                {/* Add review list component here */}
              </div>

              <div style={{ height: '20px' }}></div>

              <div className="stat-card recent-menu-items">
                <h3>Recent Menu Items</h3>
                {recentMenuItems.length === 0 ? (
                  <p>No menu items added yet.</p>
                ) : (
                  <div className="recent-items-list">
                    {recentMenuItems.map((item) => (
                      <div key={item._id} className="recent-item">
                        <div className="recent-item-image">
                          <img 
                            src={`http://localhost:4003/${item.image}`} 
                            alt={item.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="recent-item-info">
                          <h4>{item.name}</h4>
                          <div className="recent-item-meta">
                            <span className="price">Rs.{parseFloat(item.price).toFixed(2)}</span>
                            <span className={`status ${item.isAvailable === 'true' ? 'available' : 'unavailable'}`}>
                              {item.isAvailable === 'true' ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="view-all-btn"
                      onClick={() => setActiveTab('items')}
                    >
                      View All Menu Items
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h1>Order Management</h1>
              {/* Add order management components */}
            </div>
          )}

          {activeTab === 'items' && (
            <div className="items-section">
              <h1>Menu Items</h1>
              <div className="menu-form-container">
                <form onSubmit={handleMenuItemSubmit} className="menu-form">
                  <div className="form-section">
                    <h3>Add New Menu Item</h3>
                    
                    <div className="form-group">
                      <label>Item Name</label>
                      <input
                        type="text"
                        name="name"
                        value={menuItem.name}
                        onChange={handleMenuItemChange}
                        placeholder="Enter item name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={menuItem.description}
                        onChange={handleMenuItemChange}
                        placeholder="Describe your menu item"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price ($)</label>
                        <input
                          type="number"
                          name="price"
                          value={menuItem.price}
                          onChange={handleMenuItemChange}
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Category</label>
                        <select
                          name="category"
                          value={menuItem.category}
                          onChange={handleMenuItemChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Indian Specialties">Indian Specialties</option>
                          <option value="Curries">Curries</option>
                          <option value="Breads">Breads</option>
                          <option value="Rice Dishes">Rice Dishes</option>
                          <option value="Street Food">Street Food</option>
                          <option value="Seafood">Seafood</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Soups & Salads">Soups & Salads</option>
                          <option value="Appetizers">Appetizers</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Item Image</label>
                        <div className="image-upload-box">
                          {previewImage ? (
                            <img src={previewImage} alt="Preview" />
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt"></i>
                              <p>Click to upload image</p>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">
                      Add Menu Item
                    </button>
                  </div>
                </form>
              </div>

              {/* Display existing menu items */}
            <div className="menu-items-list">
              <h3>Your Menu Items</h3>
              
              {loading ? (
                <div className="loading">Loading menu items...</div>
              ) : menuItems.length === 0 ? (
                <div className="no-items">No menu items found. Add your first item!</div>
              ) : (
                <div className="menu-items-grid">
                  {menuItems.map((item) => (
                    <div key={item._id} className="menu-item-card">
                      <div className="menu-item-image">
                        <img 
                          src={`http://localhost:4003/${item.image}`} 
                          alt={item.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="menu-item-details">
                        <h4>{item.name}</h4>
                        <p className="description">{item.description}</p>
                        <div className="menu-item-meta">
                          <span className="price">Rs.{parseFloat(item.price).toFixed(2)}</span>
                          <span className="category">{item.category}</span>
                        </div>
                        <div className="menu-item-actions">
                          <button 
                            className={`availability-toggle ${item.isAvailable === 'true' ? 'available' : 'unavailable'}`}
                            onClick={() => toggleItemAvailability(item._id, item.isAvailable)}
                            title={item.isAvailable === 'true' ? 'Mark as unavailable' : 'Mark as available'}
                          >
                            {item.isAvailable === 'true' ? (
                              <><FaToggleOn /> Available</>
                            ) : (
                              <><FaToggleOff /> Unavailable</>
                            )}
                          </button>
                          <button className="edit-btn" onClick={() => openEditModal(item)} title="Edit item"> <FaEdit /> </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteMenuItem(item._id)}
                            title="Delete item"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}

          {/* Add this edit modal to the bottom of your component's return statement */}
          {editingItem && (
            <div className="modal-overlay">
              <div className="edit-modal">
                <div className="modal-header">
                  <h3>Edit Menu Item</h3>
                  <button className="close-btn" onClick={closeEditModal}>×</button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="edit-form">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      placeholder="Enter item name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      placeholder="Describe your menu item"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Indian Specialties">Indian Specialties</option>
                        <option value="Curries">Curries</option>
                        <option value="Breads">Breads</option>
                        <option value="Rice Dishes">Rice Dishes</option>
                        <option value="Street Food">Street Food</option>
                        <option value="Seafood">Seafood</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Soups & Salads">Soups & Salads</option>
                        <option value="Appetizers">Appetizers</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Availability</label>
                    <select
                      name="isAvailable"
                      value={editFormData.isAvailable}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Item Image</label>
                    <div className="image-upload-box">
                      {editImagePreview ? (
                        <img src={editImagePreview} alt="Preview" />
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt"></i>
                          <p>Click to upload image</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                      />
                    </div>
                    <small>Leave empty to keep current image</small>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={closeEditModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Update Menu Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-container">
                <div className="formContainer">
                  <h2 className="title">MY Profile</h2>
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

                    <div className="formGroup">
                      <label className="label">
                        <i className="fas fa-toggle-on icon"></i>
                        Availability
                      </label>
                      <select name="isAvailable" value={formData.isAvailable} onChange={handleChange} className="input">
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                      {errors.isAvailable && <span className="error">{errors.isAvailable}</span>}
                    </div>

                    <button type="submit" className="submitButton">
                      Register Restaurant
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RestaurantDashboard;