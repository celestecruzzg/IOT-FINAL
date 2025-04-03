import { useState } from 'react';
import { DashboardIcon, TrashIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import Logo from '../assets/icons/logo.svg';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-white shadow-md border-r border-gray-300 transition-all duration-300 ${isOpen ? 'w-58' : 'w-20'} sm:hidden md:block`}>
      <div className="p-4 flex items-center justify-between">
        {isOpen && <img src={Logo} alt="Weather App Logo" className="h-12 " />}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-200"
        >
          <HamburgerMenuIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <nav className="mt-3 px-4">
        <div className="p-[0.7px] bg-gray-200 mb-3"></div>
        {isOpen && <h3 className='mt-4 text-xs text-gray-400 font-sm'>MENU</h3>}
        <div className="mt-8 space-y-4 text-sm">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:bg-gray-200'} ${isOpen ? '' : 'justify-center'}`
            }
          >
            <DashboardIcon className={`${isOpen ? 'w-6 h-6 mr-3' : 'w-8 h-8'}`} />
            {isOpen && 'Dashboard'}
          </NavLink>
          <NavLink
            to="/dashboard/eliminados"
            className={({ isActive }) => 
              `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:bg-gray-200'} ${isOpen ? '' : 'justify-center'}`
            }
          >
            <TrashIcon className={`${isOpen ? 'w-6 h-6 mr-3' : 'w-8 h-8'}`} />
            {isOpen && 'Eliminados'}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
