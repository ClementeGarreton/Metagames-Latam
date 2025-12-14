import React from 'react';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { Trophy, Share2, CreditCard, Gamepad2 } from 'lucide-react';

const HomePage: React.FC = () => {
  // Limpiar localStorage y sessionStorage al cargar
  React.useEffect(() => {
    localStorage.removeItem('lastGameScore');
    localStorage.removeItem('lastGameMode');
    localStorage.removeItem('lastGameTime');

    sessionStorage.removeItem('conquest-loaded');
    sessionStorage.removeItem('easymode-loaded');
    sessionStorage.removeItem('conquest-refresh');
    sessionStorage.removeItem('easymode-refresh');
  }, []);

  // Estado para la cuenta regresiva
  const [countdown, setCountdown] = React.useState('');

  React.useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();

      // Lunes 8:00 AM
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      start.setHours(8, 0, 0, 0);

      // Domingo 8:00 PM
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(20, 0, 0, 0);

      if (now < start) {
        // Antes del lunes 8 AM
        const diff = start.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(`Comienza el sorteo en ${hours}h ${minutes}m ${seconds}s`);
      } else if (now >= start && now <= end) {
        // Entre lunes 8 AM y domingo 8 PM
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        // Entre domingo 8 PM y lunes 8 AM
        setCountdown('El sorteo está cerrado. ¡Vuelve mañana a las 8 AM!');
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const gameOptions = [
    {
      title: "Modo Desafio",
      description: "500 Pesos Chilenos cada partida. Los enemigos son aleatorios",
      image: "/game1.png",
      buttonText: "Jugar en Dificil",
      buttonLink: "https://mpago.la/19BPFvn",
      isExternal: false
    },
    {
      title: "Modo Principiante",
      description: "1000 Pesos la partida. La velocidad y enemigos son constantes.",
      image: "/game2.png",
      buttonText: "Jugar en Facil",
      buttonLink: "https://mpago.la/2kMbM58",
      isExternal: false
    },
    {
      title: "JUEGA GRATIS",
      description: "Modo de practica. Familiaizate antes de competir, entrena duro y gana.",
      image: "/game3.png",
      buttonText: "JUEGA AQUÍ",
      buttonLink: "/game",
      isExternal: false
    },
    {
      title: "Sala de Ganadores", 
      description: "Consulta los puntajes ganadores con total transparencia para ganar.",
      image: "/game4.jpg",
      buttonText: "Ver",
      buttonLink: "/winners",
      isExternal: false
    },
    {
      title: "Diana PvP",
      description: "Compite contra otros jugadores en tiempo real y gana su botin.",
      image: "/game5.png",
      buttonText: "Seguir",
      buttonLink: "/diana",
      isExternal: true
    },
    {
      title: "Mi Carta de la Suerte",
      description: "Paga por revelar el precio y gana productos premium.",
      image: "/gamex.png",
      buttonText: "Descubrir",
      buttonLink: "#",
      isExternal: false
    }
  ];

  const howToPlay = [
    {
      icon: <CreditCard className="w-12 h-12 text-orange-500" />,
      title: "Paga",
      description: "Haz clic en los logos de arriba para jugar."
    },
    {
      icon: <Gamepad2 className="w-12 h-12 text-orange-500" />,
      title: "Juega",
      description: "Juega Dino Run. El puntaje más alto gana el premio cada mes."
    },
    {
      icon: <Trophy className="w-12 h-12 text-orange-500" />,
      title: "Gana",
      description: "Se compara tu puntaje con tu pago para asegurar un juego justo."
    },
    {
      icon: <Share2 className="w-12 h-12 text-orange-500" />,
      title: "Comparte",
      description: "Si quieres, comparte cómo ganaste en Metagames."
    }
  ];

  return (
    <div className="min-h-screen relative">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4" style={{ marginBottom: '-2rem' }}>
        <div className="container mx-auto text-center">
          <div className="relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black gradient-text mb-6 floating">
              METAGAMES
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Proximo premio a pagar cada domingo al final de la cuenta regresiva:
            </p>
            <div className="mt-4 text-4xl font-extrabold text-orange-500">
              {countdown}
            </div>
          </div>
        </div>
      </section>

      {/* Game Options Section */}
      <section id="game-section" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-orange">
              <a href="/game">Modos de Juego</a>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameOptions.map((option, index) => (
              <div key={index}>
                <GameCard {...option} titleClassName="glow-orange" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-orange">
              Cómo Jugar
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howToPlay.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 glow-orange">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 glow-text">
                Sobre Nosotros
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Aquí en Metagames puedes ganar dinero online jugando Dino Run haciendo el máximo puntaje a fin de mes.
                </p>
                <p>
                  <strong className="text-orange-500">NO somos un casino online</strong> ya que nuestra propuesta desafía a los juegos de azar que son más trampa que acuerdo mutuo.
                </p>
                <p>
                  El premio millonario se paga el día 28 de cada mes y hay 2 modos de juego.
                </p>
                <p>
                  Modo gratuito para practicar y modo premium con Mercado Pago y Power-Ups.
                </p>
                <p>
                  El modo premium cuesta 5 centavos la entrada o por juego y el power up para revivir y continuar sin perder tu puntaje cuesta 50 centavos.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Gaming"
                className="rounded-2xl shadow-2xl neon-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Transparency"
                className="rounded-2xl shadow-2xl neon-border"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-white mb-6 glow-text">
                Transparencia & Confianza
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Para mantener la transparencia, la legalidad y la confianza publicamos la cantidad de dinero en juego en nuestro Instagram o la red Bitcoin con total transparencia y dominio público.
                </p>
                <p>
                  Antes de entregar el premio, revisamos que el ganador no haya hecho trampa (como modificar el puntaje o jugar sin pagar).
                </p>
                <p>
                  Al entrar al juego en modo premium debes ingresar tu email el cual será censurado en la tabla de ganadores para proteger tu identidad y evitar estafas que se hagan pasar por nosotros.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black border-t border-orange-500/30">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            Copyright 2025 All Rights Reserved By <span className="text-orange-500 font-bold">Metagames</span>
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes neonPulse {
          0% { text-shadow: 0 0 5px #ff6600, 0 0 10px #ff6600, 0 0 20px #ff9933; }
          50% { text-shadow: 0 0 10px #ff9933, 0 0 20px #ff6600, 0 0 30px #ffaa55; }
          100% { text-shadow: 0 0 5px #ff6600, 0 0 10px #ff6600, 0 0 20px #ff9933; }
        }
        .glow-orange {
          animation: neonPulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
