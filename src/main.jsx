import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

// Main entry point
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
