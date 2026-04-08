import { BrowserRouter,Routes,Route,Navigate } from 'react'
import Register from './pages/Register'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
