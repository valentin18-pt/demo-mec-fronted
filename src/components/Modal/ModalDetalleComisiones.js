import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input, Table } from 'reactstrap';

const ModalDetalleComisiones = ({ 
  isOpen, 
  onClose, 
  gestorDetalle 
}) => {
  const formatoSSoles = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(monto);
  };

  const obtenerNombreTipoComision = (tipo) => {
    const tipos = {
      'honorarios_exito_monto': 'Honorarios de éxito según monto',
      'incremento_resultado_monto': 'Incremento de resultado según monto',
      'honorarios_exito_meta': 'Honorarios de éxito según meta',
      'incremento_resultado_meta': 'Incremento de resultado según meta',
      'bono_alcance_meta': 'Bono por alcance de meta'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" backdrop="static" fade={false}>
      <ModalHeader className="modal-header">
        <div className="titulo">
          <h1>DETALLE DE COMISIÓN</h1>
          <Button className="close-btn" onClick={onClose}>X</Button>
        </div>
      </ModalHeader>
      <div className="modal-body-footer">
        {gestorDetalle && (
          <ModalBody className="modal-body">
            <Form className="fila">
              <FormGroup>
                <Label className="font-weight-bold">Gestor:</Label>
                <div style={{ 
                  padding: '3px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '10px', color: '#333333' }}>
                    {gestorDetalle.nombre_completo}
                  </span>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Monto Neto:</Label>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '10px', color: '#333333' }}>
                    Total
                  </span>
                  <span style={{ fontSize: '10px', color: '#333333', fontWeight: '500' }}>
                    S/ {gestorDetalle.monto_total.toFixed(2)}
                  </span>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>
                  Comisiones Aplicadas:
                </Label>
                
                {gestorDetalle.comisiones && Object.keys(gestorDetalle.comisiones).length > 0 ? (
                  <div>
                    {Object.entries(gestorDetalle.comisiones).map(([tipo, monto]) => (
                      monto > 0 && (
                        <div key={tipo} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '8px 12px',
                          backgroundColor: '#ffffff',
                          marginBottom: '8px',
                          borderRadius: '12px',
                        }}>
                          <span style={{ fontSize: '10px', color: '#333333' }}>
                            {obtenerNombreTipoComision(tipo)}:
                          </span>
                          <span style={{ fontSize: '10px', color: '#333333', fontWeight: '500' }}>
                            {formatoSSoles(monto)}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '10px', color: '#6c757d', fontStyle: 'italic', fontSize: '10px' }}>
                    No hay comisiones aplicadas
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  Comisión:
                </Label>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '10px', color: '#333333' }}>
                    Total
                  </span>
                  <span style={{ fontSize: '10px', color: '#333333', fontWeight: '500' }}>
                    S/ {gestorDetalle.comision_total.toFixed(2)}
                  </span>
                </div>
              </FormGroup>

              {gestorDetalle.detalles_comision && gestorDetalle.detalles_comision.length > 0 && (
                <FormGroup>
                  <Label>
                    Detalles por Rango:
                  </Label>
                  <div className="table-container">
                    <Table>
                      <thead>
                        <tr>
                          <th>Tipo de Comisión</th>
                          <th className="text-center">Rango</th>
                          <th className="text-center">Valor</th>
                          <th className="text-center">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gestorDetalle.detalles_comision.map((detalle, index) => (
                          <tr key={index}>
                            <td>{detalle.tipo}</td>
                            <td className="text-center">
                              {detalle.avance_porcentaje !== undefined ? (
                                <>
                                  <div>Avance: {detalle.avance_porcentaje}%</div>
                                  {detalle.meta && (
                                    <div>
                                      Meta: {formatoSSoles(detalle.meta)}
                                    </div>
                                  )}
                                  {detalle.meta_periodo && (
                                    <div>
                                      {detalle.meta_periodo}
                                    </div>
                                  )}
                                  <div>
                                    Rango: {detalle.rango.min}% - {detalle.rango.max === null ? 'En adelante' : detalle.rango.max + '%'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {formatoSSoles(detalle.rango.min)} - {detalle.rango.max === 9999999.99 ? 'En adelante' : formatoSSoles(detalle.rango.max)}
                                </>
                              )}
                            </td>
                            <td className="text-center">
                              {detalle.rango.tipo_pago === 'Porcentaje' 
                                ? `${detalle.rango.valor_pago}%`
                                : formatoSSoles(detalle.rango.valor_pago)
                              }
                            </td>
                            <td>
                              {formatoSSoles(detalle.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3">
                            TOTAL:
                          </td>
                          <td>
                            {formatoSSoles(gestorDetalle.comision_total)}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </FormGroup>
              )}

              <FormGroup style={{ marginTop: '20px' }}>
                <div className="button-container">
                  <Button className="button-custom" onClick={onClose} color="secondary">
                    CERRAR
                  </Button>
                </div>
              </FormGroup>
            </Form>
          </ModalBody>
        )}
      </div>
    </Modal>
  );
};

export default ModalDetalleComisiones;