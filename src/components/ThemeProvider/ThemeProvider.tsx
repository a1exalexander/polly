'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useTransition,
    PropsWithChildren,
} from 'react';
import { setThemeCookie } from './actions';
import { type Theme } from './constants';

export type { Theme };

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps extends PropsWithChildren {
    initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = 'light' }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const [, startTransition] = useTransition();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const updateTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        startTransition(() => {
            setThemeCookie(newTheme);
        });
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        updateTheme(newTheme);
    }, [updateTheme]);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        updateTheme(newTheme);
    }, [theme, updateTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
