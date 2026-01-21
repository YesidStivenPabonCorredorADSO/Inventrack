import { Outlet } from 'react-router-dom'; 
import Headers from '../componentes/headers.jsx'; 
import Footer from '../componentes/Footer.jsx';
function Mainlayout() {
  return (
    <div className="min-h-screen flex flex-col">
    <Headers />
      {/* ¡El Outlet renderiza el contenido de la ruta hija (e.g., AboutPage)! */}
        <main className="flex-1">
        <Outlet /> 
        </main>
    
    <Footer />
    </div>
    
)
}
export default Mainlayout
