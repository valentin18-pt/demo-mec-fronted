import {useContext, useState} from "react";
import {AppContext} from '../../application/provider';
import './SideBar.css';
import {Button} from "reactstrap";
import LogoBlanco from '../../img/logo_mec_2.webp';
import NavigationLinks from '../../components/Navigation/NavigationLinks';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SideBar ({ onLogout, isCollapsed, toggleSidebar }) {
  const [state] = useContext(AppContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

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
    <section className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle-button">
        <Button onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
        </Button>
      </div>

      {!isCollapsed && (
      <div className="sidebar-encabezado">
        <img src={LogoBlanco} alt="Logo_blanco" className="logo-image"/>
        <p>{state.user?.nombres}</p>
        <div>
          <Button onClick={handleLogoutClick} disabled={isLoggingOut}>
            {isLoggingOut ? "Saliendo..." : "Salir"}
          </Button>
        </div>
        {![20, 7].includes(Number(state.user?.perfil_id)) && (<div className="paginas-externas">
          <Button onClick={() => window.open("https://www.sentinelperu.com/cliente/sentinel.aspx", "_blank")}>
            Sentinel
          </Button>
          <Button onClick={() => window.open("/#/agencias", "_blank")}>
            Agencias
          </Button>
        </div>)}
      </div>
      )}
      <div className="navigation-links">
        <NavigationLinks
          perfilId={state.user?.perfil_id}
          linkClassName="sidebar-button-link"
          paginate={false}
          isCollapsed={isCollapsed}
        />
      </div>
    </section>
  );
};
export default SideBar;