# Configuración de Clerk para la Clínica

## Problema Actual
El error "Clerk: Failed to load Clerk" indica que faltan las variables de entorno necesarias para que Clerk funcione.

## Solución

### 1. Crear archivo `.env.local`
En la raíz del proyecto `clinica-nextjs/`, crea un archivo llamado `.env.local` con el siguiente contenido:

```bash
# Clerk Configuration
# Obtén estas claves desde https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
CLERK_SECRET_KEY=sk_test_tu_clave_aqui

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Obtener las claves de Clerk
1. Ve a [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Crea una nueva aplicación o selecciona una existente
3. Ve a la sección "API Keys"
4. Copia la "Publishable Key" (empieza con `pk_test_`)
5. Copia la "Secret Key" (empieza con `sk_test_`)

### 3. Configurar la aplicación en Clerk
En el dashboard de Clerk, configura:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/dashboard`
- **After sign-up URL**: `/dashboard`

### 4. Reiniciar el servidor
Después de crear el archivo `.env.local`:
```bash
npm run dev
```

## Configuración Temporal
Si no tienes acceso a Clerk por ahora, el sistema usará claves de demostración (`pk_test_demo`) que permitirán que la aplicación funcione en modo de desarrollo, pero sin autenticación real.

## Verificación
Una vez configurado correctamente, deberías ver:
- ✅ No más errores de "Clerk: Failed to load Clerk"
- ✅ Sistema de autenticación funcionando
- ✅ Páginas protegidas accesibles
- ✅ Componentes de Clerk renderizándose correctamente

## Notas Importantes
- El archivo `.env.local` NO debe subirse a Git (ya está en `.gitignore`)
- Las claves de demostración solo funcionan en desarrollo
- Para producción, necesitarás claves reales de Clerk 