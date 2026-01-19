import React, { useRef, useState, useContext, useEffect } from "react";
import { AppContext } from "../application/provider";
import "./Prospectos.css";
import { Container, Button } from "reactstrap";
import ProspectoService from "../axios_services/prospectos.service";
import PadronService from "../axios_services/catalogo.service";
import ModalEditProspectos from "../components/Modal/ModalEditProspectos";
import ModalPropuestaSolicitud from "../components/Modal/ModalPropuestaSolicitud";
import ModalNuevoProspecto from "../components/Modal/ModalNuevoProspecto";
import { MultiSelect, MultiSelectItem, SearchSelect, SearchSelectItem } from "@tremor/react";
import Loader from "../components/Loader/Loader";
import Pagination from "../components/Pagination/Pagination";
import { ButtonInsert } from '../components/Buttons/Buttons';
import TabsWithTable from "../components/Tabs/TabsWithTable";
import {
  TablaSeguimiento,
  TablaDatosPersonales,
  TablaHistorialCredito,
  TablaDetallesRCC,
  useTablaHandlers,
} from "../components/Tablas/TablasProspectos";

function Prospectos() {
  const [prospectos, setProspectos] = useState([]);
  const [instituciones_filtradas, setInstitucionesFiltradas] = useState([]);
  const [celular, setCelular] = useState([]);
  const [edad_max, setEdadMax] = useState("");
  const [zonal_id, setZonalId] = useState(null);
  const [saldo_otras_entidades_max, setSaldoOtrasEntidadesMax] = useState("");
  const [saldo_caja_max, setSaldoCajaMax] = useState("");
  const [num_entidad_titular, setNumEntidadTitular] = useState("");
  const [num_entidad_conyuge, setNumEntidadConyuge] = useState("");
  const [prospectos_seleccionados, setProspectosSeleccionados] = useState([]);
  const [state, setState] = useContext(AppContext);
  const [gestoresSeleccionados, setGestoresSeleccionados] = useState([]);
  const [asignar, setAsignar] = useState(false);
  const [isBuscar, setIsBuscar] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [asignacion_activa, setAsignacionActiva] = useState(false);
  const [page, setPage] = useState(1);
  const [rows_per_page, setRowsPerPage] = useState(10);
  const [total_prospectos, setTotalProspectos] = useState(100);
  const [tabActiva, setTabActiva] = useState('seguimiento');
  
  //FILTROS
  const [dni, setDni] = useState("");
  const [razon_social, setRazonSocial] = useState("");
  const [nombre, setNombre] = useState("");
  const [gestor, setGestor] = useState("");
  const [buro2, setBuro2] = useState("");
  const [estado2, setEstado2] = useState("");
  const [contactado, setContactado] = useState("");
  const [contrato_condicion2, setContratoCondicion2] = useState("");
  const [deuda_caja, setDeudaCaja] = useState("");
  const [monto_cuota, setMontoCuota] = useState("");
  const [promedio_mora, setPromedioMora] = useState("");
  const [afecta_boleta, setAfectaBoleta] = useState("");
  const [consentimiento_datos, setConsentimientoDatos] = useState("");
  const [atraso_aval, setAtrasoAval] = useState("");
  const hasFetched = useRef(false);

  //CATALOGOS
  const [estado_civil] = useState(
    state.catalogos.tipos.filter((t) => t.categoria_id == 4)
  );
  const [buro] = useState(
    state.catalogos.tipos.filter((t) => t.categoria_id == 3)
  );
  const [estado] = useState(
    state.catalogos.tipos.filter((t) => t.categoria_id == 9)
  );
  const [contrato_condicion] = useState(
    state.catalogos.tipos.filter((t) => t.categoria_id == 13)
  );
  const [tipo_credito] = useState(
    state.catalogos.tipos.filter((t) => t.categoria_id == 17)
  );
  const [usuarios_asignados] = useState(state.user.personal);
  const [agencias] = useState(state.catalogos.tipos.agencias);

  const { handleVerMas, handlePropuestaSolicitud } = useTablaHandlers(
    prospectos,
    prospectos_seleccionados,
    setState,
    state,
    agencias
  );

  const getProspectos = async () => {
    const data = await ProspectoService.getProspectos(
      state.user?.usuario_id,
      state.user?.perfil_id,
      dni,
      nombre,
      edad_max,
      num_entidad_titular,
      num_entidad_conyuge,
      saldo_otras_entidades_max,
      saldo_caja_max,
      deuda_caja,
      monto_cuota,
      promedio_mora,
      afecta_boleta,
      consentimiento_datos,
      atraso_aval,
      buro2,
      contactado,
      estado2,
      contrato_condicion2,
      razon_social,
      gestor,
      celular,
      rows_per_page,
      page
    );
    setProspectos(data);
    setTotalProspectos(
      data.length > 0 && data[0]?.total_prospectos ? data[0].total_prospectos : 0
    );
  };

  const getInstitucionesFiltradas = async () => {
    try {
      const response = await PadronService.getInstitucionesFiltradas(
        state.user?.usuario_id,
        state.user?.perfil_id
      );
      if (Array.isArray(response) && response.length > 0) {
        setInstitucionesFiltradas(response);
      } else {
        setInstitucionesFiltradas([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setInstitucionesFiltradas([]);
      } else {
        setInstitucionesFiltradas([]);
        console.error("Error inesperado:", error);
      }
    }
  };

  const registrarGestorProspecto = async () => {
    setIsLoadingButton(true);
    if (gestoresSeleccionados.length === 0) {
      alert("No hay gestores seleccionados.");
      setIsLoadingButton(false);
      return;
    }
    if (!Number.isInteger(prospectos_seleccionados.length / gestoresSeleccionados.length)) {
      alert("La cantidad de prospectos no se puede dividir equitativamente entre los gestores seleccionados.");
      setIsLoadingButton(false);
      return;
    }
    if (prospectos_seleccionados.length === 0) {
      alert("La cantidad de prospectos seleccionados debe ser mayor a 0");
      setIsLoadingButton(false);
      return;
    }
    
    try {
      await ProspectoService.registrarGestorProspecto(
        prospectos_seleccionados,
        gestoresSeleccionados,
        state.user?.usuario_id,
        state.user?.perfil_id,
        state.zonal_id
      );
      alert("Prospectos asignados satisfactoriamente");
      setGestoresSeleccionados([]);
      setProspectosSeleccionados([]);
      setAsignacionActiva(false);
      setLoadingTable(true);
      await getProspectos();
      setLoadingTable(false);
    } catch (error) {
      console.error("Error en la asignación:", error);
      alert("Hubo un error al asignar los prospectos.");
    } finally {
      setIsLoadingButton(false);
    }
  };

  const handleBuscar = async () => {
    setIsBuscar(true);
    setAsignar(true);
    setLoadingTable(true);
    try {
      setPage(1);
      setRowsPerPage(10);
      await getProspectos();
      setAsignacionActiva(false);
    } catch (error) {
      console.error("Error al obtener los prospectos:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const todos = prospectos.map((prospecto) => prospecto.prospecto_id);
      setProspectosSeleccionados(todos);
    } else {
      setProspectosSeleccionados([]);
    }
  };

  const handleCheckboxChange = (event, prospecto) => {
    const prospecto_id = prospecto.prospecto_id;
    if (event.target.checked) {
      setProspectosSeleccionados((prev) => [...prev, prospecto_id]);
    } else {
      setProspectosSeleccionados((prev) =>
        prev.filter((item) => item !== prospecto_id)
      );
    }
  };

  const handleAsignar = (event) => {
    setAsignacionActiva(event.target.checked);
    setGestoresSeleccionados([]);
    setProspectosSeleccionados([]);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total_prospectos / rows_per_page)) {
      setPage(newPage);
    }
  };

  const handleTabChange = (tabKey) => {
    setTabActiva(tabKey);
  };

  function mostrarModalNuevoProspecto() {
    setState({
      ...state,
      modalNuevoProspecto: true,
      modalEditPS: false,
      prospectoInsertado: false,
    });
  }

  const formatoSoles = (valor) => {
    const formatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    });
    return formatter.format(valor);
  };

  const tabs = [
    {
      key: 'seguimiento',
      label: 'Seguimiento',
      content: (
        <TablaSeguimiento
          prospectos={prospectos}
          instituciones={instituciones_filtradas}
          estado={estado}
          loading={false}
          asignacionActiva={asignacion_activa}
          prospectosSeleccionados={prospectos_seleccionados}
          onSelectAll={handleSelectAll}
          onCheckboxChange={handleCheckboxChange}
          onVerMas={handleVerMas}
          onPropuestaSolicitud={handlePropuestaSolicitud}
        />
      )
    },
    {
      key: 'datos_personales',
      label: 'Datos Personales',
      content: (
        <TablaDatosPersonales
          prospectos={prospectos}
          estadoCivil={estado_civil}
          contratoCondicion={contrato_condicion}
          formatoSoles={formatoSoles}
          loading={false}
          onVerMas={handleVerMas}
          onPropuestaSolicitud={handlePropuestaSolicitud}
        />
      )
    },
    {
      key: 'historial_credito',
      label: 'Historial de Crédito',
      content: (
        <TablaHistorialCredito
          prospectos={prospectos}
          buro={buro}
          tipoCredito={tipo_credito}
          formatoSoles={formatoSoles}
          loading={false}
          onVerMas={handleVerMas}
          onPropuestaSolicitud={handlePropuestaSolicitud}
        />
      )
    },
    {
      key: 'detalles_rcc',
      label: 'Detalles RCC',
      content: (
        <TablaDetallesRCC
          prospectos={prospectos}
          formatoSoles={formatoSoles}
          loading={false}
          onVerMas={handleVerMas}
          onPropuestaSolicitud={handlePropuestaSolicitud}
        />
      )
    }
  ];

  useEffect(() => {
    if (state.isUpdated || state.prospectoInsertado) {
      const fetchData = async () => {
        setLoadingTable(true);
        try {
          await getInstitucionesFiltradas();
          await getProspectos();
        } catch (error) {
          console.error("Error al actualizar datos:", error);
        } finally {
          setLoadingTable(false);
        }
      };
      fetchData();
    }
  }, [state.isUpdated, state.prospectoInsertado]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const fetchData = async () => {
      try {
        await getInstitucionesFiltradas();
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isBuscar) {
      const fetchData = async () => {
        setLoadingTable(true);
        try {
          await getProspectos();
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoadingTable(false);
        }
      };
      fetchData();
    }
  }, [page, rows_per_page]);

  return (
    <Container className="prospectos">
      <div className="encabezado">
        <h1>LISTA DE PROSPECTOS</h1>
      </div>

      <div className="filtros">
        <div>
          <label htmlFor="dni">Ingrese DNI:</label>
          <input
            type="text"
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nombre_cliente">Ingrese nombre:</label>
          <input
            type="text"
            id="nombre_cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="razon_social">Razón social:</label>
          <SearchSelect
            id="razon_social"
            className="search_select"
            value={razon_social}
            onValueChange={(value) => setRazonSocial(value)}
            placeholder="Seleccione..."
          >
            {instituciones_filtradas.map((institucion) => (
              <SearchSelectItem
                key={institucion.institucion_id}
                value={institucion.institucion_id}
                className="search_select"
              >
                {institucion.razon_social}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="buro">Buro:</label>
          <SearchSelect
            id="buro"
            className="search_select"
            value={buro2}
            onValueChange={(value) => setBuro2(value)}
            placeholder="Seleccione..."
          >
            {buro.map((item) => (
              <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                {item.descripcion}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="contactado">Contactado:</label>
          <SearchSelect
            id="contactado"
            className="search_select"
            value={contactado}
            onValueChange={(value) => setContactado(value)}
            placeholder="Seleccione..."
          >
            <SearchSelectItem value="S" className="search_select">SI</SearchSelectItem>
            <SearchSelectItem value="N" className="search_select">NO</SearchSelectItem>
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="estado">Estado:</label>
          <SearchSelect
            id="estado"
            className="search_select"
            value={estado2}
            onValueChange={(value) => setEstado2(value)}
            placeholder="Seleccione..."
          >
            {estado.map((item) => (
              <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                {item.descripcion}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="celular">Ingrese celular:</label>
          <input
            type="text"
            id="celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contrato_condicion">Condición de contrato:</label>
          <SearchSelect
            id="contrato_condicion"
            className="search_select"
            value={contrato_condicion2}
            onValueChange={(value) => setContratoCondicion2(value)}
            placeholder="Seleccione..."
          >
            {contrato_condicion.map((item) => (
              <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                {item.descripcion}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="num_entidad_titular">Número de entidad titular:</label>
          <input
            type="number"
            id="num_entidad_titular"
            value={num_entidad_titular}
            onChange={(e) => setNumEntidadTitular(e.target.value)}
            min="0"
            step="1"
          />
          <small>Se mostrarán prospectos con entidades ≤ al número ingresado.</small>
        </div>
        <div>
          <label htmlFor="num_entidad_conyuge">Número de entidad cónyuge:</label>
          <input
            type="number"
            id="num_entidad_conyuge"
            value={num_entidad_conyuge}
            onChange={(e) => setNumEntidadConyuge(e.target.value)}
            min="0"
            step="1"
          />
          <small>Se mostrarán prospectos con entidades ≤ al número ingresado.</small>
        </div>
        <div>
          <label htmlFor="edad">Edad:</label>
          <input
            type="number"
            id="edad"
            value={edad_max}
            onChange={(e) => setEdadMax(e.target.value)}
            min="0"
            step="1"
          />
          <small>Se mostrarán prospectos de edad ≤ al número ingresado.</small>
        </div>
        <div>
          <label htmlFor="saldo_otras_entidades_max">Saldo máximo de otras entidades:</label>
          <input
            type="number"
            id="saldo_otras_entidades_max"
            value={saldo_otras_entidades_max}
            onChange={(e) => setSaldoOtrasEntidadesMax(e.target.value)}
            min="0"
            step="0.01"
          />
          <small>Saldo combinado del titular y su cónyuge.</small>
        </div>
        <div>
          <label htmlFor="saldo_caja_max">Saldo máximo de caja:</label>
          <input
            type="number"
            id="saldo_caja_max"
            value={saldo_caja_max}
            onChange={(e) => setSaldoCajaMax(e.target.value)}
            min="0"
            step="0.01"
          />
          <small>Saldo combinado del titular y su cónyuge.</small>
        </div>
        {state.user?.perfil_id !== "4" && (
          <div>
            <label htmlFor="gestor">Gestor:</label>
            <SearchSelect
              id="gestor"
              className="search_select"
              value={gestor}
              onValueChange={(value) => setGestor(value)}
              placeholder="Seleccione..."
            >
              {usuarios_asignados
                .filter(
                  (gestor) =>
                    !zonal_id ||
                    Number(gestor.usuario_id_jefe_jefe_inmediato) === Number(zonal_id) ||
                    Number(gestor.usuario_id_jefe_inmediato) === Number(zonal_id)
                )
                .map((gestor) => (
                  <SearchSelectItem key={gestor.usuario_id} value={gestor.usuario_id} className="search_select">
                    {gestor.nombre_completo_usuario.toUpperCase()}
                  </SearchSelectItem>
                ))}
              {(Number(state.user?.perfil_id) === 1 ||
                Number(state.user?.perfil_id) === 6 ||
                Number(state.user?.perfil_id) === 8) && (
                <SearchSelectItem value="sin_gestor" className="search_select">N/A</SearchSelectItem>
              )}
            </SearchSelect>
          </div>
        )}
        <div>
          <label htmlFor="deuda_caja">Deuda en caja:</label>
          <SearchSelect
            id="deuda_caja"
            className="search_select"
            value={deuda_caja}
            onValueChange={(value) => setDeudaCaja(value)}
            placeholder="Seleccione..."
          >
            <SearchSelectItem value="S" className="search_select">SI</SearchSelectItem>
            <SearchSelectItem value="N" className="search_select">NO</SearchSelectItem>
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="monto_cuota">Monto de cuota del último crédito:</label>
          <input
            type="number"
            id="monto_cuota"
            value={monto_cuota}
            onChange={(e) => setMontoCuota(e.target.value)}
            min="0"
            step="0.01"
          />
          <small>Se mostrarán prospectos cuya cuota es ≤ al número ingresado.</small>
        </div>
        <div>
          <label htmlFor="promedio_mora">Promedio de mora del último crédito:</label>
          <input
            type="number"
            id="promedio_mora"
            value={promedio_mora}
            onChange={(e) => setPromedioMora(e.target.value)}
            min="0"
            step="0.01"
          />
          <small>Se mostrarán prospectos cuyos días de mora son menores al ingresado.</small>
        </div>
        <div>
          <label htmlFor="afecta_boleta">Afecta a la boleta:</label>
          <SearchSelect
            id="afecta_boleta"
            className="search_select"
            value={afecta_boleta}
            onValueChange={(value) => setAfectaBoleta(value)}
            placeholder="Seleccione..."
          >
            <SearchSelectItem value="S" className="search_select">SI</SearchSelectItem>
            <SearchSelectItem value="N" className="search_select">NO</SearchSelectItem>
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="consentimiento_datos">Consentimiento de datos:</label>
          <SearchSelect
            id="consentimiento_datos"
            className="search_select"
            value={consentimiento_datos}
            onValueChange={(value) => setConsentimientoDatos(value)}
            placeholder="Seleccione..."
          >
            <SearchSelectItem value="S" className="search_select">SI</SearchSelectItem>
            <SearchSelectItem value="N" className="search_select">NO</SearchSelectItem>
            <SearchSelectItem value="X" className="search_select">X</SearchSelectItem>
          </SearchSelect>
        </div>
        <div>
          <label htmlFor="atraso_aval">Atraso de aval:</label>
          <input
            type="number"
            id="atraso_aval"
            value={atraso_aval}
            onChange={(e) => setAtrasoAval(e.target.value)}
            min="0"
          />
          <small>Se mostrarán prospectos cuyos días de atraso son menores al ingresado.</small>
        </div>
      </div>

      <div>
        <Button className="buscar" onClick={handleBuscar}>
          Buscar
        </Button>
      </div>

      {asignar && (
        <>
          {Number(state.user?.perfil_id) !== 4 && (
            <div
              className={`asignar ${
                asignacion_activa
                  ? prospectos_seleccionados.length === 0
                    ? "bg-red-100"
                    : "bg-green-100"
                  : "bg-default"
              }`}
            >
              <div className="campos_asignacion">
                <div className="tipo_asignacion">
                  <label>
                    <input
                      type="checkbox"
                      checked={asignacion_activa}
                      onChange={handleAsignar}
                      className="check_asignacion"
                    />
                    ASIGNACIÓN MANUAL
                  </label>
                </div>
                {asignacion_activa && (
                  <>
                    <div className="flex justify-center items-center w-full">
                      <div className="max-w-full w-full flex justify-center">
                        <MultiSelect
                          id="gestorSeleccionado"
                          value={gestoresSeleccionados}
                          onValueChange={setGestoresSeleccionados}
                          className="gestor_select"
                          multiple
                          placeholder="Selecciona un gestor"
                        >
                          {usuarios_asignados.map((asignado) => (
                            <MultiSelectItem
                              key={asignado.usuario_id}
                              value={asignado.usuario_id}
                              className="gestor_select"
                            >
                              {asignado.nombre_completo_usuario}
                            </MultiSelectItem>
                          ))}
                        </MultiSelect>
                      </div>
                    </div>
                    <div className="items-center flex justify-end">
                      <Button
                        className="button-aleatorio"
                        disabled={isLoadingButton}
                        onClick={registrarGestorProspecto}
                      >
                        {isLoadingButton ? "Procesando..." : "Asignar 👤"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Pagination
              page={page}
              totalItems={total_prospectos}
              rowsPerPage={rows_per_page}
              handlePageChange={handlePageChange}
            />
            <div className="flex justify-between items-center mt-[18px] mb-4">
              <div>
                <label className="font-normal text-base text-gray-800">
                  Total de prospectos:{" "}
                  <span className="numero inline-flex items-center gap-1">
                    <select
                      className="border border-gray-300 rounded px-2 py-[2px] text-sm bg-white text-gray-800 min-w-[70px]"
                      value={rows_per_page}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={100}>100</option>
                      <option value={1000}>1000</option>
                    </select>
                    <span className="whitespace-nowrap font-normal text-gray-800">{`de ${Number(total_prospectos)}`}</span>
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                {asignacion_activa && (
                  <label className="font-normal text-base text-gray-800">
                    Prospectos seleccionados:{" "}
                    <span className="numero font-normal text-gray-800">{prospectos_seleccionados.length}</span>
                  </label>
                )}
                <ButtonInsert 
                  onClick={mostrarModalNuevoProspecto}
                  disabled={loadingTable}
                />
              </div>
            </div>

            <div className={`table-loading-container no-select ${loadingTable ? 'loading' : 'loaded'}`}>
              {loadingTable && (
                <div className="table-loading-overlay">
                  <Loader />
                </div>
              )}
              
              <div className="table-container-prospectos">
                <TabsWithTable
                  tabs={tabs}
                  defaultTab="seguimiento"
                  actionButton={null}
                  onTabChange={handleTabChange}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <ModalEditProspectos isOpen={state.modalEditProspectos} />
      <ModalPropuestaSolicitud isOpen={state.modalSolicitud} />
      <ModalNuevoProspecto isOpen={state.modalNuevoProspecto} />
    </Container>
  );
}

export default Prospectos;