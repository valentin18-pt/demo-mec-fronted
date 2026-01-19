import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import {Button} from "reactstrap";
import './ChangePassword.css';
import UsuarioService from "../axios_services/usuarios.service"

function ChangePassword({ onLogin }) {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [state,setState] = useContext(AppContext);
    const [showArrow, setShowArrow] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const updatePassword = async (usuario_id, password) => {
            const data = await UsuarioService.updatePassword(usuario_id, password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowArrow(false);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            await updatePassword(state.user?.usuario_id, newPassword);
            setNewPassword('');
            setConfirmPassword('');
            setFormSubmitted(true);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ocurrió un error inesperado.'); 
            }
        }
    };

    return (
        <div className="change-password">
    <div>
        {!formSubmitted ? (
            <form className="form-change-password" onSubmit={handleSubmit}>
                                <h1>Actualiza tu contraseña</h1>
                                <div className="requerimientos">
                  <p>La contraseña debe incluir al menos una letra mayúscula (A-Z), un número (0-9) y un simbolo especial (@, #, $, etc.).</p>
                </div>

                <div  className="input-container">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        name="password"
                        placeholder="Nueva Contraseña" 
                        onChange={(e) => setNewPassword(e.target.value)}
                        value={newPassword}
                        required
                    />
                    <span className="password-icon">
                            {showNewPassword 
                                ? <FaEyeSlash onClick={() => setShowNewPassword(!showNewPassword)}/> 
                                : <FaEye onClick={() => setShowNewPassword(!showNewPassword)} />}
                    </span>
                </div>
                <div  className="input-container">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password"
                        placeholder="Confirmar Contraseña" 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        required
                    />
                    <span className="password-icon">
                            {showConfirmPassword 
                                ? <FaEyeSlash onClick={() => setShowConfirmPassword(!showConfirmPassword)}/> 
                                : <FaEye onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                    </span>
                </div>
                <Button className="btn-change-password" type="submit">Cambiar Contraseña</Button>
            </form>
            ): (
                <form>
             <div className="form-container">
                  <h2>La contraseña fue cambiada exitosamente.</h2>
                  <Button className="btn-change-password" onClick={() => onLogin(1)}>Continuar ➔ </Button>
                </div>
            </form>
              )}
            {error && <p className="error">{error}</p>}
    </div>
</div>

    );
}

export default ChangePassword;