import React from 'react';
import Header from '../components/Header';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 p-6 text-center">
              <h2 className="text-3xl font-bold tracking-widest text-white">METAGAMES LATAM</h2>
              <p className="text-sm tracking-wide opacity-90 text-white">¡Gana dinero jugando!</p>
            </div>

            <div className="p-8 text-center">
              <div className="mb-6">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 animate-pulse mb-4" />
                <h3 className="text-2xl font-bold text-red-400 mb-2">¡Error en el Pago!</h3>
                <p className="text-gray-300">
                  Hubo un problema procesando tu pago. Por favor, intenta nuevamente.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="cyber-button rounded-lg w-full py-3 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Intentar Nuevamente</span>
                </button>
                
                <Link
                  to="/"
                  className="block w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Volver al Inicio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;