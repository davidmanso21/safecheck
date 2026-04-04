# 🛡️ SafeCheck v3 — Inspecciones de Seguridad Laboral

## Estructura del proyecto
```
safecheck/
├── public/
│   └── index.html    ← App frontend completa
├── server.js         ← Servidor Node.js + proxy Anthropic
├── package.json
├── Procfile
├── .gitignore
└── README.md
```

## Usuarios
| Usuario      | Contraseña | Rol           |
|-------------|------------|---------------|
| admin       | admin123   | Administrador |
| inspector1  | insp2024   | Inspector     |

## Despliegue paso a paso

### 1. GitHub
```bash
git init
git add .
git commit -m "feat: SafeCheck v3"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/safecheck.git
git push -u origin main
```

### 2. Railway
1. railway.app → New Project → Deploy from GitHub → safecheck
2. Settings → Networking → Generate Domain

### 3. Variable ANTHROPIC_API_KEY en Railway
1. console.anthropic.com → API Keys → Create Key → copiar sk-ant-...
2. Railway → tu servicio → Variables → New Variable
   - NAME: ANTHROPIC_API_KEY
   - VALUE: sk-ant-api03-XXXXXXXXX
3. Railway reinicia automáticamente

### Verificar en Logs de Railway:
✅ SafeCheck en http://0.0.0.0:XXXX
🔑 API Key: ✅ OK
