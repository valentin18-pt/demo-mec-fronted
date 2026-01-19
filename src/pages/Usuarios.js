import "./Usuarios.css";
import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import UsuarioService from "../axios_services/usuarios.service";
import {Table, Button, Form, FormGroup} from "reactstrap";
import ModalCrearUsuario from "../components/Modal/ModalCrearUsuario";
import ModalEliminarUsuario from "../components/Modal/ModalEliminarUsuario";
import ModalReestablecerUsuario from "../components/Modal/ModalReestablecerUsuario";
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FileMinus, RotateCcw, Loader, FileSpreadsheet} from "lucide-react";
import ArchivoService from "../axios_services/archivos.service";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


function Usuarios() {

    const [loading, setLoading] = useState(false);
    const [state,setState] = useContext(AppContext);
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
    const jefes_filtrados_periodo = usuarios_periodo.filter(u => Number(u.perfil_id) !== 4).map(u => ({usuario_id: u.usuario_id,nombre_completo_usuario: `${u.apellidos}, ${u.nombre}`.toUpperCase(),perfil_id: u.perfil_id}));
    const [jefes_filtrados_actuales] = useState(state.user.personal.filter(u => Number(u.perfil_id) !== 4).map(u => ({usuario_id: u.usuario_id,nombre_completo_usuario: u.nombre_completo_usuario.toUpperCase(),perfil_id: u.perfil_id})));

    //CATALOGOS
    const [perfiles,setPerfiles] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 6}));
    const [areas,setAreas] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 22}));
    const [provincias,setProvincias] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 7}));
    const [jornadas_laborales,setjornadasLaborales] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 5}));
    const [entidades_financieras] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 25}));
    const [turnos_horario_laboral,setTurnosHorarioLaboral] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 24}));
    const [centro_estudios,setCentroEstudios] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 23}));
    const [jefes_inmediatos,setJefesInmediatos] = useState([]);

    const ordenarUsuariosJerarquia = (usuarios) => {
        const usuariosMap = {};
            usuarios.forEach(u => {
                usuariosMap[u.usuario_id] = {...u, subordinados: []};
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

            return resultado.map(({subordinados, ...rest}) => rest);
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
            setState({...state, isUpdated: false });
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            alert('Ocurrió un error al cargar los datos.');
        }
    };

    const handleButtonClick = async () => {
        await getUsuariosPorPeriodo();
    };


    function mostrarModalCrearUsuario (usuario, jefes_inmediatos) {
        setState({ ...state, modalCrearUsuario:true, usuario:usuario, jefes_inmediatos:jefes_inmediatos, periodo_fecha: periodo_fecha})
    };

    function mostrarModalEliminarUsuario (usuario) {
        setState({ ...state, modalEliminarUsuario:true, usuario:usuario})
    };

    function mostrarModalReestablecerUsuario (usuario) {
        setState({ ...state, modalReestablecerUsuario:true, usuario:usuario})
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
        if (state.isUpdated === true){
            getUsuariosPorPeriodo();   
        }
    }, [state.isUpdated]);

