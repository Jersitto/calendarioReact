import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/CrearEvento.css';

export default function CrearEvento() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtener fecha seleccionada del estado de navegación o usar la fecha actual
    const fechaSeleccionada = location.state?.fechaSeleccionada || new Date().toISOString().split('T')[0];
    
    // Obtener información del usuario logueado
    const [usuarioData, setUsuarioData] = useState(null);
    
    // Efecto para cargar los datos del usuario desde localStorage
    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                setUsuarioData(userData);
                console.log("Datos de usuario cargados:", userData);
            } catch (error) {
                console.error("Error al parsear los datos del usuario:", error);
            }
        } else {
            // Si no hay datos de usuario, podríamos redirigir al login
            console.log("No hay datos de usuario, usando valores predeterminados");
        }
    }, []);
    
    // Configurar valores predeterminados para los IDs
    const usuarioId = usuarioData?.id || 1;
    const aprendizId = usuarioId; // Usar mismo ID como aprendiz
    
    console.log("Fecha recibida en CrearEvento:", fechaSeleccionada);
    console.log("Usuario ID:", usuarioId, "Aprendiz ID:", aprendizId);
    
    const [formData, setFormData] = useState({
        nombre: '',
        fecha: fechaSeleccionada, // Formato YYYY-MM-DD
        hora: '',
        aprendiz_id: aprendizId,
        usuario_modificador_id: usuarioId,
        usuario_creador_id: usuarioId,
        usuario_eliminador_id: null,
        eliminado: 0
    });
    
    // Actualizar formData cuando cambia usuarioData
    useEffect(() => {
        if (usuarioData) {
            setFormData(prevData => ({
                ...prevData,
                aprendiz_id: usuarioData.id,
                usuario_modificador_id: usuarioData.id,
                usuario_creador_id: usuarioData.id
            }));
        }
    }, [usuarioData]);
    
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito(false);
        
        // Validación básica para los campos visibles
        if (!formData.nombre || !formData.fecha || !formData.hora) {
            setError('Todos los campos son obligatorios');
            return;
        }
        
        try {
            // Asegurarse de que la fecha está en formato correcto YYYY-MM-DD
            // La fecha ya debería estar en formato correcto, pero lo verificamos
            if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha)) {
                setError('Formato de fecha incorrecto. Use YYYY-MM-DD');
                return;
            }
            
            console.log("Enviando datos:", JSON.stringify(formData));
            
            const response = await fetch('http://localhost:3032/evento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Evento creado:", data);
                setExito(true);
                setTimeout(() => {
                    navigate('/welcome');
                }, 1500);
            } else {
                const errorData = await response.json();
                console.error("Error del servidor:", errorData);
                setError(errorData.error || 'Error al crear el evento');
            }
        } catch (err) {
            console.error('Error al crear el evento:', err);
            setError(`Error de conexión al servidor: ${err.message}`);
        }
    };
    
    return (
        <div className="crear-evento-container">
            <h1>Crear Nuevo Evento</h1>
            
            {usuarioData ? (
                <div className="user-info">
                    Creando evento como: <span className="username">{usuarioData.nombre || "Usuario"}</span>
                </div>
            ) : null}
            
            {exito && (
                <div className="exito-mensaje">
                    ¡Evento creado correctamente! Redirigiendo...
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre del evento</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre del evento"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="fecha">Fecha</label>
                    <input
                        id="fecha"
                        name="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={handleChange}
                    />
                    <div className="fecha-value">{formData.fecha}</div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="hora">Hora</label>
                    <input
                        id="hora"
                        name="hora"
                        type="time"
                        value={formData.hora}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="debug-info">
                    <p>ID Aprendiz: {formData.aprendiz_id}</p>
                    <p>ID Usuario: {formData.usuario_creador_id}</p>
                    <p>Fecha formato: {formData.fecha} (YYYY-MM-DD)</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="buttons">
                    <button type="button" onClick={() => navigate('/welcome')} className="cancel-btn">
                        Cancelar
                    </button>
                    <button type="submit" className="submit-btn">
                        Guardar Evento
                    </button>
                </div>
            </form>
        </div>
    );
}
