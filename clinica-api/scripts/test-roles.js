#!/usr/bin/env node

/**
 * Script para probar la configuración de roles
 * Este script simula diferentes escenarios de metadatos de Clerk
 */

import { determineUserRole, showClerkRoleConfiguration } from '../src/utils/clerkSync.js';

// Casos de prueba para diferentes configuraciones de metadatos
const testCases = [
  {
    name: "Usuario con rol 'admin' en publicMetadata",
    clerkUser: {
      id: "user_test_1",
      email: "admin@test.com",
      publicMetadata: { role: "admin" },
      privateMetadata: {}
    }
  },
  {
    name: "Usuario con rol 'fisioterapeuta' en roles array",
    clerkUser: {
      id: "user_test_2", 
      email: "doctor@test.com",
      publicMetadata: { roles: ["fisioterapeuta"] },
      privateMetadata: {}
    }
  },
  {
    name: "Usuario con rol 'recepcionista' en privateMetadata",
    clerkUser: {
      id: "user_test_3",
      email: "reception@test.com", 
      publicMetadata: {},
      privateMetadata: { role: "recepcionista" }
    }
  },
  {
    name: "Usuario con rol 'paciente' (por defecto)",
    clerkUser: {
      id: "user_test_4",
      email: "patient@test.com",
      publicMetadata: {},
      privateMetadata: {}
    }
  },
  {
    name: "Usuario con múltiples roles (debe tomar el primero válido)",
    clerkUser: {
      id: "user_test_5",
      email: "multi@test.com",
      publicMetadata: { 
        roles: ["invalid_role", "admin", "paciente"] 
      },
      privateMetadata: {}
    }
  }
];

async function testRoleDetermination() {
  console.log('🧪 Iniciando pruebas de determinación de roles...\n');
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log(`   Email: ${testCase.clerkUser.email}`);
    console.log(`   PublicMetadata:`, testCase.clerkUser.publicMetadata);
    console.log(`   PrivateMetadata:`, testCase.clerkUser.privateMetadata);
    
    try {
      const roleId = await determineUserRole(testCase.clerkUser);
      console.log(`   ✅ Rol determinado: ID ${roleId}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }
  
  console.log('🎉 Pruebas completadas!\n');
  
  // Mostrar información de configuración
  showClerkRoleConfiguration();
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRoleDetermination().catch(console.error);
}

export { testRoleDetermination, testCases };
