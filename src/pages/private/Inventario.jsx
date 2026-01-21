import { useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from "../../supaBase/supaBase";
import { useOutletContext } from "react-router-dom";
import InputField from "../../componentes/Input";
import Button from "../../componentes/Button";
import * as Yup from "yup";

export default function Inventario() {
  const { usuario } = useOutletContext() || {};

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // Estado para el formulario de edición
  const [editForm, setEditForm] = useState({
    nombre_producto: "",
    descripcion: "",
    materia_prima: "",
    lote: "",
    costo_unitario: "",
    mano_obra: "",
    otros_costos: ""
  });

  // Validaciones para editar producto
  const editProductSchema = Yup.object().shape({
    nombre_producto: Yup.string()
      .required("El nombre del producto es obligatorio"),
    costo_unitario: Yup.number()
      .min(0, "El costo debe ser mayor o igual a 0")
      .required("El costo unitario es obligatorio"),
    mano_obra: Yup.number()
      .min(0, "La mano de obra debe ser mayor o igual a 0")
      .required("La mano de obra es obligatoria"),
    otros_costos: Yup.number()
      .min(0, "Los otros costos deben ser mayor o igual a 0")
      .required("Los otros costos son obligatorios"),
  });

  const idRol = usuario?.id_rol_fk ?? 0;
  const esAdmin = idRol === 1;

  /* ================= FETCH ================= */
  const fetchInventario = async () => {
    const { data, error } = await supabase
      .from("inventario")
      .select(`
        id_inventario,
        cantidad,
        fecha_movimiento,
        observaciones,

        producto:producto (
          id_producto,
          nombre_producto,
          descripcion,
          materia_prima,
          lote,
          costo_unitario,
          mano_obra,
          otros_costos
        ),

        lote:lote (
          codigo_lote,
          costo_total,
          cantidad_inicial
        ),

        motivo_movimiento:motivo_movimiento (
          descripcion
        )
      `)
      .order("fecha_movimiento", { ascending: false });

    if (error) {
      console.error("Error inventario:", error);
    } else {
      setInventario(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInventario();
  }, []);

    // ⬇️ AGREGAR ESTE useEffect AQUÍ ⬇️
  useEffect(() => {
    if (openEdit && selected) {
      setEditForm({
        nombre_producto: selected.producto?.nombre_producto || "",
        descripcion: selected.producto?.descripcion || "",
        materia_prima: selected.producto?.materia_prima || "",
        lote: selected.producto?.lote || "",
        costo_unitario: selected.producto?.costo_unitario || 0,
        mano_obra: selected.producto?.mano_obra || 0,
        otros_costos: selected.producto?.otros_costos || 0
      });
    }
  }, [openEdit, selected]);

 /* ================= CALCULOS ================= */
  const inventarioCalculado = useMemo(() => {
    return inventario.map((row) => {
      const costoUnitarioLote =
        row.lote?.costo_total && row.lote?.cantidad_inicial
          ? row.lote.costo_total / row.lote.cantidad_inicial
          : 0;

      const costoUnitarioProducto = row.producto?.costo_unitario || 0;
      const manoObra = row.producto?.mano_obra || 0;
      const otrosCostos = row.producto?.otros_costos || 0;
      
      const precioVenta = costoUnitarioProducto + manoObra + otrosCostos;

      const gananciaEstimada =
        (precioVenta - costoUnitarioLote) * row.cantidad;

      return {
        ...row,
        costoUnitario: costoUnitarioLote,
        precioVenta,
        gananciaEstimada,
      };
    });
  }, [inventario]);

  /* ================= FILTRO ================= */
  const filteredInventario = useMemo(() => {
    if (!searchTerm.trim()) return inventarioCalculado;

    const search = searchTerm.toLowerCase();

    return inventarioCalculado.filter((i) =>
      i.producto?.nombre_producto?.toLowerCase().includes(search) ||
      i.lote?.codigo_lote?.toLowerCase().includes(search) ||
      i.motivo_movimiento?.descripcion?.toLowerCase().includes(search)
    );
  }, [inventarioCalculado, searchTerm]);

  /* ================= ABRIR MODAL DE EDICIÓN ================= */
  const openEditModal = (row) => {
    setSelected(row);
    setEditErrors({});
    setOpenEdit(true);
  };
  /* ================= ACTUALIZAR PRODUCTO ================= */
  const handleUpdateProducto = async () => {
    if (!selected?.producto?.id_producto) return;

    try {
      const { error } = await supabase
        .from("producto")
        .update({
          nombre_producto: editForm.nombre_producto,
          descripcion: editForm.descripcion,
          materia_prima: editForm.materia_prima,
          lote: editForm.lote,
          costo_unitario: parseFloat(editForm.costo_unitario),
          mano_obra: parseFloat(editForm.mano_obra),
          otros_costos: parseFloat(editForm.otros_costos)
        })
        .eq("id_producto", selected.producto.id_producto);

      if (error) throw error;

      setOpenEdit(false);
      fetchInventario();
      alert("Producto actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Error al actualizar el producto");
    }
  };

  const handleUpdate = async () => {
    try {
      await editProductSchema.validate(editForm, { abortEarly: false });
      setEditErrors({});
      await handleUpdateProducto();
    } catch (err) {
      if (err.inner) {
        const formatted = {};
        err.inner.forEach(e => {
          formatted[e.path] = e.message;
        });
        setEditErrors(formatted);
      }
    }
  };

  /* ================= ELIMINAR PRODUCTO ================= */
  const handleDeleteProducto = async () => {
    if (!selected?.producto?.id_producto) return;

    try {
      const { error } = await supabase
        .from("producto")
        .delete()
        .eq("id_producto", selected.producto.id_producto);

      if (error) throw error;

      setOpenDelete(false);
      setSelected(null);
      fetchInventario();
      alert("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Hubo un error al eliminar el producto. Puede que esté asociado a otros registros.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ================= HEADER ================= */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Inventario
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Movimientos de entrada y salida de productos por lote
            </p>
          </div>

          {/* ================= BUSCADOR ================= */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por producto, lote o movimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Limpiar búsqueda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {filteredInventario.length}
                </span>
                {' '}{filteredInventario.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>

          {/* ================= TABLA ================= */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Lote</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Movimiento</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Cantidad</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Costo Unit.</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Precio Venta</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Ganancia</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-6 text-center text-gray-500">
                        Cargando inventario...
                      </td>
                    </tr>
                  ) : filteredInventario.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-6 text-center text-gray-500">
                        No hay movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    filteredInventario.map((row) => (
                      <tr key={row.id_inventario} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          {row.producto?.nombre_producto}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {row.lote?.codigo_lote}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {row.motivo_movimiento?.descripcion}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          {row.cantidad}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          ${row.costoUnitario.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          ${row.precioVenta.toFixed(2)}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-semibold ${
                            row.gananciaEstimada >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${row.gananciaEstimada.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {row.fecha_movimiento}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Ver */}
                            <button
                              onClick={() => {
                                setSelected(row);
                                setOpenView(true);
                              }}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Ver detalles"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {/* Editar */}
                              <button
                                onClick={() => openEditModal(row)}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Editar producto"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                          

                            {/* Eliminar */}
                            
                              <button
                                onClick={() => {
                                  setSelected(row);
                                  setOpenDelete(true);
                                }}
                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Eliminar producto"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                      
                            
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DE VISUALIZACIÓN ================= */}
      {openView && selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenView(false)}
          ></div>

          <div className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-xl animate-slide-left overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles del Producto
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Información completa del movimiento
                </p>
              </div>

              <button
                onClick={() => setOpenView(false)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputField
                    label="Nombre del Producto"
                    value={selected.producto?.nombre_producto || ""}
                    disabled={true}
                  />
                </div>

                <div>
                  <InputField
                    label="Lote"
                    value={selected.lote?.codigo_lote || ""}
                    disabled={true}
                  />
                </div>
              </div>

              <div>
                <InputField
                  label="Descripción"
                  value={selected.producto?.descripcion || "Sin descripción"}
                  disabled={true}
                />
              </div>

              <div>
                <InputField
                  label="Materia Prima"
                  value={selected.producto?.materia_prima || "No especificado"}
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <InputField
                    label="Costo Unitario"
                    value={`$${(selected.producto?.costo_unitario || 0).toFixed(2)}`}
                    disabled={true}
                  />
                </div>

                <div>
                  <InputField
                    label="Mano de Obra"
                    value={`$${(selected.producto?.mano_obra || 0).toFixed(2)}`}
                    disabled={true}
                  />
                </div>

                <div>
                  <InputField
                    label="Otros Costos"
                    value={`$${(selected.producto?.otros_costos || 0).toFixed(2)}`}
                    disabled={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputField
                    label="Cantidad del Movimiento"
                    value={selected.cantidad}
                    disabled={true}
                  />
                </div>

                <div>
                  <InputField
                    label="Tipo de Movimiento"
                    value={selected.motivo_movimiento?.descripcion || ""}
                    disabled={true}
                  />
                </div>
              </div>

              <div>
                <InputField
                  label="Observaciones"
                  value={selected.observaciones || "Sin observaciones"}
                  disabled={true}
                />
              </div>

              <div>
                <InputField
                  label="Fecha del Movimiento"
                  value={selected.fecha_movimiento}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

{/* ================= MODAL DE EDICIÓN ================= */}
{openEdit && selected && (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpenEdit(false)}
    ></div>

    <div className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-xl animate-slide-left overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Producto
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Actualiza la información del producto
          </p>
        </div>

        <button
          onClick={() => setOpenEdit(false)}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <InputField
            label="Nombre del Producto"
            type="text"
            value={editForm.nombre_producto ?? selected.producto?.nombre_producto ?? ""}
            onChange={(e) => setEditForm({ ...editForm, nombre_producto: e.target.value })}
            error={editErrors.nombre_producto}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={editForm.descripcion ?? selected.producto?.descripcion ?? ""}
            onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <InputField
            label="Materia Prima"
            type="text"
            value={editForm.materia_prima ?? selected.producto?.materia_prima ?? ""}
            onChange={(e) => setEditForm({ ...editForm, materia_prima: e.target.value })}
          />
        </div>

        <div>
          <InputField
            label="Lote"
            type="text"
            value={editForm.lote ?? selected.producto?.lote ?? ""}
            onChange={(e) => setEditForm({ ...editForm, lote: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <InputField
              label="Costo Unitario"
              type="number"
              step="0.01"
              min="0"
              value={editForm.costo_unitario ?? selected.producto?.costo_unitario ?? 0}
              onChange={(e) => setEditForm({ ...editForm, costo_unitario: e.target.value })}
              error={editErrors.costo_unitario}
            />
          </div>

          <div>
            <InputField
              label="Mano de Obra"
              type="number"
              step="0.01"
              min="0"
              value={editForm.mano_obra ?? selected.producto?.mano_obra ?? 0}
              onChange={(e) => setEditForm({ ...editForm, mano_obra: e.target.value })}
              error={editErrors.mano_obra}
            />
          </div>

          <div>
            <InputField
              label="Otros Costos"
              type="number"
              step="0.01"
              min="0"
              value={editForm.otros_costos ?? selected.producto?.otros_costos ?? 0}
              onChange={(e) => setEditForm({ ...editForm, otros_costos: e.target.value })}
              error={editErrors.otros_costos}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setOpenEdit(false)}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
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
      {/* ================= MODAL ELIMINAR ================= */}
      <Transition appear show={openDelete}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpenDelete(false)}>
          <div className="fixed inset-0 bg-black/30" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Eliminar Producto
              </Dialog.Title>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                ¿Seguro deseas eliminar el producto{" "}
                <strong>{selected?.producto?.nombre_producto}</strong>?
              </p>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteProducto}
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