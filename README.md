# 🚀 Next.js SaaS Template - PDF AI Summarizer

Una plantilla completa de SaaS construida con Next.js que permite a los usuarios subir archivos PDF y obtener resúmenes inteligentes utilizando la API de Gemini AI de Google.

## ✨ Características

- 🏠 **Landing Page** - Página de inicio atractiva
- 💰 **Página de Precios** - Planes de suscripción con Stripe
- 📊 **Dashboard** - Panel de usuario para gestionar PDFs
- 🤖 **AI PDF Summarizer** - Resúmenes automáticos con Gemini AI
- 🔐 **Autenticación** - Sistema completo con Clerk
- 💳 **Pagos** - Integración con Stripe
- 🗄️ **Base de Datos** - Prisma + Supabase
- 🚀 **Deploy Ready** - Configurado para Vercel

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14
- **Autenticación**: Clerk
- **Base de Datos**: Supabase + Prisma ORM
- **Pagos**: Stripe
- **AI**: Google Gemini API (Gratuita)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Inicio Rápido

### 1. Clona el repositorio

```bash
git clone [tu-repositorio]
cd nextjs-saas-template
```

### 2. Instala las dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_publica
CLERK_SECRET_KEY=sk_test_tu_clave_secreta
WEBHOOK_SECRET=tu_webhook_secret_de_clerk

# Google Gemini AI
GEMINI_API_KEY=tu_clave_de_gemini_api

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
STRIPE_PRICE_ID=price_tu_price_id
STRIPE_WEBHOOK_SECRET=tu_webhook_secret_de_stripe

# Supabase Database
# Para operaciones normales (queries, inserts, updates) - USA POOLING
DATABASE_URL="postgresql://postgres.usuario:contraseña@host:6543/postgres?pgbouncer=true&connection_limit=1"

# Para migraciones y operaciones que requieren conexión directa
DIRECT_URL="postgresql://postgres.usuario:contraseña@host:5432/postgres"
```

### 4. Configura la base de datos

```bash
# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones
npx prisma db push
```

### 5. Ejecuta el proyecto

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Configuración de Servicios

### Clerk (Autenticación)

1. Crea una cuenta en [Clerk](https://clerk.com)
2. Crea una nueva aplicación
3. Copia las claves públicas y secretas
4. Configura los webhooks para sincronizar usuarios

### Supabase (Base de Datos)

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > Database
3. Copia la Connection String (para pooling y directa)
4. Habilita Row Level Security si es necesario

### Stripe (Pagos)

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Ve a Developers > API Keys
3. Copia las claves públicas y secretas
4. Crea productos y precios
5. Configura webhooks para manejar eventos de pago

### Google Gemini AI

1. Ve a [Google AI Studio](https://aistudio.google.com)
2. Crea una API Key gratuita
3. Configura los límites de uso según tus necesidades

### Vercel (Deployment)

1. Conecta tu repositorio a Vercel
2. Configura todas las variables de entorno
3. Deploy automático con cada push

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (auth)/         # Rutas y componentes relacionados con autenticación (login, registro, etc.)
│   ├── dashboard/      # Sección principal para usuarios autenticados
│   ├── pricing/        # Página de precios y planes
│   ├── api/            # Endpoints de la API interna
│   └── globals.css     # Estilos globales de la aplicación
├── components/
│   ├── ui/             # Componentes reutilizables de interfaz de usuario
│   ├── auth/           # Componentes específicos para autenticación
│   └── dashboard/      # Componentes específicos del dashboard
├── lib/
│   ├── prisma.ts       # Configuración y cliente de Prisma ORM
│   ├── stripe.ts       # Integración con Stripe para pagos
│   └── gemini.ts       # Integración con Gemini AI para procesamiento de PDFs
├── prisma/
│   └── schema.prisma   # Definición del esquema de base de datos
└── middleware.ts       # Middleware global para Next.js (protección de rutas)
```

## 🎯 Funcionalidades Implementadas

### Dashboard
- Subida de archivos PDF
- Lista de PDFs procesados
- Visualización de resúmenes
- Gestión de suscripción

### Sistema de Pagos
- Planes de suscripción
- Checkout con Stripe
- Webhooks para actualizar estado
- Portal del cliente

### AI Integration
- Procesamiento de PDFs
- Generación de resúmenes con Gemini
- Límites basados en suscripción

### Autenticación
- Login/Registro con Clerk
- Middleware de protección de rutas
- Sincronización con base de datos

## 🔒 Middleware y Seguridad

El middleware está configurado para:
- Proteger rutas del dashboard
- Validar autenticación
- Manejar redirects automáticos
- Sincronizar usuarios con la base de datos

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción (incluye prisma generate automáticamente)
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint

# Base de datos
npx prisma studio      # Interface visual
npx prisma db push     # Sincronizar schema
npx prisma generate    # Generar cliente (se ejecuta automáticamente en postinstall)
```

## ⚙️ Configuración de Vercel

El proyecto incluye un archivo `vercel.json` con la configuración optimizada:

```json
{
    "buildCommand": "prisma generate && next build",
    "installCommand": "npm install"
}
```

Esta configuración asegura que:
- Prisma se genere correctamente antes del build
- Las dependencias se instalen adecuadamente
- El deployment sea consistente

## 🚨 Notas Importantes

1. **API Keys**: Nunca commitees las API keys reales al repositorio
2. **Webhooks**: Configura correctamente los webhooks de Stripe y Clerk
3. **Base de Datos**: Usa la URL con pooling para operaciones normales
4. **Límites**: La API de Gemini tiene límites gratuitos, considera upgrading para producción
5. **CORS**: Configura correctamente los dominios en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de cada servicio
2. Verifica que todas las variables de entorno estén configuradas
3. Comprueba los logs en Vercel para errores de deployment
4. Asegúrate de que los webhooks estén funcionando correctamente

---

**¡Desarrollado con ❤️ para la comunidad SaaS!**