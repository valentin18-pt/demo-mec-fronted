import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Toast, ToastBody, ToastHeader, Form, FormGroup} from 'reactstrap';
import "./ModalEditProspectos.css";
import ProspectoService from "../../axios_services/prospectos.service";
import ArchivoService from "../../axios_services/archivos.service";
import Loader from '../../components/Loader/Loader'; 

function ModalEditProspectos ({isOpen}) {
    const [state,setState] = useContext(AppContext);
    const [showToast, setShowToast] = useState(false);
    const [descripcion, setDescripcion] = useState('');
    const [estado_id, setEstadoId] = useState(state.estado_id || '');
    const [comentarios, setComentarios] = useState([]);
    const [celulares, setCelulares] = useState([]);
    const [rcc_detallado, setRCCDetallado] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [changedCells, setChangedCells] = useState({});
    const [audio, setAudio] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isOpenAcordeon1, setIsOpenAcordeon1] = useState(false);
    const [isOpenAcordeon2, setIsOpenAcordeon2] = useState(false);
    const [isOpenAcordeon3, setIsOpenAcordeon3] = useState(false);
    const [isOpenAcordeon4, setIsOpenAcordeon4] = useState(false);
    //CATALOGOS
    const [estado,setEstado] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 9}));
    const [estado_civil,setEstadoCivil] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 4}));
    const [condicion_contrato,setCondicionContrato] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 13}));
    const [tipo_credito,setTipoCredito] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 17}));

    const toggleAccordion1 = () => setIsOpenAcordeon1(!isOpenAcordeon1);
    const toggleAccordion2 = () => setIsOpenAcordeon2(!isOpenAcordeon2);
    const toggleAccordion3 = () => setIsOpenAcordeon3(!isOpenAcordeon3);
    const toggleAccordion4 = () => setIsOpenAcordeon4(!isOpenAcordeon4);

    const createComentario = async () => {
        setIsSaved(true);
        try {
            const data = await ProspectoService.createComentario(
                state.prospecto.prospecto_id, 
                descripcion,
                state.user?.usuario_id, 
                state.contactado,
                estado_id,
            );
            setState((prevState) => ({
                ...prevState,
                contactado: state.contactado,
                estado_id: estado_id,
                isUpdated: true
            }));
            alert("Seguimiento registrado con éxito");
            setIsSaved(false);
            await getComentarios(state.prospecto.prospecto_id, state.user?.usuario_id, state.user?.perfil_id, state.user?.zonal_id);
            setDescripcion('');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert(`Error: ${error.response.data.error}`);
                setState((prevState) => ({
                    ...prevState,
                    isUpdated: true
                }));
            } else {
                alert("Hubo un error al registrar el seguimiento. Intenta nuevamente.");
            }
            setIsSaved(false);
        }
    };

    const getComentarios = async () => {
        const data = await ProspectoService.getComentarios(state.prospecto.prospecto_id, state.user?.usuario_id, state.user?.perfil_id, state.user?.zonal_id);
        setComentarios(data);
        setState((prevState) => ({
            ...prevState,
            estado_id: state.estado_id
        }));
    };

    // const guardarAudio = async (prospecto_id, usuario_id, archivo_audio) => {
    //     const data = await ArchivoService.guardarAudio(prospecto_id, usuario_id, archivo_audio);
    // };
    
    // const getAudio = async () => {
    //     try {
    //         const audioResponse  = await ArchivoService.getAudio(state.prospecto.prospecto_id);
    //         setAudio(audioResponse);
    //     } catch (error) {
    //         console.error("No se pudo cargar el audio.", error);
    //     }
    // }

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalEditProspectos: false,
            isUpdated: false,
            contactado: null,  
            estado_id: null, 
            prospecto_id: null,
            prospecto_nombre: null
        }));
        setShowToast(false);
        setDescripcion('');
        setIsOpenAcordeon1(false);
        setIsOpenAcordeon2(false);
        setIsOpenAcordeon3(false);
        setIsOpenAcordeon4(false);
        setAudio(null);
        setAudioFile(null);
        setEstadoId(null)
    }; 

    React.useEffect(() => {
        if(state.modalEditProspectos){setLoading(true);
        const fetchData = async () => {
            if (state.prospecto.prospecto_id) {
                try {
                    await Promise.all([
                        getComentarios(),
                        // getAudio()
                    ]);
                } catch (error) {
                    console.error('Error al obtener los datos:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchData();}
    }, [state.prospecto]);


    const handleCheckboxChange = (id) => {
        setCelulares(prevCelulares => {
          const updatedCelulares = prevCelulares.map(celular =>
            celular.celular_id === id
              ? { 
                  ...celular, 
                  celular_verificado: celular.celular_verificado === "1" ? "0" : "1" 
                }
              : celular
          );
          return updatedCelulares;
        });
        setChangedCells(prevState => ({
            ...prevState,
            [id]: !prevState[id]
          }));
      };

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioFile(file);
        }
    };


    return(
        state.modalEditProspectos === true && (<Modal isOpen={state.modalEditProspectos} className="modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>{state.prospecto.nombre}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <div class="modal-body-footer">
            {loading ? (
                <Loader />
            ) :  (
            <ModalBody className="modal-body">
                {/* <div className="fila">
                    <h2 
                        onClick={toggleAccordion4} 
                        className={`accordion-title ${isOpenAcordeon4 ? 'open' : ''}`}
                    >
                        CARGAR AUDIO
                        <span>▼</span>
                    </h2>
                    <div className={`accordion-content ${isOpenAcordeon4 ? 'open' : ''}`}>
                        {audio === null && (<div>
                        <input
                            className="accordion-audio-input"
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                        />
                        <p className="file-format-info">
                            Solo se aceptan archivos .mp3 y .ogg, con un tamaño máximo de 10MB.
                        </p>
                        <Button 
                            className="accordion-audio-button"
                            disabled = {!audioFile}
                            onClick={() => {
                                setIsLoadingAudio(true);
                                if (audioFile || isLoadingAudio) {
                                    guardarAudio(state.prospecto.prospecto_id, state.user?.usuario_id, audioFile);
                                    setAudioFile(null);
                                    getAudio();
                                } else {
                                    console.error("Por favor selecciona un archivo de audio.");
                                }
                                setIsLoadingAudio(false);
                            }}
                        >
                            {isLoadingAudio ? "Cargando..." : "Grabar audio"}
                        </Button>
                        </div>)}
                        {audio !== null &&(<Table>
                            <thead>
                                <tr>
                                    <th>Audio</th>
                                    <th>Fecha de registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="audio-wrapper">
                                            <audio className="audio-table" controls>
                                                <source src={audio.url_completa} type="audio/mpeg" />
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        </div>
                                    </td>
                                    <td>{new Date(audio.created_at).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </Table>)}
                    </div>
                </div> */}
                <div className="fila">
                {/* <h2>
                    VER Y EDITAR SEGUIMIENTO
                </h2> */}
                <div class="filter-colum1"> 
                    <Form>    
                    <label htmlFor="contactado">Contactado:</label>
                    <select
                        id="contactado"
                        value={state.contactado}
                        onChange={(e) => setState({ ...state, contactado: e.target.value })}
                        disabled = {Number(state.estado_id) === 3 || Number(state.estado_id) === 11 || Number(state.prospecto.gestor_id) != state.user?.usuario_id || (Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4)}
                        >
                        <option value="">Seleccione...</option>
                        <option value="S">Si</option>
                        <option value="N">No</option>
                    </select>
                    <label htmlFor="estado">Estado:</label>
                    <select
                        id="estado"
                        value={(estado_id == ''||estado_id ===null) ? state.estado_id: estado_id}
                        onChange={(e) => setEstadoId(e.target.value)}
                        disabled = {Number(state.estado_id) === 3 || Number(state.estado_id) === 11 || Number(state.prospecto.gestor_id) != state.user?.usuario_id || (Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4)}
                        >
                        <option value="">Seleccione...</option>
                        {state.contactado && estado
                            .filter((item) => 
                                state.contactado === "S" 
                                    ? (item.tipo_id >= 1 && item.tipo_id <= 5) || (item.tipo_id >= 9 && item.tipo_id <= 11) 
                                    : (item.tipo_id >= 6 && item.tipo_id <= 9)
                            )
                            .map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id} disabled={state.contactado === "S" && (Number(item.tipo_id) === 4 || Number(item.tipo_id) === 5
                                    || Number(item.tipo_id) === 11)}>
                                    {item.descripcion}
                                </option>
                            ))}  
                    </select>
                    <FormGroup className="recordatorio-input">
                    <label >Comentario nuevo:</label>
                        <input 
                            className="form-control"
                            name="cargo"
                            type="text" 
                            maxLength={20} 
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)} 
                            disabled={
                                Number(state.estado_id) === 3 || 
                                Number(state.estado_id) === 11 || 
                                Number(state.prospecto.gestor_id) != state.user?.usuario_id || 
                                (Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4)
                            }
                        />
                        <small>{(descripcion.length || 0)} / 30</small>
                        </FormGroup>
                    </Form>     
                <div className="button-container">
                    <Button 
                        disabled = {Number(state.estado_id) === 3 || Number(state.estado_id) === 11 || Number(state.prospecto.gestor_id) != state.user?.usuario_id || (Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4)}
                        onClick={async () => {
                            setIsSaved(true)
                            if (descripcion.trim()) {
                                await createComentario();
                            } 
                            setIsSaved(false)
                    }}>
                        Registrar comentario
                    </Button>
                </div>
                
                <div className="row-container">
                    {showToast && (
                    <Toast className="message">
                        <ToastHeader>
                            Notificación
                        </ToastHeader>
                        <ToastBody>
                            Prospecto actualizado
                        </ToastBody>
                    </Toast>
                    )}
                </div>
                    <div className="table-container">
                    <Table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Contactado</th>
                            <th>Estado</th>
                            <th class="fixed-width">Comentario</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comentarios.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-solicitudes">Sin seguimiento</td>
                            </tr>
                        ) :(comentarios
                        .map((comentario, index) => (
                            <tr>
                                <td>{comentario.gestor_nombre ? comentario.gestor_nombre : 'N/A'}</td>
                                <td>{comentario.contactado ? comentario.contactado : 'N/A'}</td>
                                <td>
                                    {estado.find(item => item.tipo_id === comentario.estado_id)
                                        ? estado.find(item => item.tipo_id === comentario.estado_id).descripcion
                                        : 'N/A'}
                                </td>
                                <td class="fixed-width">{comentario.descripcion}</td>
                                <td>{new Date(comentario.created_at).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }).replace(',', '')}</td>
                            </tr>
                        )))}
                    </tbody>
                    </Table>
                     </div>
                </div>
                </div>
            </ModalBody>)}
            </div>
        </Modal>)
    );
}

export default ModalEditProspectos;