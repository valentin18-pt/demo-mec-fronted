import "./Usuarios.css";
import React, { useState, useContext } from "react";
import { AppContext } from '../application/provider';
import UsuarioService from "../axios_services/usuarios.service";
import { Table, Button, Form, FormGroup } from "reactstrap";
import ModalCrearUsuario from "../components/Modal/ModalCrearUsuario";
import ModalEliminarUsuario from "../components/Modal/ModalEliminarUsuario";
import ModalReestablecerUsuario from "../components/Modal/ModalReestablecerUsuario";
import { SearchSelect, SearchSelectItem } from '@tremor/react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FileMinus, RotateCcw, FileSpreadsheet } from "lucide-react";
import Loader from '../components/Loader/Loader';
import ArchivoService from "../axios_services/archivos.service";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ButtonInsert, ButtonExcel, ButtonSearch, ButtonUpdate, ButtonDelete } from '../components/Buttons/Buttons';


function Usuarios() {

    const [loading, setLoading] = useState(false);
    const [state, setState] = useContext(AppContext);
    const [area, setArea] = useState('1');
    const [n_usuarios, setNUsuarios] = useState('1');
    const [usuarios_periodo, setUsuariosPeriodo] = useState([]);
    const [loadingDocumento, setLoadingDocumento] = useState({ usuarioId: null, tipo: null });
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [perfil, setPerfil] = useState('');
    const [provincia, setProvincia] = useState('');
    const [nombre_completo, setNombreCompleto] = useState('');
    const [jefe_inmediato, setJefeInmediato] = useState('');
    const [estado, setEstado] = useState('');
    const [DNI, setDNI] = useState('');
    const jefes_filtrados_periodo = usuarios_periodo.filter(u => Number(u.perfil_id) !== 4).map(u => ({ usuario_id: u.usuario_id, nombre_completo_usuario: `${u.apellidos}, ${u.nombre}`.toUpperCase(), perfil_id: u.perfil_id }));
    const [jefes_filtrados_actuales] = useState(state.user.personal.filter(u => Number(u.perfil_id) !== 4).map(u => ({ usuario_id: u.usuario_id, nombre_completo_usuario: u.nombre_completo_usuario.toUpperCase(), perfil_id: u.perfil_id })));

    //CATALOGOS
    const [perfiles, setPerfiles] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 6 }));
    const [areas, setAreas] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 22 }));
    const [provincias, setProvincias] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 7 }));
    const [jornadas_laborales, setjornadasLaborales] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 5 }));
    const [entidades_financieras] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 25 }));
    const [turnos_horario_laboral, setTurnosHorarioLaboral] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 24 }));
    const [centro_estudios, setCentroEstudios] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 23 }));
    const [jefes_inmediatos, setJefesInmediatos] = useState([]);

    const ordenarUsuariosJerarquia = (usuarios) => {
        const usuariosMap = {};
        usuarios.forEach(u => {
            usuariosMap[u.usuario_id] = { ...u, subordinados: [] };
        });

        const raiz = [];
        usuarios.forEach(u => {
            const jefeId = u.usuario_id_jefe_inmediato;
            if (jefeId && usuariosMap[jefeId]) {
                usuariosMap[jefeId].subordinados.push(usuariosMap[u.usuario_id]);
            } else {
                raiz.push(usuariosMap[u.usuario_id]);
            }
        });

        raiz.sort((a, b) => {
            if (!a.usuario_id_jefe_inmediato && b.usuario_id_jefe_inmediato) return -1;
            if (a.usuario_id_jefe_inmediato && !b.usuario_id_jefe_inmediato) return 1;
            return 0;
        });

        const resultado = [];
        const recorrer = (nodos) => {
            nodos.forEach(nodo => {
                resultado.push(nodo);
                if (nodo.subordinados.length) {
                    recorrer(nodo.subordinados);
                }
            });
        };
        recorrer(raiz);

        return resultado.map(({ subordinados, ...rest }) => rest);
    };


    const exportToExcel = async (usuarios_periodo, perfiles, provincias, centro_estudios, jornadas_laborales, turnos_horario_laboral, entidades_financieras, periodo_fecha, area, areas) => {
        const areaSeleccionada = areas.find(a => a.tipo_id === area)?.descripcion || 'Directorio';
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(areaSeleccionada);

        const fieldsToExport = [
            { key: 'codigo_usuario', header: 'Código' },
            { key: 'apellidos', header: 'Apellidos' },
            { key: 'nombre', header: 'Nombres' },
            { key: 'dni', header: 'DNI' },
            { key: 'fecha_nacimiento', header: 'Fecha de nacimiento' },
            { key: 'celular', header: 'Celular' },
            { key: 'correo_personal', header: 'Correo personal' },
            { key: 'perfil', header: 'Cargo' },
            { key: 'correo_corporativo', header: 'Correo corporativo' },
            { key: 'provincia', header: 'Provincia' },
            { key: 'n_contrato', header: 'N° de contrato' },
            { key: 'practicas', header: 'Prácticas' },
            { key: 'fecha_ingreso', header: 'Fecha de ingreso' },
            { key: 'fecha_termino_contrato', header: 'Término de contrato' },
            { key: 'jornada_laboral', header: 'Jornada laboral' },
            { key: 'horario', header: 'Horario' },
            { key: 'fecha_cese', header: 'Fecha de cese' },
            { key: 'n_cuenta_bancaria', header: 'N° de cuenta' },
            { key: 'n_cuenta_interbancaria', header: 'N° de cuenta interbancaria' },
            { key: 'banco', header: 'Banco' },
            { key: 'ficha', header: 'Ficha' },
            { key: 'contrato', header: 'Contrato' },
            { key: 'dni_doc', header: 'Co. DNI' },
            { key: 'recibo', header: 'Recibo luz o agua' },
            { key: 'certijoven', header: 'Certijoven' },
            { key: 'fotocheck', header: 'Fotocheck' },
            { key: 'equifax', header: 'Equifax' },
            { key: 'casaca', header: 'Casaca' }
        ];

        worksheet.columns = fieldsToExport.map(field => ({
            header: field.header,
            key: field.key,
            width: 20
        }));

        worksheet.getRow(1).eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9D9D9' }
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        const safeValue = (value, defaultValue = '—') =>
            value === null || value === undefined || value === '' ? defaultValue : value;

        const perfilColors = {
            1: 'FFDBE9FF',
            2: 'FFDFF2DF',
            3: 'FFFFF9D9',
            4: 'FFF5F5F5',
            5: 'FFDCE9FF',
            6: 'FFEFD9F1',
            7: 'FFFBE3EA',
            8: 'FFE9F0D8',
            9: 'FFE5E1F3',
            10: 'FFD8F1F5',
            default: 'FFFFFFFF'
        };

        usuarios_periodo.forEach(usuario => {
            const perfilDescripcion = perfiles.find(p => p.tipo_id === usuario.perfil_id)?.descripcion || '—';
            const provinciaDescripcion = provincias.find(p => p.tipo_id === usuario.provincia_id)?.descripcion || '—';
            const practicasDescripcion = centro_estudios.find(p => p.tipo_id === usuario.centro_estudios_id)?.descripcion || '—';
            const jornadaDescripcion = jornadas_laborales.find(p => p.tipo_id === usuario.tipo_jornada_laboral_id)?.descripcion || '—';
            const horarioDescripcion = turnos_horario_laboral.find(p => p.tipo_id === usuario.turno_laboral_id)?.descripcion || '—';
            const bancoDescripcion = entidades_financieras.find(p => p.tipo_id === usuario.entidad_financiera_id)?.descripcion || '—';

            const row = worksheet.addRow({
                codigo_usuario: safeValue(usuario.codigo_usuario),
                apellidos: safeValue(usuario.apellidos)?.toUpperCase(),
                nombre: safeValue(usuario.nombre)?.toUpperCase(),
                dni: safeValue(usuario.dni),
                fecha_nacimiento: safeValue(usuario.fecha_nacimiento),
                celular: safeValue(usuario.celular),
                correo_personal: safeValue(usuario.correo_personal),
                perfil: perfilDescripcion,
                correo_corporativo: safeValue(usuario.correo_corporativo, 'No maneja'),
                provincia: provinciaDescripcion,
                n_contrato: safeValue(usuario.n_contrato),
                practicas: practicasDescripcion,
                fecha_ingreso: safeValue(usuario.fecha_ingreso),
                fecha_termino_contrato: safeValue(usuario.fecha_termino_contrato),
                jornada_laboral: jornadaDescripcion,
                horario: horarioDescripcion,
                fecha_cese: safeValue(usuario.fecha_cese),
                n_cuenta_bancaria: safeValue(usuario.n_cuenta_bancaria),
                n_cuenta_interbancaria: safeValue(usuario.n_cuenta_interbancaria),
                banco: bancoDescripcion,
                ficha: usuario.tiene_archivo_ficha === '1' ? 'Sí' : 'No',
                contrato: usuario.tiene_archivo_contrato === '1' ? 'Sí' : 'No',
                dni_doc: usuario.tiene_archivo_dni === '1' ? 'Sí' : 'No',
                recibo: usuario.tiene_archivo_recibo_luz_agua === '1' ? 'Sí' : 'No',
                certijoven: usuario.tiene_archivo_certijoven === '1' ? 'Sí' : 'No',
                fotocheck: usuario.tiene_fotocheck === '1' ? 'Sí' : 'No',
                equifax: usuario.tiene_equifax === '1' ? 'Sí' : 'No',
                casaca: usuario.tiene_casaca === '1' ? 'Sí' : 'No',
            });

            const fillColor = perfilColors[usuario.perfil_id] || perfilColors['default'];

            row.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if (usuario.estado === '0') {
                    cell.font = { color: { argb: 'FFFF0000' } };
                }
            });
        });
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Directorio_${periodo_fecha}.xlsx`);
    };

    const getUsuariosPorPeriodo = async () => {
        if (!area) {
            alert('Por favor, seleccione un área antes de continuar.');
            return;
        }

        if (!periodo_fecha) {
            alert('Por favor, seleccione un periodo de fecha antes de continuar.');
            return;
        }

        try {
            setLoading(true);
            const data = await UsuarioService.getUsuariosPorPeriodo(area, periodo_fecha);
            const usuariosOrdenados = ordenarUsuariosJerarquia(data.usuarios);
            setUsuariosPeriodo(usuariosOrdenados);
            setNUsuarios(data.total);
            setJefesInmediatos(data.usuarios.filter(t => Number(t.perfil_id) !== 4));
            setState({ ...state, isUpdated: false });
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            alert('Ocurrió un error al cargar los datos.');
        }
    };

    const handleButtonClick = async () => {
        await getUsuariosPorPeriodo();
    };


    function mostrarModalCrearUsuario(usuario, jefes_inmediatos) {
        setState({ ...state, modalCrearUsuario: true, usuario: usuario, jefes_inmediatos: jefes_inmediatos, periodo_fecha: periodo_fecha })
    };

    function mostrarModalEliminarUsuario(usuario) {
        setState({ ...state, modalEliminarUsuario: true, usuario: usuario })
    };

    function mostrarModalReestablecerUsuario(usuario) {
        setState({ ...state, modalReestablecerUsuario: true, usuario: usuario })
    };

    const handleVerDocumentos = async (usuario_id, tipo) => {
        if (loadingDocumento.usuarioId === usuario_id && loadingDocumento.tipo === tipo) return;

        setLoadingDocumento({ usuarioId: usuario_id, tipo });

        try {
            let response;
            switch (tipo) {
                case 'ficha':
                    response = await ArchivoService.getFicha(usuario_id);
                    break;
                case 'contrato':
                    response = await ArchivoService.getContrato(usuario_id);
                    break;
                case 'dni':
                    response = await ArchivoService.getDni(usuario_id);
                    break;
                case 'recibo':
                    response = await ArchivoService.getReciboLuzAgua(usuario_id);
                    break;
                case 'certijoven':
                    response = await ArchivoService.getCertijoven(usuario_id);
                    break;
                default:
                    throw new Error("Tipo de documento no válido.");
            }

            if (response?.url_completa) {
                window.open(response.url_completa, "_blank", "noopener,noreferrer");
            } else {
                alert("No se encontró el archivo. Verifique que esté cargado.");
            }
        } catch (error) {
            console.error("Error al obtener el documento:", error);
            alert("Ocurrió un error al intentar abrir el documento. Intente nuevamente.");
        } finally {
            setLoadingDocumento({ usuarioId: null, tipo: null });
        }
    };

    React.useEffect(() => {
        if (area && periodo_fecha) {
            getUsuariosPorPeriodo();
        }
    }, []);

    React.useEffect(() => {
        if (state.isUpdated === true) {
            getUsuariosPorPeriodo();
        }
    }, [state.isUpdated]);

    return (
        <>
            <div className="caja-flujo-container">
                <div className="flex items-center justify-between mb-4">
                    <h1>DIRECTORIO DE USUARIOS</h1>
                    <ButtonExcel
                        onClick={() => exportToExcel(usuarios_periodo, perfiles, provincias, centro_estudios, jornadas_laborales, turnos_horario_laboral, entidades_financieras, periodo_fecha, area, areas)}
                        disabled={usuarios_periodo.length === 0}
                    />
                </div>

                <div className="filtros">
                    <div>
                        <label htmlFor="periodo_fecha">Periodo de fecha:</label>
                        <input
                            id="periodo_fecha"
                            type="month"
                            value={periodo_fecha}
                            onChange={(e) => setPeriodoFecha(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="area">Área:</label>
                        <SearchSelect
                            id="area"
                            className="search_select"
                            value={area}
                            onValueChange={(value) => setArea(value)}
                            placeholder="Seleccione..."
                        >
                            {areas.map((item) => (
                                <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                                    {item.descripcion}
                                </SearchSelectItem>
                            ))}
                        </SearchSelect>
                    </div>
                    <div>
                        <label htmlFor="dni">DNI:</label>
                        <input
                            type="text"
                            id="dni"
                            value={DNI}
                            onChange={(e) => setDNI(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre_completo}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="jefe_inmediato">Jefe inmediato:</label>
                        <SearchSelect
                            id="jefe_inmediato"
                            className="search_select"
                            value={jefe_inmediato}
                            onValueChange={(value) => setJefeInmediato(value)}
                            placeholder="Seleccione..."
                        >
                            {jefes_inmediatos.map((item) => (
                                <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select">
                                    {item.apellidos.toUpperCase() + ', ' + item.nombre.toUpperCase()}
                                </SearchSelectItem>
                            ))}
                        </SearchSelect>
                    </div>
                    <div>
                        <label htmlFor="estado">Estado:</label>
                        <SearchSelect
                            id="estado"
                            className="search_select"
                            value={estado}
                            onValueChange={(value) => setEstado(value)}
                            placeholder="Seleccione..."
                        >
                            <SearchSelectItem value="1" className="search_select">VIGENTE</SearchSelectItem>
                            <SearchSelectItem value="0" className="search_select">CESADO</SearchSelectItem>
                        </SearchSelect>
                    </div>
                </div>

                <div className="mb-4">
                    <ButtonSearch
                        onClick={handleButtonClick}
                        disabled={!area || !periodo_fecha || loading}
                        isLoading={loading}
                        className="w-100"
                    />
                </div>

                <div className="flex justify-end items-center mt-[18px] mb-4">
                    <ButtonInsert
                        onClick={() => mostrarModalCrearUsuario(null, jefes_filtrados_actuales)}
                    />
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="usuarios-table-scroll-container" style={{ overflowX: 'auto' }}>
                        <div className="table-container">
                            <Table hover size="sm">
                                <thead>
                                    <tr>
                                        <th colSpan={7} className="text-center">Datos personales</th>
                                        <th colSpan={10} className="text-center">Información laboral</th>
                                        <th colSpan={3} className="text-center">Información bancaria</th>
                                        <th colSpan={5} className="text-center">Documentos</th>
                                        <th colSpan={3} className="text-center">Instrumentos</th>
                                        <th rowSpan={2} className="text-center align-middle">Acciones</th>
                                    </tr>
                                    <tr>
                                        <th style={{ minWidth: '80px' }}>Código</th>
                                        <th style={{ minWidth: '150px' }}>Apellidos</th>
                                        <th style={{ minWidth: '150px' }}>Nombres</th>
                                        <th style={{ minWidth: '90px' }}>DNI</th>
                                        <th style={{ minWidth: '100px' }}>Fecha de nacimiento</th>
                                        <th style={{ minWidth: '90px' }}>Celulares</th>
                                        <th style={{ minWidth: '150px' }}>Correo personal</th>
                                        <th style={{ minWidth: '120px' }}>Cargo</th>
                                        <th style={{ minWidth: '150px' }}>Correo corporativo</th>
                                        <th style={{ minWidth: '100px' }}>Provincia</th>
                                        <th style={{ minWidth: '80px' }}>N° de contrato</th>
                                        <th style={{ minWidth: '120px' }}>Prácticas</th>
                                        <th style={{ minWidth: '100px' }}>Fecha de ingreso</th>
                                        <th style={{ minWidth: '100px' }}>Término de contrato</th>
                                        <th style={{ minWidth: '120px' }}>Jornada laboral</th>
                                        <th style={{ minWidth: '120px' }}>Horario</th>
                                        <th style={{ minWidth: '100px' }}>Fecha de cese</th>
                                        <th style={{ minWidth: '120px' }}>N° de cuenta</th>
                                        <th style={{ minWidth: '120px' }}>N° de cuenta interbancaria</th>
                                        <th style={{ minWidth: '120px' }}>Banco</th>
                                        <th>Ficha</th>
                                        <th>Contrato</th>
                                        <th>Co. DNI</th>
                                        <th>Recibo de luz o agua</th>
                                        <th>Certijoven</th>
                                        <th>Fotocheck</th>
                                        <th>Equifax</th>
                                        <th>Casaca</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios_periodo.length === 0 ? (
                                        <tr>
                                            <td colSpan="30" className="no-solicitudes text-center py-4">
                                                Sin personal registrado en este periodo de fecha
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios_periodo
                                            .filter(usuario => perfil ? usuario.perfil_id === perfil : true)
                                            .filter(usuario => estado ? usuario.estado === estado : true)
                                            .filter(usuario => provincia ? usuario.provincia_id === provincia : true)
                                            .filter(usuario => jefe_inmediato ? (usuario.usuario_id_jefe_inmediato === jefe_inmediato || usuario.usuario_id === jefe_inmediato) : true)
                                            .filter(usuario => nombre_completo ? (usuario.apellidos.toUpperCase() + ', ' + usuario.nombre.toUpperCase()).includes(nombre_completo.toUpperCase()) : true)
                                            .filter(usuario => DNI ? usuario.dni.includes(DNI) : true)
                                            .map((usuario, index) => (
                                                <tr
                                                    key={index}
                                                    className={`text-gray-800
                                        ${usuario.estado === '0' ? 'fila-inactiva' : ''}
                                        perfil-${usuario.perfil_id}`}
                                                >
                                                    <td className="px-2">{usuario.codigo_usuario?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.apellidos?.trim().toUpperCase() || '—'}</td>
                                                    <td className="px-2">{usuario.nombre?.trim().toUpperCase() || '—'}</td>
                                                    <td className="px-2">{usuario.dni?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.fecha_nacimiento?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.celular?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.correo_personal?.trim() || '—'}</td>
                                                    <td className="px-2">
                                                        {perfiles.find(p => p.tipo_id === usuario.perfil_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">
                                                        {usuario.correo_corporativo?.trim() || 'No maneja'}
                                                    </td>
                                                    <td className="px-2">
                                                        {provincias.find(p => p.tipo_id === usuario.provincia_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">{usuario.n_contrato?.trim() || '—'}</td>
                                                    <td className="px-2">
                                                        {centro_estudios.find(p => p.tipo_id === usuario.centro_estudios_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">{usuario.fecha_ingreso?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.fecha_termino_contrato?.trim() || '—'}</td>
                                                    <td className="px-2">
                                                        {jornadas_laborales.find(p => p.tipo_id === usuario.tipo_jornada_laboral_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">
                                                        {turnos_horario_laboral.find(p => p.tipo_id === usuario.turno_laboral_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">{usuario.fecha_cese?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.n_cuenta_bancaria?.trim() || '—'}</td>
                                                    <td className="px-2">{usuario.n_cuenta_interbancaria?.trim() || '—'}</td>
                                                    <td className="px-2">
                                                        {entidades_financieras.find(p => p.tipo_id === usuario.entidad_financiera_id)?.descripcion || '—'}
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_archivo_ficha === '1'
                                                                ? (<button
                                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'ficha')}
                                                                    className="archivo-presente cursor-pointer bg-transparent border-0 p-0"
                                                                    title="Documento adjuntado - haz clic para ver"
                                                                >
                                                                    <FileMinus size={20} />
                                                                </button>)
                                                                : (<FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />)}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_archivo_contrato === '1' ? (
                                                                <button
                                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'contrato')}
                                                                    disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'contrato'}
                                                                    className={`archivo-presente bg-transparent border-0 p-0 ${loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'contrato'
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : 'cursor-pointer'
                                                                        }`}
                                                                    title="Documento adjuntado - haz clic para ver"
                                                                >
                                                                    {loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'contrato'
                                                                        ? <Loader size={20} className="animate-spin text-gray-500" />
                                                                        : <FileMinus size={20} />}
                                                                </button>
                                                            ) : (
                                                                <FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_archivo_dni === '1' ? (
                                                                <button
                                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'dni')}
                                                                    disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'dni'}
                                                                    className={`archivo-presente bg-transparent border-0 p-0 ${loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'dni'
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : 'cursor-pointer'
                                                                        }`}
                                                                    title="Documento adjuntado - haz clic para ver"
                                                                >
                                                                    {loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'dni'
                                                                        ? <Loader size={20} className="animate-spin text-gray-500" />
                                                                        : <FileMinus size={20} />}
                                                                </button>
                                                            ) : (
                                                                <FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_archivo_recibo_luz_agua === '1' ? (
                                                                <button
                                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'recibo')}
                                                                    disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'recibo'}
                                                                    className={`archivo-presente bg-transparent border-0 p-0 ${loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'recibo'
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : 'cursor-pointer'
                                                                        }`}
                                                                    title="Documento adjuntado - haz clic para ver"
                                                                >
                                                                    {loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'recibo'
                                                                        ? <Loader size={20} className="animate-spin text-gray-500" />
                                                                        : <FileMinus size={20} />}
                                                                </button>
                                                            ) : (
                                                                <FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_archivo_certijoven === '1' ? (
                                                                <button
                                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'certijoven')}
                                                                    disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'certijoven'}
                                                                    className={`archivo-presente bg-transparent border-0 p-0 ${loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'certijoven'
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : 'cursor-pointer'
                                                                        }`}
                                                                    title="Documento adjuntado - haz clic para ver"
                                                                >
                                                                    {loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'certijoven'
                                                                        ? <Loader size={20} className="animate-spin text-gray-500" />
                                                                        : <FileMinus size={20} />}
                                                                </button>
                                                            ) : (
                                                                <FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_fotocheck === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_equifax === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                                                        </div>
                                                    </td>
                                                    <td className="px-2">
                                                        <div className="flex justify-center items-center">
                                                            {usuario.tiene_casaca === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 text-center flex justify-center space-x-3">
                                                        <ButtonUpdate
                                                            onClick={() => mostrarModalCrearUsuario(usuario, jefes_filtrados_periodo)}
                                                        />
                                                        {usuario.estado === '1' ? (
                                                            <ButtonDelete
                                                                onClick={() => mostrarModalEliminarUsuario(usuario)}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => mostrarModalReestablecerUsuario(usuario)}
                                                                title="Reestablecer usuario"
                                                                className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
            <ModalCrearUsuario
                isOpen={state.modalCrearUsuario}
            />
            <ModalEliminarUsuario
                isOpen={state.modalEliminarUsuario}
            />
            <ModalReestablecerUsuario
                isOpen={state.modalReestablecerUsuario}
            />
        </>
    );
}

export default Usuarios;