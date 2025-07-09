# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

# 🏥 Clínica FisioSalud - Página Web

Una página web moderna y profesional para una clínica de fisioterapia, desarrollada con React, TypeScript y Vite.

## 📋 Descripción

Esta aplicación web presenta una clínica de fisioterapia ficticia llamada "Clínica FisioSalud" ubicada en Costa Rica. La página incluye todas las secciones necesarias para un negocio de fisioterapia comercial:

- **Sección Hero**: Bienvenida atractiva con llamadas a la acción
- **Servicios**: Catálogo completo de servicios de fisioterapia
- **Perfil Profesional**: Información del equipo médico
- **Ubicación**: Dirección, horarios y cómo llegar
- **Agendar Cita**: Formulario para programar consultas
- **Contacto**: Información de contacto y formulario
- **Redes Sociales**: Enlaces a plataformas sociales

## 🚀 Características

### ✨ Diseño Moderno
- Interfaz responsive y atractiva
- Gradientes y efectos visuales modernos
- Animaciones suaves y transiciones
- Diseño adaptativo para móviles y tablets

### 🎯 Funcionalidades
- Navegación suave entre secciones
- Formularios interactivos para citas y contacto
- Enlaces directos a WhatsApp y teléfono
- Botón de "volver arriba"
- Menú hamburguesa para móviles

### 📱 Responsive Design
- Optimizado para dispositivos móviles
- Diseño adaptativo con CSS Grid y Flexbox
- Menú de navegación colapsable
- Tipografía escalable

## 🛠️ Tecnologías Utilizadas

- **React 19.1.0**: Framework de JavaScript para la interfaz de usuario
- **TypeScript**: Tipado estático para mayor robustez
- **Vite**: Herramienta de construcción rápida
- **React Router DOM**: Navegación entre páginas
- **Lucide React**: Iconos modernos y ligeros
- **CSS3**: Estilos modernos con Grid, Flexbox y animaciones

## 📁 Estructura del Proyecto

```
clinica-web/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   ├── Hero.tsx            # Sección de bienvenida
│   │   ├── Servicios.tsx       # Catálogo de servicios
│   │   ├── PerfilProfesional.tsx # Equipo médico
│   │   ├── Ubicacion.tsx       # Información de ubicación
│   │   ├── AgendarCita.tsx     # Formulario de citas
│   │   ├── Contacto.tsx        # Información de contacto
│   │   └── Footer.tsx          # Pie de página con redes sociales
│   ├── assets/
│   ├── App.tsx                 # Componente principal
│   ├── App.css                 # Estilos principales
│   ├── index.css               # Estilos globales
│   └── main.tsx                # Punto de entrada
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Secciones de la Página

### 1. **Navbar** 
- Logo de la clínica
- Menú de navegación con enlaces a todas las secciones
- Menú hamburguesa para dispositivos móviles
- Navegación suave entre secciones

### 2. **Hero Section**
- Título principal atractivo
- Descripción de la clínica
- Botones de llamada a la acción
- Indicador de scroll

### 3. **Servicios**
- 6 servicios principales de fisioterapia:
  - Fisioterapia Deportiva
  - Fisioterapia Cardiorrespiratoria
  - Fisioterapia Neurológica
  - Terapia Manual
  - Fisioterapia Geriátrica
  - Fisioterapia Ortopédica
- Iconos coloridos y descripciones detalladas

### 4. **Perfil Profesional**
- Estadísticas de la clínica (pacientes, experiencia, etc.)
- Información de 3 fisioterapeutas especializados:
  - Dr. Carlos Méndez (Fisioterapia Deportiva)
  - Dra. Ana Rodríguez (Fisioterapia Neurológica)
  - Dr. Miguel Torres (Fisioterapia Ortopédica)
- Certificaciones y especialidades

### 5. **Ubicación**
- Dirección completa en San José, Costa Rica
- Horarios de atención detallados
- Información de contacto (teléfono, email)
- Instrucciones de cómo llegar
- Servicios adicionales disponibles
- Información de emergencias

### 6. **Agendar Cita**
- Formulario completo para programar citas
- Selección de fecha y hora
- Elección de servicio
- Información personal del paciente
- Beneficios de agendar con la clínica
- Enlaces directos de contacto

### 7. **Contacto**
- Información de contacto detallada
- Formulario de contacto
- Preguntas frecuentes
- Enlaces directos a WhatsApp y teléfono

### 8. **Footer**
- Información de la clínica
- Enlaces rápidos a secciones
- Redes sociales (Facebook, Instagram, Twitter, LinkedIn, YouTube)
- Formulario de suscripción al boletín
- Información legal

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd clinica-web
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter

## 📱 Información de Contacto

### Clínica FisioSalud
- **Dirección**: Calle 123 # 45-67, Local 2, Barrio Amon, San José C.R., Costa Rica
- **Teléfono**: (506) 234 5678
- **Celular**: (506) 300 123 4567
- **WhatsApp**: (506) 300 123 4567
- **Email**: info@clinicafisiosalud.com
- **Emergencias**: (506) 800 123 4567

### Horarios de Atención
- **Lunes - Viernes**: 8:00 AM - 7:00 PM
- **Sábados**: 8:00 AM - 2:00 PM
- **Domingos**: Cerrado

## 🎯 Características Técnicas

### Performance
- Carga rápida con Vite
- Optimización de imágenes
- Lazy loading de componentes
- CSS optimizado

### SEO
- Estructura semántica HTML
- Meta tags optimizados
- URLs amigables
- Contenido estructurado

### Accesibilidad
- Navegación por teclado
- Contraste de colores adecuado
- Textos alternativos en imágenes
- Estructura de encabezados correcta

## 🔧 Personalización

### Cambiar Información de Contacto
Edita los archivos de componentes para actualizar:
- Números de teléfono
- Dirección
- Horarios
- Información del equipo

### Modificar Servicios
En `src/components/Servicios.tsx` puedes:
- Agregar nuevos servicios
- Cambiar descripciones
- Modificar iconos y colores

### Actualizar Estilos
Los estilos principales están en:
- `src/App.css` - Estilos de componentes
- `src/index.css` - Estilos globales

## 📦 Despliegue

### Build para Producción
```bash
npm run build
```

### Despliegue en Netlify
1. Conecta tu repositorio a Netlify
2. Configura el directorio de build como `dist`
3. El comando de build será `npm run build`

### Despliegue en Vercel
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Vite
3. Se desplegará automáticamente

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado para equipo de trabajo Curso Analisis y modelado de requerimientos - U.Fidelitas - Costa Rica


- [React](https://reactjs.org/) - Framework de JavaScript
- [Vite](https://vitejs.dev/) - Herramienta de construcción
- [Lucide](https://lucide.dev/) - Iconos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático

---

**Nota**: Esta es una aplicación de demostración. La información de contacto y ubicación es ficticia y se debe actualizar con datos reales antes de usar en producción.

---

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
