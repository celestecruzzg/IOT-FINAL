// src/components/Header.tsx
// import { FiCloud } from "react-icons/fi";
import Icono from '../assets/icons/icono_header.svg';

const Header = () => {
  return (
    <header className="mb-8 flex gap-3">
        {/* <FiCloud className="text-3xl text-blue-500" /> */}
        <img src={Icono} alt="icono header" className='w-16' />
        <div className="items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0084FF] to-[#2DD4BF] bg-clip-text text-transparent">Mini estación meteorológica</h1>
            <p className="mt-1 text-gray-600">Monitoreo de datos meteorológicos en tiempo real</p>
        </div>
    </header>
  );
};

export default Header;