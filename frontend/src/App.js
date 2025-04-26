import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile"
import Helpdesk from "./components/Helpdesk";
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
                  <Route path="/helpdesk" element={<Helpdesk />} />
              </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
