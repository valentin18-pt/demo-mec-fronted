import { Table, Button } from "reactstrap";
import React, { useState, useContext, useRef, useEffect } from "react";
import { AppContext } from '../application/provider';
import ModalBonoDescuento from "../components/Modal/ModalBonoDescuento";
import PlanillaService from "../axios_services/planilla.service";
import ArchivoService from "../axios_services/archivos.service";
import {Save, Upload, FileMinus , Edit  } from "lucide-react";
import Loader from "../components/Loader/Loader";
import "./ReciboPorHonorarios.css";

function ReciboPorHonorarios() {
    const [periodo_pago, setPeriodoPago] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [planilla_existente, setPlanillaExistente] = useState('');
    const [planillas, setPlanillas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDocumento, setLoadingDocumento] = useState({ usuarioId:null});
    const [state,setState] = useContext(AppContext);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const isFirstRender = useRef(true);

    const getMontoReciboHonorarios = async () => {
        setLoading(true);
        try {
            const response = await PlanillaService.getMontoReciboHonorarios(state.user?.usuario_id,  periodo_pago , state.user?.perfil_id);
            setPlanillas(response.planillas);
            setPlanillaExistente(response.planilla_existente);
        } catch (error) {
            console.error('Error al obtener monto de planilla cargada:', error);
            setPlanillas([]);
        } finally {
            setLoading(false);
        }
    };

    const formatoSoles = (valor) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(valor || 0);
    };

    const handleFileChange = (event, usuario_id) => {
    const file = event.target.files[0];
    if (file) {
        setUploadedFiles(prevFiles => ({
            ...prevFiles,
            [usuario_id]: file 
        }));
    }
};

const handleSaveClick = async (usuario_id) => {
    const fileToSave = uploadedFiles[usuario_id];
    if (fileToSave) {        
        try {
            await ArchivoService.guardarReciboPorHonorarios(
                fileToSave,
                usuario_id,
                state.user?.usuario_id,
                periodo_pago
            );

            setUploadedFiles(prevFiles => {
                const newFiles = { ...prevFiles };
                delete newFiles[usuario_id];
                return newFiles;
            });

            console.log('Archivo guardado con éxito!');
            getMontoReciboHonorarios();

        } catch (error) {
            console.error('Error al guardar el archivo:', error);
        }
    }
};

    const handleButtonClick = async () => {
        await getMontoReciboHonorarios();
    };

    const handleVerReciboHonorarios = async (usuario_id, periodo_fecha) => {
            try {
              const recibo_honorarios = await ArchivoService.getReciboPorHonorarios(usuario_id, periodo_fecha);
              window.open(recibo_honorarios.url_completa, "_blank", "noopener,noreferrer");
            } catch (error) {
              console.error("Error trayendo recibo por honorarios:", error);
              alert("Hubon un error al cargar el recibo por honorarios.");
            }
          };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const fetchData = async () => {
            await getMontoReciboHonorarios();
        };
        fetchData();
    }, []);

    return (
        <>{loading ? (
        <Loader />
      ) : (
        <> 
            <div >
                <h1>Recibo Por Honorarios</h1>
            </div>
            <div className="filtros">
                    <div>
                        <label htmlFor="periodo_pago">Periodo de pago:</label>
                        <input
                            id="periodo_pago"
                            type="month"
                            value={periodo_pago}
                            onChange={(e) => setPeriodoPago(e.target.value)}
                        />
                    </div>
            </div>
            <Button className="buscar" onClick={handleButtonClick} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular'}
            </Button>
           {
    planilla_existente ? (
        planillas.map(planilla => (
            <div
                key={planilla.usuario_id}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ced4da',
                    borderLeft: '5px solid #fd7e14',
                    borderRadius: '8px',
                    marginTop: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#17a2b8' }}>
                        {planilla.nombre_completo}
                    </p>
                    <p style={{ margin: 0, color: '#6c757d' }}>
                        Monto a emitir: {formatoSoles(planilla.total_pagar)}
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{ marginRight: '10px' }}>
        {planilla.archivo_url === null ? (
            <span title="Recibo por honorarios no adjuntado">
                <FileMinus size={34} className="expediente-faltante" />
            </span>
        ) : (
            <button
                onClick={() => handleVerReciboHonorarios(planilla.usuario_id, periodo_pago)}
                className="expediente-disponible cursor-pointer bg-transparent border-0 p-0"
                title="Recibo por honorarios adjuntado - haz clic para ver"
                type="button"
            >
                <FileMinus size={34} />
            </button>
        )}
    </div>

    <div style={{ marginRight: '10px' }}>
        <label>
            {(planilla.archivo_url === null
            ? <span title="Cargar Recibo por Honorarios"><Upload size={34} color="orange" style={{ cursor: 'pointer' }}/></span>
            : <span title="Editar Recibo por Honorarios"><Edit size={34} color="blue" style={{ cursor: 'pointer' }}/></span>

            )}
            <input
                type="file"
                onChange={(e) => handleFileChange(e, planilla.usuario_id)}
                style={{ display: 'none' }}
                accept=".pdf, .jpeg, .png, .jpg"
            />
        </label>
    </div>

    {uploadedFiles[planilla.usuario_id] && (
        <button
            onClick={() => handleSaveClick(planilla.usuario_id)}
        >
            <span title="Guardar cambio">
                <Save size={34} color="green"/>
            </span>
        </button>
    )}
</div>
                    {uploadedFiles[planilla.usuario_id] && (
                        <p style={{ fontSize: '0.8em', color: '#6c757d', margin: '5px 0 0 0' }}>
                            {uploadedFiles[planilla.usuario_id].name}
                        </p>
                    )}
                </div>
            </div>
        ))
    ) : (
        <p className="mensaje-no-planilla">No hay una planilla para emitir este mes.</p>
    )
}
        </>
      )
        }
        </>
    );
}

export default ReciboPorHonorarios;