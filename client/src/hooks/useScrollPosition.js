import { useEffect, useState } from 'react';

const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleScroll = () => {
      setScrollY(window.scrollY || window.pageYOffset || 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollY;
};

export default useScrollPosition;
