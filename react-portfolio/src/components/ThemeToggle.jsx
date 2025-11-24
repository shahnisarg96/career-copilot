import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const getPreferredTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // Default to dark, unless system explicitly prefers light
    return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
};

const ThemeToggle = () => {
    const [theme, setTheme] = useState(getPreferredTheme);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.querySelector('html').setAttribute('data-theme', theme);
    }, [theme]);

    // Optional: Listen for theme changes in other tabs
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'theme' && e.newValue) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <label className="swap swap-rotate" title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}>
            <input
                type="checkbox"
                onChange={toggleTheme}
                checked={theme === 'dark'}
                aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            />
            <FaSun className="swap-on h-6 w-6 fill-current" />
            <FaMoon className="swap-off h-6 w-6 fill-current" />
        </label>
    );
};

export default ThemeToggle;
