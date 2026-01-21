import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainlayout from "./layouts/Mainlayout";
import AboutPage from "./componentes/advantages";
import LoginPages from "./pages/public/LoginPages";
import Inventario from "./pages/private/Inventario";
import DashboardLayout from "./layouts/DasboardLayout";
import DashboardHome from "./pages/private/DasboardHome";
import CreateEmpresa from "./pages/private/CreateEmpresa";
import Register from "./pages/public/Register";
import CatalogoEmpresa from "./pages/private/CatologoEmpresa";
import GestioCostos from "./pages/private/GestioCostos";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Rutas públicas */}
          <Route path="/" element={<Mainlayout />}>
            <Route index element={<AboutPage />} />
          </Route>

          <Route path="/login" element={<LoginPages />} />
          <Route path="/register" element={<Register/>}/>

          {/* Rutas privadas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="create-empresa" element={<CreateEmpresa />} />
            <Route path="catalogo-empresa" element={<CatalogoEmpresa />} />
            {/* Rutas para cuando es usuario */}
            <Route path="/dashboard/gestion-costos" element={<GestioCostos />} />
            <Route path="/dashboard/inventario" element={<Inventario/>}/>
            
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
