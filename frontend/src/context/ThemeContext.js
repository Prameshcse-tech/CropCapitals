import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(isDark));
        if (isDark) {
            document.body.style.backgroundColor = '#1a1a1a';
            document.body.style.color = '#e0e0e0';
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#000000';
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
