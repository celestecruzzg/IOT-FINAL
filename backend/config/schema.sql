-- Crear tabla de usuarios primero
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de parcelas después
CREATE TABLE IF NOT EXISTS parcelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    responsable VARCHAR(100),
    tipo_cultivo VARCHAR(100),
    ultimo_riego DATETIME,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de historial de sensores
CREATE TABLE IF NOT EXISTS historial_sensores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    humedad DECIMAL(5,2),
    temperatura DECIMAL(5,2),
    lluvia DECIMAL(5,2),
    sol DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
