/**
 * SafeCheck — Servidor autónomo
 * El HTML completo está embebido aquí. No hace falta ninguna carpeta externa.
 * Solo necesita: ANTHROPIC_API_KEY como variable de entorno en Railway.
 */

'use strict';
const http  = require('http');
const https = require('https');
const url   = require('url');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/* ─────────────────────────────────────────────────
   HTML COMPLETO DE LA APLICACIÓN (embebido)
───────────────────────────────────────────────── */
const APP_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SafeCheck — Inspecciones de Seguridad</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
:root{--bg:#0a0e1a;--sur:#111827;--sur2:#1a2235;--brd:#1e2d45;--acc:#f97316;--acc2:#fb923c;--ok:#22c55e;--warn:#eab308;--dan:#ef4444;--txt:#e2e8f0;--mut:#64748b;--r:12px}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden}
h1,h2,h3,h4{font-family:'Syne',sans-serif}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(249,115,22,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,.04) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
.screen{display:none;min-height:100vh;position:relative;z-index:1}
.screen.active{display:flex;flex-direction:column}
#sl{align-items:center;justify-content:center;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(249,115,22,.18) 0%,transparent 70%)}
.lcard{background:var(--sur);border:1px solid var(--brd);border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 40px 80px rgba(0,0,0,.5)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:32px}
.lico{width:44px;height:44px;background:var(--acc);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px}
.logo h1{font-size:24px;font-weight:800;letter-spacing:-.5px}
.logo span{color:var(--acc)}
label{display:block;font-size:11px;font-weight:600;color:var(--mut);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
input[type=text],input[type=password],input[type=date],textarea,select{width:100%;background:var(--sur2);border:1px solid var(--brd);border-radius:8px;color:var(--txt);padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;transition:border-color .2s}
input:focus,textarea:focus,select:focus{border-color:var(--acc)}
.fld{margin-bottom:18px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:9px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;cursor:pointer;border:none;transition:all .2s;white-space:nowrap}
.bpri{background:var(--acc);color:#fff}.bpri:hover{background:var(--acc2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(249,115,22,.35)}
.bsec{background:transparent;border:1.5px solid var(--brd);color:var(--txt)}.bsec:hover{border-color:var(--acc);color:var(--acc)}
.bok{background:var(--ok);color:#fff}.bok:hover{filter:brightness(1.1)}
.bpdf{background:#1d4ed8;color:#fff}.bpdf:hover{background:#1e40af}
.bsm{padding:7px 14px;font-size:12px}
.bw{width:100%}
.demo-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--sur2);border-radius:8px;margin-bottom:8px;font-size:13px;cursor:pointer;border:1px solid transparent;transition:border-color .2s}
.demo-row:hover{border-color:var(--acc)}
.dbadge{font-size:10px;padding:3px 8px;border-radius:4px;font-weight:700;text-transform:uppercase}
.ba{background:rgba(249,115,22,.2);color:var(--acc)}.bi{background:rgba(34,197,94,.2);color:var(--ok)}
.errmsg{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#fca5a5;border-radius:8px;padding:10px 14px;font-size:14px;margin-bottom:16px;display:none}
#sa{background:var(--bg)}
.topbar{background:var(--sur);border-bottom:1px solid var(--brd);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.tblogo{display:flex;align-items:center;gap:10px}
.tblogo .lico{width:32px;height:32px;font-size:16px;border-radius:7px}
.tblogo span{font-family:'Syne',sans-serif;font-weight:800;font-size:16px}
.tblogo em{color:var(--acc);font-style:normal}
.upill{display:flex;align-items:center;gap:10px}
.av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
.ava{background:rgba(249,115,22,.3);color:var(--acc);border:1.5px solid var(--acc)}
.avi{background:rgba(34,197,94,.3);color:var(--ok);border:1.5px solid var(--ok)}
.uname{font-size:14px;font-weight:500}.urole{font-size:11px;color:var(--mut)}
.tabnav{display:flex;gap:4px;padding:0 24px;background:var(--sur);border-bottom:1px solid var(--brd)}
.tabbtn{padding:12px 18px;font-family:'Syne',sans-serif;font-weight:600;font-size:13px;background:none;border:none;color:var(--mut);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}
.tabbtn.active{color:var(--acc);border-bottom-color:var(--acc)}
.tabbtn:hover:not(.active){color:var(--txt)}
.ac{padding:32px 24px;max-width:960px;margin:0 auto;width:100%}
.ptitle{font-size:28px;font-weight:800;margin-bottom:4px}
.psub{color:var(--mut);font-size:14px;margin-bottom:28px}
.ialert{background:linear-gradient(135deg,rgba(249,115,22,.15),rgba(249,115,22,.05));border:1.5px solid var(--acc);border-radius:16px;padding:24px 28px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;animation:pb 2.5s ease-in-out infinite}
@keyframes pb{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0)}50%{box-shadow:0 0 0 6px rgba(249,115,22,.12)}}
.aiico{font-size:36px;flex-shrink:0}
.aitxt h3{font-size:18px;margin-bottom:4px}.aitxt p{color:var(--mut);font-size:13px}.aitxt strong{color:var(--acc)}
.srow{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:16px;margin-bottom:28px}
.scard{background:var(--sur);border:1px solid var(--brd);border-radius:var(--r);padding:20px}
.snum{font-family:'Syne',sans-serif;font-size:32px;font-weight:800}
.slbl{color:var(--mut);font-size:12px;margin-top:4px}
.cok{color:var(--ok)}.cwarn{color:var(--warn)}.cdan{color:var(--dan)}
.scard2{background:var(--sur);border:1px solid var(--brd);border-radius:16px;padding:24px;margin-bottom:20px}
.scard2 h3{font-size:16px;margin-bottom:16px}
.rrow{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--sur2);border-radius:10px;margin-bottom:8px;gap:12px;flex-wrap:wrap}
.rinfo{flex:1;min-width:0}.rtitle{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rmeta{font-size:12px;color:var(--mut);margin-top:2px}
.racts{display:flex;align-items:center;gap:8px;flex-shrink:0}
.tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:4px 10px;border-radius:20px;font-weight:700}
.tok{background:rgba(34,197,94,.15);color:var(--ok)}.tdan{background:rgba(239,68,68,.15);color:var(--dan)}
.ih{display:flex;align-items:center;gap:16px;margin-bottom:28px;flex-wrap:wrap}
.ih h2{font-size:22px;font-weight:800}
.pwrap{background:var(--sur2);border-radius:99px;height:6px;flex:1;min-width:80px}
.pbar{height:100%;border-radius:99px;background:var(--acc);transition:width .4s}
.plbl{font-size:12px;color:var(--mut);flex-shrink:0}
.chaps{display:flex;flex-direction:column;gap:12px}
.chap{background:var(--sur);border:1px solid var(--brd);border-radius:14px;overflow:hidden}
.chaphdr{display:flex;align-items:center;gap:16px;padding:18px 20px;cursor:pointer;user-select:none}
.chnum{width:36px;height:36px;border-radius:8px;background:var(--sur2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;flex-shrink:0;transition:all .3s}
.chnum.done{background:rgba(34,197,94,.2);color:var(--ok)}
.chtitle{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;flex:1}
.chev{color:var(--mut);transition:transform .3s}
.chap.open .chev{transform:rotate(180deg)}
.chapbody{display:none;padding:0 20px 20px}
.chap.open .chapbody{display:block}
.sub{background:var(--sur2);border-radius:10px;padding:18px;margin-bottom:12px}
.stitle{font-weight:600;font-size:14px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.snum2{color:var(--acc);font-family:'Syne',sans-serif}
.uz{border:2px dashed var(--brd);border-radius:10px;padding:28px;text-align:center;cursor:pointer;transition:all .2s;position:relative}
.uz:hover{border-color:var(--acc);background:rgba(249,115,22,.04)}
.uz input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.uico{font-size:32px;margin-bottom:8px}
.uz p{color:var(--mut);font-size:13px}.uz strong{color:var(--acc)}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.pthumb{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:4/3;background:var(--sur)}
.pthumb img{width:100%;height:100%;object-fit:cover}
.delbtn{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.75);border:none;border-radius:50%;width:24px;height:24px;color:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
.air{background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.25);border-radius:10px;padding:14px 16px;margin-top:12px;font-size:13px;line-height:1.6}
.ailbl{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--acc);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.aisp{display:inline-block;width:10px;height:10px;border:2px solid var(--acc);border-top-color:transparent;border-radius:50%;animation:sp .6s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.aif{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}
.aifl{font-size:10px;text-transform:uppercase;color:var(--mut);letter-spacing:.4px}
.aifv{color:var(--txt);font-weight:500}
.cblock{background:rgba(255,255,255,.03);border:1px solid var(--brd);border-radius:10px;padding:16px;margin-top:12px}
.cblock h4{font-size:13px;margin-bottom:12px;color:var(--mut)}
.crow{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.dbadge2{display:none;color:var(--ok);font-size:13px;margin-top:8px;font-weight:500}
.cklist{display:flex;flex-direction:column;gap:8px}
.cki{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--sur);border-radius:8px;border:1px solid var(--brd);cursor:pointer;transition:border-color .2s}
.cki:hover{border-color:var(--ok)}
.cki.on{border-color:var(--ok);background:rgba(34,197,94,.06)}
.ckb{width:20px;height:20px;border-radius:5px;border:2px solid var(--brd);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cki.on .ckb{background:var(--ok);border-color:var(--ok)}
.cki.on .ckb::after{content:'✓';font-size:12px;color:#fff;font-weight:700}
.dalert{background:rgba(239,68,68,.12);border:1.5px solid var(--dan);border-radius:10px;padding:16px;margin-top:12px}
.dalert h4{color:var(--dan);font-size:15px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.dalert p{font-size:13px;color:#fca5a5;line-height:1.5}
.dok{background:rgba(34,197,94,.1);border:1.5px solid var(--ok);border-radius:10px;padding:16px;margin-top:12px}
.dok h4{color:var(--ok);font-size:15px;display:flex;align-items:center;gap:8px}
.navrow{display:flex;justify-content:space-between;align-items:center;margin-top:28px}
.mover{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:300;align-items:center;justify-content:center}
.mover.open{display:flex}
.modal{background:var(--sur);border:1px solid var(--brd);border-radius:20px;padding:32px;max-width:540px;width:92%;max-height:85vh;overflow-y:auto}
.modal h3{font-size:20px;margin-bottom:12px}
.modal>p{color:var(--mut);font-size:14px;margin-bottom:20px;line-height:1.6}
.mbtns{display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap}
.rdsec{margin-bottom:14px;padding:14px;background:var(--sur2);border-radius:8px}
.rdsec h4{font-size:12px;color:var(--acc);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}
.rdsec p{font-size:13px;line-height:1.7}
.rdsec ul{font-size:13px;padding-left:18px;line-height:2}
.rdimg{width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-top:8px}
.toast{position:fixed;bottom:24px;right:24px;background:var(--sur);border:1px solid var(--brd);border-radius:12px;padding:14px 20px;font-size:14px;display:none;z-index:999;align-items:center;gap:10px;box-shadow:0 16px 40px rgba(0,0,0,.4)}
.toast.show{display:flex;animation:sin .3s ease}
@keyframes sin{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(max-width:600px){.ac{padding:16px}.pgrid{grid-template-columns:repeat(2,1fr)}.ialert{flex-direction:column}.lcard{padding:32px 20px}.rrow{flex-direction:column;align-items:flex-start}}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="sl" class="screen active">
  <div class="lcard">
    <div class="logo"><div class="lico">&#128737;</div><h1>Safe<span>Check</span></h1></div>
    <h2 style="margin-bottom:6px">Iniciar sesi&#243;n</h2>
    <p style="color:var(--mut);font-size:14px;margin-bottom:24px">Sistema de inspecciones de seguridad laboral</p>
    <div id="lerr" class="errmsg">Usuario o contrase&#241;a incorrectos</div>
    <div class="fld"><label>Usuario</label><input type="text" id="iu" placeholder="admin &nbsp;/&nbsp; inspector1" autocomplete="username"/></div>
    <div class="fld"><label>Contrase&#241;a</label><input type="password" id="ip" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" autocomplete="current-password"/></div>
    <button class="btn bpri bw" onclick="doLogin()">Entrar &#8594;</button>
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--brd)">
      <p style="font-size:12px;color:var(--mut);margin-bottom:10px">Acceso r&#225;pido demo:</p>
      <div class="demo-row" onclick="qlogin('admin','admin123')">
        <span>&#128100; admin / admin123</span><span class="dbadge ba">Administrador</span>
      </div>
      <div class="demo-row" onclick="qlogin('inspector1','insp2024')">
        <span>&#128119; inspector1 / insp2024</span><span class="dbadge bi">Inspector</span>
      </div>
    </div>
  </div>
</div>

<!-- APP -->
<div id="sa" class="screen">
  <nav class="topbar">
    <div class="tblogo"><div class="lico">&#128737;</div><span>Safe<em>Check</em></span></div>
    <div class="upill">
      <div><div class="uname" id="nn"></div><div class="urole" id="nr"></div></div>
      <div class="av" id="nav-av"></div>
      <button class="btn bsec bsm" onclick="doLogout()">Salir</button>
    </div>
  </nav>
  <div class="tabnav" id="tabnav" style="display:none">
    <button class="tabbtn active" id="tb-dash" onclick="goTab('dash')">&#128202; Panel</button>
    <button class="tabbtn" id="tb-rep"  onclick="goTab('rep')">&#128203; Informes</button>
  </div>
  <div class="ac">

    <!-- DASHBOARD -->
    <div id="vd">
      <h1 class="ptitle" id="dtitle">Panel</h1>
      <p class="psub" id="dsub"></p>
      <div id="pal" class="ialert" style="display:none">
        <div class="aiico">&#9888;&#65039;</div>
        <div class="aitxt">
          <h3>Inspecci&#243;n pendiente de realizar</h3>
          <p>Instalaci&#243;n: <strong id="aloc">-</strong> &nbsp;&#183;&nbsp; Solicitada por: <strong id="aby">-</strong></p>
        </div>
        <button class="btn bpri" style="width:auto;flex-shrink:0" onclick="startInsp()">&#9654; Iniciar</button>
      </div>
      <div class="srow">
        <div class="scard"><div class="snum cok" id="s0">0</div><div class="slbl">Completadas</div></div>
        <div class="scard"><div class="snum cwarn" id="s1">0</div><div class="slbl">Pendientes</div></div>
        <div class="scard"><div class="snum cdan" id="s2">0</div><div class="slbl">Alertas caducidad</div></div>
      </div>
      <div id="admpnl" class="scard2" style="display:none">
        <h3>&#9881;&#65039; Solicitar inspecci&#243;n</h3>
        <div class="fld"><label>Nombre instalaci&#243;n</label><input type="text" id="iloc" placeholder="Ej: Nave Industrial A3 &#8211; Pol&#237;gono Norte"/></div>
        <div class="fld"><label>Asignar inspector</label>
          <select id="iinsp"><option value="inspector1">Carlos Rodr&#237;guez (inspector1)</option></select>
        </div>
        <button class="btn bpri" style="width:auto" onclick="reqInsp()">&#128203; Solicitar inspecci&#243;n</button>
      </div>
      <div class="scard2">
        <h3>&#128193; &#218;ltimas inspecciones</h3>
        <div id="histlist"><p style="color:var(--mut);font-size:14px">No hay inspecciones registradas.</p></div>
      </div>
    </div>

    <!-- INFORMES -->
    <div id="vr" style="display:none">
      <h1 class="ptitle">&#128203; Informes de inspecci&#243;n</h1>
      <p class="psub">Consulta y descarga los informes realizados por los inspectores</p>
      <div id="replist"><p style="color:var(--mut);font-size:14px">No hay informes disponibles a&#250;n.</p></div>
    </div>

    <!-- INSPECCION -->
    <div id="vi" style="display:none">
      <div class="ih">
        <button class="btn bsec bsm" onclick="goBack()">&#8592; Volver</button>
        <h2>&#128269; Inspecci&#243;n de seguridad</h2>
        <div class="pwrap"><div class="pbar" id="pb" style="width:0%"></div></div>
        <span class="plbl" id="ptxt">0/4</span>
      </div>
      <p style="color:var(--mut);font-size:13px;margin-bottom:20px">&#128205; <span id="ilbl">&#8212;</span></p>

      <div class="chaps">
        <!-- CAP 1 -->
        <div class="chap" id="c1">
          <div class="chaphdr" onclick="togCh('c1')">
            <div class="chnum" id="c1n">1</div>
            <div class="chtitle">Revisi&#243;n de documentaci&#243;n</div>
            <span class="chev">&#9660;</span>
          </div>
          <div class="chapbody">
            <!-- 1.1 -->
            <div class="sub">
              <div class="stitle"><span class="snum2">1.1</span> Adhesi&#243;n Plan PRL</div>
              <div class="uz">
                <div class="uico">&#128196;</div>
                <p>Sube foto de la <strong>portada del Plan PRL</strong></p>
                <p style="margin-top:4px;font-size:11px;color:var(--mut)">La IA leer&#225; empresa, ubicaci&#243;n y fecha</p>
                <input type="file" accept="image/*" onchange="addPh(event,'11')">
              </div>
              <div id="pg11" class="pgrid"></div>
              <div id="ai11" class="air" style="display:none"></div>
              <div id="cf11" class="cblock" style="display:none">
                <h4>&#128221; Confirma o corrige los datos extra&#237;dos:</h4>
                <div class="fld"><label>Empresa / Instalaci&#243;n</label><input type="text" id="n11" placeholder="Nombre de la empresa&#8230;"/></div>
                <div class="fld"><label>Ubicaci&#243;n / Direcci&#243;n</label><input type="text" id="l11" placeholder="Direcci&#243;n de la instalaci&#243;n&#8230;"/></div>
                <div class="fld"><label>Observaciones</label><input type="text" id="o11" placeholder="Fecha del plan, n&#186; revisi&#243;n&#8230;"/></div>
                <div class="crow"><button class="btn bok bsm" onclick="confSec('11')">&#10003; Confirmar</button></div>
                <div id="d11" class="dbadge2">&#10003; Secci&#243;n 1.1 confirmada</div>
              </div>
            </div>
            <!-- 1.2 -->
            <div class="sub">
              <div class="stitle"><span class="snum2">1.2</span> Libro de Subcontrataci&#243;n</div>
              <div class="uz">
                <div class="uico">&#128203;</div>
                <p>Sube foto de la <strong>hoja de empresas subcontratadas</strong></p>
                <p style="margin-top:4px;font-size:11px;color:var(--mut)">La IA leer&#225; las empresas y datos del registro</p>
                <input type="file" accept="image/*" onchange="addPh(event,'12')">
              </div>
              <div id="pg12" class="pgrid"></div>
              <div id="ai12" class="air" style="display:none"></div>
              <div id="cf12" class="cblock" style="display:none">
                <h4>&#128221; Empresas detectadas &#8212; confirma el registro:</h4>
                <div class="fld"><label>Empresas subcontratadas</label><textarea id="e12" rows="3" placeholder="Una empresa por l&#237;nea&#8230;"></textarea></div>
                <div class="fld"><label>Otros datos (CIF, fechas&#8230;)</label><input type="text" id="o12" placeholder="Datos adicionales&#8230;"/></div>
                <div class="crow"><button class="btn bok bsm" onclick="confSec('12')">&#10003; Confirmar registro</button></div>
                <div id="d12" class="dbadge2">&#10003; Secci&#243;n 1.2 confirmada</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CAP 2 -->
        <div class="chap" id="c2">
          <div class="chaphdr" onclick="togCh('c2')">
            <div class="chnum" id="c2n">2</div>
            <div class="chtitle">Botiqu&#237;n</div>
            <span class="chev">&#9660;</span>
          </div>
          <div class="chapbody">
            <!-- 2.1 -->
            <div class="sub">
              <div class="stitle"><span class="snum2">2.1</span> Inspecci&#243;n General</div>
              <div class="uz" id="z21">
                <div class="uico">&#127973;</div>
                <p>Sube hasta <strong>3 fotograf&#237;as del botiqu&#237;n</strong></p>
                <p style="margin-top:4px;font-size:11px;color:var(--mut)">La IA identificar&#225; los elementos presentes</p>
                <input type="file" accept="image/*" multiple onchange="addPhs(event,'21')">
              </div>
              <div id="pg21" class="pgrid"></div>
              <div id="ai21" class="air" style="display:none"></div>
              <div id="cl21" style="display:none">
                <p style="font-size:13px;margin:14px 0 10px;font-weight:500">Confirma el contenido del botiqu&#237;n:</p>
                <div class="cklist">
                  <div class="cki" onclick="togCk(this,'tijeras')"><div class="ckb"></div><span>&#9986;&#65039; Tijeras</span></div>
                  <div class="cki" onclick="togCk(this,'vendas')"><div class="ckb"></div><span>&#129321; Vendas</span></div>
                  <div class="cki" onclick="togCk(this,'tiritas')"><div class="ckb"></div><span>&#129706; Tiritas / Ap&#243;sitos</span></div>
                  <div class="cki" onclick="togCk(this,'gasas')"><div class="ckb"></div><span>&#129511; Gasas</span></div>
                  <div class="cki" onclick="togCk(this,'agua_ox')"><div class="ckb"></div><span>&#128167; Agua oxigenada</span></div>
                  <div class="cki" id="ck_otros">
                    <div class="ckb" onclick="event.stopPropagation();togCk(document.getElementById('ck_otros'),'otros')"></div>
                    <span>&#128230; Otros:</span>
                    <input type="text" id="otros_txt" onclick="event.stopPropagation()" style="flex:1;background:transparent;border:none;border-bottom:1px solid var(--brd);padding:4px;font-size:13px;color:var(--txt);outline:none" placeholder="especificar&#8230;"/>
                  </div>
                </div>
                <div class="crow"><button class="btn bok bsm" onclick="confSec('21')">&#10003; Confirmar checklist</button></div>
                <div id="d21" class="dbadge2">&#10003; Secci&#243;n 2.1 confirmada</div>
              </div>
            </div>
            <!-- 2.2 -->
            <div class="sub">
              <div class="stitle"><span class="snum2">2.2</span> Caducidad del botiqu&#237;n</div>
              <div class="uz">
                <div class="uico">&#128197;</div>
                <p>Sube foto de la <strong>etiqueta de caducidad</strong></p>
                <p style="margin-top:4px;font-size:11px;color:var(--mut)">La IA leer&#225; la fecha autom&#225;ticamente</p>
                <input type="file" accept="image/*" onchange="addPh(event,'22')">
              </div>
              <div id="pg22" class="pgrid"></div>
              <div id="ai22" class="air" style="display:none"></div>
              <div id="cf22" class="cblock" style="display:none">
                <h4>&#128197; Confirma o corrige la fecha:</h4>
                <div class="fld"><label>Fecha de caducidad</label><input type="date" id="dt22"/></div>
                <div id="dtctx" style="font-size:12px;color:var(--mut);margin-top:-10px;margin-bottom:12px"></div>
                <div class="crow"><button class="btn bpri bsm" onclick="chkExp()">Comprobar fecha &#8594;</button></div>
                <div id="expr"></div>
                <div id="d22" class="dbadge2">&#10003; Secci&#243;n 2.2 confirmada</div>
              </div>
            </div>
          </div>
        </div>
      </div><!-- /chaps -->

      <div class="navrow">
        <button class="btn bsec" onclick="goBack()">&#8592; Cancelar</button>
        <button class="btn bok" onclick="finInsp()">Finalizar inspecci&#243;n &#10003;</button>
      </div>
    </div>

  </div><!-- /ac -->
</div><!-- /sa -->

<!-- MODAL FINALIZAR -->
<div class="mover" id="mfin">
  <div class="modal">
    <h3>&#127937; &#191;Finalizar inspecci&#243;n?</h3>
    <p>Se guardar&#225; el informe completo y quedar&#225; disponible para el administrador.</p>
    <div class="mbtns">
      <button class="btn bsec bsm" onclick="cModal('mfin')">Cancelar</button>
      <button class="btn bok bsm" onclick="saveInsp()">Guardar informe</button>
    </div>
  </div>
</div>

<!-- MODAL INFORME -->
<div class="mover" id="mrep">
  <div class="modal">
    <h3 id="mr_title">Informe</h3>
    <p id="mr_meta" style="color:var(--mut);font-size:13px;margin-bottom:16px"></p>
    <div id="mr_body"></div>
    <div class="mbtns" style="margin-top:20px">
      <button class="btn bsec bsm" onclick="cModal('mrep')">Cerrar</button>
      <button class="btn bpdf bsm" id="mr_pdf">&#8595; Descargar PDF</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"><span id="ticon"></span><span id="tmsg"></span></div>

<script>
// ── USUARIOS ─────────────────────────────────────────
const USERS={
  admin:{pw:'admin123',name:'Admin P\xe9rez',role:'Administrador',type:'admin'},
  inspector1:{pw:'insp2024',name:'Carlos Rodr\xedguez',role:'Inspector de seguridad',type:'inspector'}
};

// ── ESTADO ───────────────────────────────────────────
let U=null, PI=null, INSP=[], CID={}, SDONE={}, PHOTOS={}, CKLIST={}, CTAB='dash';

// ── AUTH ─────────────────────────────────────────────
function doLogin(){
  const u=document.getElementById('iu').value.trim();
  const p=document.getElementById('ip').value;
  const e=document.getElementById('lerr');
  if(USERS[u]&&USERS[u].pw===p){U={username:u,...USERS[u]};e.style.display='none';launch();}
  else e.style.display='block';
}
function qlogin(u,p){document.getElementById('iu').value=u;document.getElementById('ip').value=p;doLogin();}
function doLogout(){U=null;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('sl').classList.add('active');}
document.getElementById('ip').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

function launch(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('sa').classList.add('active');
  const av=document.getElementById('nav-av');
  av.textContent=U.name[0];av.className='av av'+U.type[0];
  document.getElementById('nn').textContent=U.name;
  document.getElementById('nr').textContent=U.role;
  document.getElementById('tabnav').style.display=U.type==='admin'?'flex':'none';
  goTab('dash');
}

// ── TABS ─────────────────────────────────────────────
function goTab(t){
  CTAB=t;
  document.querySelectorAll('.tabbtn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('tb-'+t);if(btn)btn.classList.add('active');
  document.getElementById('vd').style.display=t==='dash'?'block':'none';
  document.getElementById('vr').style.display=t==='rep'?'block':'none';
  document.getElementById('vi').style.display='none';
  if(t==='dash')renderDash();
  if(t==='rep')renderRep();
}

// ── DASHBOARD ────────────────────────────────────────
function goBack(){goTab('dash');}
function renderDash(){
  const isA=U.type==='admin';
  document.getElementById('dtitle').textContent=isA?'Panel de administraci\xf3n':'Mis inspecciones';
  document.getElementById('dsub').textContent=isA?'Gestiona y solicita inspecciones de seguridad':'Bienvenido, '+U.name;
  document.getElementById('admpnl').style.display=isA?'block':'none';
  const showAl=PI&&(isA||PI.to===U.username);
  const pal=document.getElementById('pal');pal.style.display=showAl?'flex':'none';
  if(showAl){document.getElementById('aloc').textContent=PI.loc;document.getElementById('aby').textContent=PI.by;}
  document.getElementById('s0').textContent=INSP.length;
  document.getElementById('s1').textContent=PI?1:0;
  document.getElementById('s2').textContent=INSP.filter(r=>r.alert).length;
  const list=document.getElementById('histlist');
  if(!INSP.length){list.innerHTML='<p style="color:var(--mut);font-size:14px">No hay inspecciones registradas.</p>';return;}
  list.innerHTML=INSP.map((r,i)=>'<div class="rrow"><div class="rinfo"><div class="rtitle">'+r.loc+'</div><div class="rmeta">'+r.date+' \xb7 '+r.insp+'</div></div><div class="racts"><span class="tag '+(r.alert?'tdan':'tok')+'">'+(r.alert?'\u26a0\ufe0f Caducado':'\u2705 OK')+'</span>'+(isA?'<button class="btn bpdf bsm" onclick="viewRep('+i+')">&#128196; Ver</button>':'')+'</div></div>').join('');
}
function reqInsp(){
  const loc=document.getElementById('iloc').value.trim();
  if(!loc){toast('\u26a0\ufe0f','Introduce el nombre de la instalaci\xf3n');return;}
  PI={loc,to:document.getElementById('iinsp').value,by:U.name};
  document.getElementById('iloc').value='';renderDash();toast('📋','Inspecci\xf3n solicitada');
}

// ── INFORMES ─────────────────────────────────────────
function renderRep(){
  const list=document.getElementById('replist');
  if(!INSP.length){list.innerHTML='<p style="color:var(--mut);font-size:14px">No hay informes a\xfan.</p>';return;}
  list.innerHTML=INSP.map((r,i)=>'<div class="rrow"><div class="rinfo"><div class="rtitle">📄 '+r.loc+'</div><div class="rmeta">'+r.date+' \xb7 Inspector: '+r.insp+' \xb7 '+r.nSec+'/4 secciones</div></div><div class="racts"><span class="tag '+(r.alert?'tdan':'tok')+'">'+(r.alert?'\u26a0\ufe0f ALERTA':'\u2705 OK')+'</span><button class="btn bsec bsm" onclick="viewRep('+i+')">👁 Ver</button><button class="btn bpdf bsm" onclick="dlPDF('+i+')">\u2b07 PDF</button></div></div>').join('');
}

function viewRep(idx){
  const r=INSP[idx];
  document.getElementById('mr_title').textContent='Informe \u2014 '+r.loc;
  document.getElementById('mr_meta').textContent=r.date+' \xb7 Inspector: '+r.insp;
  document.getElementById('mr_pdf').onclick=()=>dlPDF(idx);
  let h='';
  if(r.s11)h+='<div class="rdsec"><h4>1.1 \xb7 Adhesi\xf3n Plan PRL</h4><p><b>Empresa:</b> '+(r.s11.emp||'\u2014')+'</p><p><b>Ubicaci\xf3n:</b> '+(r.s11.loc||'\u2014')+'</p><p><b>Obs:</b> '+(r.s11.obs||'\u2014')+'</p>'+(r.s11.ph?'<img class="rdimg" src="'+r.s11.ph+'">':'')+'</div>';
  if(r.s12)h+='<div class="rdsec"><h4>1.2 \xb7 Libro Subcontrataci\xf3n</h4><p><b>Empresas:</b> '+(r.s12.emp||'\u2014')+'</p><p><b>Datos:</b> '+(r.s12.obs||'\u2014')+'</p>'+(r.s12.ph?'<img class="rdimg" src="'+r.s12.ph+'">':'')+'</div>';
  if(r.s21){const it=Object.entries(r.s21.ck||{}).filter(([,v])=>v).map(([k])=>k);h+='<div class="rdsec"><h4>2.1 \xb7 Botiqu\xedn General</h4><ul>'+it.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+(r.s21.otros?'<p><b>Otros:</b> '+r.s21.otros+'</p>':'')+'</div>';}
  if(r.s22)h+='<div class="rdsec"><h4>2.2 \xb7 Caducidad</h4><p><b>Fecha:</b> '+(r.s22.f||'\u2014')+'</p><p><b>Estado:</b> '+(r.alert?'\u26a0\ufe0f CADUCADO':'\u2705 En vigor')+'</p>'+(r.s22.ph?'<img class="rdimg" src="'+r.s22.ph+'">':'')+'</div>';
  document.getElementById('mr_body').innerHTML=h||'<p style="color:var(--mut)">Sin datos registrados.</p>';
  document.getElementById('mrep').classList.add('open');
}

// ── PDF ───────────────────────────────────────────────
async function dlPDF(idx){
  const r=INSP[idx];
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210,M=18,CW=W-M*2;let y=20;
  const np=(n=20)=>{if(y+n>278){doc.addPage();y=20;}};
  const field=(lbl,val)=>{np(8);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(lbl+':',M+2,y);doc.setFont('helvetica','normal');const ls=doc.splitTextToSize(String(val||'\u2014'),CW-46);doc.text(ls,M+44,y);y+=ls.length*5+2;};
  const sep=(t)=>{np(12);doc.setFillColor(249,115,22);doc.rect(M,y,CW,7,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(t,M+3,y+5);doc.setTextColor(30,30,30);doc.setFont('helvetica','normal');doc.setFontSize(10);y+=11;};
  // Header
  doc.setFillColor(249,115,22);doc.rect(0,0,W,22,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(15);
  doc.text('SafeCheck \u2014 Informe de Inspecci\xf3n de Seguridad',M,14);y=30;
  // Meta
  doc.setTextColor(30,30,30);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text('DATOS GENERALES',M,y);y+=7;
  doc.setFillColor(241,245,249);doc.rect(M,y-4,CW,30,'F');
  doc.setFont('helvetica','normal');doc.setFontSize(10);
  doc.text('Instalaci\xf3n:  '+r.loc,M+4,y+2);
  doc.text('Inspector:    '+r.insp,M+4,y+8);
  doc.text('Fecha:        '+r.date,M+4,y+14);
  doc.text('Estado:       '+(r.alert?'\u26a0 ALERTA \u2014 Botiqu\xedn caducado':'\u2713 Sin alertas'),M+4,y+22);
  y+=36;
  // S11
  sep('1.1 \xb7 Adhesi\xf3n Plan PRL');
  if(r.s11){field('Empresa',r.s11.emp);field('Ubicaci\xf3n',r.s11.loc);field('Observaciones',r.s11.obs);if(r.s11.ph){np(55);try{doc.addImage(r.s11.ph,'JPEG',M,y,80,55);y+=60;}catch(e){}}}
  else{doc.text('Secci\xf3n no completada',M+2,y);y+=8;}
  y+=4;
  // S12
  sep('1.2 \xb7 Libro de Subcontrataci\xf3n');
  if(r.s12){field('Empresas',r.s12.emp);field('Datos adicionales',r.s12.obs);if(r.s12.ph){np(55);try{doc.addImage(r.s12.ph,'JPEG',M,y,80,55);y+=60;}catch(e){}}}
  else{doc.text('Secci\xf3n no completada',M+2,y);y+=8;}
  y+=4;
  // S21
  sep('2.1 \xb7 Inspecci\xf3n General Botiqu\xedn');
  if(r.s21){
    const labs={tijeras:'Tijeras',vendas:'Vendas',tiritas:'Tiritas/Ap\xf3sitos',gasas:'Gasas',agua_ox:'Agua oxigenada',otros:'Otros'};
    const ck=r.s21.ck||{};
    np(8);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Elementos presentes:',M+2,y);y+=6;
    Object.entries(labs).forEach(([k,l])=>{np(7);const ok=ck[k];doc.setFillColor(ok?34:200,ok?197:200,ok?94:200);doc.rect(M+4,y-4,4,4,'F');doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(l+': '+(ok?'\u2713 Presente':'\u2717 No confirmado'),M+12,y);y+=6;});
    if(r.s21.otros)field('Otros',r.s21.otros);
  }else{doc.text('Secci\xf3n no completada',M+2,y);y+=8;}
  y+=4;
  // S22
  sep('2.2 \xb7 Caducidad del Botiqu\xedn');
  if(r.s22){
    field('Fecha caducidad',r.s22.f);
    if(r.alert){np(18);doc.setFillColor(254,226,226);doc.rect(M,y-2,CW,16,'F');doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(185,28,28);doc.text('\u26a0 ALERTA: BOTIQU\xcdN CADUCADO \u2014 PARALIZAR TRABAJOS',M+3,y+5);doc.text('Reponer el botiqu\xedn antes de reanudar la actividad.',M+3,y+11);doc.setTextColor(30,30,30);y+=20;}
    if(r.s22.ph){np(55);try{doc.addImage(r.s22.ph,'JPEG',M,y,80,55);y+=60;}catch(e){}}
  }else{doc.text('Secci\xf3n no completada',M+2,y);y+=8;}
  // Footer
  np(22);doc.setFillColor(241,245,249);doc.rect(M,y+2,CW,18,'F');
  doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(100,116,139);
  doc.text('Informe generado autom\xe1ticamente por SafeCheck el '+new Date().toLocaleString('es-ES'),M+3,y+9);
  doc.text('Documento con validez como registro de inspecci\xf3n de seguridad laboral (PRL).',M+3,y+15);
  doc.save('SafeCheck_'+r.loc.replace(/\\s+/g,'-')+'_'+r.date.replace(/\\//g,'-')+'.pdf');
  toast('📥','PDF descargado');
}

// ── INSPECCIÓN ────────────────────────────────────────
function startInsp(){
  SDONE={};PHOTOS={'11':[],'12':[],'21':[],'22':[]};CKLIST={};CID={};
  document.querySelectorAll('.air').forEach(e=>{e.style.display='none';e.innerHTML='';});
  document.querySelectorAll('.cblock').forEach(e=>e.style.display='none');
  document.getElementById('cl21').style.display='none';
  document.getElementById('expr').innerHTML='';
  document.getElementById('dtctx').textContent='';
  document.querySelectorAll('.dbadge2').forEach(e=>e.style.display='none');
  document.querySelectorAll('.pgrid').forEach(e=>e.innerHTML='');
  document.querySelectorAll('.chap').forEach(c=>c.classList.remove('open'));
  document.querySelectorAll('.chnum').forEach(n=>n.classList.remove('done'));
  document.querySelectorAll('.cki').forEach(e=>e.classList.remove('on'));
  document.getElementById('otros_txt').value='';
  ['n11','l11','o11','e12','o12','dt22'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('pb').style.width='0%';
  document.getElementById('ptxt').textContent='0/4';
  document.getElementById('ilbl').textContent=PI?.loc||'\u2014';
  document.getElementById('vd').style.display='none';
  document.getElementById('vr').style.display='none';
  document.getElementById('vi').style.display='block';
  document.querySelectorAll('.tabbtn').forEach(b=>b.classList.remove('active'));
}
function togCh(id){document.getElementById(id).classList.toggle('open');}

// ── FOTOS ─────────────────────────────────────────────
function addPh(e,s){const f=e.target.files[0];if(f)addPhoto(f,s);}
function addPhs(e,s){Array.from(e.target.files).slice(0,3-PHOTOS[s].length).forEach(f=>addPhoto(f,s));}
function addPhoto(f,s){
  const r=new FileReader();
  r.onload=ev=>{PHOTOS[s].push({data:ev.target.result,type:f.type});renderPg(s);analyzeImg(ev.target.result,f.type,s);};
  r.readAsDataURL(f);
}
function renderPg(s){
  document.getElementById('pg'+s).innerHTML=PHOTOS[s].map((p,i)=>'<div class="pthumb"><img src="'+p.data+'"><button class="delbtn" onclick="delPh('+i+',\\''+s+'\\')">&#10005;</button></div>').join('');
  if(s==='21')document.getElementById('z21').style.opacity=PHOTOS['21'].length>=3?'0.4':'1';
}
function delPh(i,s){PHOTOS[s].splice(i,1);renderPg(s);}

// ── IA ────────────────────────────────────────────────
async function analyzeImg(dataUrl,mime,s){
  const box=document.getElementById('ai'+s);
  box.style.display='block';
  box.innerHTML='<div class="ailbl"><div class="aisp"></div> Analizando imagen con IA Claude&#8230;</div>';
  const b64=dataUrl.split(',')[1];
  try{
    const resp=await fetch('/api/analyze',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({imageBase64:b64,mediaType:mime||'image/jpeg',section:s})
    });
    const data=await resp.json();
    if(!resp.ok)throw new Error(data.error||'HTTP '+resp.status);
    const txt=(data.content||[]).map(b=>b.text||'').join('').trim();
    let p=null;
    try{p=JSON.parse(txt.replace(/\`\`\`json\\s*/gi,'').replace(/\`\`\`\\s*/g,'').trim());}catch(_){}
    renderAI(s,p);
  }catch(err){
    box.innerHTML='<div class="ailbl">&#9888;&#65039; Error al analizar</div><p style="color:#fca5a5;font-size:12px;margin-top:4px">'+err.message+'</p><p style="color:var(--mut);font-size:12px;margin-top:4px">Rellena los campos manualmente. Verifica que ANTHROPIC_API_KEY est\xe1 configurada en Railway.</p>';
    fallback(s);
  }
}
function fallback(s){
  if(s==='11')document.getElementById('cf11').style.display='block';
  else if(s==='12')document.getElementById('cf12').style.display='block';
  else if(s==='22')document.getElementById('cf22').style.display='block';
  else if(s==='21'&&PHOTOS['21'].length>0)document.getElementById('cl21').style.display='block';
}
function renderAI(s,p){
  const box=document.getElementById('ai'+s);
  if(s==='11'){
    box.innerHTML='<div class="ailbl">🤖 Plan PRL analizado</div>'+(p?'<div class="aif"><span class="aifl">Empresa</span><span class="aifv">'+(p.empresa||'\u2014')+'</span></div><div class="aif"><span class="aifl">Ubicaci\xf3n</span><span class="aifv">'+(p.ubicacion||'\u2014')+'</span></div>'+(p.fecha_doc?'<div class="aif"><span class="aifl">Fecha documento</span><span class="aifv">'+p.fecha_doc+'</span></div>':'')+(p.observaciones?'<div class="aif"><span class="aifl">Observaciones</span><span class="aifv">'+p.observaciones+'</span></div>':''):'<p style="color:var(--mut);font-size:13px">No se detect\xf3 texto autom\xe1ticamente. Rellena los campos.</p>');
    if(p){document.getElementById('n11').value=p.empresa||'';document.getElementById('l11').value=p.ubicacion||'';document.getElementById('o11').value=[p.fecha_doc,p.revision,p.observaciones].filter(Boolean).join(' \xb7 ');}
    document.getElementById('cf11').style.display='block';
  }
  else if(s==='12'){
    box.innerHTML='<div class="ailbl">🤖 Libro Subcontrataci\xf3n analizado</div>'+(p?''+(p.empresas?.length?'<div class="aif"><span class="aifl">Empresas ('+p.empresas.length+')</span><span class="aifv">'+p.empresas.join(' \xb7 ')+'</span></div>':'')+(p.cifs?.length?'<div class="aif"><span class="aifl">CIFs</span><span class="aifv">'+p.cifs.join(' \xb7 ')+'</span></div>':'')+(p.observaciones?'<div class="aif"><span class="aifl">Observaciones</span><span class="aifv">'+p.observaciones+'</span></div>':''):'<p style="color:var(--mut);font-size:13px">Verifica el documento manualmente.</p>');
    if(p){document.getElementById('e12').value=(p.empresas||[]).join('\n');document.getElementById('o12').value=[(p.cifs||[]).join(', '),(p.fechas||[]).join(', '),p.observaciones].filter(Boolean).join(' | ');}
    document.getElementById('cf12').style.display='block';
  }
  else if(s==='21'){
    box.innerHTML='<div class="ailbl">🤖 Contenido botiqu\xedn analizado</div>'+(p?''+(p.elementos_visibles?.length?'<div class="aif"><span class="aifl">\u2705 Detectados</span><span class="aifv">'+p.elementos_visibles.join(', ')+'</span></div>':'')+(p.elementos_faltantes?.length?'<div class="aif"><span class="aifl">\u26a0\ufe0f No visibles</span><span class="aifv" style="color:var(--warn)">'+p.elementos_faltantes.join(', ')+'</span></div>':'')+(p.estado_general?'<div class="aif"><span class="aifl">Estado</span><span class="aifv">'+p.estado_general+'</span></div>':'')+(p.observaciones?'<div class="aif"><span class="aifl">Observaciones</span><span class="aifv">'+p.observaciones+'</span></div>':''):'<p style="color:var(--mut);font-size:13px">Completa el checklist manualmente.</p>');
    CID.aiObs21=p?.observaciones||'';
    if(p?.elementos_visibles){const m={tijeras:'tijeras',vendas:'vendas',tiritas:'tiritas','ap\xf3sitos':'tiritas',gasas:'gasas','agua oxigenada':'agua_ox'};p.elementos_visibles.forEach(el=>{const k=m[el.toLowerCase().trim()];if(k){const it=document.querySelector('.cki[onclick*="\\\''+k+'\\\'"]');if(it&&!it.classList.contains('on'))it.click();}});}
    if(PHOTOS['21'].length>0)document.getElementById('cl21').style.display='block';
  }
  else if(s==='22'){
    const di=document.getElementById('dt22'),ctx=document.getElementById('dtctx');
    box.innerHTML='<div class="ailbl">🤖 Fecha de caducidad detectada</div>'+(p?.fecha_detectada&&p.fecha_detectada!=='null'?'<div class="aif"><span class="aifl">Texto en imagen</span><span class="aifv">'+(p.texto_original||'\u2014')+'</span></div><div class="aif"><span class="aifl">Fecha interpretada</span><span class="aifv">'+p.fecha_detectada+'</span></div><div class="aif"><span class="aifl">Confianza</span><span class="aifv">'+(p.confianza||'\u2014')+'</span></div>':'<p style="color:var(--mut);font-size:13px">Fecha no detectada. Intr\xf3ducela manualmente.</p>');
    if(p?.fecha_detectada&&p.fecha_detectada!=='null'){di.value=p.fecha_detectada;ctx.textContent='Texto le\xeddo: "'+p.texto_original+'" \u2192 Confianza: '+(p.confianza||'\u2014');}
    document.getElementById('cf22').style.display='block';
  }
}

// ── CHECKLIST ─────────────────────────────────────────
function togCk(el,k){el.classList.toggle('on');CKLIST[k]=el.classList.contains('on');}

// ── CONFIRMAR SECCIONES ───────────────────────────────
function confSec(s){
  if(s==='11')CID.s11={emp:document.getElementById('n11').value,loc:document.getElementById('l11').value,obs:document.getElementById('o11').value,ph:PHOTOS['11'][0]?.data||null};
  else if(s==='12')CID.s12={emp:document.getElementById('e12').value,obs:document.getElementById('o12').value,ph:PHOTOS['12'][0]?.data||null};
  else if(s==='21')CID.s21={ck:{...CKLIST},otros:document.getElementById('otros_txt').value,aiObs:CID.aiObs21||''};
  SDONE[s]=true;document.getElementById('d'+s).style.display='block';updProg();toast('\u2705','Secci\xf3n confirmada');
}
function chkExp(){
  const v=document.getElementById('dt22').value;
  if(!v){toast('\u26a0\ufe0f','Introduce la fecha');return;}
  const dt=new Date(v),hoy=new Date();hoy.setHours(0,0,0,0);
  CID.s22={f:dt.toLocaleDateString('es-ES'),ph:PHOTOS['22'][0]?.data||null};
  const res=document.getElementById('expr');
  if(dt<hoy){
    res.innerHTML='<div class="dalert"><h4>🚨 BOTIQU\xcdN CADUCADO \u2014 PARALICE LOS TRABAJOS</h4><p>La fecha (<b>'+dt.toLocaleDateString('es-ES')+'</b>) es anterior a hoy. Debe <b>paralizar los trabajos</b> y reponer el botiqu\xedn antes de continuar.</p></div>';
    SDONE['22_alert']=true;
  }else res.innerHTML='<div class="dok"><h4>\u2705 Botiqu\xedn en vigor hasta el '+dt.toLocaleDateString('es-ES')+'</h4></div>';
  SDONE['22']=true;document.getElementById('d22').style.display='block';updProg();
}
function updProg(){
  const n=['11','12','21','22'].filter(s=>SDONE[s]).length;
  document.getElementById('pb').style.width=(n/4*100)+'%';
  document.getElementById('ptxt').textContent=n+'/4';
  if(SDONE['11']&&SDONE['12'])document.getElementById('c1n').classList.add('done');
  if(SDONE['21']&&SDONE['22'])document.getElementById('c2n').classList.add('done');
}

// ── FINALIZAR ─────────────────────────────────────────
function finInsp(){document.getElementById('mfin').classList.add('open');}
function cModal(id){document.getElementById(id).classList.remove('open');}
function saveInsp(){
  cModal('mfin');
  const n=['11','12','21','22'].filter(s=>SDONE[s]).length;
  INSP.unshift({loc:PI?.loc||'Sin nombre',date:new Date().toLocaleDateString('es-ES'),insp:U.name,alert:!!SDONE['22_alert'],nSec:n,s11:CID.s11||null,s12:CID.s12||null,s21:CID.s21||null,s22:CID.s22||null});
  PI=null;toast('🏁','Inspecci\xf3n guardada. El administrador puede verla.');goTab('dash');
}

// ── TOAST ─────────────────────────────────────────────
function toast(ic,msg){
  const t=document.getElementById('toast');
  document.getElementById('ticon').textContent=ic;document.getElementById('tmsg').textContent=msg;
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);
}
</script>
</body>
</html>`;

/* ─────────────────────────────────────────────────────
   PROMPTS POR SECCIÓN
───────────────────────────────────────────────────── */
function getPrompt(section) {
  if (section === '11') return `Eres un experto en inspecciones de seguridad laboral PRL. Analiza la imagen de la portada del Plan de Prevención de Riesgos Laborales. Lee TODO el texto visible: logotipos, encabezados, pies, sellos. Extrae nombre empresa, dirección/ubicación, fecha del documento, número de revisión. Responde SOLO con JSON válido sin texto extra ni bloques markdown: {"empresa":"nombre","ubicacion":"dirección","fecha_doc":"fecha o null","revision":"rev o null","observaciones":"otros datos"}`;
  if (section === '12') return `Eres un experto en inspecciones de seguridad laboral PRL. Analiza esta imagen del Libro de Subcontratación. Lee todas las filas: nombre empresa, CIF/NIF, actividad, fechas entrada/salida, representante. Responde SOLO con JSON válido sin texto extra: {"empresas":["n1","n2"],"cifs":["c1"],"actividades":["a1"],"fechas":["f1"],"representantes":["r1"],"observaciones":"datos adicionales"}`;
  if (section === '21') return `Eres un experto en inspecciones de seguridad laboral. Analiza esta imagen de un botiquín. Identifica: tijeras, vendas, tiritas, gasas, agua oxigenada, guantes, esparadrapo, pinzas, termómetro, antiséptico. Responde SOLO con JSON válido sin texto extra: {"elementos_visibles":["e1","e2"],"elementos_faltantes":["e3"],"estado_general":"bueno","observaciones":"descripción"}`;
  if (section === '22') return `Eres un experto en lectura de texto en imágenes. Busca CUALQUIER fecha de caducidad o expiración: CAD, Caduca, EXP, Caducidad, Best before, fecha en formato DD/MM/AAAA o MM/AAAA. Lee con máxima atención todos los dígitos. Responde SOLO con JSON válido sin texto extra: {"fecha_detectada":"YYYY-MM-DD o null","texto_original":"texto exacto visto en imagen","confianza":"alta/media/baja","ubicacion_en_imagen":"descripción"}`;
  return '';
}

/* ─────────────────────────────────────────────────────
   LEER BODY HTTP CON LÍMITE 20 MB
───────────────────────────────────────────────────── */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', chunk => {
      total += chunk.length;
      if (total > 20 * 1024 * 1024) { reject(new Error('Payload demasiado grande')); return; }
      chunks.push(chunk);
    });
    req.on('end',   () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/* ─────────────────────────────────────────────────────
   LLAMADA A ANTHROPIC API
───────────────────────────────────────────────────── */
function callAnthropic(payload) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(JSON.stringify(payload), 'utf8');
    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': bodyBuf.length,
        'x-api-key':      ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      timeout: 60000,
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout Anthropic API')); });
    req.write(bodyBuf);
    req.end();
  });
}

/* ─────────────────────────────────────────────────────
   SERVIDOR HTTP
───────────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);

  // ── Health check ──────────────────────────────────
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, apiKey: !!ANTHROPIC_API_KEY }));
    return;
  }

  // ── API: analizar imagen ──────────────────────────
  if (pathname === '/api/analyze' && req.method === 'POST') {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY no está configurada en Railway. Ve a Variables y añádela.' }));
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
      console.log(`[AI] sección=${section} tipo=${mediaType}`);
      const result = await callAnthropic({
        model:      'claude-sonnet-4-6',   // modelo correcto y disponible
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text',  text: prompt }
          ]
        }]
      });
      console.log(`[AI] Anthropic → HTTP ${result.status}`);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    } catch (err) {
      console.error('[AI] Error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Servir HTML de la app (SIEMPRE funciona) ──────
  res.writeHead(200, {
    'Content-Type':  'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(APP_HTML);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       SafeCheck v3 — Arrancado           ║');
  console.log(`║  Puerto: ${PORT.toString().padEnd(32)}║`);
  console.log(`║  API Key: ${(ANTHROPIC_API_KEY ? '✅ Configurada' : '❌ NO configurada — añadir en Railway').padEnd(31)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
