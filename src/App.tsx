import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import DriverLogin from './components/auth/DriverLogin';
import BusinessLogin from './components/auth/BusinessLogin';
import DriverSignIn from './components/auth/DriverSignIn';
import BusinessSignIn from './components/auth/BusinessSignIn';
import DriverDashboard from './components/dashboard/DriverDashboard';
import BusinessDashboard from './components/dashboard/BusinessDashboard';

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/business-login" element={<BusinessLogin />} />
          <Route path="/driver-signin" element={<DriverSignIn />} />
          <Route path="/business-signin" element={<BusinessSignIn />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;