import { useLocation, Link } from 'react-router-dom';
import './styles/Welcome.css';
import Calendario from './Calendario';
export default function Welcome() {
    const location = useLocation();
    const username = location.state?.username || "Invitado";
    
    return (
        <div className="welcome-container welcome-animation">
            <h1>Bienvenido, <span className="username">{username}</span></h1>
            <p>Esta es la página de bienvenida. Gracias por iniciar sesión correctamente.</p>
            <Calendario />
            <Link to="/">
                <button>Volver al inicio</button>
            </Link>
        </div>
    )
}