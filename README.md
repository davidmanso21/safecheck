# 🛡️ SafeCheck — Inspecciones de Seguridad Laboral

App web de inspecciones PRL con análisis de imágenes mediante IA (Anthropic Claude).

---

## 📁 Estructura del proyecto

```
safecheck/
├── public/
│   └── index.html       ← Aplicación frontend completa
├── server.js            ← Servidor Node.js + proxy hacia Anthropic API
├── package.json
├── Procfile             ← Instrucción de arranque para Railway
├── .gitignore
└── README.md
```

---

## 👥 Usuarios

| Usuario      | Contraseña | Rol           |
|-------------|------------|---------------|
| `admin`     | `admin123` | Administrador |
| `inspector1`| `insp2024` | Inspector (Carlos Rodríguez) |

---

## 🚀 Paso 1 — Subir a GitHub

### 1.1 Crear repositorio en GitHub
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `safecheck`
3. Privado o público (según prefieras)
4. **NO** marques "Add README" (ya lo tienes)
5. Haz clic en **Create repository**

### 1.2 Subir los archivos desde tu ordenador

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "feat: SafeCheck v2 con proxy Anthropic"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/safecheck.git
git push -u origin main
```

---

## 🚂 Paso 2 — Desplegar en Railway

### 2.1 Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con tu cuenta de GitHub
2. Haz clic en **New Project**
3. Selecciona **Deploy from GitHub repo**
4. Elige el repositorio `safecheck`
5. Railway detectará el `Procfile` automáticamente y comenzará el despliegue

### 2.2 Generar dominio público

1. En tu proyecto de Railway, ve a la pestaña **Settings**
2. En la sección **Networking** → **Public Networking**
3. Haz clic en **Generate Domain**
4. Railway te dará una URL del tipo: `safecheck-production.up.railway.app`

---

## 🔑 Paso 3 — Configurar la API de Anthropic (CLAVE)

> ⚠️ **SIN ESTE PASO EL ANÁLISIS DE IA NO FUNCIONARÁ**

### 3.1 Obtener la clave de API de Anthropic

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Inicia sesión o crea una cuenta
3. En el menú lateral ve a **API Keys**
4. Haz clic en **Create Key**
5. Dale un nombre: `safecheck-railway`
6. **Copia la clave** — empieza por `sk-ant-api03-...`
   > ⚠️ Guárdala bien, Anthropic solo te la muestra UNA VEZ

### 3.2 Añadir la clave en Railway

1. En tu proyecto de Railway, haz clic en el servicio `safecheck`
2. Ve a la pestaña **Variables**
3. Haz clic en **New Variable**
4. Rellena así:

   | Campo | Valor |
   |-------|-------|
   | **NAME** | `ANTHROPIC_API_KEY` |
   | **VALUE** | `sk-ant-api03-XXXXXXXXX` (tu clave) |

5. Haz clic en **Add** → Railway reiniciará el servidor automáticamente

### 3.3 Verificar que funciona

En Railway → tu servicio → pestaña **Logs**, deberías ver:
```
✅ SafeCheck corriendo en http://localhost:XXXX
🤖 API de Anthropic configurada correctamente
```

Si ves `⚠️ ANTHROPIC_API_KEY no definida` → la variable no se guardó correctamente.

---

## 🔄 Actualizar la aplicación

Cuando hagas cambios en el código:

```bash
git add .
git commit -m "fix: descripción del cambio"
git push origin main
```

Railway detectará el push y redespllegará automáticamente.

---

## 🧪 Desarrollo local

Crea un archivo `.env` en la raíz (NO lo subas a GitHub):
```
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXX
```

Luego instala `dotenv` y úsalo, o simplemente:

```bash
ANTHROPIC_API_KEY=sk-ant-... node server.js
# → http://localhost:3000
```

---

## 🤖 Qué hace la IA en cada sección

| Sección | Análisis |
|---------|----------|
| **1.1 Plan PRL** | Lee empresa, dirección y fecha del documento |
| **1.2 Subcontratación** | Extrae nombres de empresas, CIFs y fechas |
| **2.1 Botiquín** | Identifica elementos presentes y faltantes |
| **2.2 Caducidad** | Lee la fecha de caducidad → alerta si está vencida |

---

## ⚠️ Alertas automáticas

- Si la fecha de caducidad del botiquín es **anterior a hoy** →
  aparece: **"BOTIQUÍN CADUCADO — PARALICE LOS TRABAJOS"**
- La inspección queda marcada con alerta en el historial del administrador
