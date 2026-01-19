import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Home from "./pages/Home";
import React, {useContext, useState, useEffect } from 'react';
import {AppContext, AppProvider} from './application/provider';
import DashboardLayout from './components/DashboardLayout/DashboardLayout'; 
import SideBar from './components/SideBar/SideBar';
import Prospectos from './pages/Prospectos';
import ChangePassword from './pages/ChangePassword';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import EstadoRevision from './pages/EstadoRevision';
import Agencias from './pages/Agencias';
import GestionProspectos from './pages/GestionProspectos';
import SolicitudesExtra from './pages/SolicitudesExtra';
import Avances from './pages/Avances';
import AsignacionMetas from './pages/AsignacionMetas';
import Planilla from './pages/Planilla';
import SimuladorCreditos from './pages/SimuladorPrestamos';
import Inventario from './pages/Inventario';
import CargoPago from './pages/CargoPago';
import GraficoDashboard from './pages/GraficoDashboard';
import DashboardAdministracion from './pages/DashboardAdministración';
import GraficosColocaciones from './pages/GraficoColocaciones';
import UsuarioService from './axios_services/usuarios.service';
import CatalogoService from './axios_services/catalogo.service';
import Loader from './components/Loader/Loader'; 
import { useNavigate } from 'react-router-dom';
import GastosTotales from './pages/GastosTotales';
import DetalleAbc from './pages/DetalleAbc';
import ReciboPorHonorarios from './pages/ReciboPorHonorarios';
import CostosDirectos from './pages/CostosDirectos';
import ResumenFinal from './pages/ResumenFinal';
import CostosAbc from './pages/CostosAbc';
import CajaFlujoDatos from './pages/CajaFlujoDatos';
import CajaFinancieroMovimiento from './pages/CajaFinancieroMovimiento';
import CajaFinancieroReporte from './pages/CajaFinancieroReporte';
import ViaticoDetallePasaje from './pages/ViaticoDetallePasaje';
import ViaticoSolicitud from './pages/ViaticoSolicitud';
import SeguimientoDesembolsos from './pages/SeguimientoDesembolsos';
import ComisionDesembolsos from './pages/ComisionDesembolsos';

function App() {
  const [state, setState] = useState({ login: false, password_changed: false, loading: true });

  const [globalState, setGlobalState] = useContext(AppContext);
  const [userData, setUserData] = useState(null);
  const [catalogData, setCatalogData] = useState(null);
  const navigate = useNavigate();
  const SESSION_DURATION = 32400000;


const loadSessionData = async (user) => {
    try {
        const [personal, tipos, instituciones, agencias] = await Promise.all([
            await UsuarioService.getPersonal(
                user.usuario_id,
                user.supervisor_id,
                user.zonal_id,
                user.perfil_id
            ),
            CatalogoService.getTipos(),
            CatalogoService.getInstituciones(),
            CatalogoService.getAgencias(),
        ]);

        await setGlobalState(prev => ({
            ...prev,
            user: {
                ...user,
                nombres: user.nombres,
                personal: personal,
            },
            catalogos: {
                tipos: tipos,
                instituciones: instituciones,
                agencias: agencias,
            },
        }));

        setState(prevState => ({ ...prevState, loading: false }));

    } catch (error) {
        console.error("Error al cargar los datos de la sesión:", error);
        handleLogout();
    }
};

  useEffect(() => {
    const storedAuthData = JSON.parse(localStorage.getItem('authData'));
    let timer;
    if (storedAuthData && storedAuthData.token) {
      const loginTime = storedAuthData.loginTime || Date.now();
      const elapsedTime = Date.now() - loginTime;
      const remainingTime = SESSION_DURATION - elapsedTime;

      if (remainingTime > 0) {
      setState(prevState => ({
        ...prevState,
        login: true,
        password_changed: storedAuthData.user.password_changed,
        nombres: storedAuthData.user.nombres,
      }));
      loadSessionData(storedAuthData.user);
      timer = setTimeout(handleAutoLogout, remainingTime);
    } else {
      handleAutoLogout();
    }
     
    } else {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  }, []);

  const handleLogin = async (passwordChanged) => {
    const storedAuthData = JSON.parse(localStorage.getItem('authData'));
    if (storedAuthData) {
        const authDataWithTime = {
        ...storedAuthData,
        loginTime: Date.now()
      };
      localStorage.setItem('authData', JSON.stringify(authDataWithTime));
      await loadSessionData(storedAuthData.user);
          setState(prevState => ({
      ...prevState,
      login: true,
      password_changed: passwordChanged,
    }));
    }
    if (passwordChanged === 1) {
        setState(prevState => ({ ...prevState, password_changed: true }));
    }
  };

  const handleLogout = async () => {
    try {
      await UsuarioService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      localStorage.removeItem('authData');
      setState({ login: false, password_changed: false, loading: false });
      setUserData(null);
      setCatalogData(null);
      navigate('/login');
    }
  };

  const handleAutoLogout = () => {
    localStorage.removeItem('authData');
    localStorage.removeItem('auth_token');
    setState({ login: false, password_changed: false, loading: false });
    alert('El tiempo máximo de su sesión ha expirado. Por favor, vuelva a iniciar sesión.');
    navigate('/login');
  };

  if (state.loading) {
    return <Loader />;
  }

  if (state.login === false) {
    return <Login onLogin={handleLogin} />;
  }

  return (
      <Routes>
        <Route
          path="/"
          element={
            state.password_changed === true ? (
              <Home onLogout={handleLogout}/>
            ) : (
              <ChangePassword onLogin={handleLogin}/>
            )
          }
        />
        <Route path='/home' element={<Home onLogout={handleLogout}/>} />
        <Route path='/agencias' element={<Agencias />} />
        <Route element={<DashboardLayout onLogout={handleLogout}/>}>
          <Route path='/change_password' element={<ChangePassword />} />
          <Route path='/prospectos' element={<Prospectos />} />
          <Route path='/reportes' element={<Reportes />} />
          <Route path='/usuarios' element={<Usuarios />} />
          <Route path='/revision' element={<EstadoRevision />} />
          <Route path='/gestion_prospectos' element={<GestionProspectos />} />
          <Route path='/solicitudes_extra' element={<SolicitudesExtra />} />
          <Route path='/avances' element={<Avances />} />
          <Route path='/asignacion_metas' element={<AsignacionMetas />} />
          <Route path='/planilla' element={<Planilla />} />
          <Route path='/simulador_creditos' element={<SimuladorCreditos />} />
          <Route path='/inventario' element={<Inventario />} />
          <Route path='/cargo_pago' element={<CargoPago />} />
          <Route path='/grafico_dashboard' element={<GraficoDashboard />} />
          <Route path='/dashboard_administracion' element={<DashboardAdministracion />} />
          <Route path='/graficos_colocaciones' element={<GraficosColocaciones />} />
          <Route path='/gastos_totales' element={<GastosTotales />} />
          <Route path='/detalle_abc' element={<DetalleAbc />} />
          <Route path='/recibo_honorarios' element={<ReciboPorHonorarios />} />
          <Route path='/costos_directos' element={<CostosDirectos />} />
          <Route path='/resumen_final' element={<ResumenFinal />} />
          <Route path='/costos_abc' element={<CostosAbc />} />
          <Route path='/caja_flujo_datos' element={<CajaFlujoDatos />} />
          <Route path='/caja_financiero_movimiento' element={<CajaFinancieroMovimiento />} />
          <Route path='/caja_financiero_reporte' element={<CajaFinancieroReporte />} />
          <Route path='/viatico-detalle-pasaje' element={<ViaticoDetallePasaje />} />
          <Route path='/viatico-solicitud' element={<ViaticoSolicitud />} />
          <Route path='/seguimiento-desembolsos' element={<SeguimientoDesembolsos />} /> 
          <Route path='/comisiones-desembolsos' element={<ComisionDesembolsos />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
  );
}


const AppWrapper = () => (
  <AppProvider>
    <App />
  </AppProvider>
);

export default AppWrapper;


