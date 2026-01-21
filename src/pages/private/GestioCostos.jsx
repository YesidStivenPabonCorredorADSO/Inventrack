import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { supabase } from "../../supaBase/supaBase";
import Button from "../../componentes/Button";
import InputField from "../../componentes/Input";

export default function GestioCostos() {
  const { usuario } = useOutletContext(); // Usuario actual
  const [mensaje, setMensaje] = useState("");

  // ✅ Esquema de validación con Yup
  const validationSchema = Yup.object({
    producto: Yup.string()
      .required("El nombre del producto es obligatorio")
      .min(3, "Debe tener al menos 3 caracteres"),
    materia: Yup.string().required("La materia prima es obligatoria"),
    descripcion: Yup.string().optional(),
    lote: Yup.string().required("El lote es obligatorio"),
      cantidad: Yup.number()
    .required("La cantidad producida es obligatoria")
    .positive("Debe ser mayor a 0")
    .integer("Debe ser un número entero"),
    costo: Yup.number()
      .required("El costo por unidad es obligatorio")
      .positive("Debe ser un número positivo"),
    mano_obra: Yup.number()
      .required("La mano de obra es obligatoria")
      .positive("Debe ser un número positivo"),
    otros_costos: Yup.number()
      .required("Los otros costos son obligatorios")
      .min(0, "No puede ser negativo"),
  });

  // ✅ Formik para manejar los datos
  const formik = useFormik({
    initialValues: {
      producto: "",
      materia: "",
      lote: "",
      cantidad:"",
      costo: "",
      mano_obra: "",
      otros_costos: "",
    },
    validationSchema,
onSubmit: async (values, { resetForm }) => {
  try {
    /* ================= PRODUCTO ================= */
    const { data: productoData, error: productoError } = await supabase
      .from("producto")
      .insert({
        id_empresa_fk: usuario.id_empresa_fk,
        nombre_producto: values.producto,
        materia_prima: values.materia,
        lote: values.lote,  // ✅ Agregar el lote
        costo_unitario: Number(values.costo),  // ✅ AGREGAR
        mano_obra: Number(values.mano_obra),   // ✅ AGREGAR
        otros_costos: Number(values.otros_costos), // ✅ AGREGAR
      })
      .select("id_producto")
      .single();

    if (productoError) throw productoError;

    /* ================= COSTO TOTAL LOTE ================= */
    const costoTotal =
      Number(values.costo) +
      Number(values.mano_obra) +
      Number(values.otros_costos);

    /* ================= LOTE ================= */
    const { data: loteData, error: loteError } = await supabase
      .from("lote")
      .insert({
        id_producto: productoData.id_producto,
        codigo_lote: values.lote,
        fecha_produccion: new Date(),
        cantidad_inicial: values.cantidad,
        costo_total: costoTotal,
        observaciones: "Lote inicial",
      })
      .select("id_lote")
      .single();

    if (loteError) throw loteError;

    /* ================= INVENTARIO ================= */
    const { error: inventarioError } = await supabase
      .from("inventario")
      .insert({
        id_producto: productoData.id_producto,
        id_lote_fk: loteData.id_lote,
        id_motivo_movimiento: 1,
        cantidad: values.cantidad,
        fecha_movimiento: new Date(),
        observaciones: "Ingreso inicial por producción",
        created_by: usuario.id_usuario,
      });

    if (inventarioError) throw inventarioError;

    setMensaje("✅ Lote registrado correctamente");
    resetForm();

  } catch (error) {
    console.error(error);
    setMensaje("❌ Error al registrar: " + error.message);
  }
},
  });
  // ✅ Generar lote automático cuando cambia el nombre del producto
  const generarLote = (nombreProducto) => {
    if (!nombreProducto) return "";
    const siglas = nombreProducto
      .split(" ")
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase();
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear().toString().slice(-2);
    return `${siglas}-${dia}${mes}${anio}`;
  };

  // Cada vez que cambie el producto, se genera automáticamente el lote
  const handleProductoChange = (e) => {
    formik.setFieldValue("producto", e.target.value);
    const nuevoLote = generarLote(e.target.value);
    formik.setFieldValue("lote", nuevoLote);
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-8 md:p-10">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark tracking-tight">
              Gestionar Costos de Producción
            </h1>
            <p className="text-muted-light dark:text-muted-dark mt-2">
              Ingrese los detalles para un nuevo lote de producción.
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <InputField
                label="Nombre del Producto"
                placeholder="Ingresa el nombre del producto"
                name="producto"
                type="text"
                value={formik.values.producto}
                onChange={handleProductoChange}
              />
              {formik.touched.producto && formik.errors.producto && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.producto}</p>
              )}
            </div>
            {/* Descripcion */}
              <InputField
                label="Descripción (opcional)"
                placeholder="Descripción del producto"
                name="descripcion"
                type="text"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
              />
            {/* Materia Prima */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Materia prima"
                placeholder="Ingresa el nombre de la materia prima"
                name="materia"
                type="text"
                value={formik.values.materia}
                onChange={formik.handleChange}
              />
              {formik.touched.materia && formik.errors.materia && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.materia}</p>
              )}
               {/* Lote asociado */}
              <InputField
                label="Lote Asociado"
                placeholder="Se genera automáticamente"
                name="lote"
                type="text"
                value={formik.values.lote}
                readOnly
              />
            </div>
            {/* Cantidad */}
              <InputField
                label="Cantidad producida"
                type="number"
                name="cantidad"
                placeholder="Ej: 30, 40, 100"
                value={formik.values.cantidad}
                onChange={formik.handleChange}
              />
              {formik.touched.mano_obra && formik.errors.mano_obra && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.mano_obra}</p>
              )}
              
            {/* Costos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <InputField
                label="Costo por unidad"
                type="number"
                name="costo"
                placeholder="Ingresa un costo por unidad"
                value={formik.values.costo}
                onChange={formik.handleChange}
              />
              {formik.touched.costo && formik.errors.costo && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.costo}</p>
              )}
               {/* Mano de obra */}
              <InputField
                label="Mano de obra"
                type="number"
                name="mano_obra"
                placeholder="Ingresa el valor de la mano de obra"
                value={formik.values.mano_obra}
                onChange={formik.handleChange}
              />
              {formik.touched.mano_obra && formik.errors.mano_obra && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.mano_obra}</p>
              )}
              {/* Otros costos */}
               <InputField
                label="Otros costos"
                type="number"
                name="otros_costos"
                placeholder="Ingresa el valor de otros costos"
                value={formik.values.otros_costos}
                onChange={formik.handleChange}
              />
              {formik.touched.otros_costos && formik.errors.otros_costos && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.otros_costos}</p>
              )}
            </div>
            {/* Botón */}
            <div className="pt-6 flex justify-end">
              <Button
                variant="primary"
                size="medium"
                type="submit"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>

          {mensaje && (
            <p className="mt-4 text-center text-sm font-semibold">
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
