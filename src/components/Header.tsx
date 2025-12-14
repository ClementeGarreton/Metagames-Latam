// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Trophy, Gamepad2, LogIn, UserPlus, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserEmail('');
    navigate('/');
    setIsMenuOpen(false);
  };

  const getUserInitial = () => {
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Gamepad2 className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold gradient-text">METAGAMES</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            
            <Link 
              to="/game" 
              className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jugar</span>
            </Link>
            
            <Link 
              to="/winners" 
              className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>Ganadores</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-700">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{getUserInitial()}</span>
                    </div>
                    <span className="text-white text-sm max-w-[100px] truncate">{userEmail}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:text-orange-500 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Signup</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-orange-500 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-orange-500/30">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
              
              <Link
                to="/game"
                className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Jugar</span>
              </Link>
              
              <Link
                to="/winners"
                className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                <span>Ganadores</span>
              </Link>

              {/* Mobile Auth Section */}
              <div className="pt-4 mt-4 border-t border-gray-700">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-lg mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{getUserInitial()}</span>
                      </div>
                      <span className="text-white text-sm">{userEmail}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 w-full px-4 py-2 text-white hover:text-orange-500 border border-gray-700 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cuenta</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;