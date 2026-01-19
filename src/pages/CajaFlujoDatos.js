import { Table } from "reactstrap";
import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from '../application/provider';
import CajaDatosService from "../axios_services/cajaflujodatos.service";
import Loader from "../components/Loader/Loader";
import { ButtonUpdate, ButtonInsert, ButtonDelete } from '../components/Buttons/Buttons';
import ModalCajaFlujoConcepto from '../components/Modal/ModalCajaFlujoConcepto';
import ModalCajaFlujoCategoria from '../components/Modal/ModalCajaFlujoCategoria';
import TabsWithTable from '../components/Tabs/TabsWithTable';
import './CajaFlujoDatos.css';

function CajaFlujoDatos() {
    const [state] = useContext(AppContext);
    const [loadingConceptos, setLoadingConceptos] = useState(false);
    const [loadingCategorias, setLoadingCategorias] = useState(false);
    const [tabActiva, setTabActiva] = useState('concepto');
    
    const [conceptos, setConceptos] = useState([]);
    const [isModalConceptoOpen, setIsModalConceptoOpen] = useState(false);
    const [conceptoEditar, setConceptoEditar] = useState(null);
    
    const [categorias, setCategorias] = useState([]);
    const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    
    const initialFetchDone = useRef(false);
    const conceptosFetched = useRef(false);
    const categoriasFetched = useRef(false);
    
    const [tipo_categoria] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 27));

    useEffect(() => {
        if (!initialFetchDone.current) {
            getCajaConceptos();
            initialFetchDone.current = true;
        }
    }, []);

    useEffect(() => {
        if (tabActiva === 'concepto' && !conceptosFetched.current) {
            getCajaConceptos();
        } else if (tabActiva === 'categoria' && !categoriasFetched.current) {
            getCajaCategorias();
        }
    }, [tabActiva]);

    const getCajaConceptos = async () => {
        setLoadingConceptos(true);
        try {
            const response = await CajaDatosService.getCajaConcepto(
                state.user?.perfil_id
            );
            
            if (response.success && response.data) {
                setConceptos(response.data);
            } else {
                setConceptos([]);
            }
            conceptosFetched.current = true;
        } catch (error) {
            console.error('Error al obtener conceptos:', error);
            setConceptos([]);
            const errorMsg = error.response?.data?.message || 'Error al cargar los conceptos';
            alert(errorMsg);
        } finally {
            setLoadingConceptos(false);
        }
    };

    const getCajaCategorias = async () => {
        setLoadingCategorias(true);
        try {
            const response = await CajaDatosService.getCajaCategoria(
                state.user?.perfil_id
            );
            
            if (response.success && response.data) {
                setCategorias(response.data);
            } else {
                setCategorias([]);
            }
            categoriasFetched.current = true;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            setCategorias([]);
            const errorMsg = error.response?.data?.message || 'Error al cargar las categorías';
            alert(errorMsg);
        } finally {
            setLoadingCategorias(false);
        }
    };

    const getTipoCategoria = (tipoId) => {
        const tipo = tipo_categoria.find(t => t.tipo_id == tipoId);
        return tipo ? tipo.descripcion : tipoId;
    };

    const handleEliminarConcepto = async (conceptoId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este concepto?')) {
            return;
        }

        try {
            setLoadingConceptos(true);
            await CajaDatosService.deleteCajaConcepto({
                caja_concepto_id: conceptoId,
                perfil_id: state.user?.perfil_id
            });
            await getCajaConceptos();
            alert('Concepto eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar concepto:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar el concepto';
            alert(errorMsg);
        } finally {
            setLoadingConceptos(false);
        }
    };

    const handleNuevoConcepto = () => {
        setConceptoEditar(null);
        setIsModalConceptoOpen(true);
    };

    const handleEditarConcepto = (concepto) => {
        setConceptoEditar(concepto);
        setIsModalConceptoOpen(true);
    };

    const handleCloseModalConcepto = () => {
        setIsModalConceptoOpen(false);
        setConceptoEditar(null);
    };

    const handleSaveConcepto = async (conceptoData) => {
        try {
            const dataConPerfil = {
                ...conceptoData,
                perfil_id: state.user?.perfil_id
            };
            
            if (conceptoEditar) {
                await CajaDatosService.updateCajaConcepto({
                    ...dataConPerfil,
                    caja_concepto_id: conceptoEditar.caja_concepto_id
                });
                alert('Concepto actualizado correctamente');
            } else {
                await CajaDatosService.insertCajaConcepto(dataConPerfil);
                alert('Concepto agregado correctamente');
            }
            
            await getCajaConceptos();
        } catch (error) {
            console.error('Error al guardar concepto:', error);
            const errorMsg = error.response?.data?.message || 'Error al guardar el concepto';
            alert(errorMsg);
            throw error;
        }
    };

    const handleEliminarCategoria = async (categoriaId) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta categoría?')) {
            return;
        }

        try {
            setLoadingCategorias(true);
            await CajaDatosService.deleteCajaCategoria({
                caja_categoria_id: categoriaId,
                perfil_id: state.user?.perfil_id
            });
            await getCajaCategorias();
            alert('Categoría eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar la categoría';
            alert(errorMsg);
        } finally {
            setLoadingCategorias(false);
        }
    };

    const handleNuevaCategoria = () => {
        setCategoriaEditar(null);
        setIsModalCategoriaOpen(true);
    };

    const handleEditarCategoria = (categoria) => {
        setCategoriaEditar(categoria);
        setIsModalCategoriaOpen(true);
    };

    const handleCloseModalCategoria = () => {
        setIsModalCategoriaOpen(false);
        setCategoriaEditar(null);
    };

    const handleSaveCategoria = async (categoriaData) => {
        try {
            const dataConPerfil = {
                ...categoriaData,
                perfil_id: state.user?.perfil_id
            };
            
            if (categoriaEditar) {
                await CajaDatosService.updateCajaCategoria({
                    ...dataConPerfil,
                    caja_categoria_id: categoriaEditar.caja_categoria_id
                });
                alert('Categoría actualizada correctamente');
            } else {
                await CajaDatosService.insertCajaCategoria(dataConPerfil);
                alert('Categoría agregada correctamente');
            }
            
            await getCajaCategorias();
        } catch (error) {
            console.error('Error al guardar categoría:', error);
            const errorMsg = error.response?.data?.message || 'Error al guardar la categoría';
            alert(errorMsg);
            throw error;
        }
    };

    const mostrarAcciones = () => {
        return [8, 12, 13, 21].includes(Number(state.user?.perfil_id));
    };

    const handleTabChange = (tabKey) => {
        setTabActiva(tabKey);
    };

    const getActionButton = () => {
        if (!mostrarAcciones()) return null;
        
        const loading = tabActiva === 'concepto' ? loadingConceptos : loadingCategorias;
        
        return (
            <ButtonInsert 
                onClick={tabActiva === 'concepto' ? handleNuevoConcepto : handleNuevaCategoria} 
                disabled={loading}
            />
        );
    };

    const renderConceptosTable = () => {
        if (loadingConceptos) {
            return <Loader />;
        }

        return (
            <div className="table-container">
                <Table hover size="sm">
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Concepto</th>
                            {mostrarAcciones() && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {conceptos.length > 0 ? (
                            conceptos.map((concepto) => (
                                <tr key={concepto.caja_concepto_id}>
                                    <td>{concepto.nombre_categoria}</td>
                                    <td>{concepto.nombre_concepto || 'Sin nombre'}</td>
                                    {mostrarAcciones() && (
                                        <td>
                                            <div className="acciones-container">
                                                <ButtonUpdate 
                                                    onClick={() => handleEditarConcepto(concepto)}
                                                />
                                                <ButtonDelete 
                                                    onClick={() => handleEliminarConcepto(concepto.caja_concepto_id)} 
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={mostrarAcciones() ? "3" : "2"} className="text-center">
                                    No hay conceptos disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        );
    };

    const renderCategoriasTable = () => {
        if (loadingCategorias) {
            return <Loader />;
        }

        return (
            <div className="table-container">
                <Table hover size="sm">
                    <thead>
                        <tr>
                            <th>Nombre Categoría</th>
                            <th>Tipo</th>
                            {mostrarAcciones() && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.length > 0 ? (
                            categorias.map((categoria) => (
                                <tr key={categoria.caja_categoria_id}>
                                    <td>{categoria.nombre_categoria}</td>
                                    <td>{getTipoCategoria(categoria.tipo_id)}</td>
                                    {mostrarAcciones() && (
                                        <td>
                                            <div className="acciones-container">
                                                <ButtonUpdate 
                                                    onClick={() => handleEditarCategoria(categoria)}
                                                />
                                                <ButtonDelete 
                                                    onClick={() => handleEliminarCategoria(categoria.caja_categoria_id)} 
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={mostrarAcciones() ? "3" : "2"} className="text-center">
                                    No hay categorías disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        );
    };

    const tabs = [
        {
            key: 'concepto',
            label: 'Conceptos',
            content: renderConceptosTable()
        },
        {
            key: 'categoria',
            label: 'Categorías',
            content: renderCategoriasTable()
        }
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1>FLUJO DE CAJA - DATOS</h1>
            </div>

            <TabsWithTable
                tabs={tabs}
                defaultTab="concepto"
                actionButton={getActionButton()}
                onTabChange={handleTabChange}
            />

            <ModalCajaFlujoConcepto
                onSave={handleSaveConcepto}
                onClose={handleCloseModalConcepto}
                isOpen={isModalConceptoOpen}
                perfilId={state.user?.perfil_id}
                conceptoEditar={conceptoEditar}
            />

            <ModalCajaFlujoCategoria
                onSave={handleSaveCategoria}
                onClose={handleCloseModalCategoria}
                isOpen={isModalCategoriaOpen}
                categoriaEditar={categoriaEditar}
            />
        </>
    );
}

export default CajaFlujoDatos;