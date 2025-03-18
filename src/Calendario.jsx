import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendario.css";

const Calendario = () => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [eventos, setEventos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioData, setUsuarioData] = useState(null);
    const navigate = useNavigate();

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
                setError("Error al cargar datos del usuario");
            }
        } else {
            console.log("No hay datos de usuario, redirigiendo al login");
            navigate("/login");
        }
    }, [navigate]);

    // Formatear fecha para mostrar en la UI
    const formatoFecha = (fecha) => {
        // Asegurarse de que tengamos una fecha y la convertimos a YYYY-MM-DD
        if (!fecha) return '';
        
        if (typeof fecha === 'string') {
            return fecha; // Ya está en formato YYYY-MM-DD
        }
        
        // Si es un objeto Date, lo formateamos
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Obtener eventos desde la API solo para el aprendiz logueado
    const obtenerEventos = async () => {
        // Si no hay usuario logueado, no podemos obtener eventos
        if (!usuarioData?.id) {
            console.log("No hay usuario logueado para obtener eventos");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Obtener eventos por aprendiz_id
            const aprendizId = usuarioData.id;
            const response = await fetch(`http://localhost:3032/eventos/aprendiz/${aprendizId}`);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Si los eventos son un array vacío o no es un array
            if (!Array.isArray(data) || data.length === 0) {
                console.log(`No se encontraron eventos para el aprendiz ID: ${aprendizId}`);
                setEventos({});
                setLoading(false);
                return;
            }
            
            console.log(`Eventos recibidos para aprendiz ${aprendizId}:`, data);
            
            // Organizar eventos por fecha
            const eventosMap = {};
            data.forEach((evento) => {
                // Asegurar que la fecha está en formato YYYY-MM-DD
                let fechaEvento = evento.fecha;
                
                // Si la fecha incluye la hora (ISO string) extraer solo la parte de la fecha
                if (fechaEvento && fechaEvento.includes('T')) {
                    fechaEvento = fechaEvento.split('T')[0];
                }
                
                // Imprimir cada evento para depuración
                console.log(`ID: ${evento.id}, Nombre: ${evento.nombre}, Fecha: ${fechaEvento}, Hora: ${evento.hora}`);
                
                if (!fechaEvento) {
                    console.warn("Evento sin fecha válida:", evento);
                    return; // Saltamos este evento
                }
                
                if (!eventosMap[fechaEvento]) {
                    eventosMap[fechaEvento] = [];
                }
                
                // Guardar solo los datos necesarios
                eventosMap[fechaEvento].push({
                    id: evento.id,
                    nombre: evento.nombre,
                    hora: evento.hora
                });
            });
            
            console.log("Mapa de eventos por fecha:", eventosMap);
            setEventos(eventosMap);
            
            // Verificar si hay eventos para la fecha seleccionada
            const fechaActual = formatoFecha(fechaSeleccionada);
            if (eventosMap[fechaActual]) {
                console.log(`Eventos para hoy (${fechaActual}):`, eventosMap[fechaActual]);
            } else {
                console.log(`No hay eventos para hoy (${fechaActual})`);
            }
        } catch (error) {
            console.error("Error al obtener eventos:", error);
            setError(`Error al cargar eventos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Cargar eventos cuando cambia el usuario
    useEffect(() => {
        if (usuarioData) {
            obtenerEventos();
            
            // Recargar eventos automáticamente cada minuto
            const intervalId = setInterval(obtenerEventos, 60000);
            
            // Limpiar el intervalo cuando el componente se desmonte
            return () => clearInterval(intervalId);
        }
    }, [usuarioData]);

    // Manejar cambio de fecha en el calendario
    const cambiarFecha = (fecha) => {
        setFechaSeleccionada(fecha);
    };

    // Obtener la fecha formateada para la fecha seleccionada
    const fechaFormateada = formatoFecha(fechaSeleccionada);

    // Función para eliminar evento y actualizar el estado
    const eliminarEvento = async (eventoId) => {
        try {
            console.log(`Eliminando evento con ID: ${eventoId}`);
            
            // Hacer la petición DELETE
            const response = await fetch(`http://localhost:3032/evento/${eventoId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Evento eliminado correctamente");
                // Recargar eventos
                obtenerEventos();
            } else {
                alert("Error al eliminar el evento");
            }
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            alert(`Error al eliminar: ${error.message}`);
        }
    };

    // Redirigir a CrearEvento.jsx con la fecha seleccionada
    const agregarEvento = () => {
        navigate("/crearEvento", { state: { fechaSeleccionada: fechaFormateada } });
    };

    return (
        <div className="calendario-container">
            <h2>Calendario de Eventos</h2>
            
            {usuarioData && (
                <div className="user-info">
                    Eventos de: <span className="username">{usuarioData.nombre || "Usuario"}</span>
                </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <p className="loading">Cargando eventos...</p>
            ) : (
                <>
                    {/* Calendario */}
                    <div className="calendar-box">
                        <Calendar
                            onChange={cambiarFecha}
                            value={fechaSeleccionada}
                            tileClassName={({ date }) => {
                                // Formatear la fecha del tile del calendario
                                const fechaKey = formatoFecha(date);
                                
                                // Verificar si hay eventos para esta fecha
                                const tieneEventos = eventos[fechaKey] && eventos[fechaKey].length > 0;
                                
                                return tieneEventos ? "evento-dia" : "";
                            }}
                        />
                    </div>

                    {/* Eventos del día seleccionado */}
                    <div className="eventos-box">
                        <h3>Eventos para {fechaSeleccionada.toLocaleDateString()}</h3>
                        <div className="fecha-debug">
                            Fecha seleccionada: {fechaFormateada}
                            {eventos[fechaFormateada] ? ` (${eventos[fechaFormateada].length} eventos)` : " (sin eventos)"}
                        </div>
                        
                        {eventos[fechaFormateada] && eventos[fechaFormateada].length > 0 ? (
                            <div className="eventos-lista">
                                {eventos[fechaFormateada].map((evento) => (
                                    <div key={evento.id} className="evento-card">
                                        <div className="evento-info">
                                            <h4>{evento.nombre}</h4>
                                            <p>⏰ {evento.hora}</p>
                                        </div>
                                        <button 
                                            onClick={() => eliminarEvento(evento.id)}
                                            className="delete-btn">
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-eventos">No hay eventos para {fechaFormateada}</p>
                        )}
                        
                        <button onClick={agregarEvento} className="add-button">
                            Agregar Evento para {fechaFormateada}
                        </button>
                        
                        <button onClick={obtenerEventos} className="refresh-button">
                            Actualizar Eventos
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Calendario;
