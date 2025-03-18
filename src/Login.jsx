import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [aprendices, setAprendices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data from API when component mounts
        const fetchAprendices = async () => {
            try {
            const response = await fetch('http://localhost:3032/aprendices');
            const data = await response.json();
            setAprendices(data);
            } catch (err) {
            console.error('Error fetching aprendices:', err);
            setError('Error al conectar con el servidor');
            }
        };

        fetchAprendices();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        // Find aprendiz with matching nombre and documento
        const aprendiz = aprendices.find(
            a => a.nombre === username && a.documento === password
        );
        
        if (aprendiz) {
            // Login successful
            
            // Guardar datos del usuario en localStorage
            const userData = {
                id: aprendiz.id,
                nombre: aprendiz.nombre,
                documento: aprendiz.documento
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            alert('Inicio de sesión exitoso');
            // Navigate with state to pass username
            navigate('/welcome', { state: { username: aprendiz.nombre } });
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Usuario" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}