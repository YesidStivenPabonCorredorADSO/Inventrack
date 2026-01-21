import { useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from '../../supaBase/supaBase';
import { useOutletContext } from "react-router-dom";
import InputField from "../../componentes/Input";
import SelectField from "../../componentes/SelectField";
import * as Yup from "yup";

function CatologoEmpresa() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1); 
  const[openDelete,setOpenDelete]=useState(false)
  const [tiposNegocio, setTiposNegocio] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const { usuario } = useOutletContext() || {};
  const idRol = usuario?.id_rol_fk ?? 0; // seguridad
  const esAdmin = idRol === 1;
  const [editForm,setEditForm]=useState({
      nombre_empresa: "",
      nit: "",
      tipoNegocio: "",
      direccion: "",
      correo: "",
      telefono: ""
  });

// Validaciones para los campos de editar empresa
const editESchema=Yup.object().shape({
  nombre_empresa:Yup.string()
  .required("El nombre es obligatorio"),
  nit: Yup.string()
    .required("El NIT es obligatorio")
    .matches(/^[0-9]{9,10}(-[0-9])?$/, "Formato inválido. Ej: 900123456-7"),

  tipoNegocio: Yup.string()
    .required("Selecciona un tipo de negocio"),

  direccion: Yup.string()
    .required("La dirección es obligatoria"),

  correo: Yup.string()
    .email("Correo inválido")
    .required("El correo es obligatorio"),

  telefono: Yup.string()
    .matches(/^\d{7,10}$/, "Debe tener entre 7 y 10 números")
    .required("El teléfono es obligatorio"),
})

