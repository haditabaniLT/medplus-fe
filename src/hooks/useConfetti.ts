import { useState, useCallback } from 'react';

/**
 * Hook to trigger confetti animation
 * Usage:
 * const { triggerConfetti, confettiActive } = useConfetti();
 * 
 * <Confetti trigger={confettiActive} />
 * <button onClick={triggerConfetti}>Celebrate!</button>
 */
export const useConfetti = () => {
  const [confettiActive, setConfettiActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    // Reset after animation completes
    setTimeout(() => setConfettiActive(false), 100);
  }, []);

  return {
    triggerConfetti,
    confettiActive,
  };
};
