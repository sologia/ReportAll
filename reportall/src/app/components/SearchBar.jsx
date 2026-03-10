import { FaBars, FaSearch } from "react-icons/fa";

const SearchBar = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center bg-[#ECE6F0] rounded-full px-4 py-3 shadow-sm">

        {/* Icono de filtros */}
        <FaBars className="text-gray-600 mr-3 cursor-pointer" />

        {/* Input */}
        <input
          type="text"
          placeholder="Buscar"
          className="flex-1 bg-transparent outline-none text-gray-700"
        />

        {/* Icono de búsqueda */}
        <FaSearch className="text-gray-600 ml-3 cursor-pointer" />
      </div>
    </div>
  )
}

export default SearchBar