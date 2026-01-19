import axiosPrivate from "./axiosPrivate";

const getProspectos = (...args) => {
    const [
        usuario_id, perfil_id, dni, nombre, edad_max, num_entidad_titular,
        num_entidad_conyuge, saldo_otras_entidades_max, saldo_caja_max,
        deuda_caja, monto_cuota, promedio_mora, afecta_boleta,
        consentimiento_datos, atraso_aval, buro_id, contactado,
        estado_id, contrato_condicion, razon_social_id, gestor_id,
        celular, rows_per_page, page
    ] = args;

    return axiosPrivate.post("getProspectos", {
        usuario_id, perfil_id, dni, nombre, edad_max, num_entidad_titular,
        num_entidad_conyuge, saldo_otras_entidades_max, saldo_caja_max,
        deuda_caja, monto_cuota, promedio_mora, afecta_boleta,
        consentimiento_datos, atraso_aval, buro_id, contactado,
        estado_id, contrato_condicion, razon_social_id, gestor_id,
        celular, rows_per_page, page
    }).then(response => response.data);
};

const insertarProspecto = (...args) => {
    const [
        nombre, dni, institucion, cargo, contrato_condicion,
        rango_ingresos, celular, usuario_id, zonal_id
    ] = args;

    return axiosPrivate.post("insertarProspecto", {
        nombre, dni, institucion, cargo, contrato_condicion,
        rango_ingresos, celular, usuario_id, zonal_id
    }).then(response => response.data);
};

const getProspecto = (prospecto_id) => {
    return axiosPrivate.post("getProspecto", { prospecto_id })
        .then(response => response.data);
};

const getNProspectos = (...args) => {
    const [
        usuario_id, perfil_id, zonal_id, dni, nombre, edad_max,
        num_entidad_titular, num_entidad_conyuge, saldo_otras_entidades_max,
        saldo_caja_max, buro_id, contactado, estado_id,
        contrato_condicion, razon_social_id, celular, gestor_id
    ] = args;

    return axiosPrivate.post("getNProspectos", {
        usuario_id, perfil_id, zonal_id, dni, nombre, edad_max,
        num_entidad_titular, num_entidad_conyuge, saldo_otras_entidades_max,
        saldo_caja_max, buro_id, contactado, estado_id,
        contrato_condicion, razon_social_id, celular, gestor_id
    }).then(response => response.data);
};

const updateProspecto = (prospecto_id, contactado, estado_id) => {
    return axiosPrivate.post("updateProspecto", {
        prospecto_id, contactado, estado_id
    }).then(response => response.data);
};

const registrarGestorProspecto = (prospecto_ids, gestores_id, usuario_id, perfil_id, zonal_id) => {
    return axiosPrivate.post("registrarGestorProspecto", {
        prospecto_ids, gestores_id, usuario_id, perfil_id, zonal_id
    }).then(response => response.data);
};

const registrarGestorAleatorio = (n_prospecto, gestores_id, usuario_id, perfil_id, zonal_id) => {
    return axiosPrivate.post("registrarGestorAleatorio", {
        n_prospecto, gestores_id, usuario_id, perfil_id, zonal_id
    }).then(response => response.data);
};

const getReporteContactados = (usuario_id, perfil_id, periodo_fecha, zonal_id, supervisor_id, gestor_id) => {
    return axiosPrivate.post("getReporteContactados", {
        usuario_id, perfil_id, periodo_fecha, zonal_id, supervisor_id, gestor_id
    }).then(response => response.data);
};

const createComentario = (prospecto_id, descripcion, usuario_id, contactado, estado_id) => {
    return axiosPrivate.post("createComentario", {
        prospecto_id, descripcion, usuario_id, contactado, estado_id
    }).then(response => response.data);
};

const getComentarios = (prospecto_id, usuario_id, perfil_id, zonal_id) => {
    return axiosPrivate.post("getComentarios", {
        prospecto_id, usuario_id, perfil_id, zonal_id
    }).then(response => response.data);
};

const getRCCDetalladoByProspecto = (prospecto_id) => {
    return axiosPrivate.post("getRCCDetalladoByProspecto", { prospecto_id })
        .then(response => response.data);
};

const getCelularesByProspecto = (prospecto_id) => {
    return axiosPrivate.post("getCelularesByProspecto", { prospecto_id })
        .then(response => response.data);
};

