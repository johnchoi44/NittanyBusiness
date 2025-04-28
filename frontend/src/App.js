import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './components/UserContext';
import Landing from "./pages/Landing";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile"
import Helpdesk from "./components/Helpdesk";
import OrderReview from "./pages/OrderReview";
import Checkout from "./pages/Checkout";
import ProductManage from "./pages/ProductManage";
import OrderHistory from "./pages/OrderHistory";

function App() {
  return (
    <UserProvider>
      <Router>
              <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />}/>
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/helpdesk" element={<Helpdesk />} />
                  <Route path="/product-management" element={<ProductManage />}/>
                  <Route path="/order-management" element={<OrderHistory />}/>
                  <Route path="/order-review" element={<OrderReview />}/>
                  <Route path="/order-checkout" element={<Checkout />}/>
              </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
