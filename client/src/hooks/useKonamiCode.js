import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const useKonamiCode = () => {
  const [triggered, setTriggered] = useState(false);
  const sequenceIndexRef = useRef(0);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const resetToastTimer = () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };

    const handleSuccess = () => {
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTriggered(true);
      resetToastTimer();

      toastTimerRef.current = setTimeout(() => {
        setTriggered(false);
        toastTimerRef.current = null;
      }, 2500);
    };

    const handleKeyDown = (event) => {
      const expectedKey = KONAMI_SEQUENCE[sequenceIndexRef.current];

      if (event.key === expectedKey) {
        sequenceIndexRef.current += 1;

        if (sequenceIndexRef.current === KONAMI_SEQUENCE.length) {
          sequenceIndexRef.current = 0;
          handleSuccess();
        }
      } else {
        sequenceIndexRef.current = event.key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetToastTimer();
    };
  }, []);

  return { triggered };
};

export default useKonamiCode;
