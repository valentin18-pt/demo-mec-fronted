import { Table, Button } from "reactstrap";
import { useState, useContext, useRef, useEffect } from "react";
import {Accordion, AccordionBody,AccordionHeader, AccordionList, SearchSelect,SearchSelectItem} from '@tremor/react';
import { AppContext } from '../application/provider';
import { FileText } from 'lucide-react';
import { Plus} from "lucide-react";
import { FileSpreadsheet, Lock  } from "lucide-react";
import ModalBonoDescuento from "../components/Modal/ModalBonoDescuento";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PlanillaService from "../axios_services/planilla.service";
import Loader from "../components/Loader/Loader";
import "./Planilla.css";
import { Check, Save  } from 'lucide-react';
import ButtonSearch from '../components/Buttons/ButtonSearch';

function Planilla() {
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [periodo_pago, setPeriodoPago] = useState('');
    const [usuarios, setUsuarios] = useState({gerencia: [],comercial: [],interna: [],externa: []});
    const [loading, setLoading] = useState(true);
    const [registro_existente, setRegistroExistente] = useState(true);
    const [state,setState] = useContext(AppContext);
    const [guardando, setGuardando] = useState(false);
    const [area_id, setAreaId] = useState('');

    //CATALOGOS
    const [areas,setAreas] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 22}));
    const [perfiles] = useState(state.catalogos.tipos.filter(t => {return Number(t.categoria_id) === 6}));

    const secciones = [
        // { key: 'gerencia', header: 'GERENCIAS', usuarios: usuarios.gerencia },
        { key: 'comercial', header: 'COMERCIAL', usuarios: usuarios.comercial },
        // { key: 'interna', header: 'ADMINISTRACIÓN INTERNA', usuarios: usuarios.interna },
        // { key: 'externa', header: 'ADMINISTRACIÓN EXTERNA', usuarios: usuarios.externa },
    ];

    const buildHierarchy = (usuarios, jefeId = null) => {
        const subordinados = usuarios.filter(
            (usuario) => Number(usuario.usuario_id_jefe_inmediato) === Number(jefeId)
        );

        return subordinados.map((usuario) => ({
            ...usuario,
            subordinados: buildHierarchy(usuarios, usuario.usuario_id),
        }));
    };

    const aplanarJerarquia = (usuariosPorGrupo) => {
        let todosLosUsuarios = [];

        const recorrer = (usuarios) => {
            if (!usuarios) return;

            usuarios.forEach((usuario) => {
                todosLosUsuarios.push(usuario);
                if (usuario.subordinados && usuario.subordinados.length > 0) {
                    recorrer(usuario.subordinados);
                }
            });
        };

        Object.values(usuariosPorGrupo).forEach(grupo => {
            recorrer(grupo);
        });

        return todosLosUsuarios;
    };

    const guardarPlanilla = async () => {
        try {
            setGuardando(true);
            const allUsers = aplanarJerarquia(usuarios);

            const planillas = allUsers.map(usuario => ({
            usuario_id: usuario.usuario_id,
            periodo_planilla: periodo_pago,
            periodo_pago: periodo_pago,
            usuario_creo_id: state.user?.usuario_id,
            monto_neto_final: usuario.monto_neto_final === 'No aplica' ? null : (usuario.monto_neto_final ?? 0),
            sueldo_mensual: usuario.sueldo_base === 'No aplica' ? null : (usuario.sueldo_base ?? 0),
            porcentaje_comision: usuario.porcentaje_comision === 'No aplica' ? null : (usuario.porcentaje_comision ?? 0),
            comision: usuario.suma_comision === 'No aplica' ? null : (usuario.suma_comision ?? 0),
            bono_por_honorario: usuario.bono_honorario_exito === 'No aplica' ? null : (usuario.bono_honorario_exito ?? 0),
            bono_equipo_100: usuario.bono_equipo === 'No aplica' ? null : (usuario.bono_equipo ?? 0),
            bono_rotacion_equipo: usuario.bono_rotacion === 'No aplica' ? null : (usuario.bono_rotacion ?? 0),
            bono_incremento_resultado: usuario.bono_incremento_resultado === 'No aplica' ? null : (usuario.bono_incremento_resultado ?? 0),
            bono_extra: usuario.bono_extra === 'No aplica' ? null : (usuario.bono_extra ?? 0),
            total_comision: usuario.total_comision === 'No aplica' ? null : (usuario.total_comision ?? 0),
            descuento_cancelados: usuario.descuento_cancelados === 'No aplica' ? null : (usuario.descuento_cancelados ?? 0),
            descuento_extra: usuario.descuento_extra === 'No aplica' ? null : (usuario.descuento_extra ?? 0),
            total_pagar: usuario.total_pagar === 'No aplica' ? null : (usuario.total_pagar ?? 0),
            desembolsos: usuario.detalle_desembolsos ?? [],
            cancelados: usuario.detalle_cancelados ?? [],
            }));

            await PlanillaService.guardarPlanilla(planillas);
            setRegistroExistente(true);
            alert('¡Planillas guardadas correctamente!');
            await getPlanilla();
        } catch (error) {
            console.error('Error al guardar todas las planillas:', error);
            alert('Ocurrió un error al guardar las planillas.');
        } finally {
            setGuardando(false);
        }
    };


    const getPlanilla = async () => {
        setLoading(true);
        try {
            const response = await PlanillaService.getPlanilla( state.user?.perfil_id,  state.user?.usuario_id, periodo_fecha);
            const jerarquiaComercial = buildHierarchy(response.datos.usuarios_comercial, null);
            // const jerarquiaGerencia = buildHierarchy(response.datos.usuarios_gerencia, null);
            // const jerarquiaInterna = buildHierarchy(response.datos.usuarios_administracion_interna, null);
            // const jerarquiaExterna = buildHierarchy(response.datos.usuarios_administracion_externa, null);
            setUsuarios({
                comercial: jerarquiaComercial,
                gerencia: [], // jerarquiaGerencia,
                interna: [], // jerarquiaInterna,
                externa: [], // jerarquiaExterna,
            });
            setPeriodoPago(response.periodo_planilla);
            setRegistroExistente(response.registro_existente);
        } catch (error) {
            console.error('Error al obtener datos de planilla:', error);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const formatoSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };


    const AccordionUsuarios = ({ usuarios, jefeId = null }) => {
        if (!usuarios || usuarios.length === 0) {
            if ([5, 8].includes(Number(state.user?.perfil_id))) {
                return (<p className="text-center text-gray-500 py-2">Esta sección no contiene usuarios, por lo tanto no se ha generado una planilla para este período de pago.</p>);
            } else {
                return (<p className="text-center text-gray-500 py-2">Aún no se ha registrado una planilla de pago para esta sección en el período actual.</p>);
            }
        }

        return (
        <>
            {usuarios.map((usuario) => (
                <AccordionItem
                    key={usuario.usuario_id}
                    usuario={usuario}
                    usuarios={usuario.subordinados}
                />
            ))}
        </>
    );
    };

    const AccordionItem = ({ usuario, usuarios }) => {
        const [isOpen, setIsOpen] = useState(false);
        const toggleAccordion = () => setIsOpen(!isOpen);

        const tieneSubordinados = usuarios.some(
            (u) => Number(u.usuario_id_jefe_inmediato) === Number(usuario.usuario_id)
        );

        return (
            <Accordion className="accordion" open={isOpen} onClick={tieneSubordinados ? toggleAccordion : undefined}>
                <AccordionHeader className="accordion-header">
                        <span className="accordion-header-nombre">
                            {`${usuario.apellidos || ''}, ${usuario.nombre || ''}`.toUpperCase()}
                        </span>
                        <span className="accordion-header-detalle">
                            Avance de meta: <span className="text-green-600">{Number(usuario.porc_avance_meta).toFixed(2)}%</span> |{' '}
                            Sueldo total: <span className="text-blue-600">{formatoSoles(usuario.total_pagar)}</span>
                        </span>
                </AccordionHeader>
                <AccordionBody>
                    <Table>
                        <thead>
                            <tr>
                                <th className="bg-gray-700 text-white">META</th>
                                <th className="bg-gray-700 text-white">Monto Neto Total</th>
                                    {(usuario.sueldo_base !== 'No aplica') && (
                                        <th className="bg-green-600 text-white font-semibold border-l border-gray-300">Sueldo</th>
                                    )}
                                    {(usuario.suma_comision !== 'No aplica') && (
                                        <th className="bg-green-600 text-white font-semibold border-l border-gray-300">Comisión</th>
                                    )}
                                    {(usuario.bono_extra !== 'No aplica') && (
                                        <th className="bg-orange-600 text-white font-semibold border-l border-gray-300">BONO ADICIONAL</th>
                                    )}
                                    {(usuario.bono_honorario_exito !== 'No aplica') && (
                                        <th className="bg-orange-600 text-white font-semibold border-l border-gray-300">BONO HONORARIO DE ÉXITO</th>
                                    )}
                                    {(usuario.bono_incremento_resultado !== 'No aplica') && (
                                        <th className="bg-orange-600 text-white font-semibold border-l border-gray-300">BONO INCREMENTO POR RESULTADO</th>
                                    )}
                                    {(usuario.bono_equipo !== 'No aplica') && (
                                        <th className="bg-orange-600 text-white font-semibold border-l border-gray-300">BONO EQUIPO 100%</th>
                                    )}
                                    {(usuario.bono_rotacion !== 'No aplica') && (
                                        <th className="bg-orange-600 text-white font-semibold border-l border-gray-300">BONO ROTACIÓN DE EQUIPO</th>
                                    )}
                                    {(usuario.descuento_extra !== 'No aplica') && (
                                        <th className="bg-red-600 text-white font-semibold border-l border-gray-300">DESCUENTO ADICIONAL</th>
                                    )}
                                    <th className="bg-red-600 text-white font-semibold border-l border-gray-300">DESCUENTO POR CANCELACIÓN</th>
                                    <th className="bg-orange-800 text-white font-bold tracking-wide border-l border-gray-300">
                                        TOTAL A PAGAR
                                    </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{formatoSoles(usuario.meta)}</td>
                                <td>{formatoSoles(usuario.monto_neto_final)}</td>
                                {(usuario.sueldo_base !== 'No aplica') && (<td>{formatoSoles(usuario.sueldo_base)}</td>)}
                                {(usuario.suma_comision !== 'No aplica') && (<td>{formatoSoles(usuario.suma_comision)}</td>)}
                                {(usuario.bono_extra !== 'No aplica') && (<td>{formatoSoles(usuario.bono_extra)}</td>)}
                                {(usuario.bono_honorario_exito !== 'No aplica') && (<td>{formatoSoles(usuario.bono_honorario_exito)}</td>)}
                                {(usuario.bono_incremento_resultado !== 'No aplica') && (<td>{formatoSoles(usuario.bono_incremento_resultado)}</td>)}
                                {(usuario.bono_equipo !== 'No aplica') && (<td>{formatoSoles(usuario.bono_equipo)}</td>)}
                                {(usuario.bono_rotacion !== 'No aplica') && (<td>{formatoSoles(usuario.bono_rotacion)}</td>)}
                                {(usuario.descuento_extra !== 'No aplica') && (<td>{formatoSoles(usuario.descuento_extra)}</td>)}
                                <td>{formatoSoles(usuario.descuento_cancelados || 0)}</td>
                                <td className="font-bold bg-orange-100">{formatoSoles(usuario.total_pagar)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <div>
                        {[3, 4].includes(Number(usuario.perfil_id)) && ( <Accordion className="accordion-ver-detalles">
                        <AccordionHeader className="flex items-center cursor-pointer text-blue-600 font-semibold hover:text-blue-800 transition-colors border-0">
                        <div className="ml-auto flex items-center gap-2">
                            <span>Ver Detalles</span>
                            <FileText className="w-3 h-3" />
                        </div>
                        </AccordionHeader>
                         <AccordionBody>
                             {Number(usuario.perfil_id) === 3 && (
                                 <>
                                     {Number(usuario.monto_neto_final) >= Number(usuario.meta) ? (
                                     <div className="w-full bg-green-50 border-l-4 border-green-500 text-green-900 p-4 rounded-lg shadow-md mb-6 flex items-start ">
                                         <p><strong>Buen trabajo:</strong> Ha <strong>superado su meta</strong>, por lo que sus <strong>colocaciones personales se están considerando</strong> en su pago, <strong>hasta un máximo de 200,000</strong> soles en desembolsos.</p>
                                     </div>
                                     ) : (
                                     <div className="w-full bg-red-50 border-l-4 border-red-500 text-red-900 p-4 rounded-lg shadow-md mb-6 flex items-start space-x-3">
                                         <p><strong>Atención:</strong> Actualmente <strong>no ha alcanzado su meta</strong>. Por ello, sus <strong>desembolsos personales no están siendo considerados</strong> en el cálculo de su pago, solo los de sus gestores.</p>
                                     </div>
                                     )}
                                 </>
                                 )}
                                 <Table>
                                     <thead>
                                         <tr>
                                         <th className="bg-gray-200 text-gray-700 font-semibold">N° Solicitud</th>
                                         <th className="bg-gray-200 text-gray-700 font-semibold ">Cliente</th>
                                         <th className="bg-gray-200 text-gray-700 font-semibold">DNI</th>
                                         <th className="bg-gray-200 text-gray-700 font-semibold">Monto Neto Final</th>
                                         <th className="bg-gray-200 text-gray-700 font-semibold">Fecha de desembolso</th>
                                         <th className="bg-gray-200 text-gray-700 font-semibold">Comisión</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {usuario.detalle_desembolsos.length > 0 ? (usuario.detalle_desembolsos.map((d, i) => (
                                         <tr key={i}>
                                             <td className="bg-white text-gray-800 ">{d.n_solicitud}</td>
                                             <td className="bg-white text-gray-800 ">{d.nombre_cliente}</td>
                                             <td className="bg-white text-gray-800 ">{d.dni}</td>
                                             <td className="bg-white text-gray-800 ">{formatoSoles(d.monto_neto || 0)}</td>
                                             <td className="bg-white text-gray-800 ">{d.fecha_desembolso}</td>
                                             <td className="bg-white text-gray-800 ">{formatoSoles(d.comision || 0)}</td>
                                         </tr>
                                         )))
                                         : (
                                             <tr>
                                                 <td colSpan={6} className="bg-white text-center text-gray-500 py-2">
                                                 Sin desembolsos registrados
                                                 </td>
                                             </tr>
                                         )}
                                         {usuario.detalle_cancelados.length > 0 ?(usuario.detalle_cancelados.map((d, i) => (
                                         <tr key={i}>
                                             <td className="bg-red-100 text-gray-800">{d.n_solicitud}</td>
                                             <td className="bg-red-100 text-gray-800">{d.nombre_cliente}</td>
                                             <td className="bg-red-100 text-gray-800">{d.dni}</td>
                                             <td className="bg-red-100 text-gray-800">{formatoSoles(d.monto_neto || 0)}</td>
                                             <td className="bg-red-100 text-gray-800">{d.fecha_desembolso}</td>
                                             <td className="bg-red-100 text-gray-800">{formatoSoles(d.comision || 0)}</td>
                                         </tr>
                                         )))
                                     : (
                                     <tr>
                                         <td colSpan={6} className="bg-red-50 text-center text-red-500 py-2">
                                            Sin cancelados registrados
                                         </td>
                                     </tr>
                                     )}
                                     </tbody>
                                 </Table>
                         </AccordionBody>
                     </Accordion>)}
                 </div> 
                {tieneSubordinados && (
                    <AccordionUsuarios usuarios={usuarios} />
                )}
                </AccordionBody>
            </Accordion>
        );
    };

    function mostrarModalBonoDescuento () {
        setState({ ...state, 
            modalBonoDescuento:true, 
            isUpdated: false,
        })
    };

const exportToExcel = async (periodo_pago) => {
    const workbook = new ExcelJS.Workbook();
    const perfiles = [ /* Tu array de perfiles aquí, si lo tienes */ ];

    const fieldsToExport = [
        { key: 'perfil', header: 'Perfil' },
        { key: 'apellidos', header: 'Apellidos del Gestor' },
        { key: 'nombre', header: 'Nombre del gestor' },
        { key: 'monto_neto_final', header: 'Monto Neto Final' },
        { key: 'meta', header: 'Meta' },
        { key: 'porc_avance_meta', header: '% Avance' },
        { key: 'sueldo_base', header: 'Sueldo Base' },
        { key: 'suma_comision', header: 'Comisión' },
        { key: 'bono_extra', header: 'Bono Adicional' },
        { key: 'bono_honorario_exito', header: 'Bono por Honorario' },
        { key: 'bono_equipo', header: 'Bono de Equipo 100%' },
        { key: 'bono_rotacion', header: 'Bono de Rotación de Equipo' },
        { key: 'bono_incremento_resultado', header: 'Bono de Incremento de Resultado' },
        { key: 'descuento_cancelados', header: 'Descuento Cancelados' },
        { key: 'descuento_extra', header: 'Descuento Adicional' },
        { key: 'total_pagar', header: 'Sueldo Total' },
        { key: 'n_solicitud', header: 'N° Solicitud' },
        { key: 'dni', header: 'DNI Cliente' },
        { key: 'nombre_cliente', header: 'Cliente' },
        { key: 'monto_neto', header: 'Monto Neto' }
    ];

    const columnasMoneda = [
        'monto_neto_final', 'meta', 'porc_avance_meta',
        'sueldo_base', 'suma_comision', 'bono_extra', 'bono_honorario_exito',
        'bono_equipo', 'bono_rotacion', 'bono_incremento_resultado',
        'descuento_cancelados', 'descuento_extra', 'total_pagar',
        'monto_neto'
    ];

    const perfilColors = {
        6: 'FFFFD580', // Gerencia
        2: 'FFFFECB3', // Comercial
        3: 'FFD9E1F2', // Interna
        4: 'FFF9F9F9', // Externa
        'default': 'FFFFFFFF'
    };

    const safeValue = (value, defaultValue = 'N/A') =>
        value === null || value === undefined || value === '' ? defaultValue : value;

    const buildAndFlattenData = (users) => {
        let flattenedData = [];

        const aplanarRecursivamente = (user, parentData = {}) => {
            const perfilDesc = perfiles.find(p => Number(p.tipo_id) === Number(user.perfil_id))?.descripcion;
            const isManager = [6, 2, 3].includes(Number(user.perfil_id));

            const baseRow = {
                perfil_id: user.perfil_id,
                perfil: perfilDesc,
                apellidos: safeValue(user.apellidos),
                nombre: safeValue(user.nombre),
                monto_neto_final: safeValue(user.monto_neto_final, 0),
                meta: safeValue(user.meta, 0),
                porc_avance_meta: safeValue(user.porc_avance_meta, 0),
                sueldo_base: safeValue(user.sueldo_base, 0),
                suma_comision: safeValue(user.suma_comision, 0),
                bono_extra: safeValue(user.bono_extra, 0),
                bono_honorario_exito: safeValue(user.bono_honorario_exito, 0),
                bono_equipo: safeValue(user.bono_equipo, 0),
                bono_rotacion: safeValue(user.bono_rotacion, 0),
                bono_incremento_resultado: safeValue(user.bono_incremento_resultado, 0),
                descuento_extra: safeValue(user.descuento_extra, 0),
                descuento_cancelados: safeValue(user.descuento_cancelados, 0),
                total_pagar: safeValue(user.total_pagar, 0),
            };

            const hasDetails = (user.detalle_desembolsos?.length > 0 || user.detalle_cancelados?.length > 0);

            // Agregar la fila principal del usuario (jefe o gestor)
            if (!hasDetails) {
                flattenedData.push({
                    ...baseRow,
                    isManagerHeader: isManager,
                    isFirstOfGroup: true,
                    isLastOfGroup: user.subordinados?.length === 0,
                });
            } else {
                // Agregar desembolsos
                user.detalle_desembolsos.forEach((desembolso, index) => {
                    const isFirstRow = index === 0;
                    flattenedData.push({
                        ...baseRow,
                        isManagerHeader: isManager && isFirstRow,
                        isFirstOfGroup: isFirstRow,
                        isLastOfGroup: user.subordinados?.length === 0 && index === user.detalle_desembolsos.length - 1 && user.detalle_cancelados.length === 0,
                        n_solicitud: safeValue(desembolso.n_solicitud),
                        dni: safeValue(desembolso.dni),
                        nombre_cliente: safeValue(desembolso.nombre_cliente),
                        monto_neto: safeValue(desembolso.monto_neto, 0),
                    });
                });

                // Agregar cancelados
                user.detalle_cancelados.forEach((cancelado, index) => {
                    const isFirstRow = user.detalle_desembolsos.length === 0 && index === 0;
                    flattenedData.push({
                        ...baseRow,
                        isManagerHeader: isManager && isFirstRow,
                        isFirstOfGroup: isFirstRow,
                        isLastOfGroup: user.subordinados?.length === 0 && index === user.detalle_cancelados.length - 1,
                        n_solicitud: safeValue(cancelado.n_solicitud),
                        dni: safeValue(cancelado.dni),
                        nombre_cliente: safeValue(cancelado.nombre_cliente),
                        monto_neto: safeValue(cancelado.monto_neto, 0),
                        isCanceled: true,
                    });
                });
            }


            // Llamada recursiva para los subordinados
            user.subordinados?.forEach(sub => aplanarRecursivamente(sub, baseRow));

            // Marca la última fila del grupo
            if (user.subordinados?.length > 0) {
                const lastSubordinate = user.subordinados[user.subordinados.length - 1];
                const lastRowOfSubordinate = flattenedData.findLast(row => row.apellidos === lastSubordinate.apellidos && row.nombre === lastSubordinate.nombre);
                if (lastRowOfSubordinate) {
                    lastRowOfSubordinate.isLastOfGroup = true;
                }
            }
        };

        users.forEach(user => aplanarRecursivamente(user));
        return flattenedData;
    };

    const agregarHoja = (nombreHoja, grupoUsuarios) => {
        const worksheet = workbook.addWorksheet(nombreHoja);

        worksheet.columns = fieldsToExport.map(field => ({
            header: field.header,
            key: field.key,
            width: 19
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

        // Aplanar todos los datos con la jerarquía
        const flattenedData = buildAndFlattenData(grupoUsuarios);

        let lastUserKey = '';

        flattenedData.forEach((item, index) => {
            const row = worksheet.addRow(item);
            const perfilId = Number(item.perfil_id);
            const fillColor = perfilColors[perfilId] || perfilColors['default'];
            const currentUserKey = `${item.perfil_id}-${item.apellidos}-${item.nombre}`;

            // Lógica para no repetir datos del gestor principal
            if (currentUserKey === lastUserKey) {
                 row.getCell('perfil').value = '';
                 row.getCell('apellidos').value = '';
                 row.getCell('nombre').value = '';
                 row.getCell('monto_neto_final').value = '';
                 row.getCell('meta').value = '';
                 row.getCell('porc_avance_meta').value = '';
                 row.getCell('sueldo_base').value = '';
                 row.getCell('suma_comision').value = '';
                 row.getCell('bono_extra').value = '';
                 row.getCell('bono_honorario_exito').value = '';
                 row.getCell('bono_equipo').value = '';
                 row.getCell('bono_rotacion').value = '';
                 row.getCell('bono_incremento_resultado').value = '';
                 row.getCell('descuento_extra').value = '';
                 row.getCell('descuento_cancelados').value = '';
                 row.getCell('total_pagar').value = '';
            } else {
                lastUserKey = currentUserKey;
            }

            // Aplicar sangría a gestores de perfil 4 (gestores externos)
            if (perfilId === 4) {
                row.getCell('apellidos').value = '    ' + item.apellidos;
                row.getCell('nombre').value = '    ' + item.nombre;
            }

            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor }
                };

                const key = fieldsToExport[colNumber - 1]?.key;
                if (columnasMoneda.includes(key)) {
                    cell.numFmt = '"S/" #,##0.00';
                }

                if (item.isCanceled) {
                    cell.font = {
                        color: { argb: 'FFFF0000' } // Rojo
                    };
                }

                // Los estilos de relleno de color del perfil se aplican a continuación,
                // asegurando que no se sobrescriban
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor }
                };


                if ([6, 2, 3].includes(perfilId) || item.isManagerHeader) {
                    cell.font = { bold: true };
                }

                // Definir bordes para simular los "acordeones"
                cell.border = {
                    top: { style: item.isFirstOfGroup ? 'medium' : 'thin' },
                    bottom: { style: item.isLastOfGroup ? 'medium' : 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

    };
        // Solo agregar hojas que tengan datos
    if (usuarios.gerencia.length > 0) {
        agregarHoja('Gerencia', usuarios.gerencia);
    }
    if (usuarios.comercial.length > 0) {
        agregarHoja('Comercial', usuarios.comercial);
    }
    if (usuarios.interna.length > 0) {
        agregarHoja('Interna', usuarios.interna);
    }
    if (usuarios.externa.length > 0) {
        agregarHoja('Externa', usuarios.externa);
    }

    // Verificar que al menos una hoja tenga datos
    const hasData = usuarios.gerencia.length > 0 || 
                    usuarios.comercial.length > 0 || 
                    usuarios.interna.length > 0 || 
                    usuarios.externa.length > 0;

    if (!hasData) {
        alert('No hay datos para exportar. Por favor, asegúrate de haber cargado la planilla correctamente.');
        return;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Planilla_${periodo_pago}.xlsx`);
};
    

    const handleButtonClick = () => {
        getPlanilla();
    };

   const handleCheckboxChange = async (seccionKey, checkboxId) => {
        
        const usuariosSeccion = usuarios[seccionKey];
        let nuevoEstado;

        if (checkboxId === 1) {
            const esCheck = usuariosSeccion.every(u => Number(u.estado_validacion_id) >= 2);
            nuevoEstado = esCheck ? 1 : 2;
        } else if (checkboxId === 2) {
            const esCheck = usuariosSeccion.every(u => Number(u.estado_validacion_id) >= 3);
            nuevoEstado = esCheck ? 2 : 3;
        } else if (checkboxId === 3) {
            const esCheck = usuariosSeccion.every(u => Number(u.estado_validacion_id) >= 4);
            nuevoEstado = esCheck ? 3 : 4;
        }

        const mensaje = `¿Estás seguro de que deseas cambiar el estado de validación para todos los usuarios del área "${seccionKey}"?`;
        const confirmar = window.confirm(mensaje);
        if (!confirmar) {
            return;
        }

        try {
            const getAllUserIds = (users) => {
                let ids = [];
                users.forEach(user => {
                    ids.push(user.usuario_id);
                    if (user.subordinados && user.subordinados.length > 0) {
                        ids = ids.concat(getAllUserIds(user.subordinados));
                    }
                });
                return ids;
            };

            const usuariosIds = getAllUserIds(usuariosSeccion);

            const response = await PlanillaService.editarValidacionPlanillaArea(
                usuariosIds,
                nuevoEstado,
                state.user?.usuario_id,
                periodo_pago
            );

            if (response.success) {
                const actualizarEstadoRecursivo = (users) => {
                    return users.map(usuario => {
                        const usuarioActualizado = {
                            ...usuario,
                            estado_validacion_id: nuevoEstado.toString()
                        };
                        if (usuario.subordinados && usuario.subordinados.length > 0) {
                            usuarioActualizado.subordinados = actualizarEstadoRecursivo(usuario.subordinados);
                        }
                        return usuarioActualizado;
                    });
                };

                const usuariosActualizados = actualizarEstadoRecursivo(usuariosSeccion);

                setUsuarios(prevState => ({
                    ...prevState,
                    [seccionKey]: usuariosActualizados
                }));
            } else {
                console.error('La API devolvió un error:', response.message);
            }

        } catch (error) {
            console.error('Error al actualizar la validación:', error);
            alert('Ocurrió un error al guardar los cambios. Inténtalo de nuevo.');
        }
    };

    useEffect(() => {
        getPlanilla();
    }, []);

    return (
        <>
            <div className="flex items-center justify-between">
                <h1>PLANILLA DE PAGO</h1>
                <div className="flex items-center gap-x-4">
                    {[6, 8].includes(Number(state.user?.perfil_id)) && (
                        <button
                        onClick={mostrarModalBonoDescuento}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-blue-700 transition"
                        >
                        <Plus className="w-4 h-4" />
                        Registrar bono o descuento
                        </button>
                    )}
                    {[5, 8, 10].includes(Number(state.user?.perfil_id)) && (
                        <Button
                        onClick={() => exportToExcel(periodo_pago)}
                        className="flex items-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold shadow transition"
                        >
                        <FileSpreadsheet className="w-4 h-4" />
                        Exportar a Excel
                        </Button>
                    )}
                </div>
            </div>
            <div className="filtros">
                <div>
                    <label htmlFor="periodo_fecha">Periodo de pago:</label>
                    <input
                        id="periodo_fecha"
                        type="month"
                        value={periodo_fecha}
                        onChange={(e) => setPeriodoFecha(e.target.value)}
                    />
                </div>
            </div>

            <ButtonSearch 
                onClick={handleButtonClick}
                isLoading={loading}
            />

            {[5, 8].includes(Number(state.user?.perfil_id)) && (<div className="flex justify-end">
                <Button onClick={guardarPlanilla} disabled={guardando || registro_existente} className="boton-guardar">
                    {registro_existente
                        ? <Check size={20} title="Planilla guardada"/>
                        : <Save size={20} title="Guardar planilla" />}
                </Button>
            </div>)}
                {/* {usuarios
                    .filter(u => Number(u.total_pagar) < 0)
                    .map((u, i) => (
                        <div
                            key={`alerta-${u.usuario_id}-${i}`}
                            className="w-full bg-red-100 border-l-4 border-red-500 text-red-900 p-4 rounded-md shadow-sm mb-3 flex items-start gap-3"
                        >
                            <AlertTriangle className="text-red-600 w-6 h-6 mt-1" />
                        <p>
                            <strong>Importante:</strong> Se ha identificado que el colaborador <strong>{u.nombre} {u.apellidos}</strong> presenta descuentos que superan el total de su comisión correspondiente al periodo seleccionado.
                        </p>
                        </div>
                    ))
                } */}
                <div className="loading-contenedor">
            {loading ? (
                <Loader />
                ) : (
                <>
                    {registro_existente && (
                        <div className="table-container table-validacion">
                        <Table >
                            <thead>
                                <tr>
                                    <th rowSpan="2">ÁREA</th>
                                    <th colSpan="3">VALIDADO POR</th>
                                </tr>
                                <tr>
                                    <th>JEFATURA DE RRHH</th>
                                    <th>JEFATURA DE FINANZAS</th>
                                    <th>GERENCIA DE ADMINISTRACIÓN</th>

                                </tr>
                            </thead>
                            <tbody>
                            {secciones.map((seccion, index) => (
                                <tr key={index}>
                                    <td>{seccion.header.toUpperCase()}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(seccion.usuarios) && seccion.usuarios.length > 0 && seccion.usuarios.every(u => Number(u.estado_validacion_id) >= 2)}
                                            disabled={!Array.isArray(seccion?.usuarios) || !seccion.usuarios.length > 0 || !(Number(state.user?.perfil_id) === 5 || Number(state.user?.perfil_id) === 8) || (!seccion.usuarios.every(u => Number(u.estado_validacion_id) === 1 || Number(u.estado_validacion_id) === 2))}
                                            onChange={() => handleCheckboxChange(seccion.key, 1)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(seccion.usuarios) && seccion.usuarios.length > 0 && seccion.usuarios.every(u => Number(u.estado_validacion_id) >= 3)}
                                            disabled={!Array.isArray(seccion?.usuarios) || !seccion.usuarios.length > 0 || !(Number(state.user?.perfil_id) === 13 || Number(state.user?.perfil_id) === 8) || (!seccion.usuarios.every(u => Number(u.estado_validacion_id) === 2 || Number(u.estado_validacion_id) === 3))}
                                            onChange={() => handleCheckboxChange(seccion.key, 2)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(seccion.usuarios) && seccion.usuarios.length > 0 && seccion.usuarios.every(u => Number(u.estado_validacion_id) >= 4)}
                                            disabled={!Array.isArray(seccion?.usuarios) || !seccion.usuarios.length > 0 || !(Number(state.user?.perfil_id) === 10 || Number(state.user?.perfil_id) === 8) || !seccion.usuarios.every(u => Number(u.estado_validacion_id) === 3 )}
                                            onChange={() => handleCheckboxChange(seccion.key, 3)}
                                        />
                                    </td>
                                </tr>
                            ))}                     
                            </tbody>
                    </Table>
                    </div>)}
                    {secciones.map((seccion) => (
                        <Accordion key={seccion.header} className="accordion">
                            <AccordionHeader className="accordion-header">{seccion.header}</AccordionHeader>
                            <AccordionBody>
                                <AccordionUsuarios usuarios={seccion.usuarios} />
                            </AccordionBody>
                        </Accordion>
                    ))}
                </>
            )}
            </div>
            <ModalBonoDescuento
                isOpen={state.modalBonoDescuento}
            />
        </>
    );
}

export default Planilla;
