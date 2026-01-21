function AdvantageCard({ icon, title, description, bgColor }) {
  return(
    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${bgColor}`}>
        {icon}
      </div>
      <h3 className="text-blue-900 dark:text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default AdvantageCard