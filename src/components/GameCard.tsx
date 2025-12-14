import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isExternal?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  image,
  buttonText,
  buttonLink,
  isExternal = false
}) => {
  // Check if it's an external payment link
  const isPaymentLink = buttonLink.includes('mpago.la');
  
  const ButtonComponent = (isExternal && !isPaymentLink) ? 'a' : (isPaymentLink ? 'a' : Link);
  const buttonProps = isExternal && !isPaymentLink
    ? { href: buttonLink, target: "_blank", rel: "noopener noreferrer" }
    : isPaymentLink
    ? { href: buttonLink }
    : { to: buttonLink };

  return (
    <div className="game-card rounded-xl p-6 text-center group">
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-20 h-20 mx-auto rounded-full object-cover transition-transform duration-300 group-hover:scale-110 border-2 border-orange-500/30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 glow-text">{title}</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">{description}</p>
      
      <ButtonComponent
        {...buttonProps}
        className="cyber-button rounded-lg inline-flex items-center space-x-2 w-full justify-center"
      >
        <span>{buttonText}</span>
        {isExternal && <ExternalLink className="w-4 h-4" />}
      </ButtonComponent>
    </div>
  );
};

export default GameCard;