import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardIndex from "./pages/DashboardIndex";
import { AuthPage } from "./pages/AuthPage";
import Parcelas from "./pages/Parcelas";
import ProtectedRoute from "./Layouts/ProtectedRoute";
import Historial from "./pages/Historial";
import { ThemeProvider, createTheme } from '@mui/material/styles';  // Importar ThemeProvider y createTheme

// Definir un tema con MUI (opcional, puedes personalizarlo)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Ejemplo de color primario
    },
    secondary: {
      main: '#9c27b0', // Ejemplo de color secundario
    },
    grey: {
      100: '#f5f5f5',  // Si deseas usar colores grises personalizados
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>  {/* Envolver tu aplicación con ThemeProvider */}
      <Routes>
        {/* Solo permite acceso a la página de login sin autenticación */}
        <Route path="/login" element={<AuthPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardIndex />} />
            <Route path="parcelas" element={<Parcelas />} />
            <Route path="eliminados" element={<Historial />} />
          </Route>
        </Route>

        {/* Si la ruta no existe, redirige a login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ThemeProvider>  
  );
}
