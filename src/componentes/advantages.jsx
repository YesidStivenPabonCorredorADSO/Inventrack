import AdvantageCard from './AdvanteTageCard.jsx'
function AboutPage() {
  const advantages = [
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>
        </svg>
      ),
      title: "Control Total del Inventario",
      description: "Gestiona tus materias primas y productos terminados con precisión. Evita roturas de stock y reduce el exceso de inventario.",
      bgColor: "bg-green-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      ),
      title: "Seguimiento de Producción",
      description: "Sigue cada lote desde su creación hasta la venta final, garantizando una trazabilidad completa y una calidad consistente.",
      bgColor: "bg-cyan-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
      ),
      title: "Análisis de Rentabilidad",
      description: "Entiende tus costos y ganancias por lote para tomar decisiones estratégicas que impulsen el crecimiento de tu negocio.",
      bgColor: "bg-blue-100"
    }
  ];

  return(
    //  Solo el <main>, sin Header ni Footer
    <main className="flex-1 px-4 md:px-10 lg:px-20 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-blue-900 dark:text-white text-5xl font-black tracking-tight mb-4">
            Acerca de Inventrack
          </h1>
          <p className="text-cyan-600 dark:text-cyan-400 text-xl font-normal leading-normal max-w-3xl mx-auto">
            Optimiza tu producción y maximiza tus ganancias con la gestión inteligente de inventario.
          </p>
        </div>

        <div className="space-y-12">
          {/* ¿Qué es Inventrack? */}
          <section>
            <h2 className="text-blue-900 dark:text-white text-3xl font-bold tracking-tight mb-4">
              ¿Qué es Inventrack?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              Inventrack es una solución integral diseñada para simplificar y optimizar la gestión de inventario, 
              el seguimiento de la producción y el análisis de la rentabilidad por lotes. Nuestra plataforma 
              proporciona las herramientas necesarias para tomar decisiones informadas, reducir el desperdicio 
              y aumentar la eficiencia en todas las etapas de su proceso de producción.
            </p>
          </section>

          {/* ¿A quién va dirigido? */}
          <section>
            <h2 className="text-blue-900 dark:text-white text-3xl font-bold tracking-tight mb-4">
              ¿A quién va dirigido?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              Inventrack es ideal para pequeñas y medianas empresas, fabricantes, productores artesanales 
              y cualquier negocio que necesite un control preciso sobre su inventario y procesos de producción. 
              Si buscas mejorar la trazabilidad, entender tus costos y maximizar tus márgenes de ganancia, 
              nuestra plataforma es para ti.
            </p>
          </section>

          {/* Ventajas */}
          <section>
            <h2 className="text-blue-900 dark:text-white text-3xl font-bold tracking-tight mb-6 text-center">
              Nuestras Ventajas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <AdvantageCard key={index} {...advantage} />
              ))}
            </div>
          </section>

          {/* Más Información */}
          <section>
            <h2 className="text-blue-900 dark:text-white text-3xl font-bold tracking-tight mb-4">
              Más Información
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                className="flex-1 text-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-base font-bold rounded-lg transition-colors"
                href="#"
              >
                Documentación
              </a>
              <a 
                className="flex-1 text-center px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-base font-bold rounded-lg transition-colors"
                href="#"
              >
                Soporte Técnico
              </a>
              <a 
                className="flex-1 text-center px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-base font-bold rounded-lg transition-colors"
                href="#"
              >
                contacto@inventrack.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default AboutPage