return (
    <>
        <div>
            <div>
                <div>
                <div className="flex items-center justify-between mb-4">
                    <h1>
                        👥 Directorio de usuarios
                    </h1>
                    <div className="flex items-center gap-x-4">
                        <Button
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow transition"
                        onClick={() => { mostrarModalCrearUsuario(null, jefes_filtrados_actuales); }}
                        >
                        <Plus className="w-5 h-5" />
                        <span>Registrar Nuevo Usuario</span>
                        </Button>
                        <Button
                        onClick={() => exportToExcel(usuarios_periodo, perfiles, provincias, centro_estudios, jornadas_laborales, turnos_horario_laboral, entidades_financieras, periodo_fecha, area, areas)}
                        className="flex items-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold shadow transition"
                        >
                        <FileSpreadsheet className="w-4 h-4" />
                        Exportar a Excel
                        </Button>
                    </div>
                </div>
                <div className="filter-colum3">
                    <div className="campo-fecha">
                        <label htmlFor="periodo_fecha">Periodo de fecha:</label>
                        <input
                            id="periodo_fecha"
                            type="month"
                            value={periodo_fecha}
                            onChange={(e) => setPeriodoFecha(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="buro">Área:</label>
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
                    </div>
                    <Button className="buscar" onClick={handleButtonClick} disabled={!area || !periodo_fecha || loading}>
                        {loading ? 'Procesando...' : 'Procesar'}
                    </Button>
                    <div className="filtros-busqueda">
                    <h3 className="titulo-filtros">🔍 Filtros adicionales</h3>

                    <div className="filtros-formulario ">
                        <div className="filtro-item">
                        <label htmlFor="nombre">DNI:</label>
                        <input
                            type="text"
                            id="dni"
                            value={DNI}
                            onChange={(e) => setDNI(e.target.value)}
                        />
                        </div>
                        <div className="filtro-item">
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre_completo}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                        />
                        </div>
                        <div className="filtro-item">
                        <label htmlFor="jefe_inmediato">Jefe inmediato:</label>
                        <SearchSelect
                            id="jefe_inmediato"
                            className="search_select_filtros"
                            value={jefe_inmediato}
                            onValueChange={(value) => setJefeInmediato(value)}
                            placeholder="Seleccione..."
                        >
                            {jefes_inmediatos.map((item) => (
                            <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select_filtros">
                                {item.apellidos.toUpperCase() + ', ' + item.nombre.toUpperCase()}
                            </SearchSelectItem>
                            ))}
                        </SearchSelect>
                        </div>
                        <div className="filtro-item">
                        <label htmlFor="perfil_id">Cargo:</label>
                        <SearchSelect
                            id="perfil_id"
                            className="search_select_filtros"
                            value={perfil}
                            onValueChange={(value) => setPerfil(value)}
                            placeholder="Seleccione..."
                        >
                            {perfiles.map((item) => (
                            <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select_filtros">
                                {item.descripcion}
                            </SearchSelectItem>
                            ))}
                        </SearchSelect>
                        </div>
                        <div className="filtro-item">
                        <label htmlFor="estado">Estado:</label>
                        <SearchSelect
                            id="estado"
                            className="search_select_filtros"
                            value={estado}
                            onValueChange={(value) => setEstado(value)}
                            placeholder="Seleccione..."
                        >
                            <SearchSelectItem value="1" className="search_select_filtros">VIGENTE</SearchSelectItem>
                            <SearchSelectItem value="0" className="search_select_filtros">CESADO</SearchSelectItem>
                        </SearchSelect>
                        </div>
                    </div>
                    </div>
                    </div>
                    {loading ? (
                        <div className="cargando">Cargando...</div>
                        ) : (
                        <div className="usuarios-table-scroll-container" style={{ overflowX: 'auto' }}>
                            <div className="usuarios-table-container" style={{ minWidth: '1200px' }}>
                            <Table className="usuarios-table tabla-directorio">
                                <thead>
                                <tr>
                                    <th colSpan={30} className="text-left bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-3 rounded-t">
                                    Directorio de {areas.find((a) => a.tipo_id === area)?.descripcion}
                                    <span className="text-sm text-gray-600 ml-2">({usuarios_periodo.length} usuarios)</span>
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={7} className="bg-gray-100 text-center text-sm font-semibold text-gray-700">🧍 Datos personales</th>
                                    <th colSpan={10} className="bg-green-100 text-center text-sm font-semibold text-gray-700">💼 Información laboral</th>
                                    <th colSpan={3} className="bg-blue-100 text-center text-sm font-semibold text-gray-700">💳 Información bancaria</th>
                                    <th colSpan={5} className="bg-yellow-100 text-center text-sm font-semibold text-gray-700">📑 Documentos</th>
                                    <th colSpan={3} className="bg-pink-100 text-center text-sm font-semibold text-gray-700">🧰 Instrumentos</th>
                                    <th rowSpan={2} className="bg-gray-200 text-center text-sm font-semibold text-gray-700 align-middle">Acciones</th>
                                </tr>
                                <tr className="text-xs uppercase tracking-wide font-semibold">
                                    <th className="th-datos-personales">Código</th>
                                    <th className="th-datos-personales">Apellidos</th>
                                    <th className="th-datos-personales">Nombres</th>
                                    <th className="th-datos-personales">DNI</th>
                                    <th className="th-datos-personales">Fecha de nacimiento</th>
                                    <th className="th-datos-personales">Celular</th>
                                    <th className="th-datos-personales">Correo personal</th>
                                    <th className="th-info-laboral">Cargo</th>
                                    <th className="th-info-laboral">Correo corporativo</th>
                                    <th className="th-info-laboral">Provincia</th>
                                    <th className="th-info-laboral">N° de contrato</th>
                                    <th className="th-info-laboral">Prácticas</th>
                                    <th className="th-info-laboral">Fecha de ingreso</th>
                                    <th className="th-info-laboral">Término de contrato</th>
                                    <th className="th-info-laboral">Jornada laboral</th>
                                    <th className="th-info-laboral">Horario</th>
                                    <th className="th-info-laboral">Fecha de cese</th>
                                    <th className="th-info-bancaria">N° de cuenta</th>
                                    <th className="th-info-bancaria">N° de cuenta interbancaria</th>
                                    <th className="th-info-bancaria">Banco</th>
                                    <th className="th-documentos">Ficha</th>
                                    <th className="th-documentos">Contrato</th>
                                    <th className="th-documentos">Co. DNI</th>
                                    <th className="th-documentos">Recibo de luz o agua</th>
                                    <th className="th-documentos">Certijoven</th>
                                    <th className="th-instrumentos">Fotocheck</th>
                                    <th className="th-instrumentos">Equifax</th>
                                    <th className="th-instrumentos">Casaca</th>
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
                                    .filter(usuario => nombre_completo ?  (usuario.apellidos.toUpperCase() + ', ' + usuario.nombre.toUpperCase()).includes(nombre_completo.toUpperCase()) : true)
                                    .filter(usuario => DNI ?  usuario.dni.includes(DNI) : true)
                                    .map((usuario, index) => (
                                    <tr
                                        key={index}
                                        className={`text-xs text-gray-800
                                            ${usuario.estado === '0' ? 'fila-inactiva' : ''} 
                                            perfil-${usuario.perfil_id}`}
                                    >
                                        <td className="px-4 py-2 border border-gray-200">{usuario.codigo_usuario?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.apellidos?.trim().toUpperCase() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.nombre?.trim().toUpperCase() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.dni?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.fecha_nacimiento?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.celular?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.correo_personal?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {perfiles.find(p => p.tipo_id === usuario.perfil_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.correo_corporativo?.trim() || 'No maneja'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {provincias.find(p => p.tipo_id === usuario.provincia_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.n_contrato?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {centro_estudios.find(p => p.tipo_id === usuario.centro_estudios_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.fecha_ingreso?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.fecha_termino_contrato?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {jornadas_laborales.find(p => p.tipo_id === usuario.tipo_jornada_laboral_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {turnos_horario_laboral.find(p => p.tipo_id === usuario.turno_laboral_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.fecha_cese?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.n_cuenta_bancaria?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.n_cuenta_interbancaria?.trim() || '—'}</td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {entidades_financieras.find(p => p.tipo_id === usuario.entidad_financiera_id)?.descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.tiene_archivo_ficha === '1' 
                                                ? (<button
                                                    onClick={() => handleVerDocumentos(usuario.usuario_id, 'ficha')}
                                                    className="archivo-presente cursor-pointer bg-transparent border-0 p-0"
                                                    title="Documento adjuntado - haz clic para ver"
                                                    >
                                                    <FileMinus size={20} />
                                                    </button>) 
                                                : (<FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />)}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.tiene_archivo_contrato === '1' ? (
                                                <button
                                                onClick={() => handleVerDocumentos(usuario.usuario_id, 'contrato')}
                                                disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'contrato'}
                                                className={`archivo-presente bg-transparent border-0 p-0 ${
                                                    loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'contrato'
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
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.tiene_archivo_dni === '1' ? (
                                                <button
                                                onClick={() => handleVerDocumentos(usuario.usuario_id, 'dni')}
                                                disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'dni'}
                                                className={`archivo-presente bg-transparent border-0 p-0 ${
                                                    loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'dni'
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
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.tiene_archivo_recibo_luz_agua === '1' ? (
                                                <button
                                                onClick={() => handleVerDocumentos(usuario.usuario_id, 'recibo')}
                                                disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'recibo'}
                                                className={`archivo-presente bg-transparent border-0 p-0 ${
                                                    loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'recibo'
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
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">
                                            {usuario.tiene_archivo_certijoven === '1' ? (
                                                <button
                                                onClick={() => handleVerDocumentos(usuario.usuario_id, 'certijoven')}
                                                disabled={loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'certijoven'}
                                                className={`archivo-presente bg-transparent border-0 p-0 ${
                                                    loadingDocumento.usuarioId === usuario.usuario_id && loadingDocumento.tipo === 'certijoven'
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
                                        </td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.tiene_fotocheck === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.tiene_equifax === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}</td>
                                        <td className="px-4 py-2 border border-gray-200">{usuario.tiene_casaca === '1' ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}</td>
                                        <td className="px-4 py-2 border border-gray-200 text-center flex justify-center space-x-3">
                                            <button
                                                onClick={() => mostrarModalCrearUsuario(usuario, jefes_filtrados_periodo)}
                                                title="Editar"
                                                className="p-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {usuario.estado === '1' ? (
                                                <button
                                                onClick={() => mostrarModalEliminarUsuario(usuario)}
                                                title="Dar de baja"
                                                className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                                                >
                                                <Trash2 size={18} />
                                                </button>
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
        </div>
        </>
    );
}

export default Usuarios;