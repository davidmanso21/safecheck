# 🛡️ SafeCheck — Sistema de Inspecciones de Seguridad Laboral

Aplicación web para la gestión y realización de inspecciones de seguridad laboral con análisis de fotografías mediante IA (Claude/Copilot).

---

## 🚀 Despliegue en Railway

### Paso 1 — Subir a GitHub

```bash
git init
git add .
git commit -m "feat: SafeCheck initial release"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/safecheck.git
git push -u origin main
```

### Paso 2 — Conectar con Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. Haz clic en **New Project → Deploy from GitHub repo**
3. Selecciona el repositorio `safecheck`
4. Railway detectará automáticamente el `Procfile` y desplegará la app
5. Ve a **Settings → Domains** → genera un dominio público

### Paso 3 — Variables de entorno

En Railway → Variables, añade:
```
PORT=3000
NODE_ENV=production
```

---

## 👥 Usuarios del sistema

| Usuario      | Contraseña | Rol           | Permisos                              |
|-------------|------------|---------------|---------------------------------------|
| `admin`     | `admin123` | Administrador | Solicitar inspecciones, ver historial |
| `inspector1`| `insp2024` | Inspector     | Realizar inspecciones asignadas       |

---

## 📋 Estructura de la inspección

```
Inspección de seguridad
├── 1 - Revisión de documentación
│   ├── 1.1 Adhesión Plan PRL (foto + extracción IA)
│   └── 1.2 Libro de Subcontratación (foto + verificación)
└── 2 - Botiquín
    ├── 2.1 Inspección General (hasta 3 fotos + checklist)
    └── 2.2 Caducidad (foto + lectura de fecha con IA)
```

---

## 🤖 Integración con IA (Claude/Copilot)

La app usa la API de Anthropic (Claude Sonnet) para:

- **Sección 1.1**: Lee el nombre de empresa y ubicación del Plan PRL
- **Sección 1.2**: Lista empresas del Libro de Subcontratación
- **Sección 2.1**: Identifica elementos presentes en el botiquín
- **Sección 2.2**: Extrae la fecha de caducidad de la fotografía

### Configurar clave de API

Añade en Railway → Variables:
```
ANTHROPIC_API_KEY=sk-ant-...
```

O crea un archivo `.env` local (no subir a GitHub):
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📁 Estructura del proyecto

```
safecheck/
├── index.html          ← Aplicación principal
├── server.js           ← Servidor Node.js (Railway)
├── package.json        ← Dependencias
├── Procfile            ← Instrucción de arranque Railway
├── .gitignore          ← Exclusiones Git
└── README.md           ← Esta documentación
```

---

## ⚠️ Alertas del sistema

La app genera alertas automáticas cuando:
- La fecha de caducidad del botiquín es **anterior a la fecha actual**
- En ese caso se muestra: **"PARALICE LOS TRABAJOS"** hasta reponer el botiquín

---

## 🔧 Desarrollo local

```bash
npm install
npm start
# → http://localhost:3000
```
