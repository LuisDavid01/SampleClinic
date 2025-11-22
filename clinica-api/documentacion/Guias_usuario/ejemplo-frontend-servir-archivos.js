/**
 * EJEMPLO: Cómo usar el endpoint para servir archivos desde el frontend
 * 
 * Este archivo muestra cómo integrar el endpoint de archivos en tu aplicación Next.js
 * para mostrar archivos en el navegador.
 */

// ========================================
// 1. COMPONENTE REACT PARA MOSTRAR ARCHIVOS
// ========================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const VisorArchivos = ({ idUsuario }) => {
  const { getToken } = useAuth();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar lista de archivos
  useEffect(() => {
    const cargarArchivos = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`/api/files/${idUsuario}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Error cargando archivos');
        
        const data = await response.json();
        setArchivos(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarArchivos();
  }, [idUsuario, getToken]);

  // Función para obtener URL del archivo
  const obtenerUrlArchivo = (idArchivo) => {
    return `/api/files/${idUsuario}/${idArchivo}/serve`;
  };

  // Función para descargar archivo
  const descargarArchivo = async (idArchivo, nombreArchivo) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files/${idUsuario}/${idArchivo}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error descargando archivo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error descargando archivo:', err);
    }
  };

  if (loading) return <div>Cargando archivos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="visor-archivos">
      <h2>Mis Archivos</h2>
      
      <div className="archivos-grid">
        {archivos.map((archivo) => (
          <div key={archivo.idArchivo} className="archivo-card">
            <div className="archivo-info">
              <h3>{archivo.nombreOriginal}</h3>
              <p>Tamaño: {(archivo.tamanoArchivo / 1024).toFixed(2)} KB</p>
              <p>Tipo: {archivo.tipoMime}</p>
              {archivo.descripcion && <p>Descripción: {archivo.descripcion}</p>}
            </div>
            
            <div className="archivo-acciones">
              {/* Para imágenes, PDFs y videos - mostrar inline */}
              {archivo.tipoMime.startsWith('image/') && (
                <div className="preview-imagen">
                  <img 
                    src={obtenerUrlArchivo(archivo.idArchivo)}
                    alt={archivo.nombreOriginal}
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }}>
                    <p>No se puede mostrar la imagen</p>
                    <button onClick={() => descargarArchivo(archivo.idArchivo, archivo.nombreOriginal)}>
                      Descargar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Para PDFs - mostrar en iframe */}
              {archivo.tipoMime === 'application/pdf' && (
                <div className="preview-pdf">
                  <iframe
                    src={obtenerUrlArchivo(archivo.idArchivo)}
                    width="100%"
                    height="400px"
                    title={archivo.nombreOriginal}
                  />
                </div>
              )}
              
              {/* Para videos - mostrar reproductor */}
              {archivo.tipoMime.startsWith('video/') && (
                <div className="preview-video">
                  <video
                    src={obtenerUrlArchivo(archivo.idArchivo)}
                    controls
                    width="100%"
                    height="300px"
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                </div>
              )}
              
              {/* Para otros tipos de archivo */}
              {!archivo.tipoMime.startsWith('image/') && 
               archivo.tipoMime !== 'application/pdf' && 
               !archivo.tipoMime.startsWith('video/') && (
                <div className="preview-otros">
                  <p>Archivo: {archivo.nombreOriginal}</p>
                  <p>Tipo: {archivo.tipoMime}</p>
                  <button onClick={() => descargarArchivo(archivo.idArchivo, archivo.nombreOriginal)}>
                    Descargar
                  </button>
                </div>
              )}
              
              {/* Botón de descarga para todos */}
              <button 
                onClick={() => descargarArchivo(archivo.idArchivo, archivo.nombreOriginal)}
                className="btn-descargar"
              >
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisorArchivos;

// ========================================
// 2. HOOK PERSONALIZADO PARA ARCHIVOS
// ========================================

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useArchivos = (idUsuario) => {
  const { getToken } = useAuth();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarArchivos = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const params = new URLSearchParams(filtros);
      const response = await fetch(`/api/files/${idUsuario}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error cargando archivos');
      
      const data = await response.json();
      setArchivos(data.data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const subirArchivos = async (archivos, metadata = {}) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      
      // Agregar archivos
      archivos.forEach(archivo => {
        formData.append('files', archivo);
      });
      
      // Agregar metadata
      if (metadata.expedienteId) {
        formData.append('expedienteId', metadata.expedienteId);
      }
      if (metadata.categoria) {
        formData.append('categoria', metadata.categoria);
      }
      
      const response = await fetch(`/api/files/${idUsuario}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Error subiendo archivos');
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const eliminarArchivo = async (idArchivo) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files/${idUsuario}/${idArchivo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error eliminando archivo');
      
      // Recargar lista
      await cargarArchivos();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const actualizarArchivo = async (idArchivo, metadata) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files/${idUsuario}/${idArchivo}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      
      if (!response.ok) throw new Error('Error actualizando archivo');
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    archivos,
    loading,
    error,
    cargarArchivos,
    subirArchivos,
    eliminarArchivo,
    actualizarArchivo
  };
};

// ========================================
// 3. COMPONENTE DE SUBIDA DE ARCHIVOS
// ========================================

import React, { useState } from 'react';
import { useArchivos } from './hooks/useArchivos';

const SubirArchivos = ({ idUsuario }) => {
  const { subirArchivos, loading } = useArchivos(idUsuario);
  const [archivos, setArchivos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [expedienteId, setExpedienteId] = useState('');

  const handleFileChange = (e) => {
    setArchivos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (archivos.length === 0) {
      alert('Selecciona al menos un archivo');
      return;
    }

    try {
      await subirArchivos(archivos, {
        categoria: categoria || null,
        expedienteId: expedienteId || null
      });
      
      alert('Archivos subidos exitosamente');
      setArchivos([]);
      setCategoria('');
      setExpedienteId('');
    } catch (error) {
      alert('Error subiendo archivos: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="subir-archivos">
      <h3>Subir Archivos</h3>
      
      <div>
        <label>Archivos:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="*/*"
        />
      </div>
      
      <div>
        <label>Categoría (opcional):</label>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ej: Documentos, Imágenes, etc."
        />
      </div>
      
      <div>
        <label>ID Expediente (opcional):</label>
        <input
          type="number"
          value={expedienteId}
          onChange={(e) => setExpedienteId(e.target.value)}
          placeholder="ID del expediente"
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir Archivos'}
      </button>
    </form>
  );
};

// ========================================
// 4. PÁGINA PRINCIPAL CON ARCHIVOS
// ========================================

import React from 'react';
import { useAuth } from '@clerk/nextjs';
import VisorArchivos from '../components/VisorArchivos';
import SubirArchivos from '../components/SubirArchivos';

const ArchivosPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Debes estar autenticado para ver archivos</div>;
  }

  // Obtener ID de usuario (esto depende de cómo tengas configurado Clerk)
  const idUsuario = user.publicMetadata?.idUsuario || 1; // Ajusta según tu configuración

  return (
    <div className="archivos-page">
      <h1>Gestor de Archivos</h1>
      
      <SubirArchivos idUsuario={idUsuario} />
      
      <VisorArchivos idUsuario={idUsuario} />
    </div>
  );
};

export default ArchivosPage;

// ========================================
// 5. ESTILOS CSS (opcional)
// ========================================

const estilos = `
.visor-archivos {
  margin-top: 2rem;
}

.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.archivo-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.archivo-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.archivo-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.archivo-acciones {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-imagen img {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-pdf iframe {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-video video {
  border-radius: 4px;
}

.btn-descargar {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-descargar:hover {
  background: #0056b3;
}

.subir-archivos {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.subir-archivos div {
  margin-bottom: 1rem;
}

.subir-archivos label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.subir-archivos input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.subir-archivos button {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.subir-archivos button:hover {
  background: #218838;
}

.subir-archivos button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
`;

// ========================================
// 6. CONFIGURACIÓN DE NEXT.JS
// ========================================

// En tu next.config.js, asegúrate de tener:
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

// ========================================
// 7. VARIABLES DE ENTORNO
// ========================================

// En tu .env.local:
const envExample = `
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_key_aqui
`;

console.log('Ejemplo de integración de archivos completado!');
console.log('Recuerda configurar las variables de entorno y los tokens de Clerk.');
