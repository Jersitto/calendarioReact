import { Link } from 'react-router-dom';

export default function Boton() {
    return (
        <Link to='/login'>
            <button>Ir a Login</button>
        </Link>
    )
}