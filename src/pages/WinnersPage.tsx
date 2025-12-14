import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Trophy, Search, Filter } from 'lucide-react';

interface Winner {
  email: string; // Cambié de 'wallet' a 'email' para coincidir con tu backend
  score: number;
}

const WinnersPage: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para censurar emails (restaurada del código original)
  const censurarEmail = (email: string): string => {
    const length = email.length;
    if (length <= 6) return email;
    return email.substring(0, 3) + '...' + email.substring(length - 3);
  };

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Reemplaza 'YOUR_BACKEND_URL' con la URL real de tu backend
        // Por ejemplo: 'https://tu-backend.pythonanywhere.com/api/winners'
        const response = await fetch('https://clementeurzua.pythonanywhere.com/winners', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data: Winner[] = await response.json();
        
        // Verificar si los datos tienen el formato correcto
        const processedData = data.map(item => ({
          email: item.email || '', // Acepta tanto 'email' como 'wallet'
          score: typeof item.score === 'number' ? item.score : 0
        }));
        
        setWinners(processedData);
        setFilteredWinners(processedData);
      } catch (error) {
        console.error('Error fetching winners:', error);
        setError('Error al cargar los ganadores. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  useEffect(() => {
    let filtered = winners.filter(winner =>
      winner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
    });

    setFilteredWinners(filtered);
  }, [winners, searchTerm, sortOrder]);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Cargando ganadores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header />      
      <div className="pt-12 pb-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 mt-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 flex items-center justify-center space-x-4">
              <Trophy className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Ganadores
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Tabla de puntuaciones más altas con total transparencia
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white hover:border-orange-500 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Puntaje {sortOrder === 'desc' ? '↓' : '↑'}</span>
              </button>
            </div>
          </div>

          {/* Winners Table */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-600 to-red-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-bold">Posición</th>
                      <th className="px-6 py-4 text-left text-white font-bold">Email</th>
                      <th className="px-6 py-4 text-right text-white font-bold">Puntaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWinners.map((winner, index) => (
                      <tr
                        key={`${winner.email}-${index}`}
                        className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className={`flex items-center space-x-2 ${getRankColor(index)} font-bold`}>
                            <span className="text-2xl">{getRankIcon(index)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono">
                          {censurarEmail(winner.email)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-orange-500 font-bold text-lg">
                            {winner.score.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredWinners.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay ganadores aún'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/50 rounded-xl p-6 text-center hover:border-orange-400/70 transition-colors">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {filteredWinners.length}
              </div>
              <div className="text-gray-300">Total Jugadores</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/50 rounded-xl p-6 text-center hover:border-orange-400/70 transition-colors">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {filteredWinners.length > 0 ? filteredWinners[0].score.toLocaleString() : '0'}
              </div>
              <div className="text-gray-300">Puntaje Más Alto</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/50 rounded-xl p-6 text-center hover:border-orange-400/70 transition-colors">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {filteredWinners.length > 0 
                  ? Math.round(filteredWinners.reduce((sum, w) => sum + w.score, 0) / filteredWinners.length).toLocaleString()
                  : '0'
                }
              </div>
              <div className="text-gray-300">Puntaje Promedio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnersPage;