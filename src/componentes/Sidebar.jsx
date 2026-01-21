import  { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supaBase/supaBase";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  RectangleStackIcon,
  ArrowRightOnRectangleIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";




export default function Sidebar({ usuario }) {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // ✅ Si el usuario aún no cargó
  if (!usuario) return null;

  const esAdmin = usuario.id_rol_fk === 1;
  const esUsuario = usuario.id_rol_fk === 2;
  const tieneEmpresa = usuario.id_empresa_fk !== null;

  const menuItems = [
    { id: "inicio", label: "Inicio",icon: HomeIcon, path: "/dashboard", visible: esAdmin || (esUsuario && tieneEmpresa) },
    { id: "empresa", label: "Empresa",icon: BuildingStorefrontIcon, path: "/dashboard/create-empresa", visible: esAdmin },
    { id: "catalogo", label: "Catálogo Empresa", icon: RectangleStackIcon, path: "/dashboard/catalogo-empresa", visible: esAdmin || esUsuario },
    { id: "gestion-costos", label: "Gestión de Costos", icon: RectangleStackIcon ,path: "/dashboard/gestion-costos", visible: esUsuario && tieneEmpresa},
    {id: "Inventario", label:"Inventario", icon:ArchiveBoxIcon,path:"/dashboard/inventario",visible:esUsuario&& tieneEmpresa},

  ];

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <h1 className="text-2xl font-bold text-blue-900">Inventrack</h1>
      </div>

      {/* Navegación */}
      <nav className="mt-2 px-4 flex-grow">
        <ul>
          {menuItems
            .filter(item => item.visible)
            .map((item, index) => (
              <li key={item.id} className={index > 0 ? "mt-2" : ""}>
                <button
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>

              </li>
            ))}
        </ul>
      </nav>

      {/* Botón cerrar sesión */}
      <div className="px-4 pb-8 mt-auto">
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-sm">Cerrar Sesión</span>
        </button>
      </div>

      {/* Dialog de confirmación */}
      <Transition appear show={showLogoutDialog} as={Fragment}>
        <Dialog onClose={() => setShowLogoutDialog(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    ¿Cerrar sesión?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro que deseas cerrar sesión?
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => setShowLogoutDialog(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      onClick={handleConfirmLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </aside>
  );
}