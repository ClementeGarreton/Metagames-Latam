// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/FreePage';
import ConquestPage from './pages/HardPage';
import WinnersPage from './pages/WinnersPage';
import ErrorPage from './pages/ErrorPage';
import EasyModePage from './pages/EasyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DianaPage from './pages/DianaPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/conquest" element={<ConquestPage />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/easymode" element={<EasyModePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/diana" element={<DianaPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;