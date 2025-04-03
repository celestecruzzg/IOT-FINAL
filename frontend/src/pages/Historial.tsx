import React from 'react';
import ParcelasEliminadas from '../components/eliminados/ParcelasEliminadas';

const Historial: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex-1">
        <h2 className="text-2xl text-[var(--text-black)] font-bold mb-5">Historial de parcelas eliminadas</h2>
        <ParcelasEliminadas />
      </div>
    </div>
  );
};

export default Historial;
