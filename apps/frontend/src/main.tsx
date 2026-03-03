import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#181818',
            color: '#f0f0f0',
            border: '1px solid #333',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00e5ff', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ff4444', secondary: '#000' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
