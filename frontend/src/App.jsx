import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Group from './pages/Group/Group';
import Post from './pages/Post/Post';
import './App.css'

function PrivateRoute({ children }) {
    const userId = localStorage.getItem('userId');
    return userId ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <header style={{ background: '#054d34', color: '#fff', padding: '12px 20px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '1px' }}>MatrixMessenger</h1>
            </header>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/groups" element={
                    <PrivateRoute><Group /></PrivateRoute>
                } />
                <Route path="/posts" element={
                    <PrivateRoute><Post /></PrivateRoute>
                } />
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
