import { useState } from "react";

export default function Parcelas() {

  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-[var(--text-black)]">
          <p className="text-lg font-normal">Parcela a mostrar:</p>
            <select
              id="opciones"
              name="opciones"
              value={selectedOption}
              onChange={handleChange}
              className="w-64 px-3 py-2 border-[var(--color-blue)] border-b"
            >
              <option value="">Selecciona una parcela</option>
              <option value="opcion1">Parcela 1</option>
              <option value="opcion2">Parcela 2</option>
              <option value="opcion3">Parcela 3</option>
            </select>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          { /* Datos generales */}
          <div className="p-6 bg-white rounded-lg w-full">
            <div>
              <h3 className="text-md font-medium">Datos generales</h3>
              <p className="text-xs font-light">Información general de la parcela</p>
            </div>
            <div className="p-[0.6px] w-64 bg-[var(--color-blue)] mt-6 mb-6"></div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-[var(--text-blue)]">NOMBRE</span>
                <p className="text-sm font-base">Parcela 1</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-blue)]">UBICACION</span>
                <p className="text-sm font-base">Zona Norte</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-blue)]">RESPONSABLE</span>
                <p className="text-sm font-base">Juan P\u00e9rez</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-blue)]">TIPO DE CULTIVO</span>
                <p className="text-sm font-base">Tomate</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-blue)]">ÚLTIMO RIEGO</span>
                <p className="text-sm font-base">2025-03-24 19:57:27</p>
              </div>
            </div>

          </div>
          {/* Graficas */}
          <div className="p-6 bg-white rounded-lg w-full">
            <div>
              <h3 className="text-md font-medium">Datos generales</h3>
              <p className="text-xs font-light">Información general de la parcela</p>
            </div>
          </div>
        </div>
      </div>
    );
  }