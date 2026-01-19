import {useContext, useState} from "react";
import {AppContext} from '../application/provider';
import NavigationLinks from '../components/Navigation/NavigationLinks';
import "./Home.css";
import {Button} from "reactstrap";
import LogoBlanco from "../img/logo_mec_2.webp"
import Zorro from "../img/zorro.webp"
import ZorroEchado from "../img/zorro_echado.webp"
import { LogOut } from 'lucide-react';

function Home({ onLogout }) {

    const [state] = useContext(AppContext);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
      const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        try {
          await onLogout();
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        } finally {
          setIsLoggingOut(false);
        }
      };


    return (
        <div className="home">
            <div className="div-1">
                <img src={LogoBlanco} alt="Logo_blanco" className="logo-image"/>
                <h2>Bienvenido a la página de MEC</h2>
            </div>
            <div className="div-2">
                <img src={Zorro} alt="Imagen de un zorro" className="zorro-image"/>
            </div>
            <div className="div-3">
                <h3>{state.user?.nombres}</h3>
                    {![20, 7].includes(Number(state.user?.perfil_id)) && (<div className="paginas-externas">
                        <Button 
                            className="external-page-button"
                            onClick={() => window.open("https://www.sentinelperu.com/cliente/sentinel.aspx", "_blank")}
                        >
                            Sentinel
                        </Button>
                        <Button 
                            className="external-page-button"
                            onClick={() => window.open("/#/agencias", "_blank")}
                        >
                            Agencias
                        </Button>
                    </div>)}
                <div className="navlinks">
                    <NavigationLinks
                        perfilId={state.user?.perfil_id}
                        linkClassName="home-button-link"
                        paginate={true}
                    />
                </div>
                <div className="zorrito-mobile">
                    <img src={ZorroEchado} alt="Zorrito Echado" />
                </div>
                <div className="boton-salir-mobile">
                    <LogOut
                        size={32}
                        onClick={onLogout}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>
            <div className="div-4">
                <Button onClick={handleLogoutClick} disabled={isLoggingOut}>
                        {isLoggingOut ? "Saliendo..." : "Salir"}
                </Button>
            </div>
                    
        </div>
        
    );
}

export default Home;