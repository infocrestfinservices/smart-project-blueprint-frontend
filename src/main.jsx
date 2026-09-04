import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // attribute="class" toggles the `dark` class on <html> that every `.dark { ... }`
  // variable in index.css keys off — this is what makes dark mode apply to the WHOLE
  // app (every page uses the same bg-background/text-foreground tokens), not just the
  // Profile page's own toggle. defaultTheme="system" until AuthContext syncs the
  // account's saved theme_preference in on login (see AuthContext.jsx).
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <App />
  </ThemeProvider>
)
