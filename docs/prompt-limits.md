# Sistema de Límites de Prompts

Este documento describe el sistema de límites de prompts implementado para controlar el uso de la API de Gemini en la aplicación.

## Características

- **Límite mensual configurable**: Cada usuario tiene un límite de prompts por mes (por defecto 10)
- **Reset automático mensual**: El contador se restablece automáticamente el primer día de cada mes
- **Verificación en tiempo real**: Se verifica el límite antes de cada uso de la API
- **Interfaz de usuario**: Componente visual que muestra el progreso y estado del uso
- **Integración con Stripe**: Los usuarios reciben prompts adicionales al completar pagos
- **Bonificaciones automáticas**: +10 prompts por cada pago exitoso

## Estructura de la Base de Datos

### Campos añadidos al modelo User

```prisma
model User {
  // ... campos existentes ...
  
  // Campos para límites de prompts
  monthlyPromptLimit    Int           @default(10)  // Límite mensual de prompts
  currentPromptUsage    Int           @default(0)   // Uso actual de prompts en el mes
  lastPromptReset       DateTime      @default(now()) // Fecha del último reset mensual
}
```

## API Endpoints

### 1. Verificar y obtener uso de prompts
```
GET /api/prompt-usage
```

**Respuesta:**
```json
{
  "canUse": true,
  "remainingPrompts": 7,
  "monthlyLimit": 10,
  "currentUsage": 3,
  "nextResetDate": "2024-02-01T00:00:00.000Z",
  "usagePercentage": 30
}
```

### 2. Analizar documento (con verificación de límites)
```
POST /api/analyzed
```

**Headers requeridos:**
- Autenticación Clerk

**Body:**
```json
{
  "text": "contenido del documento..."
}
```

**Respuesta exitosa:**
```json
{
  "summary": "resumen generado...",
  "promptUsage": {
    "remaining": 6,
    "used": 4,
    "limit": 10,
    "nextReset": "2024-02-01T00:00:00.000Z"
  }
}
```

**Error cuando se alcanza el límite:**
```json
{
  "error": "Has alcanzado tu límite mensual de 10 prompts. El límite se restablecerá el 1/2/2024."
}
```

## Utilidades del Backend

### `lib/promptLimits.ts`

#### Funciones principales:

1. **`checkAndIncrementPromptUsage(userId: string)`**
   - Verifica si el usuario puede usar un prompt
   - Resetea el contador si es un nuevo mes
   - Retorna información detallada del uso

2. **`incrementPromptUsage(userId: string)`**
   - Incrementa el contador de uso en 1
   - Se llama solo después de un uso exitoso de la API

3. **`getPromptLimitInfo(userId: string)`**
   - Obtiene información del uso sin modificar el contador
   - Útil para mostrar estadísticas

4. **`updateMonthlyPromptLimit(userId: string, newLimit: number)`**
   - Actualiza el límite mensual de un usuario
   - Útil para planes de suscripción

5. **`addPromptsToLimit(userId: string, additionalPrompts: number)`** ⭐ **NUEVO**
   - Añade prompts adicionales al límite existente
   - Utilizado por el webhook de Stripe para bonificaciones

6. **`resetPromptUsage(userId: string)`** ⭐ **NUEVO**
   - Resetea el contador de uso (útil para regalos)
   - Actualiza la fecha de reset

## Componentes del Frontend

### `components/PromptUsageDisplay.tsx`

Componente visual que muestra:
- Barra de progreso del uso actual con gradientes
- Prompts restantes en tarjetas destacadas
- Fecha del próximo reset
- Estado (disponible/límite alcanzado)
- Advertencias cuando se acerca al límite (75%+)
- Diseño consistente con el tema oscuro del dashboard

### `hooks/usePromptUsage.ts`

Hook personalizado que proporciona:
- Estado del uso de prompts
- Función para refrescar datos
- Función para verificar uso antes de operaciones

## Integración con Stripe ⭐ **NUEVO**

### Webhook de Stripe (`app/api/webhooks/stripe/route.ts`)

El sistema automáticamente añade prompts cuando:

1. **Checkout completado**: +10 prompts al usuario
2. **Pago exitoso**: +10 prompts por cada factura pagada

```typescript
// Ejemplo de bonificación automática
await addPromptsToLimit(userId, 10)
```

### Eventos manejados:

- `checkout.session.completed`: Añade 10 prompts
- `invoice.payment_succeeded`: Añade 10 prompts por pago

## Uso en el Frontend

