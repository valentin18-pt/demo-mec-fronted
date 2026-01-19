import axiosPrivate from "./axiosPrivate";

const getSaldoGastos = (perfil_id, periodo_fecha) => {
    return axiosPrivate.post("getSaldoGastos", {
        perfil_id,
        periodo_fecha
    }).then(response => response.data);
};

const insertSaldoGastos = (perfil_id, saldo_inicial) => {
    return axiosPrivate.post("insertSaldoGastos", { 
        perfil_id,
        saldo_inicial 
    })
        .then(response => response.data);
};

const updateSaldoGastos = (perfil_id, saldo_gastos_id, saldo_inicial) => {
    return axiosPrivate.post("updateSaldoGastos", { 
        perfil_id,
        saldo_gastos_id,
        saldo_inicial 
    })
        .then(response => response.data);
};

export default {
    getSaldoGastos,
    insertSaldoGastos,
    updateSaldoGastos
};