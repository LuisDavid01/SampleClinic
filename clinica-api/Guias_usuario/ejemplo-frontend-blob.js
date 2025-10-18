/**
 * Ejemplo de cómo usar el endpoint de archivos desde el frontend con Blob
 * Este archivo muestra diferentes formas de enviar archivos como Blob
 */

// ========================================
// 1. ENVIAR ARCHIVO DESDE INPUT FILE
// ========================================

async function subirArchivoDesdeInput(userId, clerkToken) {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    throw new Error('No se seleccionó ningún archivo');
  }
  
  const formData = new FormData();
  formData.append('files', file);
  formData.append('categoria', 'documento');
  formData.append('descripcion', 'Archivo desde input');
  
  const response = await fetch(`/api/files/${userId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// ========================================
// 2. CREAR BLOB DESDE TEXTO
// ========================================

async function subirTextoComoArchivo(userId, clerkToken, contenido, nombreArchivo) {
  // Crear Blob desde texto
  const blob = new Blob([contenido], { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('files', blob, nombreArchivo);
  formData.append('categoria', 'texto');
  formData.append('descripcion', 'Archivo de texto generado');
  
  const response = await fetch(`/api/files/${userId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// ========================================
// 3. CREAR BLOB DESDE JSON
// ========================================

async function subirJSONComoArchivo(userId, clerkToken, datos, nombreArchivo) {
  // Convertir objeto a JSON string
  const jsonString = JSON.stringify(datos, null, 2);
  
  // Crear Blob desde JSON
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const formData = new FormData();
  formData.append('files', blob, nombreArchivo);
  formData.append('categoria', 'datos');
  formData.append('descripcion', 'Datos JSON exportados');
  
  const response = await fetch(`/api/files/${userId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// ========================================
// 4. CREAR BLOB DESDE IMAGEN (Canvas)
// ========================================

async function subirImagenDesdeCanvas(userId, clerkToken, canvas, nombreArchivo) {
  return new Promise((resolve, reject) => {
    // Convertir canvas a Blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('No se pudo crear el Blob desde el canvas'));
        return;
      }
      
      const formData = new FormData();
      formData.append('files', blob, nombreArchivo);
      formData.append('categoria', 'imagen');
      formData.append('descripcion', 'Imagen generada desde canvas');
      
      try {
        const response = await fetch(`/api/files/${userId}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${clerkToken}`
          },
          body: formData
        });
        
        const result = await response.json();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
}

// ========================================
// 5. SUBIR MÚLTIPLES ARCHIVOS COMO BLOB
// ========================================

async function subirMultiplesArchivos(userId, clerkToken, archivos) {
  const formData = new FormData();
  
  // Agregar múltiples archivos
  archivos.forEach((archivo, index) => {
    formData.append('files', archivo.blob, archivo.nombre);
  });
  
  formData.append('categoria', 'multiple');
  formData.append('descripcion', `${archivos.length} archivos subidos`);
  
  const response = await fetch(`/api/files/${userId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// ========================================
// 6. EJEMPLO COMPLETO CON REACT/NEXT.JS
// ========================================

// Componente React para subir archivos
function FileUploadComponent({ userId, clerkToken }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      files.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('categoria', 'usuario');
      formData.append('descripcion', 'Archivos subidos por usuario');
      
      const response = await fetch(`/api/files/${userId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Archivos subidos:', result);
      
    } catch (error) {
      console.error('Error subiendo archivos:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleTextUpload = async () => {
    const texto = document.getElementById('textoInput').value;
    
    if (!texto.trim()) return;
    
    setUploading(true);
    
    try {
      const blob = new Blob([texto], { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('files', blob, 'texto-generado.txt');
      formData.append('categoria', 'texto');
      formData.append('descripcion', 'Texto generado por usuario');
      
      const response = await fetch(`/api/files/${userId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('Texto subido:', result);
      
    } catch (error) {
      console.error('Error subiendo texto:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <h3>Subir Archivos</h3>
      
      {/* Subir archivos desde input */}
      <input 
        type="file" 
        multiple 
        onChange={handleFileUpload}
        disabled={uploading}
      />
      
      {/* Subir texto como archivo */}
      <div>
        <textarea 
          id="textoInput" 
          placeholder="Escribe algo para subir como archivo..."
          rows={4}
          cols={50}
        />
        <button onClick={handleTextUpload} disabled={uploading}>
          {uploading ? 'Subiendo...' : 'Subir Texto'}
        </button>
      </div>
    </div>
  );
}

// ========================================
// 7. UTILIDADES PARA MANEJAR BLOBS
// ========================================

// Convertir ArrayBuffer a Blob
function arrayBufferToBlob(arrayBuffer, mimeType = 'application/octet-stream') {
  return new Blob([arrayBuffer], { type: mimeType });
}

// Convertir Base64 a Blob
function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Crear Blob desde URL (fetch)
async function urlToBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

// ========================================
// 8. EJEMPLO DE USO COMPLETO
// ========================================

async function ejemploCompleto() {
  const userId = 1;
  const clerkToken = 'tu_clerk_token_aqui';
  
  try {
    // 1. Subir archivo desde input
    console.log('Subiendo archivo desde input...');
    const resultado1 = await subirArchivoDesdeInput(userId, clerkToken);
    console.log('Resultado:', resultado1);
    
    // 2. Subir texto como archivo
    console.log('Subiendo texto como archivo...');
    const resultado2 = await subirTextoComoArchivo(
      userId, 
      clerkToken, 
      'Este es un archivo de texto generado desde JavaScript',
      'archivo-generado.txt'
    );
    console.log('Resultado:', resultado2);
    
    // 3. Subir JSON como archivo
    console.log('Subiendo JSON como archivo...');
    const datos = { usuario: 'test', fecha: new Date().toISOString() };
    const resultado3 = await subirJSONComoArchivo(
      userId, 
      clerkToken, 
      datos, 
      'datos.json'
    );
    console.log('Resultado:', resultado3);
    
    // 4. Subir múltiples archivos
    console.log('Subiendo múltiples archivos...');
    const archivos = [
      { blob: new Blob(['Archivo 1'], { type: 'text/plain' }), nombre: 'archivo1.txt' },
      { blob: new Blob(['Archivo 2'], { type: 'text/plain' }), nombre: 'archivo2.txt' }
    ];
    const resultado4 = await subirMultiplesArchivos(userId, clerkToken, archivos);
    console.log('Resultado:', resultado4);
    
  } catch (error) {
    console.error('Error en ejemplo completo:', error);
  }
}

// Exportar funciones para uso en otros módulos
export {
  subirArchivoDesdeInput,
  subirTextoComoArchivo,
  subirJSONComoArchivo,
  subirImagenDesdeCanvas,
  subirMultiplesArchivos,
  FileUploadComponent,
  arrayBufferToBlob,
  base64ToBlob,
  urlToBlob,
  ejemploCompleto
};
