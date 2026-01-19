import React, { useState } from 'react';
import { Search, User, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import buscadorDni from "../axios_services/prospectos.service";

const SimuladorPrestamos = () => {
    const [monto, setMonto] = useState(10000);
    const [cuotas, setCuotas] = useState(12);
    const [tea, setTea] = useState(13.5);
    const [frecuencia, setFrecuencia] = useState('Mensual');
    const [gracia, setGracia] = useState(2);
    const [seguroPorcentaje, setSeguroPorcentaje] = useState(0.008);
    const [otros, setOtros] = useState(5);
    const [itf, setItf] = useState(0.005);
    const [resultados, setResultados] = useState(null);
    const [dni, setDni] = useState('');
    const [clienteData, setClienteData] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [clienteNoEncontrado, setClienteNoEncontrado] = useState(false);

    const buroMapping = {
        1: { text: 'BRONCE', color: 'bg-amber-700', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-800', accentColor: '#d97706' },
        2: { text: 'ORO', color: 'bg-yellow-500', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-200', textClass: 'text-yellow-800', accentColor: '#eab308' },
        3: { text: 'DIAMANTE', color: 'bg-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-200', textClass: 'text-blue-800', accentColor: '#3b82f6' },
        4: { text: 'PLATA', color: 'bg-gray-400', bgClass: 'bg-gray-50', borderClass: 'border-gray-200', textClass: 'text-gray-800', accentColor: '#9ca3af' },
        5: { text: 'EXCLUSIVO', color: 'bg-purple-600', bgClass: 'bg-purple-50', borderClass: 'border-purple-200', textClass: 'text-purple-800', accentColor: '#9333ea' },
        default: { text: 'Desconocido', color: 'bg-gray-300', bgClass: 'bg-gray-50', borderClass: 'border-gray-200', textClass: 'text-gray-700', accentColor: '#6b7280' }
    };

    const getBuroInfo = (buroId) => buroMapping[buroId] || buroMapping.default;

    const formatFecha = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    const frecuenciaDias = {
        Diario: 1,
        Quincenal: 15,
        Mensual: 30,
        Bimestral: 60,
        Trimestral: 90,
    };

    const calcularCuota = () => {
        const TASA_DESGRAVAMEN = 0.0001;
        const tem = Math.pow(1 + tea / 100, frecuenciaDias[frecuencia] / 360) - 1;
        const fechaDesembolso = new Date();
        let saldoCapitalInicial = monto;
        let totalInteresesGrace = 0;

        for (let i = 0; i < gracia; i++) {
            const interesGracePeriod = saldoCapitalInicial * tem;
            totalInteresesGrace += interesGracePeriod;
            saldoCapitalInicial += interesGracePeriod;
        }

        const cuotasAmortizacion = cuotas - gracia;

        if (cuotasAmortizacion <= 0) {
            setResultados({
                cuota: (0).toFixed(2),
                pagos: [],
                totalIntereses: totalInteresesGrace.toFixed(2),
                totalSeguros: (0).toFixed(2),
                totalItf: (0).toFixed(2),
                totalPagar: (monto + totalInteresesGrace).toFixed(2),
                tem: (tem * 100).toFixed(4),
                plazoDias: gracia * 30,
                fechaFinal: formatFecha(new Date(fechaDesembolso.getTime() + (gracia * 30 * 24 * 60 * 60 * 1000))),
            });
            return;
        }

        const cuotaBaseAmortizando = saldoCapitalInicial * (tem * Math.pow(1 + tem, cuotasAmortizacion)) / (Math.pow(1 + tem, cuotasAmortizacion) - 1);
        const pagos = [];
        let totalInteresesAmortizacion = 0;
        let totalSegurosYOtros = 0;
        let totalItfAmortizacion = 0;

        let fechaCuota = new Date(fechaDesembolso);
        fechaCuota.setMonth(fechaCuota.getMonth() + gracia);

        for (let i = 0; i < cuotasAmortizacion; i++) {
            const interes = saldoCapitalInicial * tem;
            const capital = cuotaBaseAmortizando - interes;
            
            const desgravamenMonto = saldoCapitalInicial * TASA_DESGRAVAMEN;
            const seguroGarantia = monto * seguroPorcentaje;
            
            const pagoSinItf = capital + interes + desgravamenMonto + seguroGarantia + otros;
            const itfMonto = pagoSinItf * (itf / 100);
            const totalCuota = pagoSinItf + itfMonto;

            pagos.push({
                numero: i + 1,
                fecha: formatFecha(new Date(fechaCuota.setMonth(fechaCuota.getMonth() + 1))),
                dias: frecuenciaDias[frecuencia],
                saldoCapital: saldoCapitalInicial.toFixed(2),
                capital: capital.toFixed(2),
                interes: interes.toFixed(2),
                desgravamen: desgravamenMonto.toFixed(2),
                segGarantia: (seguroGarantia + otros).toFixed(2),
                cuotaFinanciamiento: (capital + interes).toFixed(2),
                itf: itfMonto.toFixed(2),
                total: totalCuota.toFixed(2),
            });
            
            totalInteresesAmortizacion += interes;
            totalSegurosYOtros += desgravamenMonto + seguroGarantia + otros;
            totalItfAmortizacion += itfMonto;
            saldoCapitalInicial -= capital;
        }

        const plazoDiasTotal = gracia * 30 + cuotasAmortizacion * 30;
        const fechaFinalTotal = new Date(fechaDesembolso);
        fechaFinalTotal.setMonth(fechaFinalTotal.getMonth() + cuotas);

        setResultados({
            cuota: cuotaBaseAmortizando.toFixed(2),
            pagos,
            totalIntereses: (totalInteresesGrace + totalInteresesAmortizacion).toFixed(2),
            totalSeguros: totalSegurosYOtros.toFixed(2),
            totalItf: totalItfAmortizacion.toFixed(2),
            totalPagar: (monto + totalInteresesGrace + totalInteresesAmortizacion + totalSegurosYOtros + totalItfAmortizacion).toFixed(2),
            tem: (tem * 100).toFixed(4),
            plazoDias: plazoDiasTotal,
            fechaFinal: formatFecha(fechaFinalTotal),
        });
    };

    const buscarCliente = async () => {
        if (!dni.trim()) return;
        setBuscandoCliente(true);
        setClienteNoEncontrado(false);
        setClienteData(null);
        try {
            const prospecto = await buscadorDni.buscarProspectoPorDni(dni);
            if (prospecto) {
                setClienteData(prospecto);
            } else {
                setClienteNoEncontrado(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setClienteNoEncontrado(true);
            } else {
                console.error("Error al buscar cliente:", error);
            }
        } finally {
            setBuscandoCliente(false);
        }
    };

    const limpiarBusqueda = () => {
        setDni('');
        setClienteData(null);
        setClienteNoEncontrado(false);
    };

    const currentBuroInfo = clienteData ? getBuroInfo(clienteData.buro_id) : buroMapping.default;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
                
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #d1d5db', padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--azul-oscuro)', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                            <Search style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                            Buscar Cliente
                        </h3>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--gris-oscuro)', marginBottom: '5px' }}>
                                DNI del Cliente
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    placeholder="Ingrese DNI"
                                    maxLength="8"
                                    style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--gris-plata)', borderRadius: '20px', fontSize: '10px' }}
                                />
                                <button
                                    onClick={buscarCliente}
                                    disabled={buscandoCliente || !dni.trim()}
                                    style={{ padding: '10px 20px', backgroundColor: 'var(--azul-oscuro)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', cursor: buscandoCliente || !dni.trim() ? 'not-allowed' : 'pointer' }}
                                >
                                    {buscandoCliente ? '...' : 'Buscar'}
                                </button>
                            </div>
                            {dni && (
                                <button
                                    onClick={limpiarBusqueda}
                                    style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gris-oscuro)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    </div>

                    {buscandoCliente && (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <div style={{ width: '32px', height: '32px', border: '3px solid var(--gris-plata)', borderTop: '3px solid var(--azul-oscuro)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ color: 'var(--gris-oscuro)', marginTop: '10px', fontSize: '12px' }}>Buscando cliente...</p>
                        </div>
                    )}

                    {clienteNoEncontrado && (
                        <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626', marginRight: '8px' }} />
                                <h4 style={{ fontWeight: '600', color: '#991b1b', fontSize: '13px' }}>Cliente no encontrado</h4>
                            </div>
                            <p style={{ fontSize: '11px', color: '#991b1b' }}>
                                Este DNI no se encuentra registrado en la base de datos.
                            </p>
                        </div>
                    )}

                    {clienteData && (
                        <div style={{ backgroundColor: currentBuroInfo.bgClass === 'bg-amber-50' ? '#fffbeb' : currentBuroInfo.bgClass === 'bg-yellow-50' ? '#fefce8' : currentBuroInfo.bgClass === 'bg-blue-50' ? '#eff6ff' : currentBuroInfo.bgClass === 'bg-purple-50' ? '#faf5ff' : '#f9fafb', border: `2px solid ${currentBuroInfo.accentColor}`, borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                <User style={{ width: '32px', height: '32px', marginRight: '12px', color: currentBuroInfo.accentColor }} />
                                <div>
                                    <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: currentBuroInfo.accentColor }}>Cliente Encontrado</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                        <CheckCircle style={{ width: '14px', height: '14px', marginRight: '4px', color: currentBuroInfo.accentColor }} />
                                        <span style={{ fontSize: '10px', color: currentBuroInfo.accentColor }}>Datos verificados</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Nombre Completo</label>
                                    <p style={{ fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>{clienteData.nombre || 'No disponible'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Edad</label>
                                    <p style={{ fontWeight: '500', fontSize: '12px', color: '#1f2937' }}>{clienteData.edad || 'No disponible'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Cargo</label>
                                    <p style={{ fontWeight: '500', fontSize: '12px', color: '#1f2937' }}>{clienteData.cargo || 'No disponible'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Deuda Caja</label>
                                    <p style={{ fontWeight: '500', fontSize: '12px', color: '#1f2937' }}>
                                        {clienteData.deuda_caja === 1 || clienteData.deuda_caja === 'S' ? 'Sí' : 'No'}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Saldo Otras Entidades</label>
                                    <p style={{ fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>S/. {clienteData.saldo_otras_entidades?.toLocaleString() || '0'}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>RCC Saldo Caja</label>
                                    <p style={{ fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>S/. {clienteData.rcc_saldo_caja?.toLocaleString() || '0'}</p>
                                </div>
                                {clienteData.rcc_saldo_caja_cony !== undefined && clienteData.rcc_saldo_caja_cony !== null && (
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>RCC Saldo Caja Cónyuge</label>
                                        <p style={{ fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>S/. {clienteData.rcc_saldo_caja_cony?.toLocaleString() || '0'}</p>
                                    </div>
                                )}
                                {clienteData.buro_id !== undefined && clienteData.buro_id !== null && (
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gris-oscuro)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Categoría Buró</label>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '12px', color: 'white', fontSize: '10px', fontWeight: 'bold', backgroundColor: currentBuroInfo.accentColor }}>
                                                {Object.keys(buroMapping).find(key => key == clienteData.buro_id) || 'XX'}
                                            </span>
                                            <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>
                                                {currentBuroInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #d1d5db', padding: '20px' }}>
                    <div style={{ backgroundColor: 'var(--gris-claro)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Monto (S/):</label>
                                <input
                                    type="number"
                                    value={monto}
                                    onChange={e => setMonto(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Cuotas:</label>
                                <input
                                    type="number"
                                    value={cuotas}
                                    onChange={e => setCuotas(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>TEA (%):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tea}
                                    onChange={e => setTea(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Frecuencia:</label>
                                <select
                                    value={frecuencia}
                                    onChange={e => setFrecuencia(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                >
                                    {Object.keys(frecuenciaDias).map(f => <option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Gracia (meses):</label>
                                <input
                                    type="number"
                                    value={gracia}
                                    onChange={e => setGracia(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Seguro (% Factor):</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={seguroPorcentaje}
                                    onChange={e => setSeguroPorcentaje(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>Otros (S/.):</label>
                                <input
                                    type="number"
                                    value={otros}
                                    onChange={e => setOtros(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--azul-oscuro)', marginBottom: '5px' }}>ITF (%):</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={itf}
                                    onChange={e => setItf(+e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: 'none', borderRadius: '20px', fontSize: '10px' }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={calcularCuota}
                            style={{ marginTop: '20px', width: '100%', backgroundColor: 'var(--azul-oscuro)', color: 'white', fontWeight: '600', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                        >
                            Calcular Simulación
                        </button>
                    </div>

                    {resultados && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--gris-plata)', backgroundColor: 'white' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--azul-oscuro)', marginBottom: '15px' }}>Detalles del Financiamiento</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>TEA:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{tea}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>TEM:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{resultados.tem}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>Fecha Vencimiento:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{resultados.fechaFinal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>Plazo total:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{resultados.plazoDias} días</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--gris-plata)', backgroundColor: 'white' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--azul-oscuro)', marginBottom: '15px' }}>Resumen</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>Cuota base:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>S/. {resultados.cuota}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>Intereses:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>S/. {resultados.totalIntereses}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>Seguros y otros:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>S/. {resultados.totalSeguros}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gris-oscuro)' }}>ITF:</span>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>S/. {resultados.totalItf}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gris-plata)', paddingTop: '10px' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--gris-oscuro)' }}>Total a pagar:</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--azul-oscuro)' }}>S/. {resultados.totalPagar}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {resultados && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #d1d5db', overflow: 'hidden' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #d1d5db', backgroundColor: 'var(--gris-claro)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--azul-oscuro)', display: 'flex', alignItems: 'center' }}>
                            <FileText style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                            Plan de Pagos Detallado
                        </h3>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cuota</th>
                                    <th>Frecuencia</th>
                                    <th>Fecha</th>
                                    <th>Días</th>
                                    <th>Saldo Capital</th>
                                    <th>Capital</th>
                                    <th>Interés</th>
                                    <th>Seguro Desgravamen 0.01%</th>
                                    <th>Seguro Garantía y Otros</th>
                                    <th>Cuota por Financiamiento</th>
                                    <th>I.T.F. {itf}%</th>
                                    <th>Cuota Total a Pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.pagos.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.numero}</td>
                                        <td>{frecuencia}</td>
                                        <td>{p.fecha}</td>
                                        <td>{p.dias}</td>
                                        <td>S/. {p.saldoCapital}</td>
                                        <td>S/. {p.capital}</td>
                                        <td>S/. {p.interes}</td>
                                        <td>S/. {p.desgravamen}</td>
                                        <td>S/. {p.segGarantia}</td>
                                        <td>S/. {p.cuotaFinanciamiento}</td>
                                        <td>S/. {p.itf}</td>
                                        <td>S/. {p.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimuladorPrestamos;