# Fisioterapia Esteban Porras - Clínica Next.js

Este proyecto es una aplicación web para la clínica de fisioterapia de Esteban Porras, desarrollada con Next.js.

## Descripción

Esta aplicación permite a los usuarios ver información sobre la clínica, agendar citas y administrar su información de perfil. Los administradores tienen un panel para gestionar usuarios y citas.

## Tecnologías Utilizadas

- **Framework:** [Next.js](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Autenticación:** [Clerk](https://clerk.com/)

## Cómo Empezar

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos

- Node.js (v20 o superior)
- npm, yarn, pnpm, o bun

### Instalación

1. Navega al directorio del proyecto:
   ```bash
   cd clinica-nextjs
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Corriendo la Aplicación

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Revisa el código con ESLint.
- `npm run format`: Formatea el código con Prettier.

## Estructura del Proyecto

```
.
├── public/               # Archivos estáticos
├── src/
│   ├── app/              # Rutas y páginas de la aplicación
│   │   ├── admin/        # Panel de administración
│   │   ├── Paciente/     # Perfil del paciente
│   │   └── ...
│   ├── components/       # Componentes reutilizables
│   ├── interfaces/       # Definiciones de tipos e interfaces
│   └── utils/            # Funciones de utilidad
├── .gitignore            # Archivos ignorados por Git
├── next.config.ts        # Configuración de Next.js
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración de TypeScript
```

## Dependencias Principales

- `@clerk/nextjs`: Para la autenticación de usuarios.
- `next`: El framework de React para producción.
- `react`: Biblioteca para construir interfaces de usuario.
- `tailwindcss`: Framework de CSS para un diseño rápido.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir los cambios.