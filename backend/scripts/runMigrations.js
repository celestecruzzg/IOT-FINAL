require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');

const createUsuariosTable = `
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const createParcelasTable = `
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
)`;

const createHistorialSensoresTable = `
CREATE TABLE IF NOT EXISTS historial_sensores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    humedad DECIMAL(5,2),
    temperatura DECIMAL(5,2),
    lluvia DECIMAL(5,2),
    sol DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

async function runMigrations() {
    console.log('Iniciando migraciones...');
    
    // Primero conectamos sin especificar una base de datos
    const initialConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'weatherapp'
    });

    try {
        // Crear la base de datos si no existe
        await initialConnection.query('CREATE DATABASE IF NOT EXISTS weatherApp');
        console.log('Base de datos creada o verificada');
        
        // Cerrar la conexión inicial
        await initialConnection.end();
        
        // Crear una nueva conexión con la base de datos seleccionada
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'weatherapp'
        });

        try {
            console.log('Ejecutando migraciones...');
            
            // Leer el archivo SQL
            const sqlFile = await fs.readFile(path.join(__dirname, '../migrations/001_initial_schema.sql'), 'utf8');
            
            // Dividir el archivo en comandos SQL individuales
            const commands = sqlFile.split(';').filter(cmd => cmd.trim());
            
            // Ejecutar cada comando por separado
            for (const command of commands) {
                if (command.trim()) {
                    try {
                        await connection.query(command);
                        console.log('Comando SQL ejecutado exitosamente');
                    } catch (cmdError) {
                        console.error('Error ejecutando comando SQL:', cmdError.message);
                        console.error('Comando que falló:', command);
                    }
                }
            }
            
            console.log('Migraciones completadas exitosamente');
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error ejecutando migraciones:', error);
        throw error;
    }
}

runMigrations().catch(console.error); 