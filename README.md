# 🛡️ SafeCheck — Guía de despliegue completa

## Estructura del proyecto (SOLO 4 archivos)

```
safecheck/
├── server.js       ← Servidor + app completa embebida (único archivo crítico)
├── package.json    ← Configuración Node.js
├── Procfile        ← Instrucción de arranque para Railway
└── .gitignore      ← Exclusiones Git
```

> ✅ NO hay carpeta `public/`. El HTML está dentro de `server.js`. Así no puede haber errores de archivos no encontrados.

---

## Usuarios del sistema

| Usuario      | Contraseña | Rol           | Descripción                    |
|-------------|------------|---------------|--------------------------------|
| `admin`     | `admin123` | Administrador | Solicita inspecciones, ve todos los informes, descarga PDFs |
| `inspector1`| `insp2024` | Inspector     | Carlos Rodríguez — realiza las inspecciones asignadas |

---

## PASO 1 — Instalar herramientas necesarias

### Instalar Git (si no lo tienes)
- **Windows**: Descarga desde https://git-scm.com/download/win → instala con opciones por defecto
- **Mac**: Abre Terminal y escribe `git --version` → si no está instalado, macOS te pedirá instalarlo
- **Linux**: `sudo apt install git`

### Instalar Node.js (si no lo tienes)
- Descarga la versión LTS desde https://nodejs.org
- Instala con opciones por defecto

### Verificar que funcionan:
```bash
git --version     # debe mostrar: git version 2.x.x
node --version    # debe mostrar: v18.x.x o superior
```

---

## PASO 2 — Crear cuenta en GitHub

1. Ve a **https://github.com** y crea una cuenta si no tienes
2. Verifica tu email

---

## PASO 3 — Crear repositorio en GitHub

1. Inicia sesión en GitHub
2. Haz clic en el **botón verde "New"** (esquina superior izquierda) o ve a https://github.com/new
3. Rellena el formulario:
   - **Repository name**: `safecheck`
   - **Description**: Sistema de inspecciones de seguridad laboral (opcional)
   - **Visibility**: Public o Private (cualquiera funciona)
   - ⚠️ **NO** marques ninguna casilla de "Initialize this repository" — déjalas todas desmarcadas
4. Haz clic en **"Create repository"**
5. GitHub te mostrará una página con instrucciones — cópiala, la necesitarás

---

## PASO 4 — Subir los archivos a GitHub

### 4.1 — Pon todos los archivos en una carpeta
Crea una carpeta llamada `safecheck` en tu ordenador y coloca dentro estos 4 archivos:
- `server.js`
- `package.json`
- `Procfile` (sin extensión)
- `.gitignore`

### 4.2 — Abre la terminal en esa carpeta
- **Windows**: Haz clic derecho dentro de la carpeta → "Open in Terminal" o "Git Bash Here"
- **Mac/Linux**: Abre Terminal y escribe `cd /ruta/a/tu/carpeta/safecheck`

### 4.3 — Ejecuta estos comandos UNO A UNO:

```bash
git init
```
> Inicializa Git en la carpeta. Verás: `Initialized empty Git repository`

```bash
git add .
```
> Añade todos los archivos. Sin salida visible es normal.

```bash
git commit -m "SafeCheck v3 - listo para Railway"
```
> Guarda los cambios. Verás algo como: `[main (root-commit) abc1234] SafeCheck v3`

```bash
git branch -M main
```
> Renombra la rama a "main". Sin salida es normal.

```bash
git remote add origin https://github.com/TU_USUARIO/safecheck.git
```
> ⚠️ IMPORTANTE: Reemplaza `TU_USUARIO` por tu nombre de usuario real de GitHub.
> Por ejemplo: `git remote add origin https://github.com/pepe123/safecheck.git`

```bash
git push -u origin main
```
> Sube los archivos. GitHub pedirá tu **usuario** y una **contraseña** → usa un **Personal Access Token** (ver punto 4.4)

### 4.4 — Si GitHub pide contraseña (token)
GitHub ya no acepta contraseñas normales para `git push`. Necesitas un token:
1. Ve a **GitHub → tu foto de perfil → Settings**
2. Menú izquierdo: **Developer settings** (al final)
3. **Personal access tokens → Tokens (classic)**
4. **Generate new token (classic)**
5. Dale un nombre: `railway-deploy`
6. Marca la casilla **`repo`** (control total de repositorios privados)
7. Haz clic en **Generate token**
8. **COPIA EL TOKEN** (empieza por `ghp_...`) — solo se muestra una vez
9. Cuando Git pida contraseña, pega este token