### Dashboard Integration

El componente `PromptUsageDisplay` está integrado en el dashboard:

```tsx
// app/dashboard/_components/DashboardContent.tsx
import PromptUsageDisplay from '@/components/PromptUsageDisplay'

// En el JSX:
<div className='p-6 rounded-2xl border border-purple-300/10 bg-black/30'>
    <PromptUsageDisplay />
</div>
```

### Ejemplo básico:

```tsx
import { usePromptUsage } from '@/hooks/usePromptUsage'
import PromptUsageDisplay from '@/components/PromptUsageDisplay'

function MyComponent() {
  const { usageData, loading, checkUsage } = usePromptUsage()

  const handleAnalyzeDocument = async () => {
    const canUse = await checkUsage()
    
    if (!canUse) {
      alert('Has alcanzado tu límite mensual de prompts')
      return
    }

    // Proceder con el análisis
    // ...
  }

  return (
    <div>
      <PromptUsageDisplay />
      <button onClick={handleAnalyzeDocument}>
        Analizar Documento
      </button>
    </div>
  )
}
```

## Lógica de Reset Mensual

El sistema detecta automáticamente cuando es un nuevo mes comparando:
- Año actual vs año del último reset
- Mes actual vs mes del último reset

Si es un nuevo mes:
1. Se resetea `currentPromptUsage` a 0
2. Se actualiza `lastPromptReset` a la fecha actual
3. El usuario puede volver a usar prompts hasta su límite

## Configuración de Límites por Plan

Para implementar diferentes límites según el plan de suscripción:

```typescript
// Ejemplo: Actualizar límite según el plan
async function updateUserPlanLimit(userId: string, plan: string) {
  const limits = {
    'free': 10,
    'basic': 50,
    'pro': 200,
    'enterprise': 1000
  }
  
  await updateMonthlyPromptLimit(userId, limits[plan] || 10)
}
```

## Bonificaciones y Regalos

### Añadir prompts adicionales:

```typescript
// Añadir 25 prompts como bonificación
await addPromptsToLimit(userId, 25)

// Resetear uso actual (regalo de prompts)
await resetPromptUsage(userId)
```

### Casos de uso:

- **Pagos exitosos**: +10 prompts automáticamente
- **Promociones**: Añadir prompts específicos
- **Compensaciones**: Resetear contador de uso
- **Plan upgrades**: Aumentar límite base

## Manejo de Errores

### Errores comunes:

1. **Usuario no autenticado**: 401 Unauthorized
2. **Límite alcanzado**: 429 Too Many Requests
3. **Usuario no encontrado**: 404 Not Found
4. **Error de base de datos**: 500 Internal Server Error

### Mensajes de error en español:

- "No autorizado. Debes iniciar sesión para usar esta función."
- "Has alcanzado tu límite mensual de X prompts. El límite se restablecerá el DD/MM/YYYY."

## Migración de Datos

Para usuarios existentes, los nuevos campos se crean con valores por defecto:
- `monthlyPromptLimit`: 10
- `currentPromptUsage`: 0
- `lastPromptReset`: fecha actual

## Monitoreo y Analytics

Para monitorear el uso, puedes consultar:

```sql
-- Usuarios que han alcanzado su límite
SELECT id, email, currentPromptUsage, monthlyPromptLimit 
FROM "User" 
WHERE currentPromptUsage >= monthlyPromptLimit;

-- Promedio de uso por usuario
SELECT AVG(currentPromptUsage) as avgUsage, 
       AVG(monthlyPromptLimit) as avgLimit 
FROM "User";

-- Usuarios con más prompts disponibles
SELECT id, email, (monthlyPromptLimit - currentPromptUsage) as remaining
FROM "User" 
ORDER BY remaining DESC;
```

## Consideraciones de Rendimiento

- Las verificaciones de límites son rápidas (consultas simples a la BD)
- El reset mensual se hace automáticamente en cada verificación
- No se requieren jobs programados para el reset
- Los datos se cachean en el frontend para reducir llamadas a la API
- Los webhooks de Stripe son asíncronos y no afectan la experiencia del usuario

## Flujo de Usuario Completo

1. **Usuario accede al dashboard**: Ve su uso actual de prompts
2. **Sube un PDF**: El sistema verifica límites antes de procesar
3. **Análisis exitoso**: Se incrementa el contador de uso
4. **Pago de suscripción**: Recibe +10 prompts automáticamente
5. **Reset mensual**: El contador se restablece automáticamente 