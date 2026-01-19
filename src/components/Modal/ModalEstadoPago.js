import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup} from 'reactstrap';
import "./ModalCrearUsuario.css";
import PlanillaService from "../../axios_services/planilla.service";
import Loader from '../../components/Loader/Loader'; 
import {FileMinus, Upload, Save, DollarSign } from "lucide-react";

function ModalEstadoPago({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [monto_transaccion, setMontoTransaccion] = useState('');
    const [monto_diferido, setMontoDiferido] = useState(0);
    const [periodo_pago, setPeriodoPago] = useState('');
    const [estado_pago, setEstadoPago] = useState('');
    const [file, setFile] = useState(null);
    const [estados_pago] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 32}));


    const editarEstadoPago = async () => {
        console.log(state.cargo_pago.periodo_pago)

            try {
                if (Number(estado_pago) === 2 && file == null) {
                    alert("Adjunte la factura de pago.");
                    return;
                }

                if (Number(estado_pago) === 3 && periodo_pago === '') {
                    alert("Ingrese un nuevo periodo de pago para el monto diferido");
                    return;
                }

                if (Number(estado_pago) === 3 && periodo_pago === state.cargo_pago.periodo_pago) {
                    alert("Ingrese un periodo posterior al periodo actual");
                    return;
                }

                await PlanillaService.editarEstadoPago(
                    state.user?.usuario_id,
                    state.cargo_pago.planilla_id, 
                    estado_pago, 
                    periodo_pago, 
                    file, 
                );
                cerrarModal();
                alert("Estado de pago actualizado con éxito");
                setState(prevState => ({
                    ...prevState,
                    isUpdated: true,
                }));
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    alert(`Error: ${error.response.data.error}`);

                } else {
                    alert("Hubo un error al actualizar el estado de pago. Intenta nuevamente.");
                }
            }
    };


    React.useEffect(() => {
        if(state.modalEstadoPago === true){
            setEstadoPago(state.cargo_pago.estado_pago_id);
            setMontoTransaccion(state.cargo_pago.total_pagar);
            setPeriodoPago(state.cargo_pago.periodo_pago);
        }   
    }, [state.modalEstadoPago]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
        }
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalEstadoPago: false,
            cargo_pago: null,
        }));
        setFile(null);
    }; 

return (
    state.modalEstadoPago === true && (<Modal isOpen={state.modalEstadoPago} className="custom-modal" backdrop={true}>
        <ModalHeader className="modal-header">
            <div class="titulo">
                <h1>{state.cargo_pago.gestor}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
            </div>
        </ModalHeader>
    <div class="modal-body-footer">
            {loading ? (
            <Loader />
            ) : (
        <ModalBody className="modal-body">
            <Form>
                <FormGroup className="fila">
                    <label>Estado de Pago:</label>
                    <select
                        name="estado_pago_id"
                        value={estado_pago || ''}
                        onChange={(e) => setEstadoPago(e.target.value)}
                        disabled = {[2, 3].includes(Number(state.cargo_pago.estado_pago_id))}
                    >
                        {estados_pago.map((item) => (
                            <option key={item.tipo_id} value={String(item.tipo_id)}>
                                {item.descripcion}
                            </option>
                        ))}
                    </select>
                </FormGroup >
                {estado_pago === '2' && (<FormGroup className="fila">
                    {/* <button
                        onClick={() => handleVerFacturaPago(state.cargo_pago.usuario_id, periodo_fecha)}
                        className={`archivo-presente bg-transparent border-0 p-0 ${
                        loadingDocumento.usuarioId === cp.usuario_id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                        title="Documento adjuntado - haz clic para ver"
                    >
                        <FileMinus size={20} />
                    </button> */}
                    <label>Factura de pago:</label>
                    <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            disabled={Number(state.cargo_pago.estado_pago_id) === 2}
                    />
                </FormGroup>)}
                {estado_pago === '3' && (<FormGroup className="fila">
                    <label>Nuevo periodo de pago:</label>
                    <input
                            type="month"
                            value={periodo_pago}
                            onChange={(e) => setPeriodoPago(e.target.value)}
                            disabled={Number(state.cargo_pago.estado_pago_id) === 3}
                            min={(() => {
                                const currentPeriod = state.cargo_pago.periodo_pago;
                                if (!currentPeriod) return '';
                                const date = new Date(currentPeriod + '-01');
                                date.setMonth(date.getMonth() + 1);
                                const year = date.getFullYear();
                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                return `${year}-${month}`;
                            })()}
                    />
                </FormGroup>)}
                {/* {estado_pago === '4' && (<>
                    <FormGroup className="fila">
                        <label>Monto a pagar (Este periodo):</label>
                        <div>
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                type="number"
                                value={monto_transaccion}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^\d+(\.\d{0,2})?$/;
                                    if (regex.test(value) || value === '') {
                                        setMontoTransaccion(value);
                                    }
                                }}
                            />
                        </div>
                        </FormGroup>
                        <FormGroup className="fila">
                            <label>Factura de pago:</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                disabled={parseFloat(monto_transaccion) === 0 || monto_transaccion === ''}
                            />
                        </FormGroup>
                        <FormGroup className="fila">
                            <label>Monto a diferir (Periodo a seleccionar):</label>
                            <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                type="number"
                                value={state.cargo_pago.total_pagar - monto_transaccion}
                                disabled
                            />
                            </div>
                        </FormGroup>
                        <FormGroup className="fila">
                            <label>Periodo de pago de monto diferido:</label>
                            <input
                                type="month"
                                value={periodo_pago}
                                onChange={(e) => setPeriodoPago(e.target.value)}
                                disabled={state.cargo_pago.total_pagar - monto_transaccion === 0}
                            />
                        </FormGroup>
                    </>
                )}                  */}
                <div className="button-container">
                    <Button className="button-custom fila" onClick={editarEstadoPago} disabled = {estado_pago === '1' || [2, 3].includes(Number(state.cargo_pago.estado_pago_id))}>
                        ACTUALIZAR
                    </Button>
                </div>
            </Form>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalEstadoPago;