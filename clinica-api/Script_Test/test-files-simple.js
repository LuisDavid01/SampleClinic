#!/usr/bin/env node

/**
 * Script simple para probar la API de archivos
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

// Función para hacer login
async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correoElectronico: 'admin@clinica.com',
        contrasena: 'admin123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error en login: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error en login:', error.message);
    return null;
  }
}

// Función para probar listado de archivos
async function testListFiles(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Listado de archivos exitoso');
    console.log(`📊 Total archivos: ${data.pagination?.total || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Error en listado:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Probando API de archivos...');
  
  // Login
  console.log('🔐 Iniciando sesión...');
  const token = await login();
  
  if (!token) {
    console.error('❌ No se pudo obtener token de autenticación');
    process.exit(1);
  }
  
  console.log('✅ Login exitoso');
  
  // Probar listado
  console.log('📋 Probando listado de archivos...');
  const success = await testListFiles(token);
  
  if (success) {
    console.log('🎉 ¡API de archivos funcionando correctamente!');
  } else {
    console.log('❌ Error en la API de archivos');
  }
}

// Ejecutar
main().catch(console.error);
