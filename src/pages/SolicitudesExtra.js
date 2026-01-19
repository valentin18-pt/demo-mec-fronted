import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import "./SolicitudesExtra.css";
import {Container, Table, Button} from "reactstrap";
import PropuestaSolicitudService from "../axios_services/solicitud.service";
import ModalSeguimientoER from "../components/Modal/ModalSeguimientoER";
import * as XLSX from 'xlsx';
import { RiDeleteBinFill } from '@remixicon/react';
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import Loader from '../components/Loader/Loader'; 
import { ButtonExcel, ButtonSearch } from '../components/Buttons/Buttons';


function SolicitudesExtra() {
    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const isFirstRender = React.useRef(true);
    const [propuestas_solicitud,setPropuestasSolicitud] = useState([]);
    const [estado_id, setEstadoId] = useState('');
    const [zonal, setZonal] = useState('');
    const [gestor, setGestor] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [loadingTable, setLoadingTable] = useState(false);
    const [fecha_min, setFechaMin] = useState(() => {
        const now = new Date();
        const primerDiaDelMes = new Date(now.getFullYear(), now.getMonth(), 1);
        return primerDiaDelMes.toISOString().split('T')[0];
    });
    const [fecha_max, setFechaMax] = useState(() => {
        const now = new Date();
        const ultimoDiaDelMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return ultimoDiaDelMes.toISOString().split('T')[0];
    });
    const totalMontoBruto = propuestas_solicitud.reduce((acc, reporte) => acc + Number(reporte.monto_bruto_final || 0), 0);
    const totalMontoNeto = propuestas_solicitud.reduce((acc, reporte) => acc + Number(reporte.monto_neto_final || 0), 0);

    //CATALOGOS
    const [instituciones] = useState(state.catalogos.instituciones);
    const [buro] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 3}));
    const [estados_ps] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 11}));
    const [contrato_condicion] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 13}));
    const [canal_captacion] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 14}));
    const [estados_revision] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 12}));
    const [tipos_desembolso] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 10}));
    const [zonales] = useState(state.user.personal.filter(p => {return p.perfil_id == 2}));
    const [supervisores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3}));
    const [gestores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3 || p.perfil_id == 4}));

    const handleButtonClick = async () => {
        await getReporteSolicitudesExtra();
    };

    const getReporteSolicitudesExtra = async () => {
        setLoadingTable(true);
        const data = await PropuestaSolicitudService.getReporteSolicitudesExtra(state.user?.usuario_id, state.user?.perfil_id, fecha_min, fecha_max, estado_id, gestor, supervisor, zonal);
        setPropuestasSolicitud(data);
        setLoadingTable(false);
    };

    const deletePropuestaSolicitud = async (propuesta_solicitud_id, prospecto_id, n_solicitud) => {
        try {
            const data = await PropuestaSolicitudService.deletePropuestaSolicitud(propuesta_solicitud_id, prospecto_id, n_solicitud, state.user?.usuario_id);
            await getReporteSolicitudesExtra();
            await alert('Desembolso eliminado con éxito');
        } catch (error) {
            console.error('Error en la solicitud de eliminación:', error);
            alert('Hubo un error al eliminar el desembolso');
        }
    };

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const exportToExcel = () => {
        if (propuestas_solicitud.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const fieldsToExport = [
            { key: 'n_solicitud', header: 'N° de solicitud' },
            { key: 'zonal', header: 'Zonal' },
            { key: 'supervisor', header: 'Supervisor' },
            { key: 'asesor', header: 'Gestor de ventas' },
            { key: 'fecha_envio', header: 'Fecha de envío' },
            { key: 'dni', header: 'DNI' },
            { key: 'nombre', header: 'Apellidos y nombres' },
            { key: 'canal_captacion_id', header: 'Canal de captación' },
            { key: 'razon_social_id', header: 'Convenio' },
            { key: 'contrato_condicion', header: 'Condición laboral' },
            { key: 'buro_id', header: 'Buro' },
            { key: 'monto_bruto_final', header: 'Monto bruto' },
            { key: 'monto_neto_final', header: 'Monto neto' },
            { key: 'plazo', header: 'Plazo' },
            { key: 'tasa', header: 'Tasa' },
            { key: 'estado_ps', header: 'Estado' },
            { key: 'asesor_agencia', header: 'Asesor de agencia' },
            { key: 'agencia', header: 'Agencia' },
            { key: 'distrito', header: 'Distrito' },
            { key: 'provincia', header: 'Provincia' },
            { key: 'departamento', header: 'Departamento' },
            { key: 'zona', header: 'Zona' },
            { key: 'desembolso_id', header: 'Tipo de desembolso' },
            { key: 'fecha_registro', header: 'Fecha de registro' },
            { key: 'estado_revision', header: 'Estado de Validacion' }
        ];

        const filteredData = propuestas_solicitud.map(item => {
            const filteredItem = {};

            fieldsToExport.forEach(field => {
                if (field.key === 'canal_captacion_id') {
                    const canal = canal_captacion.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = canal ? canal.descripcion : 'N/A';
                } else if (field.key === 'contrato_condicion') {
                    const contrato = contrato_condicion.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = contrato ? contrato.descripcion : 'N/A';
                } else if (field.key === 'buro_id') {
                    const b = buro.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = b ? b.descripcion : 'N/A';
                } else if (field.key === 'estado_ps') {
                    const e = estados_ps.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = e ? e.descripcion : 'N/A';
                } else if (field.key === 'desembolso_id') {
                    const t = tipos_desembolso.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = t ? t.descripcion : 'N/A';
                } else if (field.key === 'estado_revision') {
                    const r = estados_revision.find(c => c.tipo_id === item[field.key]);
                    filteredItem[field.header] = r ? r.descripcion : 'PENDIENTE';
                } else if (field.key === 'razon_social_id') {
                    const institucion = instituciones.find(i => i.institucion_id === item[field.key]);
                    filteredItem[field.header] = institucion ? institucion.razon_social : 'N/A';            
                } else if (field.key === 'fecha_envio') {
                    filteredItem[field.header] = item[field.key] ? new Date(item[field.key]).toISOString().split('T')[0] : 'N/A';
                } else if (field.key === 'fecha_registro') {
                    filteredItem[field.header] = item[field.key] ? new Date(item[field.key]).toISOString().split('T')[0] : 'N/A';
                } else {
                    filteredItem[field.header] = item[field.key];
                }
            });
            return filteredItem;
        });

        const ws = XLSX.utils.json_to_sheet(filteredData, {
            header: fieldsToExport.map(field => field.header),
            cellDates: true
        });

        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            const montoBrutoCell = ws[XLSX.utils.encode_cell({ r: row, c: fieldsToExport.findIndex(f => f.header === 'Monto bruto') })];
            const montoNetoCell = ws[XLSX.utils.encode_cell({ r: row, c: fieldsToExport.findIndex(f => f.header === 'Monto neto') })];
            if (montoBrutoCell) {montoBrutoCell.t = 'n'}
            if (montoNetoCell) {montoNetoCell.t = 'n'}
        }
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Desembolsos");
        XLSX.writeFile(wb, "Desembolsos.xlsx");
    };

    React.useEffect(() => {
        if(state.isUpdated===true){
            const fetchData = async () => {
            await getReporteSolicitudesExtra();
        };
        fetchData();}
    }, [state.isUpdated]);

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            await getReporteSolicitudesExtra();
            setLoading(false);
        };
        fetchData();
    }, []);

