import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Product from "./pages/Product";
import { UserProvider } from './components/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/product" element={<Product />} />
              </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
