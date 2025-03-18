import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import Welcome from './Welcome'
import CrearEvento from './CrearEvento'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/crearEvento" element={<CrearEvento />} />
    </Routes>
  )
}

export default App
