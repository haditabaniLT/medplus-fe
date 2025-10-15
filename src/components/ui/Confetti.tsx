import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiProps {
  trigger?: boolean;
  duration?: number;
  particleCount?: number;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  backgroundColor: string;
  animationDelay: string;
  animationDuration: string;
}

const Confetti: React.FC<ConfettiProps> = ({
  trigger = false,
  duration = 3000,
  particleCount = 50,
  className,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    'hsl(var(--teal))',
    'hsl(var(--teal-glow))',
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--info))',
  ];

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [trigger, duration, particleCount]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-50 overflow-hidden',
        className
      )}
      role="presentation"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-fade-in"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            backgroundColor: particle.backgroundColor,
            animation: `confetti-fall ${particle.animationDuration} ${particle.animationDelay} ease-out forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
