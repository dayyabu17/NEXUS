import useOrganizerLayoutDark from './useOrganizerLayoutDark';

// Organizer layout wrapper reserved for future theme variations.
const useOrganizerLayout = (options = {}) => {
  const { suppressInitialLoader = false } = options;
  return useOrganizerLayoutDark(suppressInitialLoader);
};

export default useOrganizerLayout;
