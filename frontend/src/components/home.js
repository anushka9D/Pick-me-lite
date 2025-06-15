import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/home.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Cookies from 'js-cookie';
import axios from 'axios';

const Home = () => {
  const [navLinksVisible, setNavLinksVisible] = useState(false);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get('token');
  
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch menu items when component mounts
    fetchPopularItems();
  }, []);

  // Function to fetch popular menu items
  const fetchPopularItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4003/api/menuItem/popular', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Filter only available items
      const availableItems = response.data.filter(item => item.isAvailable === 'true');
      setPopularItems(availableItems);
    } catch (error) {
      console.error('Error fetching popular items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNavLinks = () => {
    setNavLinksVisible(!navLinksVisible);
  };

  function logout() {
    Cookies.remove('token');
    window.location.href = '/login';
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="logo">Eats Now</div>
          <div className={`nav-links ${navLinksVisible ? "active" : ""}`} id="navLinks">
            <a href="#home">Home</a>
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="order-btn" onClick={logout}>Logout</button>

          <div className="hamburger" onClick={toggleNavLinks}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Delicious Food Delivered Fast</h1>
          <p>Order from your favorite restaurants and get it delivered to your doorstep in minutes.</p>
          {/* 
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Search for restaurants or dishes..." />
            <button className="search-btn">Search</button>
          </div> */}
        </div>
      </section>

      {/* Categories Section */}
      <section id="menu" class="categories">
      <h2 class="section-title">Food Categories</h2>
      <div class="categories-grid">

          <div class="category-card">
              <i class="fas fa-utensils"></i>
              <h3>Indian Specialties</h3>
              <p>Biryani, Paratha, Dosa, Pulao Rice</p>
          </div>

          <div class="category-card">
              <i class="fas fa-bowl-rice"></i>
              <h3>Rice Dishes</h3>
              <p>Fried Rice, Nasi Goreng, Pulau Rice</p>
          </div>

          <div class="category-card">
              <i class="fas fa-bowl-food"></i>
              <h3>Curries</h3>
              <p>Mutton Curry, Prawn Curry, Vegetarian</p>
          </div>

          <div class="category-card">
              <i class="fas fa-bread-slice"></i>
              <h3>Breads</h3>
              <p>Naan, Chapati, Roti, Paratha</p>
          </div>

          <div class="category-card">
              <i class="fas fa-truck-fast"></i>
              <h3>Street Food</h3>
              <p>Kottu, Dosa, Sandwiches, Snacks</p>
          </div>

          <div class="category-card">
              <i class="fas fa-fish"></i>
              <h3>Seafood</h3>
              <p>Prawns, Fish Curry, Jaffna Style</p>
          </div>
  
          <div class="category-card">
              <i class="fas fa-ice-cream"></i>
              <h3>Desserts</h3>
              <p>Cakes, Traditional Sweets, Ice Cream</p>
          </div>
  
          <div class="category-card">
              <i class="fas fa-mug-hot"></i>
              <h3>Beverages</h3>
              <p>Tea, Coffee, Soft Drinks, Fresh Juice</p>
          </div>
  
          <div class="category-card">
              <i class="fas fa-leaf"></i>
              <h3>Soups & Salads</h3>
              <p>Fresh Salads, Traditional Soups</p>
          </div>
  
          <div class="category-card">
              <i class="fas fa-apple-alt"></i>
              <h3>Appetizers</h3>
              <p>Starters, Bites, Snacks, Chaats</p>
          </div>
          </div>
      </section>

      {/* Popular Food Section */}
      <section className="popular-food-section">
        <div className="outlet-section">
          <h2>Popular Food</h2>
          {loading ? (
            <div className="loading-spinner">Loading popular items...</div>
          ) : popularItems.length === 0 ? (
            <div className="no-items-message">No popular items available at the moment.</div>
          ) : (
            <div className="outlet-grid">
              {popularItems.map(item => (
                <Link 
                  to={`/order/${item._id}`} 
                  className="outlet-card" 
                  key={item._id}
                >
                  <img 
                    src={`http://localhost:4003${item.image}`} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <div className="price-tag">Rs.{parseFloat(item.price).toFixed(2)}</div>
                  <h3>{item.name}</h3>
                  <p>{item.description.length > 60 ? 
                    `${item.description.substring(0, 60)}...` : 
                    item.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

       <footer class="footer-container">
       <div class="footer-content">
           <div id="contact" class="footer-section contact-info">
               <h3 className="footer-contact-number">CONTACT INFO</h3>
               <p>148/10, Station Road, Malabe, Sri Lanka</p>
               <p>0123456789</p>
               <p>info@eatsnow.com</p>
               <p>eatsnow.com</p>
           </div>

           <div id="about" class="footer-section">
               <h3>ABOUT</h3>
               <p>Dining at the restaurant at The Eats Now Restaurant, Malabe, is an experience in itself as it comes with a vast array of delicious dishes and delectable treats. The restaurant which is located on the ground floor is a favorite amongst restaurants in Malabe, with the capacity to accommodate over 100 people.</p>
           </div>

           <div class="footer-section">
               <h3>FOOD CATEGORIES</h3>
               <div class="food-categories">
                  <div>Appetizers / Starters</div>
                  <div>Main Course</div>
                  <div>Desserts</div>
                  <div>Beverages / Drinks</div>
                  <div>Salads</div>
                  <div>Soups</div>
                  <div>Sides</div>
                  <div>Snacks</div>
                  <div>Breakfast</div>
                  <div>Brunch</div>
                  <div>Lunch</div>
                  <div>Dinner</div>
                  <div>Italian</div>
                  <div>Chinese</div>
                  <div>Indian</div>
                  <div>Mexican</div>
                  <div>American</div>
                  <div>Thai</div>
                  <div>Japanese</div>
                  <div>Mediterranean</div>
                  <div>Middle Eastern</div>
                  <div>Korean</div>
                  <div>Vegetarian</div>
                  <div>Vegan</div>
                  <div>Gluten-Free</div>
                  <div>Keto</div>
                  <div>Halal</div>
                  <div>Kosher</div>
              </div>
           </div>
       </div>

       <div className="app-badges">
          <a href="https://facebook.com" target="_blank" ><FaFacebook /></a>
          <a href="https://twitter.com" target="_blank"><FaTwitter /></a>
          <a href="https://instagram.com" target="_blank"><FaInstagram /></a>
          <a href="https://linkedin.com" target="_blank"> <FaLinkedin /></a>
       </div>

        <div class="copyright">
            <p>© Eats Now 2025. Designed by Eats Now Team</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
