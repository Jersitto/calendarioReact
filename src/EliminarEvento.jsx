import React from 'react';

const EliminarEvento = ({ eventoId, eliminarEvento }) => {
    const handleEliminar = async () => {
        await eliminarEvento(eventoId);
    };

    return (
        <button onClick={handleEliminar} className="delete-btn">
            Eliminar
        </button>
    );
};

export default EliminarEvento;
