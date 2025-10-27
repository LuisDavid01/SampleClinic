#!/usr/bin/env node

import fetch from 'node-fetch'

const baseUrl = 'http://localhost:3001'

async function probarEndpointDoctores() {
  try {
    console.log('🔍 Probando endpoint de doctores...\n')

    const response = await fetch(`${baseUrl}/api/evaluacion-diagnostico/doctores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    })

    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 Status Text: ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Respuesta exitosa:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('❌ Error en la respuesta:')
      console.log(errorText)
    }

  } catch (error) {
    console.error('❌ Error al probar endpoint:', error.message)
  }
}

probarEndpointDoctores()
