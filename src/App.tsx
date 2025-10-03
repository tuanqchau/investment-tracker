import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
function App() {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dashboard />
    </LocalizationProvider>
  )
}

export default App
