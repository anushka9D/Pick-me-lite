import './App.css';
import {BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Index from './components/index';
import Login from './components/login';
import RestaurantRegistration from './components/restaurantRegistration';
import RestaurantDashboard from './components/restaurantDashboard';
import Home from './components/home';

function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route path ="/" element = {<Index/>}/>
        <Route path ="/login" element = {<Login/>}/>
        <Route path ="/restaurant_registration" element = {<RestaurantRegistration/>}/>
        <Route path ="/restaurant_dashboard" element = {<RestaurantDashboard/>}/>
        <Route path ="/home" element = {<Home/>}/>
        {/* <Route path="/order/:itemId" element={<Order />} /> */} {/* New route for orders */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
