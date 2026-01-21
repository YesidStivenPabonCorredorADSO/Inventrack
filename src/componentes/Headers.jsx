import Button from "./Button";
import { useNavigate } from "react-router-dom";


const Header = () => {
    const navigate= useNavigate()
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="px-4 md:px-10 lg:px-20">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-3">
                <div className="flex items-center gap-4 text-blue-900">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
                </svg>
                <h2 className="text-xl font-bold tracking-tight">Inventrack</h2>
                </div>

                <nav className="hidden md:flex flex-1 justify-center gap-8">
                <a className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors" href="#">
                    Inicio
                </a>
                <a className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors" href="#">
                    Acerca de
                </a>
                </nav>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" size="small" onClick={()=>navigate("/Login")}>
                            Long on
                        </Button>
                    </div>
            </div>
        </div>
    </header>

    
);
};
export default Header