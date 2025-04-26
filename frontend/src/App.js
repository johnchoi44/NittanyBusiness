import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile"
import { UserProvider } from './components/UserContext';

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
              </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
