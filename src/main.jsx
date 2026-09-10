import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { installErrorLogger } from './utils/errorLog'

// Start capturing console errors before the app mounts, so a crash during the
// first render is still in the buffer when someone reports it.
installErrorLogger()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