return (
    <>
    {loading 
        ?(<Loader />) 
        :(<Container>
            <div className="flex items-center justify-between mb-4">
                <h1>REPORTE DE SOLICITUDES EXTRA</h1>
                <ButtonExcel 
                    onClick={exportToExcel}
                    disabled={propuestas_solicitud.length === 0}
                />
            </div>
            
            <div className="filtros">
                <div>
                    <label htmlFor="dni">Estado de solicitud:</label>
                    <SearchSelect
                        id = "estado_id"
                        name="estado_id"
                        className="search_select"
                        value={estado_id} 
                        onValueChange={(value) => setEstadoId(value)}
                        placeholder="Seleccione..."
                    >
                        {estados_ps.map((item) => (
                            <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                                {item.descripcion}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>
                <div>
                    <label htmlFor="dni">Fecha de registro (Min):</label>
                    <input 
                        id="fecha" 
                        type="date" 
                        value={fecha_min} 
                        onChange={(e) => setFechaMin(e.target.value)} 
                    />
                </div>
                <div>
                    <label htmlFor="dni">Fecha de registro (Max):</label>
                    <input 
                        id="fecha" 
                        type="date" 
                        value={fecha_max} 
                        onChange={(e) => setFechaMax(e.target.value)} 
                    />
                </div>
                {(Number(state.user?.perfil_id)=== 1 ||Number(state.user?.perfil_id)=== 6 ||Number(state.user?.perfil_id)=== 8) && (<div>
                        <label>Zonal:</label>
                        <SearchSelect
                            name="zonal"
                            className="search_select"
                            value={zonal} 
                            onValueChange={(value) => setZonal(value)}
                            placeholder="Seleccione..."
                        >
                            {zonales.map((item) => (
                                <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select">
                                    {item.nombre_completo_usuario.toUpperCase()}
                                </SearchSelectItem>
                            ))}
                        </SearchSelect>
                </div>)}
                {Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id)!== 4 &&(<div>
                    <label>Supervisor:</label>
                    <SearchSelect
                        id = "supervisor"
                        className="search_select"
                        value={supervisor} 
                        onValueChange={(value) => setSupervisor(value)}
                        placeholder="Seleccione..."
                    >
                        {supervisores
                        .filter(supervisor => zonal === '' || Number(supervisor.zonal_id) === Number(zonal))
                        .map((supervisor) => (
                            <SearchSelectItem key={supervisor.usuario_id} value={supervisor.usuario_id} className="search_select">
                                {supervisor.nombre_completo_usuario.toUpperCase()}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>)}
                {Number(state.user?.perfil_id)!== 4 &&(<div>
                    <label>Gestor:</label>
                    <SearchSelect
                        id = "gestor"
                        className="search_select"
                        value={gestor} 
                        onValueChange={(value) => setGestor(value)}
                        placeholder="Seleccione..."
                    >
                    {gestores
                        .filter(gestor => zonal === '' || gestor.zonal_id === zonal)
                        .filter(gestor => supervisor === '' || gestor.supervisor_id === supervisor || gestor.usuario_id === supervisor)
                        .map((gestor) => (
                            <SearchSelectItem key={gestor.usuario_id} value={gestor.usuario_id} className="search_select">
                                {gestor.nombre_completo_usuario.toUpperCase()}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>)}
            </div>
            {loadingTable ? (
                <Loader />
            ) : (<>
            
            <ButtonSearch
                onClick={handleButtonClick}
                isLoading={loadingTable}
            />

            <div className="numero-propuestas">
                <p>N° de operaciones: {propuestas_solicitud.length}</p>
                <p>Monto bruto total: {formatoSSoles(totalMontoBruto)}</p>
                <p>Monto neto total: {formatoSSoles(totalMontoNeto)}</p>
            </div>
            <div className="cursor table-container">
                <Table id="data-estado-revision">
                    <thead>
                        <tr>
                            {(Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4) &&(<th> </th>)}
                            <th>N° de solicitud</th>
                            <th>Zonal</th>
                            <th>Supervisor</th>
                            <th>Gestor de ventas</th>
                            <th>Fecha de envío</th>
                            <th>DNI</th>
                            <th>Apellidos y nombres</th>
                            <th>Canal de captación</th>
                            <th>Convenio</th>
                            <th>Condición laboral</th>
                            <th>Buro</th>
                            <th>Monto bruto</th>
                            <th>Monto neto</th>
                            <th>Plazo</th>
                            <th>Tasa</th>
                            <th>Estado</th>
                            <th>Asesor de agencia</th>
                            <th>Agencia</th>
                            <th>Distrito</th>
                            <th>Provincia</th>
                            <th>Departamento</th>
                            <th>Zona</th>
                            <th>Tipo de desembolso</th>
                            <th>Fecha de registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {propuestas_solicitud.length === 0 ? (
                            <tr>
                                <td colSpan="26" className="sin-data">Sin propuestas de solicitud</td>
                            </tr>
                        ) :(propuestas_solicitud.map((propuesta, index) => (
                            <tr 
                                key={index} 
                                className={
                                    Number(propuesta.estado_revision) === 0
                                        ? 'estado-0'
                                        : Number(propuesta.estado_revision) === 1
                                        ? 'estado-3'
                                        : Number(propuesta.estado_revision) === 2
                                        ? 'estado-1'
                                        : Number(propuesta.estado_revision) === 3
                                        ? 'estado-3'
                                        : ''
                                }
                            >
                                {(Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4) &&(
                                <td>
                                    <Button 
                                        onClick={() => {
                                            const confirmDelete = window.confirm(`¿Está seguro de eliminar la solicitud n° ${propuesta.n_solicitud}?`);
                                            if (confirmDelete) {deletePropuestaSolicitud(propuesta.propuesta_solicitud_id, propuesta.prospecto_id, propuesta.n_solicitud);}
                                        }}> 
                                        <RiDeleteBinFill size={20} 
                                            color={'red'} 
                                            style={{ marginRight: '8px', opacity: Number(propuesta.estado_revision) === 0 ? 0.5 : 1 }} /> 
                                    </Button>
                                </td>)}
                                <td>{propuesta.n_solicitud ? propuesta.n_solicitud : 'N/A'}</td>
                                <td>{propuesta.zonal ? propuesta.zonal.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.supervisor ? propuesta.supervisor.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.asesor ? propuesta.asesor.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.fecha_envio ? new Date(propuesta.fecha_envio).toISOString().split('T')[0] : 'N/A'}</td>
                                <td>{propuesta.dni ? propuesta.dni : 'N/A'}</td>
                                <td>{propuesta.nombre ? propuesta.nombre : 'N/A'}</td>
                                <td>
                                    {canal_captacion.find(item => item.tipo_id === propuesta.canal_captacion_id)
                                        ? canal_captacion.find(item => item.tipo_id === propuesta.canal_captacion_id).descripcion
                                        : 'N/A'}
                                </td>
                                <td>
                                    {instituciones.find(item => item.institucion_id === propuesta.razon_social_id)
                                        ? instituciones.find(item => item.institucion_id === propuesta.razon_social_id).razon_social
                                        : 'N/A'}</td>
                                <td>
                                    {contrato_condicion.find(item => item.tipo_id === propuesta.contrato_condicion)
                                        ? contrato_condicion.find(item => item.tipo_id === propuesta.contrato_condicion).descripcion
                                        : 'N/A'}
                                </td>
                                <td>
                                    {buro.find(item => item.tipo_id === propuesta.buro_id)
                                        ? buro.find(item => item.tipo_id === propuesta.buro_id).descripcion
                                        : 'N/A'}
                                </td>
                                <td>{propuesta.monto_bruto_final ? formatoSSoles(propuesta.monto_bruto_final) : 'N/A'}</td>
                                <td>{propuesta.monto_neto_final ? formatoSSoles(propuesta.monto_neto_final) : 'N/A'}</td>
                                <td>{propuesta.plazo ? propuesta.plazo : 'N/A'}</td>
                                <td>{propuesta.tasa ? propuesta.tasa : 'N/A'}</td>
                                <td>
                                    {estados_ps.find(item => item.tipo_id === propuesta.estado_id)
                                        ? estados_ps.find(item => item.tipo_id === propuesta.estado_id).descripcion
                                        : 'N/A'}
                                </td>
                                <td>{propuesta.asesor_agencia ? propuesta.asesor_agencia : 'N/A'}</td>
                                <td>{propuesta.agencia ? propuesta.agencia : 'N/A'}</td>
                                <td>{propuesta.distrito ? propuesta.distrito.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.provincia ? propuesta.provincia.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.departamento ? propuesta.departamento.toUpperCase() : 'N/A'}</td>
                                <td>{propuesta.zona ? propuesta.zona : 'N/A'}</td>
                                <td>
                                    {tipos_desembolso.find(item => item.tipo_id === propuesta.desembolso_id)
                                        ? tipos_desembolso.find(item => item.tipo_id === propuesta.desembolso_id).descripcion
                                        : 'N/A'}
                                </td>
                                <td>{propuesta.fecha_registro ? new Date(propuesta.fecha_registro).toISOString().split('T')[0] : 'N/A'}</td>
                            </tr>
                        )))}
                    </tbody>
                </Table>
                <ModalSeguimientoER
                    isOpen={state.modalSeguimientoER}
                />
            </div>
            </>)}
        </Container>)}
    </>
    );
}

export default SolicitudesExtra;