function Footer() {
    return(
    <footer className="bg-gray-50 dark:bg-gray-900 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 md:px-10 lg:px-20 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2024 Inventrack. Todos los derechos reservados.</p>
            <div className="mt-2">
                <a className="hover:text-cyan-600 transition-colors" href="#">
                Política de Privacidad
                </a>
                <span className="mx-2">|</span>
                <a className="hover:text-cyan-600 transition-colors" href="#">
                Términos de Servicio
                </a>
            </div>
        </div>
    </footer>
    );
}
export default Footer