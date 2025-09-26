import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Update the document class and save preference
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark, isLoading]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return {
    isDark,
    toggleTheme,
    isLoading
  };
};
