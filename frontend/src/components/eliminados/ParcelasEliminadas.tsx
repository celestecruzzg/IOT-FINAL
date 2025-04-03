import React, { useEffect, useState } from 'react';
import { sensorService, ParcelaEliminada } from '../../services/api';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/system';
import { AccessTime } from '@mui/icons-material';

// Estilo personalizado para las celdas de la tabla
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  borderBottom: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[100],
  padding: '12px 16px',
}));

// Estilo para las filas de la tabla
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const ParcelasEliminadas: React.FC = () => {
  const [parcelasEliminadas, setParcelasEliminadas] = useState<ParcelaEliminada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParcelasEliminadas = async () => {
      try {
        const response = await sensorService.getParcelasEliminadas();
        if (response.success) {
          setParcelasEliminadas(response.data);
        } else {
          setError(response.message || 'Error al cargar parcelas eliminadas');
          setParcelasEliminadas(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar parcelas eliminadas');
        setParcelasEliminadas(null);
      } finally {
        setLoading(false);
      }
    };

    loadParcelasEliminadas();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!parcelasEliminadas || parcelasEliminadas.length === 0) {
    return <Alert severity="info">No hay parcelas eliminadas</Alert>;
  }

  return (
    <TableContainer 
  component={Paper} 
  sx={{ 
    borderRadius: 3,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    background: 'linear-gradient(to bottom right, #f9f9f9, #ffffff)'
  }}
>
  <Table sx={{ minWidth: 650 }} aria-label="tabla de parcelas">
    <TableHead>
      <TableRow sx={{ 
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? 'rgba(100, 149, 237, 0.15)' 
          : 'rgba(100, 149, 237, 0.4)',
        '& th': {
          fontSize: '0.95rem',
          fontWeight: 600,
          color: (theme) => theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
          borderBottom: '2px solid rgba(100, 149, 237, 0.5)'
        }
      }}>
        <StyledTableCell sx={{ py: 2 }}>Nombre</StyledTableCell>
        <StyledTableCell sx={{ py: 2 }}>Ubicación</StyledTableCell>
        <StyledTableCell sx={{ py: 2 }}>Responsable</StyledTableCell>
        <StyledTableCell sx={{ py: 2 }}>Tipo de Cultivo</StyledTableCell>
        <StyledTableCell sx={{ py: 2 }}>Último Riego</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {parcelasEliminadas.map((parcela) => (
        <StyledTableRow 
          key={parcela.id}
          sx={{
            '&:nth-of-type(even)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            },
            '&:hover': {
              backgroundColor: 'rgba(100, 149, 237, 0.08)'
            },
            transition: 'background-color 0.2s ease'
          }}
        >
          <TableCell sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            py: 1.5
          }}>{parcela.nombre}</TableCell>
          <TableCell sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            py: 1.5
          }}>{parcela.ubicacion}</TableCell>
          <TableCell sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            py: 1.5
          }}>{parcela.responsable}</TableCell>
          <TableCell sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            py: 1.5
          }}>{parcela.tipo_cultivo}</TableCell>
          <TableCell sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            py: 1.5,
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.85rem',
            color: (theme) => {
              const fechaRiego = new Date(parcela.ultimo_riego);
              const hoy = new Date();
              const diffDias = Math.floor((hoy - fechaRiego) / (1000 * 60 * 60 * 24));
              
              return diffDias > 3 
                ? theme.palette.error.main 
                : diffDias > 1 
                  ? theme.palette.warning.main
                  : theme.palette.success.main;
            },
            backgroundColor: (theme) => theme.palette.mode === 'light' 
              ? 'rgba(0, 0, 0, 0.02)' 
              : 'rgba(255, 255, 255, 0.02)',
            borderRadius: 1,
            px: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AccessTime fontSize="small" sx={{ opacity: 0.7 }} />
            {new Date(parcela.ultimo_riego).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </TableCell>
        </StyledTableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
  );
};

export default ParcelasEliminadas;
