const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function callAnthropic(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url);

  // ── CORS headers (development friendly) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── PROXY: /api/analyze ──
  if (parsed.pathname === '/api/analyze' && req.method === 'POST') {
    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' }));
      return;
    }
    try {
      const rawBody = await readBody(req);
      const { imageBase64, mediaType, section } = JSON.parse(rawBody);

      // Build section-specific prompt
      let prompt = '';
      if (section === '11') {
        prompt = `Eres un asistente experto en inspecciones de seguridad laboral.
Analiza esta imagen de la portada o página principal de un Plan de Prevención de Riesgos Laborales (PRL).
Tu objetivo es extraer:
1. El nombre de la empresa o instalación
2. La dirección o ubicación que aparezca en el documento
3. Cualquier otra información relevante visible (fecha, número de revisión, etc.)

Lee TODO el texto visible en la imagen con cuidado.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código, sin explicaciones:
{"empresa":"nombre exacto de la empresa","ubicacion":"dirección completa","observaciones":"otros datos relevantes o vacío"}`;
      } else if (section === '12') {
        prompt = `Eres un asistente experto en inspecciones de seguridad laboral.
Analiza esta imagen del Libro de Subcontratación (registro de empresas subcontratadas).
Lee TODO el texto visible: nombres de empresas, CIF/NIF, fechas de entrada/salida, representantes, etc.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional:
{"empresas":["empresa1","empresa2"],"cifs":["cif1","cif2"],"fechas":["fecha1","fecha2"],"representantes":["rep1"],"observaciones":"cualquier dato adicional visible"}`;
      } else if (section === '21') {
        prompt = `Eres un asistente experto en inspecciones de seguridad laboral.
Analiza esta imagen de un botiquín de primeros auxilios.
Identifica con detalle qué elementos son claramente visibles y cuáles parecen ausentes.
Elementos a buscar: tijeras, vendas, tiritas/apósitos, gasas, agua oxigenada, guantes, esparadrapo, pinzas, termómetro, antiséptico.

Responde ÚNICAMENTE con un objeto JSON válido:
{"elementos_visibles":["elemento1","elemento2"],"elementos_faltantes":["elemento3"],"estado_general":"bueno/regular/malo","observaciones":"descripción del estado"}`;
      } else if (section === '22') {
        prompt = `Eres un asistente experto en lectura de fechas en documentos e imágenes.
Analiza esta imagen y busca CUALQUIER fecha de caducidad, fecha de expiración o fecha límite de uso.
Puede aparecer como: "CAD:", "Caduca:", "EXP:", "Fecha caducidad:", "Best before:", una fecha aislada, etc.
Lee con mucho cuidado todos los números y texto de la imagen.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional:
{"fecha_detectada":"YYYY-MM-DD o null si no hay fecha","texto_original":"texto exacto de la fecha tal como aparece en la imagen","confianza":"alta/media/baja","ubicacion_en_imagen":"descripción de dónde aparece la fecha"}`;
      }

      const result = await callAnthropic({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      });

      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } catch (err) {
      console.error('Error en /api/analyze:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── STATIC FILES ──
  let filePath = path.join(__dirname, 'public', parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(__dirname, 'public', 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(500); res.end('Error'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ SafeCheck corriendo en http://localhost:${PORT}`);
  if (!ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY no definida — el análisis IA no funcionará');
  } else {
    console.log('🤖 API de Anthropic configurada correctamente');
  }
});
