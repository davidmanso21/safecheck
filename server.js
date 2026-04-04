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
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    const MAX = 20 * 1024 * 1024;
    req.on('data', chunk => {
      total += chunk.length;
      if (total > MAX) { reject(new Error('Payload demasiado grande')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function callAnthropic(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const bodyBuf = Buffer.from(body, 'utf8');
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bodyBuf.length,
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      timeout: 60000,
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout llamando a Anthropic')); });
    req.write(bodyBuf);
    req.end();
  });
}

function getPrompt(section) {
  if (section === '11') return `Eres un experto en inspecciones de seguridad laboral PRL.
Analiza la imagen de la portada del Plan de Prevención de Riesgos Laborales.
Lee TODO el texto: logotipos, encabezados, pies de página, sellos.
Extrae: nombre empresa, dirección/ubicación, fecha del documento, número de revisión.
Responde SOLO con JSON válido sin ningún texto extra ni bloques de código markdown:
{"empresa":"nombre de la empresa","ubicacion":"dirección completa o ciudad","fecha_doc":"fecha si visible o null","revision":"número revisión o null","observaciones":"otros datos relevantes"}`;

  if (section === '12') return `Eres un experto en inspecciones de seguridad laboral PRL.
Analiza esta imagen del Libro de Subcontratación.
Lee todas las filas visibles: nombre empresa, CIF/NIF, actividad, fechas entrada/salida, representante.
Responde SOLO con JSON válido sin texto extra:
{"empresas":["nombre1","nombre2"],"cifs":["cif1","cif2"],"actividades":["act1"],"fechas":["fecha1"],"representantes":["rep1"],"observaciones":"datos adicionales visibles"}`;

  if (section === '21') return `Eres un experto en inspecciones de seguridad laboral.
Analiza esta imagen de un botiquín de primeros auxilios.
Identifica: tijeras, vendas, tiritas, gasas, agua oxigenada, guantes, esparadrapo, pinzas, termómetro, antiséptico.
Responde SOLO con JSON válido sin texto extra:
{"elementos_visibles":["el1","el2"],"elementos_faltantes":["el3"],"estado_general":"bueno","observaciones":"descripción"}`;

  if (section === '22') return `Eres un experto en lectura de texto en imágenes.
Busca en la imagen CUALQUIER fecha de caducidad, expiración o fecha límite.
Puede aparecer como: CAD, Caduca, EXP, Caducidad, fecha en formato DD/MM/AAAA o MM/AAAA.
Lee con máxima atención todos los dígitos visibles.
Responde SOLO con JSON válido sin texto extra:
{"fecha_detectada":"YYYY-MM-DD o null","texto_original":"texto exacto visto","confianza":"alta/media/baja","ubicacion_en_imagen":"donde aparece en la imagen"}`;

  return '';
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', apiKey: !!ANTHROPIC_API_KEY }));
    return;
  }

  if (parsed.pathname === '/api/analyze' && req.method === 'POST') {
    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada en Railway.' }));
      return;
    }
    try {
      const raw = await readBody(req);
      const { imageBase64, mediaType, section } = JSON.parse(raw);
      const prompt = getPrompt(section);
      if (!prompt) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Sección desconocida: ' + section }));
        return;
      }
      console.log(`[API] seccion=${section} mediaType=${mediaType}`);
      const result = await callAnthropic({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: prompt }
        ]}]
      });
      console.log(`[API] Anthropic HTTP ${result.status}`);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } catch (err) {
      console.error('[API] Error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  let filePath = path.join(__dirname, 'public',
    parsed.pathname === '/' ? 'index.html' : parsed.pathname
  );
  const publicDir = path.resolve(__dirname, 'public');
  if (!path.resolve(filePath).startsWith(publicDir)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SafeCheck en http://0.0.0.0:${PORT}`);
  console.log(`🔑 API Key: ${ANTHROPIC_API_KEY ? '✅ OK' : '❌ NO configurada'}`);
});