//Busqueda del input de empresa
const filteredEmpresas = useMemo(() => {
  if (!searchTerm.trim()) {
    return empresas; // Si no hay búsqueda, muestra todas
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  return empresas.filter(empresa => {
    // Busca en diferentes campos de la empresa
    const nombreMatch = empresa.nombre_empresa?.toLowerCase().includes(searchLower);
    const nitMatch = empresa.nit?.toLowerCase().includes(searchLower);
    const emailMatch = empresa.correo?.toLowerCase().includes(searchLower);
    const telefonoMatch = empresa.telefono?.toLowerCase().includes(searchLower);
    const tipoNegocioMatch = empresa.tipo_negocio?.nombre_tipo?.toLowerCase().includes(searchLower);
    
    return nombreMatch || nitMatch || emailMatch || telefonoMatch || tipoNegocioMatch;
  });
}, [empresas, searchTerm]);

//También necesitas resetear la página cuando busques
useEffect(() => {
  setCurrentPage(1); // Volver a la primera página cuando se busca
}, [searchTerm]);

const fetchEmpresas = async () => {
  const { data, error } = await supabase
    .from('empresa')
    .select(`
      *,
      tipo_negocio (
        id_tipo,
        nombre_tipo
      )
    `)
    .order('id_empresa', { ascending: true });

  if (error) {
    console.error("Error al cargar empresas:", error);
  } else {
    setEmpresas(data);
  }

  setLoading(false);
};
useEffect(() => {
  fetchEmpresas();
}, []);


  // Metodo eliminar Empresa
  const handleDeleteEmpresa = async () => {
  if (!selectedEmpresa) return;

  try {
    const { error } = await supabase
      .from("empresa")
      .delete()
      .eq("id_empresa", selectedEmpresa.id_empresa);

    if (error) throw error;

    setOpenDelete(false);
    setSelectedEmpresa(null);

    fetchEmpresas(); 

    alert("Empresa eliminada exitosamente.");
  } catch (error) {
    console.error("Error eliminando la empresa:", error);
    alert("Hubo un error al eliminar la empresa.");
  }
};

// EDITAR
const openEditModal = (empresa) => {
  setSelectedEmpresa(empresa);

  setEditForm({
    nombre_empresa: empresa.nombre_empresa,
  nit: empresa.nit,
  tipoNegocio: empresa.tipo_negocio?.id_tipo, // este es el UUID REAL
  direccion: empresa.direccion,
  correo: empresa.correo,
  telefono: empresa.telefono,
  });

  setIsEditModalOpen(true);
};

useEffect(() => {
  const fetchTipos = async () => {
    const { data, error } = await supabase
      .from("tipo_negocio")
      .select("*");

    if (!error) {
      setTiposNegocio(
        data.map(t => ({
          value: t.id_tipo,       // UUID
          label: t.nombre_tipo    // Nombre visible en el SelectField
        }))
      );
    }
  };

  fetchTipos();
}, []);



  // ================= METODO PARA ACTUALIZAR EMPRESA =================
  const handleUpdateEmpresa = async () => {
  if (!selectedEmpresa) return;

  try {
    const { error } = await supabase
      .from("empresa")
      .update({
        nombre_empresa: editForm.nombre_empresa,
        nit: editForm.nit,
        tipo_negocio: editForm.id_tipo_negocio,
        direccion: editForm.direccion,
        correo: editForm.correo,
        telefono: editForm.telefono,
      })
      .eq("id_empresa", selectedEmpresa.id_empresa);

    if (error) throw error;

    setIsEditModalOpen(false);

    // Recargar empresas
    const { data } = await supabase
      .from("empresa")
      .select("*")
      .order("id_empresa", { ascending: true });

    setEmpresas(data);

    alert("Empresa actualizada correctamente");
  } catch (error) {
    console.error("Error actualizando:", error);
    alert("Error al actualizar la empresa");
  }
};

const handleUpdate = async () => {
  try {
    await editESchema.validate(editForm, { abortEarly: false });

    setEditErrors({})

    await handleUpdateEmpresa();

    console.log("Formulario válido, actualizando...");
  } catch (err) {
    if (err.inner) {
      const formatted = {};
      err.inner.forEach(e => {
        formatted[e.path] = e.message;
      });
      setEditErrors(formatted);  // ← Usa el estado de errores que ya tienes
    }
  }
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className='flex-1 p-8 bg-gray-50 dark:bg-gray-900'>
        <div className="max-w-7xl mx-auto">
          
          {/* ========== PAGE HEADING ========== */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Catálogo de Empresas
            </h1>
          </div>

          {/* ========== TOOLBAR (FILTROS Y BÚSQUEDA) ========== */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative lg:col-span-2">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Buscar empresa por nombre, NIT, correo o teléfono..."
                  className="w-full h-10 pl-10 pr-10 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {/* Botón para limpiar búsqueda */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Indicador de resultados */}
              {searchTerm && (
                <div className="lg:col-span-2 flex items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {filteredEmpresas.length}
                    </span>
                    {' '}{filteredEmpresas.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========== TABLA ========== */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      ID o NIT
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nombre de la Empresa
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Tipo de Negocio
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : filteredEmpresas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No hay empresas registradas
                      </td>
                    </tr>
                  ) : (
                     filteredEmpresas.map((empresa) => (
                      <tr key={empresa.id_empresa} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {empresa.nit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {empresa.nombre_empresa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {empresa.tipo_negocio?.nombre_tipo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {empresa.direccion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Ver */}
                            <button
                              onClick={()=>{setSelectedEmpresa(empresa);setIsViewModalOpen(true)}} 
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Ver detalles"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Botón Editar */}
                            {esAdmin ? (
                              <button
                                onClick={() => openEditModal(empresa)}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                disabled
                                aria-disabled="true"
                                title="Solo administradores pueden editar"
                                className="p-1.5 text-gray-300 dark:text-gray-600 rounded-full bg-transparent cursor-not-allowed"
                              >
                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}

                            {/* Botón Eliminar */}
                            {esAdmin ? (
                              <button
                                onClick={() => { setSelectedEmpresa(empresa); setOpenDelete(true) }}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                disabled
                                aria-disabled="true"
                                className="p-1.5 text-gray-300 dark:text-gray-600 rounded-full bg-transparent cursor-not-allowed"
                                title="Solo administradores pueden eliminar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== PAGINACIÓN ========== */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando de <span className="font-bold text-gray-900 dark:text-white">1</span> a{' '}
              <span className="font-bold text-gray-900 dark:text-white">{empresas.length}</span> de{' '}
              <span className="font-bold text-gray-900 dark:text-white">{empresas.length}</span> empresas
            </p>

            <div className="flex items-center gap-2">
              {/* Botón Anterior */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1} 
                className="flex items-center justify-center h-9 px-3 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              {/* Números de página */}
              <nav className="flex items-center gap-1">
                {[1, 2, 3].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)} 
                    className={`flex items-center justify-center w-9 h-9 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>

              {/* Botón Siguiente */}
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex items-center justify-center h-9 px-3 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Siguiente
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
        {/* ================= MODAL DE VISUALIZACIÓN ================= */}
  {isViewModalOpen && (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsViewModalOpen(false)}
      ></div>

      {/* Panel deslizable */}
      <div className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-xl animate-slide-left">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visualizar Empresa
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Información completa
            </p>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
          {/* CONTENIDO */}
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            {selectedEmpresa && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <InputField
                      label="Nombre de Empresa"
                      name="nombre_empresa"
                      value={selectedEmpresa.nombre_empresa}
                      disabled={true}
                    />
                  </div>

                  {/* NIT */}
                  <div>
                    <InputField
                    label={'Nit'}
                    value={selectedEmpresa.nit}
                    disabled={true}
                    />
                  </div>
                </div>

                {/* Tipo de negocio */}
                <div>
                  <SelectField
                  label="Tipo de Negocio"
                  name="tipoNegocio"
                  value={editForm.tipoNegocio}            // UUID DEL TIPO
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tipoNegocio: e.target.value,        // ACTUALIZA UUID
                    })
                  }
                  options={tiposNegocio}                  // [{value: uuid, label: nombre}]
                />
                </div>

                {/* Dirección */}
                <div>
                  <InputField 
                  label={'Direccion'}
                  value={selectedEmpresa.direccion}
                  disabled={true}
                  />
                </div>

              {/* Correo / Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputField
                    label={'Correo'}
                    value={selectedEmpresa.correo}
                    disabled={true}
                    />
                  </div>

                  <div>
                    <InputField
                    label={'Telefono'}
                    value={selectedEmpresa.telefono}
                    disabled={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}

        {/* ================= MODAL DE EDITACIÓN ================= */}
    {isEditModalOpen && (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Fondo oscuro */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsEditModalOpen(false)}
        ></div>

        {/* Panel deslizable */}
        <div className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-xl animate-slide-left">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Empresa
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Actualiza los datos necesarios
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            {editForm && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <InputField
                    label={'Nombre de Empresa'}
                    type="text"
                    value={editForm.nombre_empresa}
                    onChange={(e)=> setEditForm({...editForm,nombre_empresa:e.target.value})}
                    error={editErrors.nombre_empresa}
                    />
              
                  </div>

                  {/* NIT */}
                  <div>
                    <InputField
                    label={'Nit'}
                    type="text"
                    maxLength={10}
                    value={editForm.nit}
                    onChange={(e)=> setEditForm({...editForm,nit:e.target.value})}
                    error={editErrors.nit}
                    />
                  </div>
                </div>

                {/* Tipo negocio */}
                <div>
                  <SelectField
                  label="Tipo de Negocio"
                  name="tipoNegocio"
                  value={editForm.tipoNegocio}            // UUID DEL TIPO
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tipoNegocio: e.target.value,        // ACTUALIZA UUID
                    })
                  }
                  options={tiposNegocio}
                  error={editErrors.tipoNegocio}                  // [{value: uuid, label: nombre}]
                />
                </div>

                {/* Dirección */}
                <div>
                    <InputField
                      label={'Direccion'}
                      type="text"
                      value={editForm.direccion}
                      onChange={(e)=> setEditForm({...editForm,direccion:e.target.value})}
                      error={editErrors.direccion}
                    />
                </div>

                {/* Correo / Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputField
                      label={'Email'}
                      value={editForm.correo}
                      onChange={(e) =>
                          setEditForm({ ...editForm, correo: e.target.value })
                        }
                        error={editErrors.correo}
                    />
                  </div>

                  <div>
                    <InputField
                      label={'Telefono'}
                      type="text"
                      value={editForm.telefono}
                      onChange={(e) =>
                        setEditForm({ ...editForm, telefono: e.target.value })
                      }
                      error={editErrors.telefono}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Botón Guardar Cambios */}
            <div className="pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleUpdate}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    )}


     {/* MODAL ELIMINAR */}
      <Transition appear show={openDelete} >
        <Dialog as="div" className="relative z-50" onClose={() => setOpenDelete(false)}>
          <div className="fixed inset-0 bg-black/30" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Eliminar Empresa
              </Dialog.Title>

              <p className="mt-2 text-sm text-gray-600">
                ¿Seguro deseas eliminar la empresa{" "}
                <strong>{selectedEmpresa?.nombre_empresa}</strong>?
              </p>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteEmpresa}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}

export default CatologoEmpresa;