const updateCelularVerificado = (celular_id, celular_verificado) => {
    return axiosPrivate.post("updateCelularVerificado", {
        celular_id, celular_verificado
    }).then(response => response.data);
};

const createPropuestaSolicitud = (
    monto_neto_propuesto, monto_bruto_propuesto, fecha_envio,
    asesor_solicitante, asesor_responsable, prospecto_id, agencia_id,
    responsable_agencia_id, monto_neto_final, monto_bruto_final,
    tasa, plazo, desembolso_id, canal_captacion_id, dni, nombre, razon_social_id
) => {
    return axiosPrivate.post("createPropuestaSolicitud", {
        monto_neto_propuesto, monto_bruto_propuesto, fecha_envio,
        asesor_solicitante, asesor_responsable, prospecto_id, agencia_id,
        responsable_agencia_id, monto_neto_final, monto_bruto_final,
        tasa, plazo, desembolso_id, canal_captacion_id, dni, nombre, razon_social_id
    }).then(response => response.data);
};

const getPropuestasSolicitud = (prospecto_id) => {
    return axiosPrivate.post("getPropuestasSolicitud", { prospecto_id })
        .then(response => response.data);
};

const updatePropuestaSolicitud = (propuesta_solicitud_id, monto_final) => {
    return axiosPrivate.post("updatePropuestaSolicitud", {
        propuesta_solicitud_id, monto_final
    }).then(response => response.data);
};

const liberarDesembolsadoProspecto = (prospecto_id, usuario_id) => {
    return axiosPrivate.post("liberarDesembolsadoProspecto", {
        prospecto_id, usuario_id
    }).then(response => response.data);
};

const getSeguimientoSolicitud = (propuesta_solicitud_id) => {
    return axiosPrivate.post("getSeguimientoSolicitud", {
        propuesta_solicitud_id
    }).then(response => response.data);
};

const createComentarioSolicitud = (
    propuesta_solicitud_id, usuario_id, comentario, estado_id,
    monto_neto_final, monto_bruto_final, tasa, plazo,
    fecha_desembolso, responsable_agencia_id, dni, nombre, prospecto_id
) => {
    return axiosPrivate.post("createComentarioSolicitud", {
        propuesta_solicitud_id, usuario_id, comentario, estado_id,
        monto_neto_final, monto_bruto_final, tasa, plazo,
        fecha_desembolso, responsable_agencia_id, dni, nombre, prospecto_id
    }).then(response => response.data);
};

const getReporteProspectosEvaluacion = (
    dni, nombre, estado_id, zonal_id, gestor_id, dias_transcurridos
) => {
    return axiosPrivate.post("getReporteProspectosEvaluacion", {
        dni, nombre, estado_id, zonal_id, gestor_id, dias_transcurridos
    }).then(response => response.data);
};

const updateEvaluacionProspecto = (
    prospecto_id, zonal_id, gestor_id, usuario_id, estado_id
) => {
    return axiosPrivate.post("updateEvaluacionProspecto", {
        prospecto_id, zonal_id, gestor_id, usuario_id, estado_id
    }).then(response => response.data);
};

const buscarProspectoPorDni = (dni) => {
    return axiosPrivate.post(`getBuscarPorDNI?dni=${dni}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al buscar prospecto por DNI:", error);
            throw error;
        });
};

const getProspectosEvaluacionPorDia = (
    usuario_id, perfil_id, periodo_fecha, zonal_id, supervisor_id, gestor_id
) => {
    return axiosPrivate.post("getProspectosEvaluacionPorDia", {
        usuario_id, perfil_id, periodo_fecha, zonal_id, supervisor_id, gestor_id
    }).then(response => response.data);
};

export default {
    getProspectos,
    getProspecto,
    getNProspectos,
    updateProspecto,
    registrarGestorProspecto,
    registrarGestorAleatorio,
    getReporteContactados,
    createComentario,
    getComentarios,
    getRCCDetalladoByProspecto,
    getCelularesByProspecto,
    updateCelularVerificado,
    getPropuestasSolicitud,
    createPropuestaSolicitud,
    updatePropuestaSolicitud,
    getSeguimientoSolicitud,
    createComentarioSolicitud,
    insertarProspecto,
    getReporteProspectosEvaluacion,
    updateEvaluacionProspecto,
    liberarDesembolsadoProspecto,
    buscarProspectoPorDni,
    getProspectosEvaluacionPorDia
}