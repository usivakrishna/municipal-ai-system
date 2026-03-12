import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UI_MODE_KEY = 'municipal_ui_mode';

const INTERFACE_MODES = [
  {
    id: 'executive',
    label: 'Executive',
    description: 'Polished presentation mode with spacious layouts and dashboard emphasis.'
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'Dense operations mode for faster scanning and reduced spacing.'
  },
  {
    id: 'contrast',
    label: 'Contrast',
    description: 'High-visibility mode for control rooms and accessibility-heavy usage.'
  }
];

const UiContext = createContext(null);

const getStoredMode = () => {
  const storedMode = localStorage.getItem(UI_MODE_KEY);
  return INTERFACE_MODES.some((item) => item.id === storedMode) ? storedMode : 'executive';
};

export const UiProvider = ({ children }) => {
  const [mode, setMode] = useState(getStoredMode);

  useEffect(() => {
    localStorage.setItem(UI_MODE_KEY, mode);
    document.documentElement.dataset.uiMode = mode;
    document.documentElement.style.colorScheme = mode === 'contrast' ? 'dark' : 'light';
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      modeMeta: INTERFACE_MODES.find((item) => item.id === mode) || INTERFACE_MODES[0],
      modes: INTERFACE_MODES,
      setMode
    }),
    [mode]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used inside UiProvider');
  }
  return context;
};
