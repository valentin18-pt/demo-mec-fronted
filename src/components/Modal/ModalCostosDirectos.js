import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import './ModalCostosDirectos.css';

function ModalCostosDirectos({ isOpen, toggle, usuario, tipoUsuario }) {
    const formatoSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    if (!usuario) return null;

    const getTituloModal = () => {
        const nombreCompleto = `${usuario.apellidos}, ${usuario.nombre}`.toUpperCase();
        return `${tipoUsuario.toUpperCase()}: ${nombreCompleto}`;
    };

    const esGestor = () => Number(usuario.perfil_id) === 4;

    return (
        <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
            <ModalHeader className="modal-header">
                <div className="titulo">
                    <h1>{getTituloModal()}</h1>
                    <Button className="close-btn" onClick={toggle}>X</Button>
                </div>
            </ModalHeader>
            <div className="modal-body-footer">
                <ModalBody className="modal-body">
                    <div className="p-3">
                        <h6 className="font-weight-bold mb-3">DETALLE DE PAGO</h6>
                        <table className="table table-sm table-bordered tabla-detalle-costos-directos">
                            <tbody>
                                {esGestor() ? (
                                    <tr>
                                        <td className="py-2"><strong>Total Comisión:</strong></td>
                                        <td className="py-2 text-right">{formatoSoles(Number(usuario.suma_comision) || 0)}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td className="py-2"><strong>Sueldo Base:</strong></td>
                                        <td className="py-2 text-right">{formatoSoles(Number(usuario.sueldo_base) || 0)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-2"><strong>Bono Honorario Éxito:</strong></td>
                                    <td className="py-2 text-right">
                                        {usuario.bono_honorario_exito === "No aplica" ? "No aplica" : formatoSoles(Number(usuario.bono_honorario_exito) || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2"><strong>Bono Rotación:</strong></td>
                                    <td className="py-2 text-right">
                                        {usuario.bono_rotacion === "No aplica" ? "No aplica" : formatoSoles(Number(usuario.bono_rotacion) || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2"><strong>Bono Equipo:</strong></td>
                                    <td className="py-2 text-right">
                                        {usuario.bono_equipo === "No aplica" ? "No aplica" : formatoSoles(Number(usuario.bono_equipo) || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2"><strong>Bono Incremento Resultado:</strong></td>
                                    <td className="py-2 text-right">
                                        {usuario.bono_incremento_resultado === "No aplica" ? "No aplica" : formatoSoles(Number(usuario.bono_incremento_resultado) || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2"><strong>Bono Extra:</strong></td>
                                    <td className="py-2 text-right">
                                        {usuario.bono_extra === "No aplica" ? "No aplica" : formatoSoles(Number(usuario.bono_extra) || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2"><strong>TOTAL A PAGAR:</strong></td>
                                    <td className="py-2 text-right"><strong>{formatoSoles(Number(usuario.total_pagar) || 0)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
}

export default ModalCostosDirectos;