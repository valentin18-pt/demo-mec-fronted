import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import "./Agencias.css";
import {Container, Table, Button} from "reactstrap";
import ProspectoService from "../axios_services/prospectos.service";
import ModalEditEstadoProspecto from "../components/Modal/ModalEditEstadoProspecto";
import * as XLSX from 'xlsx';
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import Loader from '../components/Loader/Loader'; 


function GestionProspectos() {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const isFirstRender = React.useRef(true);
    const [prospectos_evaluacion, setProspectosEvaluacion] = useState([]);
    const [dias_transcurridos, setDiasTranscurridos] = useState('');
    const [dni, setDni] = useState('');
    const [nombre, setNombre] = useState('');
    const [estado_id, setEStadoId] = useState('');
    const [zonal_id, setZonalId] = useState('');
    const [gestor_id, setGestorId] = useState('');
    const [loadingTable, setLoadingTable] = useState(false);

    //CATALOGOS
    const [estado] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 9 && (t.tipo_id == 3 || t.tipo_id == 11)}));
    const [zonales] = useState(state.user.personal.filter(p => {return p.perfil_id == 2}));
    const [gestores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3 || p.perfil_id == 4}));

    const getReporteProspectosEvaluacion = async () => {
        setLoadingTable(true);
        const data = await ProspectoService.getReporteProspectosEvaluacion(dni, nombre, estado_id, zonal_id, gestor_id, dias_transcurridos);
        setProspectosEvaluacion(data);
        setLoadingTable(false);
    };

    const handleButtonClick = async () => {
        await getReporteProspectosEvaluacion();
    };

    const exportToExcel = () => {
    
            const fieldsToExport = [
                { key: 'dni', header: 'DNI' },
                { key: 'nombre_prospecto', header: 'CLIENTE' },
                { key: 'nombre_gestor', header: 'GESTOR' },
                { key: 'estado_id', header: 'ESTADO' },
                { key: 'dias_transcurridos', header: 'DIAS TRANSCURRIDOS' },
                { key: 'fecha_envio', header: 'FECHA DE ENVÍO' }
              ];
              const filteredData = prospectos_evaluacion.map(item => {
                const filteredItem = {};
                fieldsToExport.forEach(field => {
                    if (field.key === 'estado_id') {
                        const es = estado.find(e => e.tipo_id === item[field.key]);
                        filteredItem[field.header] = es ? es.descripcion : 'N/A';
                    } else {
                        filteredItem[field.header] = item[field.key] ? item[field.key] : 'N/A';
                    }
                });
                return filteredItem;
              });
              const ws = XLSX.utils.json_to_sheet(filteredData, {
                header: fieldsToExport.map(field => field.header),
                cellDates: true
            });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "EVALUACION_DESEMBOLSADO");
            XLSX.writeFile(wb, "GESTION DE PROSPECTOS.xlsx");
    };

    function mostrarModalEditarEstadoProspecto (prospecto_nombre, prospecto_id, zonal_id, gestor_id, estado_id, estado_descripcion) {
        setState({ ...state, modalEditEstadoProspecto:true, prospecto_nombre:prospecto_nombre, prospecto_id: prospecto_id, zonal_prospecto:zonal_id , gestor_prospecto:gestor_id,
            estado_prospecto:estado_id, isUpdated:false, descripcion_estado_prospecto:estado_descripcion,
        })
    };

    React.useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            const fetchData = async () => {
                setLoading(true);
                console.log(zonales);
                await getReporteProspectosEvaluacion();
                setLoading(false);
            };
            fetchData();
        }, []);

    React.useEffect(() => {
        if(state.isUpdated===true){
            const fetchData = async () => {
            await getReporteProspectosEvaluacion();
        };
        fetchData();}
    }, [state.isUpdated]);

    return (
        <>
        {loading 
        ?(<Loader />) 
        :(<div>
            <h2>Reporte de Gestion de Prospectos</h2>
            <div className="filtros">
                <div>
                    <label htmlFor="dni">Ingrese DNI:</label>
                    <input
                        type="text"
                        id="dni"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}>
                    </input>
                </div>
                <div>
                    <label htmlFor="nombre_cliente">Ingrese nombre:</label>
                    <input
                        type="text"
                        id="nombre_cliente"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}>
                    </input>
                </div>
                <div>
                    <label htmlFor="dias_transcurridos">Minimo de días transcurridos:</label>
                    <input
                        type="number"
                        id="dias_transcurridos"
                        value={dias_transcurridos}
                        onChange={(e) => setDiasTranscurridos(e.target.value)}
                        min="0"
                        pattern="^[1-9]\d*$"
                    />
                </div>
                <div>
                    <label htmlFor="zonal">Zonal:</label>
                    <SearchSelect
                        name="zonal"
                        className="search_select"
                        value={zonal_id} 
                        onValueChange={(value) => setZonalId(value)}
                        placeholder="Seleccione..."
                    >
                        {zonales.map((item) => (
                            <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select">
                                {item.nombre_completo_usuario}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>
                <div>
                    <label htmlFor="gestor">Gestor:</label>
                    <SearchSelect
                        id = "gestor"
                        className="search_select"
                        value={gestor_id} 
                        onValueChange={(value) => setGestorId(value)}
                        placeholder="Seleccione..."
                    >
                    {gestores
                        .filter((gestor) => 
                            !zonal_id || Number(gestor.usuario_id_jefe_jefe_inmediato) === Number(zonal_id) || Number(gestor.usuario_id_jefe_inmediato) === Number(zonal_id))
                        .map((gestor) => (
                            <SearchSelectItem key={gestor.usuario_id} value={gestor.usuario_id} className="search_select">
                                {gestor.nombre_completo_usuario}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>
                <div>
                    <label htmlFor="estado">Estado:</label>
                    <select
                        id="estado"
                        value={estado_id}
                        onChange={(e) => setEStadoId(e.target.value)}
                        >
                        <option value="">Seleccione...</option>
                            {estado.map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                    {item.descripcion}
                                </option>
                            ))}
                    </select>
                </div>
            </div>
            <>
                <div>
                            <Button className="buscar" onClick={handleButtonClick}> Buscar </Button>
                            </div>
                            <div className="button-container">            
                                <Button className="button-eliminar"  onClick={exportToExcel}>
                                    Exportar a Excel
                                </Button>
                            </div>
                <div>
                <Table>
                    <thead>
                        <tr style={{ backgroundColor: '#ffffff' }}>
                            <th>DNI</th>
                            <th>CLIENTE</th>
                            <th>GESTOR</th>
                            <th>ESTADO</th>
                            <th>DIAS TRANSCURRIDOS</th>
                            <th>FECHA DE ENVIO</th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {prospectos_evaluacion.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-solicitudes">Sin data</td>
                                </tr>
                            ) :(prospectos_evaluacion
                            .map((prospecto, index) =>(
                            <tr>
                                <td>{prospecto.dni}</td>
                                <td>{prospecto.nombre_prospecto.toUpperCase()}</td>
                                <td>{prospecto.nombre_gestor.toUpperCase()} </td>
                                <td>
                                        {estado.find(item => item.tipo_id === prospecto.estado_id)
                                            ? estado.find(item => item.tipo_id === prospecto.estado_id).descripcion
                                            : 'N/A'}
                                </td>
                                <td>{prospecto.dias_transcurridos}</td>
                                <td>{prospecto.fecha_envio? prospecto.fecha_envio : 'N/A'}</td>
                                <td>
                                    <Button 
                                        className="button-edit seg" 
                                        onClick={() => {mostrarModalEditarEstadoProspecto(prospecto.nombre_prospecto.toUpperCase(), prospecto.prospecto_id, prospecto.zonal_id, prospecto.gestor_id, prospecto.estado_id, estado.find(item => item.tipo_id === prospecto.estado_id).descripcion)}}
                                    >
                                        Ver más
                                    </Button>
                                </td>
                            </tr>)))}
                    </tbody>
                </Table>
            </div>
            </>
            <ModalEditEstadoProspecto
                isOpen={state.modalEditEstadoProspecto}
            />
            </div>)}
        </>
    );
}

export default GestionProspectos;