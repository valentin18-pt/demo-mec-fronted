import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import UsuarioService from "../axios_services/usuarios.service"
import CatalogoService from "../axios_services/catalogo.service"
import Loader from "../components/Loader/Loader";
import "./Login.css";
import {Button} from "reactstrap";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import Zorro from "../img/zorro.webp"
import Logo from "../img/logo_mec_1.webp"

function Login ({ onLogin }) {
    
    const [showPassword, setShowPassword ] = useState(false);
    const [login,setLogin] = useState({codigo_usuario:"", password:""});
    const [state,setState] = useContext(AppContext);
    const [isDisabled, setIsDisabled] = useState(false); 

    const handleChange=e=>{
        const {name, value}=e.target;
        setLogin(datosOrigen =>({
          ...datosOrigen,
          [name]:value
        }))
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const loginUser = async (codigo_usuario, password) => {
      setIsDisabled(true);
      try {
        const data = await UsuarioService.login(codigo_usuario, password);
        
        const authData = {
           token: data.token,
            user: {
            nombres: `${data.user.nombre} ${data.user.apellidos}`,
            perfil_id: data.user.perfil_id,
            usuario_id: data.user.usuario_id,
            zonal_id: data.zonal_id,
            supervisor_id: data.supervisor_id,
            password_changed: data.user.password_changed == 1,
          },
        };
        localStorage.setItem('authData', JSON.stringify(authData));
        localStorage.setItem('auth_token', data.token);

        setState({
           ...state,
          nombres: authData.user.nombres,
          perfil_id: authData.user.perfil_id,
          usuario_id: authData.user.usuario_id,
          zonal_id: authData.user.zonal_id,
          supervisor_id: authData.user.supervisor_id,
          usuarios: []
        });

        onLogin(authData.user.password_changed);
        } catch (error) {
        alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
        console.log(error);
        setIsDisabled(false);
        }
    };

    return (
        <div className="login-container">
          <div className="login-image-section"></div>
          <div className="login-form-section">
            {isDisabled && (
              <div className="login-loader-wrapper">
                <Loader />
              </div>
            )}
            <img src={Logo} alt="MEC" className="login-logo"/>
            <h2> Bienvenido </h2>
            <p> Por favor ingrese sus credenciales </p>
            <form>
              <div className="input-container">
                <input
                  type="text" 
                  name="codigo_usuario"
                  placeholder="Código de usuario" 
                  onChange={handleChange}
                />
              </div>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña" 
                  onChange={handleChange}
                />
                <span className="password-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="input-container recuerdame">
                <input
                  type="checkbox"
                  id="remember-checkbox"
                  className="custom-checkbox-input"
                />
                <label htmlFor="remember-checkbox" className="custom-checkbox-label">
                  Recuérdame
                </label>
              </div>
              <Button 
                   type="button" 
                   className="boton-principal"
                   disabled={isDisabled}
                   title="Ingresar" 
                   onClick={()=>loginUser(login.codigo_usuario, login.password)}>
                     Ingresar
              </Button>
            </form>
          </div>
          <img src={Zorro} alt="Imagen de un zorro" className="centered-image" />
        </div>
  );
};

export default Login;