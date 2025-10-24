import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react-root')

  if (!container) {
    console.error('React root element not found!')
    return
  }

  const root = createRoot(container)
  root.render(<App />)

  console.log('React app mounted successfully!')
})
