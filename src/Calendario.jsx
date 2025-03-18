import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendario.css";

const Calendario = () => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [eventos, setEventos] = useState({});
    const navigate = useNavigate(); // Hook para redirección

    // Obtener eventos desde la API
    const obtenerEventos = async () => {
        try {
            const response = await fetch("http://localhost:3032/eventos");
            const data = await response.json();
            const eventosArray = Array.isArray(data) ? data : data.data;

            if (!Array.isArray(eventosArray)) {
                console.error("Formato de datos incorrecto:", data);
                return;
            }

            const eventosMap = {};
            eventosArray.forEach((evento) => {
                const fecha = evento.fecha; // "YYYY-MM-DD"
                if (!eventosMap[fecha]) {
                    eventosMap[fecha] = [];
                }
                eventosMap[fecha].push({
                    idEventos: evento.id, // Guardar el ID
                    hora: evento.hora,
                    descripcion: evento.nombre,
                });
            });

            setEventos(eventosMap);
        } catch (error) {
            console.error("Error al obtener eventos:", error);
        }
    };

    useEffect(() => {
        obtenerEventos();
    }, []);

    // Manejar cambio de fecha en el calendario
    const cambiarFecha = (fecha) => {
        setFechaSeleccionada(fecha);
    };

    // Formatear fecha seleccionada a "YYYY-MM-DD"
    const formatoFecha = fechaSeleccionada.toISOString().split("T")[0];

    // Función para eliminar evento y actualizar el estado
    const eliminarEvento = async (idEventos) => {
        try {
            const response = await fetch("http://localhost:3032/eventos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idEventos }), // Enviar ID en el body
            });

            if (response.ok) {
                alert("Evento eliminado correctamente");

                // Actualizar el estado de eventos eliminando el evento correspondiente
                setEventos((prevEventos) => {
                    const nuevosEventos = { ...prevEventos };
                    nuevosEventos[formatoFecha] = nuevosEventos[formatoFecha].filter(evento => evento.idEventos !== idEventos);

                    // Si no quedan eventos en esa fecha, eliminar la clave del objeto
                    if (nuevosEventos[formatoFecha].length === 0) {
                        delete nuevosEventos[formatoFecha];
                    }

                    return nuevosEventos;
                });
            } else {
                alert("Error al eliminar el evento");
            }
        } catch (error) {
            console.error("Error al eliminar evento:", error);
        }
    };

    // Redirigir a CrearEvento.jsx con la fecha seleccionada
    const agregarEvento = () => {
        navigate("/crearEvento", { state: { fechaSeleccionada: formatoFecha } });
    };

    return (
        <div className="calendario-container">
            {/* Buscador */}
            <div className="search-bar">
                <input type="text" placeholder="Buscar..." />
                <button>🔍</button>
            </div>

            {/* Calendario */}
            <div className="calendar-box">
                <Calendar
                    onChange={cambiarFecha}
                    value={fechaSeleccionada}
                    tileClassName={({ date }) => {
                        const fechaKey = date.toISOString().split("T")[0];
                        return eventos[fechaKey] ? "evento-dia" : "";
                    }}
                />
            </div>

            {/* Eventos del día seleccionado */}
            <div className="eventos-box">
                <h4>📅 {fechaSeleccionada.toDateString()}</h4>
                {eventos[formatoFecha] ? (
                    eventos[formatoFecha].map((evento, index) => (
                        <div key={index} className="evento">
                            <p>⏰ {evento.hora}</p>
                            <p>{evento.descripcion}</p>
                            <button onClick={() => eliminarEvento(evento.idEventos)}>Eliminar</button>
                        </div>
                    ))
                ) : (
                    <p>No hay eventos programados</p>
                )}
            </div>

            {/* Botón Agregar Evento */}
            <div className="add-event-button">
                <button onClick={agregarEvento}>➕ Agregar Evento</button>
            </div>
        </div>
    );
};

export default Calendario;