---

## PASO 5 — Crear cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Start a New Project"**
3. Selecciona **"Login with GitHub"** — autentícate con tu cuenta de GitHub
4. Autoriza Railway para acceder a tus repositorios

---

## PASO 6 — Desplegar en Railway

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona el repositorio **`safecheck`**
4. Railway comenzará el despliegue automáticamente (tarda 1-2 minutos)
5. Verás los logs en tiempo real — espera a ver:
   ```
   ╔══════════════════════════════════════════╗
   ║       SafeCheck v3 — Arrancado           ║
   ║  Puerto: XXXX                            ║
   ║  API Key: ❌ NO configurada ...          ║
   ╚══════════════════════════════════════════╝
   ```
   > La API Key aún no está configurada — lo hacemos en el Paso 7

---

## PASO 7 — Obtener clave API de Anthropic

1. Ve a **https://console.anthropic.com**
2. Crea una cuenta o inicia sesión
3. En el menú izquierdo, haz clic en **"API Keys"**
4. Haz clic en **"Create Key"**
5. Nombre: `safecheck-railway`
6. Haz clic en **"Create Key"**
7. **COPIA LA CLAVE** — empieza por `sk-ant-api03-...`
   > ⚠️ COPIA LA AHORA. Anthropic NO la muestra de nuevo. Si la pierdes tendrás que crear otra.
8. Guárdala en un lugar seguro (bloc de notas, gestor de contraseñas)

---

## PASO 8 — Configurar la clave API en Railway

1. En Railway, haz clic en tu servicio **`safecheck`**
2. Haz clic en la pestaña **"Variables"**
3. Haz clic en **"New Variable"**
4. Rellena exactamente así:
   - **NAME** (campo izquierdo): `ANTHROPIC_API_KEY`
   - **VALUE** (campo derecho): pega tu clave `sk-ant-api03-...`
5. Pulsa **Enter** o haz clic en **"Add"**
6. Railway reiniciará el servidor automáticamente (30 segundos)
7. Vuelve a la pestaña **"Logs"** y verás:
   ```
   ║  API Key: ✅ Configurada                 ║
   ```

---

## PASO 9 — Generar dominio público

1. En tu servicio Railway, ve a la pestaña **"Settings"**
2. Busca la sección **"Networking"**
3. Haz clic en **"Generate Domain"**
4. Railway te dará una URL como: `safecheck-production.up.railway.app`
5. **Haz clic en esa URL** → deberías ver la pantalla de login de SafeCheck

---

## ✅ Verificación final

La app funciona correctamente si:
- [ ] Ves la pantalla de login con el logo 🛡️ SafeCheck
- [ ] Puedes entrar con `admin` / `admin123`
- [ ] Puedes entrar con `inspector1` / `insp2024`
- [ ] El administrador puede solicitar inspecciones
- [ ] El inspector puede iniciar una inspección y subir fotos
- [ ] Al subir una foto, aparece "Analizando imagen con IA Claude…" y luego los datos extraídos
- [ ] El administrador ve la pestaña "Informes" con los informes completados
- [ ] Se puede descargar el PDF del informe

---

## 🔄 Actualizar la app en el futuro

Cada vez que modifiques `server.js`:
```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```
Railway redesplega automáticamente al detectar el push.

---

## ❓ Solución de problemas frecuentes

### La página muestra "Error" o pantalla en blanco
→ Ve a Railway → Logs → busca el mensaje de error exacto

### "API Key: ❌ NO configurada"
→ Ve a Variables en Railway → verifica que el nombre sea exactamente `ANTHROPIC_API_KEY` (sin espacios, mayúsculas exactas)

### La IA dice "Error al analizar" al subir fotos
→ Verifica que la API Key sea correcta en console.anthropic.com → API Keys → comprueba que no esté desactivada o revocada

### `git push` pide contraseña continuamente
→ Usa el Personal Access Token de GitHub (Paso 4.4), no tu contraseña normal

### Railway no detecta el Procfile
→ Asegúrate de que `Procfile` no tenga extensión (.txt, etc.) — debe llamarse exactamente `Procfile`
