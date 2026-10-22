const $ = (id) => document.getElementById(id);
const drops = {};
const ORIGENES = [["", "Todos los orígenes"], ["web", "Web"], ["script", "Scripts"], ["vigilante", "Vigilante"]];

/* fibras rojas de fondo. velocidad 1 = login; la app usa una fracción para que casi no se mueva */
function fibras(idLienzo, velocidad, visible) {
  const lienzo = $(idLienzo);
  const ctx = lienzo.getContext("2d");
  const hilos = [];
  let ancho = 0;
  let alto = 0;
  let t = 0;
  function medir() {
    ancho = lienzo.width = lienzo.offsetWidth || window.innerWidth;
    alto = lienzo.height = lienzo.offsetHeight || window.innerHeight;
  }
  function crear() {
    hilos.length = 0;
    for (let i = 0; i < 26; i += 1) {
      hilos.push({
        y: Math.random() * alto,
        amp: 40 + Math.random() * 90,
        freq: 0.0018 + Math.random() * 0.0022,
        fase: Math.random() * Math.PI * 2,
        vel: (0.0025 + Math.random() * 0.003) * velocidad,
        grosor: 0.6 + Math.random() * 1.4,
        alfa: 0.08 + Math.random() * 0.16,
      });
    }
  }
  function pintar() {
    if (!visible()) {
      requestAnimationFrame(pintar);
      return;
    }
    if (lienzo.width !== lienzo.offsetWidth || lienzo.height !== lienzo.offsetHeight) medir();
    ctx.fillStyle = `rgba(14, 14, 16, ${Math.min(0.18, 0.06 + 0.12 * velocidad)})`;
    ctx.fillRect(0, 0, ancho, alto);
    t += 1;
    hilos.forEach((h) => {
      ctx.beginPath();
      for (let x = -20; x <= ancho + 20; x += 6) {
        const y = h.y
          + Math.sin(x * h.freq + h.fase + t * h.vel) * h.amp
          + Math.sin(x * h.freq * 2.3 - t * h.vel * 0.7) * (h.amp * 0.35);
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(196, 64, 60, ${h.alfa})`;
      ctx.lineWidth = h.grosor;
      ctx.stroke();
    });
    requestAnimationFrame(pintar);
  }
  medir();
  crear();
  window.addEventListener("resize", () => { medir(); crear(); });
  pintar();
}
fibras("fibras", 0.7, () => !$("login").classList.contains("oculto"));

/* anillo de partículas del inicio. Misma fórmula que css-houdini-ringparticles (Antigravity de bramus), en rojo y con canvas */
(function anillo() {
  const lienzo = $("anillo");
  const ctx = lienzo.getContext("2d");
  const RADIO_MIN = 150;
  const RADIO_MAX = 250;
  const GROSOR = 600;
  const POR_FILA = 80;
  const FILAS = 25;
  const TAMANO = 2;
  const ALFA_MIN = 0.1;
  const ALFA_MAX = 1;
  const CICLO = 6000;
  function azar(semilla) {
    let t = semilla | 0;
    return () => {
      t = (t + 1831565813) | 0;
      let a = Math.imul(t ^ (t >>> 15), 1 | t);
      a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
      return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
    };
  }
  const semilla = 200;
  const r = azar(semilla);
  const entero = (min, max) => Math.floor(r() * (max - min + 1)) + min;
  const ondas1 = entero(2, 8);
  const vel1 = entero(1, 2);
  const h = 43758.5453123 * Math.sin(semilla + 10);
  const sentido = h - Math.floor(h) > 0.5 ? 1 : -1;
  const ondas2 = entero(2, 9);
  const fase = 0.2 + r() * 0.6;
  const amplitud = entero(8, 20);
  const centro = { x: 50, y: 50, meta: { x: 50, y: 50 } };
  let ancho = 0;
  let alto = 0;
  let anterior = performance.now();

  function medir() {
    const escala = window.devicePixelRatio || 1;
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = ancho * escala;
    lienzo.height = alto * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
  }
  const visible = () => $("app").classList.contains("en-inicio") && !document.hidden;
  /* el anillo casi no se mueve: solo se inclina un poco hacia el mouse */
  const SEGUIR = 0.06;
  window.addEventListener("pointermove", (e) => {
    if (!visible()) return;
    centro.meta.x = 50 + ((e.clientX / window.innerWidth) * 100 - 50) * SEGUIR;
    centro.meta.y = 50 + ((e.clientY / window.innerHeight) * 100 - 50) * SEGUIR;
  });
  document.addEventListener("pointerleave", () => { centro.meta.x = 50; centro.meta.y = 50; });

  function pintar(ahora) {
    requestAnimationFrame(pintar);
    const dt = Math.min(100, ahora - anterior);
    anterior = ahora;
    if (!visible()) return;
    const suave = 1 - Math.exp(-dt / 4000);
    centro.x += (centro.meta.x - centro.x) * suave;
    centro.y += (centro.meta.y - centro.y) * suave;
    const tic = (ahora % CICLO) / CICLO;
    const vaiven = (ahora % (CICLO * 2)) / CICLO;
    const ida = vaiven <= 1 ? vaiven : 2 - vaiven;
    const radio = RADIO_MIN + (RADIO_MAX - RADIO_MIN) * (ida < 0.5 ? 2 * ida * ida : 1 - Math.pow(-2 * ida + 2, 2) / 2);
    const giro = tic * Math.PI * 2;
    const exterior = radio + GROSOR;
    const mitad = GROSOR / 2;
    const cx = (ancho * centro.x) / 100;
    const cy = (alto * centro.y) / 100;
    ctx.clearRect(0, 0, ancho, alto);
    ctx.fillStyle = "#c4403c";
    for (let fila = 0; fila < FILAS; fila += 1) {
      const base = radio + (fila / (FILAS - 1)) * GROSOR;
      for (let i = 0; i < POR_FILA; i += 1) {
        const ang = (i / POR_FILA) * Math.PI * 2;
        const s = Math.sin(ang * ondas1 + giro * vel1 * sentido) + Math.sin(ang * ondas2 - giro * sentido) + Math.sin(fila * fase + giro);
        let alfa = ALFA_MIN + Math.pow(Math.max(0, (s + 3) / 6), 1.5) * (ALFA_MAX - ALFA_MIN);
        const dist = base + s * amplitud;
        const borde = Math.min(1, Math.max(0, Math.min(dist - radio, exterior - dist) / mitad));
        alfa *= Math.pow(borde, 1.7);
        if (alfa <= 0.01) continue;
        ctx.globalAlpha = Math.min(1, alfa);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, TAMANO, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  medir();
  window.addEventListener("resize", medir);
  requestAnimationFrame(pintar);
})();

/* aparece suave: sube unos pixeles mientras gana opacidad */
function aparecer(el) {
  el.classList.remove("fundido");
  void el.offsetWidth;
  el.classList.add("fundido");
}

/* pantalla completa "Bienvenido, nombre" una vez por sesión; se cierra encogiéndose en un círculo, como el portafolio de Joshua */
const SALIDA_INTRO = 1400;
async function mostrarIntro(nombre) {
  const intro = $("intro");
  if (sessionStorage.getItem("intro-vista")) return;
  sessionStorage.setItem("intro-vista", "1");
  $("intro-nombre").textContent = nombre;
  intro.classList.remove("oculto", "saliendo");
  aparecer(intro.querySelector(".intro-centro"));
  let cerrar;
  const cerrado = new Promise((r) => { cerrar = r; });
  const salir = () => cerrar();
  intro.addEventListener("click", salir, { once: true });
  document.addEventListener("keydown", salir, { once: true });
  const solo = setTimeout(salir, 4200);
  await cerrado;
  clearTimeout(solo);
  document.removeEventListener("keydown", salir);
  intro.classList.add("saliendo");
  await new Promise((r) => setTimeout(r, SALIDA_INTRO * 0.55));
  setTimeout(() => intro.classList.add("oculto"), SALIDA_INTRO * 0.45);
}

/* vitrina del inicio: carrusel con puntos, avanza solo y se pausa con el cursor encima */
(function vitrina() {
  const DURACION = 5000;
  const pista = $("vitrina-pista");
  const total = pista.children.length;
  const puntos = [];
  let actual = 0;
  let reloj = null;
  let pausado = false;
  for (let i = 0; i < total; i += 1) {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.setAttribute("aria-label", `Función ${i + 1}`);
    punto.onclick = () => mostrar(i);
    $("puntos").append(punto);
    puntos.push(punto);
  }
  function programar() {
    clearTimeout(reloj);
    if (!pausado) reloj = setTimeout(() => mostrar((actual + 1) % total), DURACION);
  }
  function mostrar(i) {
    actual = i;
    pista.style.transform = `translateX(-${i * 100}%)`;
    puntos.forEach((p, j) => p.classList.toggle("activo", j === i));
    programar();
  }
  $("vitrina").addEventListener("mouseenter", () => { pausado = true; clearTimeout(reloj); });
  $("vitrina").addEventListener("mouseleave", () => { pausado = false; programar(); });
  let toqueX = 0;
  $("vitrina").addEventListener("touchstart", (e) => { toqueX = e.changedTouches[0].clientX; pausado = true; }, { passive: true });
  $("vitrina").addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 36) mostrar(dx < 0 ? (actual + 1) % total : (actual - 1 + total) % total);
    else programar();
    pausado = false;
  }, { passive: true });
  mostrar(0);
})();

/* línea de tiempo de la guía: se llena de blanco según cuánto se bajó */
function revisarLinea() {
  const linea = $("linea-tiempo");
  if (!linea || $("inicio").classList.contains("oculto")) return;
  const caja = linea.getBoundingClientRect();
  const marca = window.innerHeight * 0.6;
  const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  const avance = alFinal ? 1 : Math.min(1, Math.max(0, (marca - caja.top) / caja.height));
  linea.style.setProperty("--relleno", `${(avance * 100).toFixed(1)}%`);
  linea.querySelectorAll(".lt-item, .lt-grupo").forEach((el) => {
    el.classList.toggle("visto", el.getBoundingClientRect().top < marca);
  });
}
window.addEventListener("scroll", revisarLinea, { passive: true });
window.addEventListener("resize", revisarLinea);

/* reloj de la barra y del pie */
function tic() {
  const hora = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
  $("reloj").textContent = hora;
  $("pie-hora").textContent = `${hora} · Costa Rica`;
}
tic();
setInterval(tic, 15000);

function irA(pagina) {
  const boton = document.querySelector(`.item[data-pagina="${pagina}"]`);
  if (boton) boton.click();
}
document.querySelectorAll("[data-ir]").forEach((b) => { b.onclick = () => irA(b.dataset.ir); });

function normal(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* desplegable. opciones.buscar agrega el buscador; opciones.todas pone TODAS de primera */
function armarDrop(id, opciones, inicial, alElegir, extra = {}) {
  const raiz = $(id);
  if (!raiz) return;
  raiz.innerHTML = "";
  const todas = extra.todas ? ["TODAS", ...opciones] : [...opciones];
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "drop-btn";
  const lista = document.createElement("div");
  lista.className = "drop-lista oculto";
  const cuerpo = document.createElement("div");
  cuerpo.className = "drop-opciones";
  let buscar = null;
  if (extra.buscar) {
    const caja = document.createElement("div");
    caja.className = "buscador";
    buscar = document.createElement("input");
    buscar.placeholder = t("bulk.search");
    buscar.onclick = (evento) => evento.stopPropagation();
    buscar.oninput = () => llenar(buscar.value);
    caja.append(buscar);
    lista.append(caja);
  }
  lista.append(cuerpo);
  const estado = { valor: inicial, elegidas: [], total: opciones.length };
  const marcadas = new Set();
  const textoMultiple = () => {
    const lista = opciones.filter((o) => marcadas.has(o));
    if (!lista.length) return inicial;
    if (lista.length === opciones.length) return "TODAS";
    if (lista.length === 1) return lista[0];
    if (lista.length === 2) return `${lista[0]} y ${lista[1]}`;
    return `${lista.length} subfamilias`;
  };
  const pintar = () => {
    if (extra.multiple) {
      estado.elegidas = opciones.filter((o) => marcadas.has(o));
      estado.valor = textoMultiple();
    }
    let visible = L(estado.valor);
    if (extra.multiple) {
      const lista = opciones.filter((o) => marcadas.has(o));
      if (!lista.length) visible = L(inicial);
      else if (lista.length === opciones.length) visible = L("TODAS");
      else if (lista.length === 1) visible = L(lista[0]);
      else if (lista.length === 2) visible = `${L(lista[0])} ${t("ui.and")} ${L(lista[1])}`;
      else visible = t("ui.nSubs", { n: lista.length });
    }
    boton.innerHTML = `<span>${visible}</span><b>▼</b>`;
    raiz.classList.toggle("cambiado", inicial === "No cambiar" && estado.valor !== inicial);
  };
  const cerrar = () => {
    lista.classList.add("oculto");
    raiz.classList.remove("abierto");
  };
  function llenar(filtro) {
    cuerpo.innerHTML = "";
    const aguja = normal(filtro || "");
    const visibles = todas.filter((texto) => texto === "TODAS" || !aguja || normal(texto).includes(aguja) || normal(L(texto)).includes(aguja));
    if (!visibles.length) {
      const nada = document.createElement("p");
      nada.className = "vacio";
      nada.textContent = t("ui.nomatch");
      cuerpo.append(nada);
      return;
    }
    visibles.forEach((texto) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = L(texto);
      if (texto === "TODAS") item.className = "todas";
      if (extra.multiple) {
        const todasMarcadas = () => opciones.every((o) => marcadas.has(o));
        item.classList.add("multi");
        item.setAttribute("role", "menuitemcheckbox");
        const reflejar = () => {
          const activo = texto === "TODAS" ? todasMarcadas() : marcadas.has(texto);
          item.classList.toggle("marcada", activo);
          item.setAttribute("aria-checked", activo ? "true" : "false");
        };
        reflejar();
        item.onclick = (evento) => {
          evento.stopPropagation();
          if (texto === "TODAS") {
            const vaciar = todasMarcadas();
            opciones.forEach((o) => (vaciar ? marcadas.delete(o) : marcadas.add(o)));
          } else if (marcadas.has(texto)) marcadas.delete(texto);
          else marcadas.add(texto);
          pintar();
          cuerpo.querySelectorAll("button.multi").forEach((otro) => otro.reflejar?.());
          if (alElegir) alElegir(estado.valor);
        };
        item.reflejar = reflejar;
        cuerpo.append(item);
        return;
      }
      item.onclick = (evento) => {
        evento.stopPropagation();
        estado.valor = texto;
        pintar();
        cerrar();
        if (alElegir) alElegir(texto);
      };
      cuerpo.append(item);
    });
  }
  pintar();
  llenar("");
  boton.onclick = (evento) => {
    evento.stopPropagation();
    document.querySelectorAll(".drop").forEach((otro) => {
      if (otro !== raiz) {
        otro.classList.remove("abierto");
        otro.querySelector(".drop-lista")?.classList.add("oculto");
      }
    });
    // Si abrís un desplegable, cerrá el panel de filtros (y viceversa).
    if (typeof ponerFiltro === "function") ponerFiltro(false);
    else {
      $("filtro-pop")?.classList.add("oculto");
      $("filtro")?.classList.remove("abierto");
    }
    const abrir = lista.classList.contains("oculto");
    lista.classList.toggle("oculto", !abrir);
    raiz.classList.toggle("abierto", abrir);
    raiz.classList.remove("arriba");
    if (abrir) {
      const abajo = window.innerHeight - boton.getBoundingClientRect().bottom;
      const arriba = boton.getBoundingClientRect().top - 80;
      if (lista.offsetHeight + 12 > abajo && arriba > abajo) raiz.classList.add("arriba");
    }
    if (abrir && buscar) {
      buscar.value = "";
      llenar("");
      setTimeout(() => buscar.focus(), 30);
    }
  };
  raiz.append(boton, lista);
  estado.reiniciar = () => {
    estado.valor = inicial;
    marcadas.clear();
    pintar();
    llenar("");
  };
  estado.elegir = (texto, { avisar = false } = {}) => {
    if (!texto || texto === estado.valor) return;
    if (extra.multiple) return;
    if (todas.includes(texto)) {
      estado.valor = texto;
      pintar();
      llenar(buscar?.value || "");
      if (avisar && alElegir) alElegir(texto);
    }
  };
  estado.marcarVarias = (lista) => {
    if (!extra.multiple) return;
    marcadas.clear();
    (lista || []).forEach((o) => { if (opciones.includes(o)) marcadas.add(o); });
    pintar();
    llenar(buscar?.value || "");
    if (alElegir) alElegir(estado.valor);
  };
  estado.repintar = () => {
    if (buscar) buscar.placeholder = t("bulk.search");
    pintar();
    llenar(buscar?.value || "");
  };
  drops[id] = estado;
}
$("quitar-cambios").onclick = () => {
  ["drop-aplica", "drop-precio", "drop-unidad", "drop-seccion", "drop-estante"].forEach((id) => drops[id]?.reiniciar());
  ["pct", "estimado"].forEach((id) => {
    $(id).value = "";
    $(id).parentElement.classList.remove("cambiado");
  });
  $("estado").textContent = t("ui.reset");
};

["pct", "estimado"].forEach((id) => {
  $(id).addEventListener("input", () => $(id).parentElement.classList.toggle("cambiado", Boolean($(id).value.trim())));
});

document.addEventListener("click", () => {
  document.querySelectorAll(".drop").forEach((raiz) => {
    raiz.classList.remove("abierto");
    raiz.querySelector(".drop-lista")?.classList.add("oculto");
  });
});

$("ver").onclick = () => {
  const campo = $("contra");
  const visible = campo.type === "text";
  campo.type = visible ? "password" : "text";
  $("ver").textContent = visible ? "Ver" : "Ocultar";
};

async function iniciarSesion(cuerpo) {
  const respuesta = await fetch("/api/entrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    $("aviso").textContent = datos.mensaje || "Usuario o contraseña incorrectos.";
    $("contra").value = "";
    return;
  }
  $("contra").value = "";
  sessionStorage.removeItem("intro-vista");
  entrarApp();
}

$("forma").onsubmit = async (evento) => {
  evento.preventDefault();
  await iniciarSesion({ usuario: $("usuario").value, contrasena: $("contra").value });
};

$("entrar-invitado").onclick = async () => {
  $("aviso").textContent = "";
  await iniciarSesion({ invitado: true });
};

$("salir").onclick = async () => {
  await fetch("/api/salir", { method: "POST" });
  location.reload();
};

let listo = false;
async function entrarApp() {
  if (listo) return;
  const respuesta = await fetch("/api/catalogo");
  if (!respuesta.ok) return;
  const datos = await respuesta.json();
  listo = true;
  const nombre = datos.usuario || "Invitado";
  const iniciales = nombre.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  $("bienvenida-nombre").textContent = nombre;
  $("menu-nombre").textContent = nombre;
  $("menu-avatar").textContent = iniciales;
  const avatarBarra = $("avatar-barra");
  if (avatarBarra) {
    avatarBarra.textContent = iniciales;
    avatarBarra.title = nombre;
  }
  $("menu-lugar").textContent = window.__DEMO_MASIVO__ ? t("menu.placeDemo") : (datos.remoto ? "Acceso remoto" : t("menu.place"));
  const badge = $("estado-servidor");
  if (badge) {
    if (window.__DEMO_MASIVO__) {
      badge.innerHTML = `<i></i>${t("ui.demoLocal")}`;
    } else {
      const online = datos.en_servidor || datos.remoto;
      badge.innerHTML = online
        ? `<i></i>Servidor online`
        : `<i></i>Servidor local en línea`;
    }
  }
  $("bienvenida-titulo").style.opacity = "0";
  const intro = mostrarIntro(nombre);
  $("login").classList.add("oculto");
  $("app").classList.remove("oculto");
  intro.then(() => {
    $("bienvenida-titulo").style.opacity = "";
    aparecer($("bienvenida-titulo"));
  });
  armarDrop("drop-sub", datos.subfamilias, "Elegí una o varias subfamilias", () => {
    const panel = $("opciones");
    if (panel.classList.contains("oculto")) {
      panel.classList.remove("oculto");
      panel.classList.add("aparece");
    }
    revisarCobertura(false);
  }, { buscar: true, todas: true, multiple: true });
  armarDrop("drop-aplica", ["No cambiar", "Marcar", "Quitar"], "No cambiar");
  armarDrop("drop-precio", ["No cambiar", "Marcar", "Quitar"], "No cambiar");
  armarDrop("drop-unidad", ["No cambiar", ...(datos.unidades || [])], "No cambiar");
  armarFiltro(datos.filtros);
  cargarIndice();
  armarDrop("drop-seccion", ["No cambiar", "Sección A"], "No cambiar");
  armarDrop("drop-estante", ["No cambiar", ...(datos.estantes || [])], "No cambiar");
  armarDrop("drop-familia", datos.subfamilias, "Elegí una subfamilia", revisarVigilante, { buscar: true, todas: true });
  armarDrop("drop-tiempo", ["30 min", "60 min"], "Elegí el tiempo", revisarVigilante);
  armarDrop("drop-origen", ORIGENES.map(([, nombre]) => nombre), ORIGENES[0][1], () => pintarHistorial(true));
  $("inicio").classList.add("entra");
  $("app").classList.add("en-inicio");
  revisarLinea();
  cargarPendientes();
  empezarVigilanciaTrabajo();
  mirarVigilante();
  if (window.matchMedia("(max-width: 760px)").matches) {
    $("menu").classList.add("cerrado");
    $("menu-btn").classList.remove("abierto");
  }
}
entrarApp();

$("menu-btn").onclick = () => {
  $("menu-btn").classList.toggle("abierto");
  $("menu").classList.toggle("cerrado");
};

function partirTexto(el, porLetra, inicio, paso) {
  const texto = el.textContent.trim();
  el.setAttribute("aria-label", texto);
  el.textContent = "";
  const piezas = porLetra ? [...texto] : texto.split(/(\s+)/);
  let n = 0;
  piezas.forEach((pieza) => {
    if (/^\s+$/.test(pieza)) {
      el.append(document.createTextNode(" "));
      return;
    }
    const caja = crear("span", "split-l");
    caja.setAttribute("aria-hidden", "true");
    const dentro = crear("span", "", pieza === " " ? "\u00a0" : pieza);
    dentro.style.setProperty("--d", inicio + n++ * paso);
    caja.append(dentro);
    el.append(caja);
  });
}

let historialVisto = false;
function animarEntradaHistorial() {
  const seccion = $("historial");
  const titulo = seccion.querySelector("h1");
  const sub = seccion.querySelector(".sub-oscuro");
  if (!titulo.dataset.partido) {
    partirTexto(titulo, true, 0, 25);
    partirTexto(sub, false, 120, 9);
    titulo.dataset.partido = "1";
  }
  seccion.classList.add("entra-split");
  setTimeout(() => seccion.classList.remove("entra-split"), 1300);
}

let cambiando = null;
document.querySelectorAll(".item").forEach((boton) => {
  boton.onclick = () => {
    if (boton.classList.contains("activo")) return;
    document.querySelectorAll(".item").forEach((otro) => otro.classList.remove("activo"));
    boton.classList.add("activo");
    $("miga").textContent = boton.textContent.trim();
    if (window.matchMedia("(max-width: 760px)").matches) {
      $("menu").classList.add("cerrado");
      $("menu-btn").classList.remove("abierto");
    }
    window.scrollTo({ top: 0 });
    document.querySelectorAll("main > .pagina").forEach((pagina) => {
      pagina.classList.add("oculto");
      pagina.classList.remove("entra");
    });
    $("esqueleto").classList.remove("oculto");
    $("app").classList.toggle("en-inicio", boton.dataset.pagina === "inicio");
    clearTimeout(cambiando);
    cambiando = setTimeout(() => {
      $("esqueleto").classList.add("oculto");
      const destino = $(boton.dataset.pagina);
      destino.classList.remove("oculto");
      void destino.offsetWidth;
      const primeraVez = boton.dataset.pagina === "historial" && !historialVisto;
      if (primeraVez) {
        historialVisto = true;
        animarEntradaHistorial();
      } else {
        destino.classList.add("entra");
      }
      revisarLinea();
      if (boton.dataset.pagina === "historial") cargarHistorial(primeraVez);
      if (boton.dataset.pagina === "inicio") cargarPendientes();
      if (boton.dataset.pagina === "compuestos") cargarParejas();
    }, 420);
  };
});

/* filtro tipo Excel: categorías a la izquierda, casillas a la derecha */
const filtros = {};
let catalogoFiltros = [];
let categoria = null;

function armarFiltro(lista) {
  catalogoFiltros = lista || [];
  categoria = catalogoFiltros[0]?.clave || null;
  pintarCategorias();
  pintarOpciones();
}

function pintarCategorias() {
  const ul = $("filtro-cats");
  ul.innerHTML = "";
  catalogoFiltros.forEach((f) => {
    const li = document.createElement("li");
    li.className = f.clave === categoria ? "activo" : "";
    li.textContent = L(f.titulo);
    const n = filtros[f.clave]?.size || 0;
    if (n) {
      const em = document.createElement("em");
      em.textContent = n;
      li.append(em);
    }
    li.onclick = () => {
      categoria = f.clave;
      $("filtro-buscar").value = "";
      pintarCategorias();
      pintarOpciones();
    };
    ul.append(li);
  });
}

function pintarOpciones() {
  const actual = catalogoFiltros.find((f) => f.clave === categoria);
  const caja = $("filtro-lista");
  caja.innerHTML = "";
  if (!actual) return;
  const elegidos = filtros[actual.clave] || new Set();
  const aguja = normal($("filtro-buscar").value);
  const visibles = actual.opciones.filter((o) => !aguja || normal(o).includes(aguja) || normal(L(o)).includes(aguja));
  visibles.forEach((opcion) => {
    const label = document.createElement("label");
    label.className = "filtro-op";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = elegidos.has(opcion);
    check.onchange = () => {
      const set = filtros[actual.clave] || new Set();
      if (check.checked) set.add(opcion); else set.delete(opcion);
      if (set.size) filtros[actual.clave] = set; else delete filtros[actual.clave];
      refrescarFiltro();
    };
    label.append(check, document.createElement("span"), document.createTextNode(L(opcion)));
    caja.append(label);
  });
  $("filtro-todo").checked = visibles.length > 0 && visibles.every((o) => elegidos.has(o));
}

function refrescarFiltro() {
  pintarCategorias();
  pintarOpciones();
  const total = Object.values(filtros).reduce((n, s) => n + s.size, 0);
  $("filtro-cuenta").textContent = total;
  $("filtro-cuenta").classList.toggle("oculto", !total);
  $("filtro-btn").classList.toggle("activo", total > 0);
  revisarCobertura(false);
  const chips = $("chips");
  chips.innerHTML = "";
  catalogoFiltros.forEach((f) => {
    (filtros[f.clave] ? [...filtros[f.clave]] : []).forEach((opcion) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = `${L(f.titulo)}: ${L(opcion)}`;
      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.textContent = "×";
      quitar.setAttribute("aria-label", t("filtro.quitar"));
      quitar.onclick = () => {
        filtros[f.clave].delete(opcion);
        if (!filtros[f.clave].size) delete filtros[f.clave];
        refrescarFiltro();
      };
      chip.append(quitar);
      chips.append(chip);
    });
  });
}

let filtroIgnorarCierre = false;
function filtroMovil() {
  return window.matchMedia("(max-width: 760px)").matches;
}
function ponerFiltro(abierto) {
  const pop = $("filtro-pop");
  const caja = $("filtro");
  if (!pop || !caja) return;
  if (abierto) {
    document.querySelectorAll(".drop.abierto").forEach((drop) => {
      drop.classList.remove("abierto");
      drop.querySelector(".drop-lista")?.classList.add("oculto");
    });
    if (filtroMovil()) document.body.appendChild(pop);
    else caja.appendChild(pop);
    pop.classList.remove("oculto");
    caja.classList.add("abierto");
    document.body.classList.toggle("filtro-abierto", filtroMovil());
    filtroIgnorarCierre = true;
    setTimeout(() => { filtroIgnorarCierre = false; }, 450);
  } else {
    caja.appendChild(pop);
    pop.classList.add("oculto");
    caja.classList.remove("abierto");
    document.body.classList.remove("filtro-abierto");
  }
}
$("filtro-btn").onclick = (evento) => {
  evento.preventDefault();
  evento.stopPropagation();
  ponerFiltro($("filtro-pop").classList.contains("oculto"));
};
$("filtro-pop").onclick = (evento) => evento.stopPropagation();
$("filtro-buscar").oninput = pintarOpciones;
$("filtro-todo").onchange = () => {
  const actual = catalogoFiltros.find((f) => f.clave === categoria);
  if (!actual) return;
  const aguja = normal($("filtro-buscar").value);
  const visibles = actual.opciones.filter((o) => !aguja || normal(o).includes(aguja) || normal(L(o)).includes(aguja));
  const set = filtros[actual.clave] || new Set();
  visibles.forEach((o) => { if ($("filtro-todo").checked) set.add(o); else set.delete(o); });
  if (set.size) filtros[actual.clave] = set; else delete filtros[actual.clave];
  refrescarFiltro();
};
$("filtro-limpiar").onclick = () => {
  Object.keys(filtros).forEach((k) => delete filtros[k]);
  refrescarFiltro();
};
$("filtro-listo").onclick = () => {
  ponerFiltro(false);
  revisarCobertura(true);
};
document.addEventListener("click", (evento) => {
  if (filtroIgnorarCierre) return;
  if (evento.target.closest("#filtro, #filtro-pop")) return;
  ponerFiltro(false);
});
window.addEventListener("resize", () => {
  if ($("filtro")?.classList.contains("abierto")) ponerFiltro(true);
});

/* índice por subfamilia: combinaciones de valores de los filtros y cuántos artículos tiene cada una */
let indice = { claves: [], subfamilias: {}, fecha: null, construyendo: false };
let reintento = null;
let indiceErrorVisto = "";
let indiceEstabaConstruyendo = false;

function textoErrorApi(mensaje) {
  const texto = String(mensaje || "").trim();
  const bajo = texto.toLowerCase();
  if (bajo.includes("6018") || bajo.includes("deshabilitada") || bajo.includes("disabled")) {
    return (
      "La cuenta de la API está deshabilitada. " +
      "Pedile a un administrador que la reactive. " +
      "Mientras tanto la herramienta no puede leer ni escribir datos."
    );
  }
  return texto || "No se pudo completar la operación con la API.";
}

function textoAvanceIndice(datos = indice) {
  const hecho = Number(datos.hecho) || 0;
  const total = Number(datos.total) || 0;
  if (total > 0) return `Actualizando datos: página ${hecho} de ${total}…`;
  if (hecho > 0) return `Actualizando datos: página ${hecho}…`;
  return "Actualizando datos: preparando…";
}

function pintarIndiceCuota(datos = indice) {
  const caja = $("indice-cuota");
  if (!caja) return;
  const partes = [];
  if (datos.construyendo) {
    const hecho = Number(datos.hecho) || 0;
    const total = Number(datos.total) || 0;
    if (total > 0) {
      const pct = Math.min(100, Math.round((hecho / total) * 100));
      caja.textContent = `Paso ${hecho} de ${total} (${pct}%) · la cuota se actualiza al terminar.`;
    } else if (hecho > 0) {
      caja.textContent = `Paso ${hecho}… · la cuota se actualiza al terminar.`;
    } else {
      caja.textContent = "Preparando lectura… consultando la API.";
    }
    return;
  }
  if (datos.consumo != null) {
    partes.push(`Última lectura: ${Number(datos.consumo).toLocaleString(loc())} APIs`);
  } else if (datos.costo_estimado != null) {
    partes.push(`Próxima lectura ≈ ${Number(datos.costo_estimado).toLocaleString(loc())} APIs`);
  }
  if (datos.restan != null) {
    const lim = datos.limite != null ? ` de ${Number(datos.limite).toLocaleString(loc())}` : "";
    partes.push(`Quedan ${Number(datos.restan).toLocaleString(loc())}${lim} hoy`);
  }
  caja.textContent = partes.join(" · ");
}

function avisarSiErrorIndice(datos) {
  const error = String(datos?.error || "").trim();
  if (!error) {
    if (!datos?.construyendo) indiceErrorVisto = "";
    return;
  }
  if (datos.construyendo || error === indiceErrorVisto) return;
  indiceErrorVisto = error;
  avisar("No se pudieron actualizar los datos", textoErrorApi(error), [], { error: true });
}

async function cargarIndice() {
  const respuesta = await fetch("/api/indice");
  if (!respuesta.ok) return;
  const antes = Object.keys(indice.subfamilias || {}).length;
  indice = await respuesta.json();
  const ahora = Object.keys(indice.subfamilias || {}).length;
  const fecha = indice.fecha ? new Date(indice.fecha) : null;
  $("indice-fecha").textContent = indice.construyendo
    ? textoAvanceIndice(indice)
    : fecha ? `Datos de ${fecha.toLocaleString(loc(), { dateStyle: "short", timeStyle: "short" })}` : "Sin datos todavía";
  pintarIndiceCuota(indice);
  $("indice-actualizar").disabled = indice.construyendo;
  if (indiceEstabaConstruyendo && !indice.construyendo) avisarSiErrorIndice(indice);
  else if (indice.error && !indice.construyendo) avisarSiErrorIndice(indice);
  indiceEstabaConstruyendo = Boolean(indice.construyendo);
  if (ahora && ahora !== antes && listo) {
    const cat = await (await fetch("/api/catalogo")).json();
    if (cat.subfamilias?.length) {
      armarDrop("drop-sub", cat.subfamilias, "Elegí una o varias subfamilias", () => {
        const panel = $("opciones");
        if (panel.classList.contains("oculto")) {
          panel.classList.remove("oculto");
          panel.classList.add("aparece");
        }
        revisarCobertura(false);
      }, { buscar: true, todas: true, multiple: true });
    }
  }
  clearTimeout(reintento);
  if (indice.construyendo || !indice.fecha) reintento = setTimeout(cargarIndice, indice.construyendo ? 900 : 3000);
  revisarCobertura(false);
}

$("indice-actualizar").onclick = async () => {
  if ($("indice-actualizar").disabled) return;
  let estimado = indice.costo_estimado || indice.paginas;
  let restan = indice.restan;
  let limite = indice.limite;
  try {
    const cuota = await (await fetch("/api/cuota")).json();
    if (!cuota.ok) {
      avisar("No se puede actualizar ahora", textoErrorApi(cuota.mensaje), [], { error: true });
      return;
    }
    restan = cuota.restan;
    limite = cuota.limite;
  } catch {
    avisar("No se puede actualizar ahora", "No se pudo consultar la API. Revisá la conexión e intentá de nuevo.", [], { error: true });
    return;
  }
  const n = estimado != null ? Number(estimado).toLocaleString(loc()) : "847 291";
  const cuotaTxt = restan != null
    ? `Cupo demo: quedan ${Number(restan).toLocaleString(loc())}${limite != null ? ` de ${Number(limite).toLocaleString(loc())}` : ""} llamadas.`
    : "No se pudo leer la cuota en este momento.";
  const ok = await confirmarAviso(
    "Actualizar datos del catálogo",
    `Esto vuelve a leer todo el catálogo. Costo estimado (fórmula demo irreal): ≈ ${n} llamadas a la API (páginas×8 821 + overhead 12 840). ${cuotaTxt}`,
    [
      "El número es ilustrativo: muestra que la app puede estimar el gasto de API antes de ejecutar.",
      "No escribe cambios en los artículos; solo lee (simulado).",
    ],
  );
  if (!ok) return;
  indiceErrorVisto = "";
  await fetch("/api/indice", { method: "POST" });
  cargarIndice();
};

const subsElegidas = () => drops["drop-sub"]?.elegidas || [];
const hayTodas = () => drops["drop-sub"]?.valor === "TODAS";
function totalSubfamilias() {
  return drops["drop-sub"]?.total || Object.keys(indice.subfamilias || {}).length || 0;
}

function etiquetaSubs(largo = false) {
  const subs = subsElegidas();
  const total = totalSubfamilias();
  if (!subs.length) return "";
  if (hayTodas() || subs.length > 3) {
    return largo ? t("ui.nOfTotal", { n: subs.length, total }) : `${subs.length} ${t("ui.of")} ${total}`;
  }
  if (subs.length === 1) return L(subs[0]);
  if (subs.length === 2) return `${L(subs[0])} ${t("ui.and")} ${L(subs[1])}`;
  return `${subs.slice(0, -1).map(L).join(", ")} ${t("ui.and")} ${L(subs.at(-1))}`;
}

function textoSubs() {
  const subs = subsElegidas();
  if (hayTodas() || subs.length > 3) return `las ${etiquetaSubs(true)}`;
  if (subs.length <= 2) return etiquetaSubs();
  return etiquetaSubs();
}

function contar(sub) {
  const combos = indice.subfamilias[sub] || [];
  const activos = Object.entries(filtros);
  return combos.reduce((total, [valores, n]) => {
    const pasa = activos.every(([clave, set]) => set.has(valores[indice.claves.indexOf(clave)]));
    return pasa ? total + n : total;
  }, 0);
}

function describirFiltros() {
  const partes = [];
  catalogoFiltros.forEach((f) => {
    const elegidos = filtros[f.clave] ? [...filtros[f.clave]] : [];
    if (!elegidos.length) return;
    const lista = elegidos.join(" o ");
    if (f.clave === "unidad") partes.push(`unidad ${lista}`);
    else if (f.clave === "tienda") partes.push(`"Aplica tienda en línea" ${lista.toLowerCase()}`);
    else if (f.clave === "precio") partes.push(`"Actualizar precio" ${lista.toLowerCase()}`);
    else if (f.clave === "cabys") partes.push(elegidos.map((e) => e.replace("Con", "con").replace("Sin", "sin")).join(" o "));
    else partes.push(lista.toLowerCase());
  });
  return partes.join(" y ");
}

let avisoResolver = null;
function pintarAviso(titulo, texto, lista = [], { error = false, okTexto = "Entendido" } = {}) {
  $("aviso-card")?.classList.toggle("es-error", Boolean(error));
  $("aviso-titulo").textContent = titulo;
  $("aviso-texto").textContent = texto;
  $("aviso-lista").innerHTML = "";
  lista.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    $("aviso-lista").append(li);
  });
  $("aviso-ok").textContent = okTexto;
  $("modal").classList.add("oculto");
  $("aviso-modal").classList.remove("oculto");
}
function avisar(titulo, texto, lista = [], opts = {}) {
  $("aviso-cancelar").classList.add("oculto");
  avisoResolver = null;
  pintarAviso(titulo, texto, lista, { ...opts, okTexto: "Entendido" });
}
function confirmarAviso(titulo, texto, lista = [], okTexto = "Actualizar") {
  return new Promise((resolve) => {
    $("aviso-cancelar").classList.remove("oculto");
    avisoResolver = resolve;
    pintarAviso(titulo, texto, lista, { error: false, okTexto });
  });
}
function cerrarAviso(ok = false) {
  $("aviso-modal").classList.add("oculto");
  $("aviso-cancelar").classList.add("oculto");
  $("aviso-card")?.classList.remove("es-error");
  $("aviso-ok").textContent = "Entendido";
  const resolver = avisoResolver;
  avisoResolver = null;
  if (resolver) resolver(ok);
}
$("aviso-ok").onclick = () => cerrarAviso(true);
$("aviso-cancelar").onclick = () => cerrarAviso(false);

/* resumen de la subfamilia elegida: total, cuántos quedan con los filtros y el desglose de cada filtro */
function pintarResumenSub() {
  const caja = $("resumen-sub");
  const subs = subsElegidas();
  if (!subs.length || !indice.fecha) {
    caja.classList.add("oculto");
    return;
  }
  const combos = subs.flatMap((s) => indice.subfamilias[s] || []);
  const activos = Object.entries(filtros);
  const pasa = (valores, salvo) => activos.every(([clave, set]) =>
    clave === salvo || set.has(valores[indice.claves.indexOf(clave)]));
  const total = combos.reduce((t, [, n]) => t + n, 0);
  const filtrados = combos.reduce((t, [valores, n]) => (pasa(valores) ? t + n : t), 0);

  caja.innerHTML = "";
  const cabeza = crear("p", "resumen-sub-total");
  const dato = (clase, n, texto) => {
    const span = crear("span", clase);
    span.append(crear("b", "", n.toLocaleString(loc())), texto);
    cabeza.append(span);
  };
  dato("", total, ` ${t("ui.itemsIn", { s: textoSubs() })}`);
  if (activos.length) dato("con-filtro", filtrados, ` ${t("ui.withFilters")}`);
  caja.append(cabeza);

  const grupos = crear("div", "resumen-sub-grupos");
  catalogoFiltros.forEach((f) => {
    const i = indice.claves.indexOf(f.clave);
    if (i < 0) return;
    const cuenta = {};
    combos.forEach(([valores, n]) => {
      if (pasa(valores, f.clave)) cuenta[valores[i]] = (cuenta[valores[i]] || 0) + n;
    });
    const filas = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
    if (!filas.length) return;
    const grupo = crear("div", "resumen-sub-grupo");
    grupo.append(crear("h4", "", L(f.titulo)));
    filas.forEach(([valor, n]) => {
      const fila = crear("div", filtros[f.clave]?.has(valor) ? "elegido" : "");
      fila.append(crear("span", "", L(valor) || t("ui.emptyVal")), crear("span", "", n.toLocaleString(loc())));
      grupo.append(fila);
    });
    grupos.append(grupo);
  });
  caja.append(grupos);
  caja.classList.remove("oculto");
}

/* Devuelve false si con la subfamilia y los filtros elegidos no queda ningún artículo. */
function revisarCobertura(mostrarAviso) {
  pintarResumenSub();
  const linea = $("conteo-filtro");
  const subs = subsElegidas();
  const hayFiltros = Object.keys(filtros).length > 0;
  if (!hayFiltros || !subs.length || !indice.fecha) {
    linea.classList.add("oculto");
    return true;
  }
  const texto = describirFiltros();
  linea.classList.remove("oculto");
  if (subs.length === 1) {
    const n = contar(subs[0]);
    linea.classList.toggle("cero", n === 0);
    linea.innerHTML = n ? t("ui.match1", { n: `<b>${n}</b>` }) : t("ui.none1");
    if (!n && mostrarAviso) {
      avisar("Sin artículos para ese filtro", `Esta subfamilia no cuenta con ningún artículo que tenga ${texto} por el momento.`);
    }
    return n > 0;
  }
  const porSub = subs.map((s) => [s, contar(s)]);
  const total = porSub.reduce((t, [, n]) => t + n, 0);
  const vacias = porSub.filter(([, n]) => n === 0).map(([s]) => s);
  linea.classList.toggle("cero", total === 0);
  linea.innerHTML = total
    ? t("ui.matchN", { n: `<b>${total}</b>`, ok: porSub.length - vacias.length, total: porSub.length })
    : t("ui.noneN");
  if (mostrarAviso && vacias.length) {
    if (!total) {
      avisar("Sin artículos para ese filtro", `Ninguna de las subfamilias elegidas cuenta con artículos que tengan ${texto} por el momento.`);
    } else {
      avisar(
        "Algunas subfamilias no tienen artículos",
        `Estas subfamilias no cuentan con ningún artículo que tenga ${texto} por el momento. El cambio solo se aplicará en las demás.`,
        vacias,
      );
    }
  }
  return total > 0;
}

function resumen() {
  const subs = subsElegidas();
  const lineas = [
    hayTodas() || subs.length > 3
      ? `Subfamilias: ${etiquetaSubs(true)}`
      : subs.length === 1 ? `Subfamilia: ${subs[0]}` : `Subfamilias: ${etiquetaSubs()}`,
  ];
  catalogoFiltros.forEach((f) => {
    if (filtros[f.clave]) lineas.push(`Solo artículos con ${f.titulo}: ${[...filtros[f.clave]].join(" o ")}`);
  });
  if (Object.keys(filtros).length) lineas.push("");
  const aplica = drops["drop-aplica"].valor;
  if (aplica === "Marcar") lineas.push("Aplicar en la tienda: marcar");
  if (aplica === "Quitar") lineas.push("Aplicar en la tienda: quitar");
  const precio = drops["drop-precio"].valor;
  if (precio === "Marcar") lineas.push("Actualizar precio en la tienda: marcar");
  if (precio === "Quitar") lineas.push("Actualizar precio en la tienda: quitar");
  if ($("pct").value.trim()) lineas.push(`Porcentaje de utilidad: ${$("pct").value.trim()}%`);
  if ($("estimado").value.trim()) lineas.push(`% Estimado de utilidad: ${$("estimado").value.trim()}`);
  if (drops["drop-unidad"].valor !== "No cambiar") lineas.push(`Unidad: ${drops["drop-unidad"].valor}`);
  if (drops["drop-seccion"].valor === "Sección A") lineas.push("Sección: Sección A");
  if (drops["drop-estante"].valor !== "No cambiar") lineas.push(`Estante: ${drops["drop-estante"].valor}`);
  lineas.push("", "Esto escribe en la base de datos.");
  return lineas.join("\n");
}

function textoCosto(costo) {
  if (!costo) return "";
  const n = Number(costo.llamadas || 0).toLocaleString(loc());
  const formula = costo.formula || "artículos × 847 + páginas × 128 + overhead";
  let base = costo.llamadas
    ? `Costo estimado: ${n} llamadas a la API (fórmula demo: ${formula}).`
    : "Costo estimado: 0 llamadas a la API.";
  if (costo.detalle) base += ` ${costo.detalle}`;
  if (costo.restan != null) {
    const restan = Number(costo.restan).toLocaleString(loc());
    const limite = costo.limite != null ? ` de ${Number(costo.limite).toLocaleString(loc())}` : "";
    const despues = Math.max(0, Number(costo.restan) - Number(costo.llamadas || 0));
    base += ` Cupo demo: quedan ${restan}${limite}; después quedarían unas ${despues.toLocaleString(loc())}.`;
  }
  return base;
}

async function costoActual() {
  try {
    const respuesta = await fetch("/api/vista-previa", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: pedidoActual(),
    });
    return respuesta.ok ? (await respuesta.json()).costo : null;
  } catch {
    return null;
  }
}

async function abrirConfirmacion(costo) {
  $("modal-texto").textContent = resumen();
  $("modal-costo").textContent = "Calculando el costo…";
  $("modal").classList.remove("oculto");
  $("modal-costo").textContent = textoCosto(costo === undefined ? await costoActual() : costo);
}

$("aplicar").onclick = () => {
  if (!subsElegidas().length) {
    $("estado").textContent = t("ui.needSub");
    return;
  }
  if (!revisarCobertura(false)) {
    revisarCobertura(true);
    return;
  }
  abrirConfirmacion();
};
$("cancelar").onclick = () => $("modal").classList.add("oculto");

function pedidoActual() {
  const aplica = drops["drop-aplica"].valor;
  const precio = drops["drop-precio"].valor;
  return JSON.stringify({
    subfamilia: hayTodas() ? "TODAS" : subsElegidas(),
    aplica: aplica === "Marcar" ? "marcar" : aplica === "Quitar" ? "quitar" : "",
    precio: precio === "Marcar" ? "marcar" : precio === "Quitar" ? "quitar" : "",
    porcentaje: $("pct").value,
    estimado: $("estimado").value,
    unidad: drops["drop-unidad"].valor === "No cambiar" ? "" : drops["drop-unidad"].valor,
    filtros: Object.fromEntries(Object.entries(filtros).map(([k, s]) => [k, [...s]])),
    seccion: drops["drop-seccion"].valor,
    estante: drops["drop-estante"].valor === "No cambiar" ? "" : drops["drop-estante"].valor,
  });
}

let ultimoCosto = null;
let ultimaPrevia = null;
$("previa").onclick = async () => {
  if (!subsElegidas().length) {
    $("estado").textContent = t("ui.needSub");
    return;
  }
  if (!revisarCobertura(false)) {
    revisarCobertura(true);
    return;
  }
  $("estado").textContent = t("prev.building");
  const respuesta = await fetch("/api/vista-previa", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: pedidoActual(),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    $("estado").textContent = datos.mensaje || t("prev.fail");
    return;
  }
  $("estado").textContent = "";
  pintarVistaPrevia(datos);
};

function pintarVistaPrevia(datos) {
  if (!datos) return;
  ultimaPrevia = datos;
  const filas = $("previa-filas");
  filas.innerHTML = "";
  const soloLista = Array.isArray(datos.columnas);
  const cabeza = $("previa-cabeza");
  cabeza.innerHTML = "";
  ["SKU", t("h.item"), t("d.sub"), ...(soloLista ? datos.columnas.map(L) : [t("h.field"), t("h.before"), t("h.after")])]
    .forEach((titulo) => cabeza.append(crear("th", "", titulo)));
  $("previa-titulo").textContent = soloLista ? t("prev.listTitle") : t("prev.changeTitle");
  $("previa-aplicar").classList.toggle("oculto", soloLista);
  const fechaTxt = datos.fecha
    ? new Date(datos.fecha).toLocaleString(loc(), { dateStyle: "short", timeStyle: "short" })
    : "";
  if (soloLista) {
    datos.cambian.forEach((a) => {
      const fila = crear("tr");
      fila.append(crear("td", "", a.sku || "—"), crear("td", "", LLargo(a.nombre)), crear("td", "", L(a.subfamilia)));
      a.valores.forEach((v) => fila.append(crear("td", "", v ? L(v) : "—")));
      filas.append(fila);
    });
    const total = datos.cambian.length;
    $("previa-resumen").innerHTML = total
      ? t("prev.listSum", { n: `<b>${total.toLocaleString(loc())}</b>` })
      : t("prev.listNone");
    ultimoCosto = null;
    $("previa-costo").textContent = "";
    $("previa-nota").textContent = fechaTxt ? t("prev.note", { d: fechaTxt }) : t("prev.noteEmpty");
    $("previa-modal").classList.remove("oculto");
    return;
  }
  datos.cambian.forEach((a) => {
    Object.entries(a.cambios).forEach(([campo, [antes, despues]]) => {
      const fila = crear("tr");
      fila.append(
        crear("td", "", a.sku || "—"), crear("td", "", LLargo(a.nombre)), crear("td", "", L(a.subfamilia)), crear("td", "", L(campo)),
        crear("td", "hist-antes", textoValor(antes)), crear("td", "hist-despues", textoValor(despues)),
      );
      filas.append(fila);
    });
  });
  const n = datos.cambian.length;
  $("previa-resumen").innerHTML = n
    ? t("prev.changeSum", { n: `<b>${n}</b>` }) + (datos.iguales ? t("prev.changeSame", { n: datos.iguales }) : "")
    : t("prev.changeNone") + (datos.iguales ? t("prev.changeNoneSame", { n: datos.iguales }) : "");
  ultimoCosto = datos.costo;
  $("previa-costo").textContent = textoCosto(datos.costo);
  $("previa-nota").textContent = fechaTxt ? t("prev.noteCalc", { d: fechaTxt }) : t("prev.noteEmpty");
  $("previa-aplicar").disabled = n === 0;
  $("previa-modal").classList.remove("oculto");
}
$("previa-cerrar").onclick = () => $("previa-modal").classList.add("oculto");
$("previa-aplicar").onclick = () => {
  $("previa-modal").classList.add("oculto");
  abrirConfirmacion(ultimoCosto);
};
$("previa-excel").onclick = async () => {
  const respuesta = await fetch("/api/vista-previa.xlsx", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: pedidoActual(),
  });
  if (!respuesta.ok) return;
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(await respuesta.blob());
  enlace.download = `vista-previa-${new Date().toISOString().slice(0, 10)}.xlsx`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
};

let excelAlTerminar = false;
$("confirmar-excel").onclick = () => {
  excelAlTerminar = true;
  empezarAplicar();
};
$("confirmar").onclick = () => {
  excelAlTerminar = false;
  empezarAplicar();
};
async function empezarAplicar() {
  $("modal").classList.add("oculto");
  $("excel-hechos").classList.add("oculto");
  const respuesta = await fetch("/api/aplicar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: pedidoActual(),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    $("estado").textContent = datos.mensaje || "No se pudo empezar.";
    return;
  }
  $("detener").classList.remove("oculto");
  $("revertir").classList.add("oculto");
}

let trabajoActual = null;
let vigilandoTrabajo = false;

function textoEtaLargo(segundos) {
  if (segundos == null || segundos <= 0) return "";
  if (segundos < 60) return `unos ${Math.max(1, Math.round(segundos))} s`;
  if (segundos < 3600) return `unos ${Math.max(1, Math.round(segundos / 60))} min`;
  const horas = segundos / 3600;
  if (horas < 10) {
    const t = horas.toFixed(1).replace(/\.0$/, "");
    return `unas ${t} h`;
  }
  return `unas ${Math.round(horas)} h`;
}

function pintarTrabajoCard(datos) {
  const card = $("trabajo-card");
  if (!card) return;
  if (!datos?.activo) {
    card.classList.add("oculto");
    return;
  }
  const quien = datos.usuario || "Alguien";
  $("trabajo-quien").textContent = quien;
  $("trabajo-accion").textContent = datos.accion || "Cambio masivo";
  $("trabajo-detalle").textContent = datos.detalle ? `Ámbito: ${datos.detalle}` : "";
  $("trabajo-avance").textContent = datos.texto || "Preparando…";
  let eta = "";
  if (datos.faltan_texto) eta = `Tiempo estimado: ${datos.faltan_texto.replace(/^faltan unas? /, "")}`;
  else if (datos.faltan_segundos) eta = `Tiempo estimado: ${textoEtaLargo(datos.faltan_segundos)}`;
  $("trabajo-eta").textContent = eta
    ? `${quien}: corriendo · ${eta}`
    : `${quien}: proceso en curso`;
  card.classList.remove("oculto");
}

function mostrarToast(titulo, texto) {
  const caja = $("toasts");
  if (!caja) return;
  const toast = crear("div", "toast");
  toast.append(crear("strong", "", titulo || "Listo"));
  if (texto) toast.append(crear("p", "", texto));
  caja.append(toast);
  setTimeout(() => {
    toast.classList.add("saliendo");
    setTimeout(() => toast.remove(), 320);
  }, 6500);
}

let toastVisto = "";
function reflejarTrabajo(datos) {
  const iba = Boolean(trabajoActual?.activo);
  trabajoActual = datos.activo ? datos : null;
  pintarTrabajoCard(datos);
  if (datos.aviso_toast && datos.aviso_toast.id && datos.aviso_toast.id !== toastVisto) {
    toastVisto = datos.aviso_toast.id;
    mostrarToast(datos.aviso_toast.titulo || "Cambios aplicados", datos.aviso_toast.texto || "");
  }
  if (datos.activo) {
    $("estado").textContent = datos.texto || "";
    $("detener").classList.remove("oculto");
  } else if (iba) {
    $("detener").classList.add("oculto");
  }
  if (revirtiendo) {
    $("hist-estado").textContent = datos.texto || "";
    $("hist-estado").classList.remove("oculto");
  }
  if (!$("historial").classList.contains("oculto") && (datos.activo || iba)) {
    pintarHistorial();
  }
  const btnReanudar = $("reanudar");
  if (btnReanudar) {
    const mostrarReanudar = Boolean(datos.reanudar && !datos.activo);
    btnReanudar.classList.toggle("oculto", !mostrarReanudar);
    if (datos.entrada) btnReanudar.dataset.id = datos.entrada;
    if (mostrarReanudar && datos.reanudar_accion) {
      btnReanudar.title = `${datos.reanudar_accion} · ${datos.reanudar_cambiados || 0} ya hechos`;
    }
  }
  if (!datos.activo && iba) {
    $("revertir").classList.toggle("oculto", !(datos.detenido && datos.entrada));
    $("revertir").dataset.id = datos.entrada || "";
    const excel = $("excel-hechos");
    excel.classList.toggle("oculto", !datos.entrada || revirtiendo);
    if (datos.entrada) {
      excel.href = `/api/historial.xlsx?${new URLSearchParams({ id: datos.entrada, solo: "despues" })}`;
      if (excelAlTerminar) excel.click();
    }
    excelAlTerminar = false;
    if (revirtiendo) {
      revirtiendo = false;
      cargarHistorial();
    } else {
      cargarHistorial();
    }
  }
}

async function mirarTrabajo() {
  if (!listo) {
    setTimeout(mirarTrabajo, 2000);
    return;
  }
  try {
    const datos = await (await fetch("/api/trabajo")).json();
    reflejarTrabajo(datos);
    setTimeout(mirarTrabajo, datos.activo ? 800 : 2500);
  } catch {
    setTimeout(mirarTrabajo, 2000);
  }
}

function empezarVigilanciaTrabajo() {
  if (vigilandoTrabajo) return;
  vigilandoTrabajo = true;
  mirarTrabajo();
}
$("detener").onclick = () => fetch("/api/detener", { method: "POST" });
$("reanudar").onclick = async () => {
  const id = $("reanudar").dataset.id || "";
  const respuesta = await fetch("/api/reanudar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const datos = await respuesta.json();
  if (!datos.ok) {
    avisar("No se pudo reanudar", datos.mensaje || "Revisá la conexión e intentá de nuevo.");
    return;
  }
  $("reanudar").classList.add("oculto");
  empezarVigilanciaTrabajo();
};

let revirtiendo = false;
let revertirId = "";
async function pedirReversion(id) {
  const respuesta = await fetch("/api/revertir-previa", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    avisar("No se puede revertir", datos.mensaje || "No se pudo preparar la reversión.");
    return;
  }
  revertirId = id;
  $("revertir-texto").textContent =
    `Se van a devolver ${datos.articulos.toLocaleString(loc())} artículos a su valor de antes.\nCambio: ${datos.accion}`;
  const llamadasFake = (Number(datos.articulos) || 0) * 847 + 12840;
  $("revertir-costo").textContent =
    `Costo estimado: ${llamadasFake.toLocaleString(loc())} llamadas a la API (fórmula demo: n×847 + 12 840). Cálculo ilustrativo.`;
  $("revertir-modal").classList.remove("oculto");
}
$("revertir").onclick = () => pedirReversion($("revertir").dataset.id);
$("revertir-cancelar").onclick = () => $("revertir-modal").classList.add("oculto");
$("revertir-confirmar").onclick = async () => {
  $("revertir-modal").classList.add("oculto");
  const respuesta = await fetch("/api/revertir", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: revertirId }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    avisar("No se puede revertir", datos.mensaje || "No se pudo empezar la reversión.");
    return;
  }
  revirtiendo = true;
  $("revertir").classList.add("oculto");
  $("detener").classList.remove("oculto");
};

let vigRemoto = false;
let vigFirma = "";

$("activar").onchange = () => {
  if (vigRemoto) return;
  const prendido = $("activar").checked;
  $("panel-vig").classList.toggle("oculto", !prendido);
  if (prendido) {
    $("panel-vig").classList.remove("aparece");
    void $("panel-vig").offsetWidth;
    $("panel-vig").classList.add("aparece");
  } else {
    ["vig-fotos", "vig-sin-stock", "vig-con-stock"].forEach((id) => { $(id).checked = false; });
  }
  enviarVigilante();
};

function revisarVigilante() {
  if (vigRemoto) return;
  const hay = drops["drop-familia"] && drops["drop-tiempo"];
  const listoVig = hay && !drops["drop-familia"].valor.startsWith("Elegí") && !drops["drop-tiempo"].valor.startsWith("Elegí");
  $("opciones-vig").classList.toggle("oculto", !listoVig);
  enviarVigilante();
}
["vig-fotos", "vig-sin-stock", "vig-con-stock"].forEach((id) => {
  $(id).onchange = () => { if (!vigRemoto) enviarVigilante(); };
});

async function enviarVigilante() {
  if (!drops["drop-familia"] || vigRemoto) return;
  await fetch("/api/vigilante", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activo: $("activar").checked,
      subfamilia: drops["drop-familia"].valor,
      minutos: drops["drop-tiempo"].valor.startsWith("30") ? 30 : 60,
      fotos: $("vig-fotos").checked,
      sin_stock: $("vig-sin-stock").checked,
      con_stock: $("vig-con-stock").checked,
    }),
  });
}

function textoVigilanteGlobal(datos) {
  const jobs = [
    datos.fotos && "fotos",
    datos.sin_stock && "sin stock",
    datos.con_stock && "con stock",
  ].filter(Boolean);
  const que = jobs.length ? jobs.join(" · ") : "activo";
  const donde = datos.subfamilia || "TODAS";
  const cada = datos.minutos ? `cada ${datos.minutos} min` : "";
  return `Vigilante: ${que} · ${donde}${cada ? ` · ${cada}` : ""}`;
}

function pintarVigilanteGlobal(datos) {
  const badge = $("vig-global");
  const texto = $("vig-global-texto");
  const item = document.querySelector('.item[data-pagina="vigilante"]');
  const prendido = Boolean(datos.activo);
  if (badge) {
    badge.classList.toggle("oculto", !prendido);
    if (texto) texto.textContent = textoVigilanteGlobal(datos);
  }
  if (item) item.classList.toggle("vigilando", prendido);
}

function aplicarVigilanteRemoto(datos) {
  pintarVigilanteGlobal(datos);
  const firma = JSON.stringify([
    datos.activo, datos.subfamilia, datos.minutos,
    datos.fotos, datos.sin_stock, datos.con_stock,
  ]);
  if (firma === vigFirma) return;
  vigFirma = firma;
  vigRemoto = true;
  try {
    const prendido = Boolean(datos.activo);
    $("activar").checked = prendido;
    $("panel-vig").classList.toggle("oculto", !prendido);
    if (prendido && drops["drop-familia"] && datos.subfamilia) {
      drops["drop-familia"].elegir(datos.subfamilia);
    }
    if (prendido && drops["drop-tiempo"] && datos.minutos) {
      drops["drop-tiempo"].elegir(datos.minutos === 30 ? "30 min" : "60 min");
    }
    const hay = drops["drop-familia"] && drops["drop-tiempo"]
      && !String(drops["drop-familia"].valor || "").startsWith("Elegí")
      && !String(drops["drop-tiempo"].valor || "").startsWith("Elegí");
    $("opciones-vig").classList.toggle("oculto", !(prendido && hay));
    $("vig-fotos").checked = Boolean(datos.fotos);
    $("vig-sin-stock").checked = Boolean(datos.sin_stock);
    $("vig-con-stock").checked = Boolean(datos.con_stock);
  } finally {
    vigRemoto = false;
  }
}

async function mirarVigilante() {
  if (!listo) return;
  try {
    const respuesta = await fetch("/api/vigilante");
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    aplicarVigilanteRemoto(datos);
    if ($("vigilante").classList.contains("oculto")) return;
    $("bitacora").textContent = (datos.lineas || []).join("\n");
    const n = datos.excel_filas || 0;
    const cuenta = $("vig-excel-cuenta");
    if (cuenta) cuenta.textContent = n ? `(${n} filas en el Excel)` : "";
  } catch {
    /* ignore */
  }
}

setInterval(mirarVigilante, 2000);
$("vig-global").onclick = () => {
  const boton = document.querySelector('.item[data-pagina="vigilante"]');
  if (boton) boton.click();
};

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function hace(fecha) {
  const min = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (min < 1) return t("h.agoNow");
  if (min < 60) return t("h.agoMin", { n: min });
  const horas = Math.round(min / 60);
  if (horas < 24) return t("h.agoH", { n: horas });
  return fecha.toLocaleDateString(loc(), { day: "numeric", month: "short" });
}

/* carrusel de artículos por revisar: fila deslizable con flechas y barra, como la versión móvil del portafolio */
let pendTipo = "";
let pendFirma = "";
let pendReintento = null;
const esFoto = (p) => /^(Foto|Fondo|Sin foto en la tienda|La foto)/.test(p);
const ICONO_FOTO = '<svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8"/></svg>';

/* cada 5 minutos en el inicio: después de cada actualización de la tienda el servidor la vuelve a leer */
setInterval(() => {
  if ($("app").classList.contains("en-inicio") && !document.hidden) cargarPendientes();
}, 5 * 60 * 1000);

async function cargarPendientes() {
  clearTimeout(pendReintento);
  const respuesta = await fetch(`/api/pendientes?tipo=${encodeURIComponent(pendTipo)}`);
  if (!respuesta.ok) return;
  const datos = await respuesta.json();
  const ocupado = datos.construyendo || datos.revision?.activo;
  if (ocupado || !datos.fecha) pendReintento = setTimeout(cargarPendientes, 6000);

  pintarChips(datos);
  const firma = JSON.stringify([pendTipo, datos.articulos.map((a) => [a.id, a.problemas])]);
  const encima = $("pend-pista").matches(":hover");
  if (firma !== pendFirma && !(encima && pendFirma)) {
    pendFirma = firma;
    pintarTarjetas(datos);
  }
  const partes = [];
  if (!datos.fecha) partes.push(t("p.firstRead"));
  else {
    partes.push(t("p.show", { n: datos.articulos.length, t: datos.total }));
    if (datos.tienda?.fecha) {
      partes.push(t("p.pub", { n: datos.tienda.publicados.toLocaleString(loc()), ago: hace(new Date(datos.tienda.fecha)) }));
      partes.push(t("p.hours", { h: datos.tienda.horas.join(", ") }));
    }
    partes.push(t("p.cat", { ago: hace(new Date(datos.fecha)) }));
  }
  if (datos.revision?.activo) {
    const r = datos.revision;
    partes.push(r.total ? t("p.reviewing", { h: r.hechos, t: r.total }) : t("p.reviewingDots"));
  }
  $("pend-estado").textContent = partes.join(" · ");
}

function pintarChips(datos) {
  const caja = $("pend-chips");
  caja.innerHTML = "";
  [["", "Todos", datos.todos], ...datos.resumen.map(([t, n]) => [t, t, n])].forEach(([tipo, nombre, n]) => {
    const chip = crear("button", `pend-chip${tipo === pendTipo ? " activo" : ""}`);
    chip.type = "button";
    chip.setAttribute("aria-pressed", tipo === pendTipo ? "true" : "false");
    chip.append(document.createTextNode(L(nombre)), crear("b", "", n.toLocaleString(loc())));
    chip.onclick = () => {
      pendTipo = tipo;
      pendFirma = "";
      $("pend-pista").scrollLeft = 0;
      cargarPendientes();
    };
    caja.append(chip);
  });
}

function pintarTarjetas(datos) {
  const pista = $("pend-pista");
  pista.innerHTML = "";
  $("pend-vacio").classList.toggle("oculto", datos.articulos.length > 0);
  $("pend-vacio").textContent = !datos.fecha
    ? t("p.loading")
    : pendTipo === "Corregidos"
      ? t("p.noneCorr")
      : t("p.none");
  datos.articulos.forEach((a, i) => {
    const li = crear("li");
    const tarjeta = crear("article", "pend-tarjeta");
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("aria-label", t("p.ariaCard", { name: LLargo(a.nombre), issues: a.problemas.map(L).join(", "), i: i + 1, t: datos.articulos.length }));

    const foto = crear("div", "pend-foto");
    if (a.foto) {
      const img = crear("img");
      img.src = a.foto;
      img.alt = t("p.photoOf", { n: LLargo(a.nombre) });
      img.loading = "lazy";
      img.draggable = false;
      img.onerror = () => { foto.innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>${t("p.noLoad")}</span></div>`; };
      foto.append(img);
    } else {
      foto.innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>${t("p.noPhoto")}</span></div>`;
    }
    if (a.tienda) foto.append(crear("span", "pend-insignia", t("p.inStore")));
    const cuenta = crear("span", "pend-cuenta", a.problemas.length);
    cuenta.title = t("p.pending", { n: a.problemas.length });
    foto.append(cuenta);

    const cuerpo = crear("div", "pend-cuerpo");
    cuerpo.append(crear("span", "pend-sku", a.sku ? t("p.sku", { s: a.sku }) : t("p.noSku")));
    const nombre = crear("h3", "pend-nombre", LLargo(a.nombre));
    nombre.title = LLargo(a.nombre);
    cuerpo.append(nombre, crear("span", "pend-sub", L(a.subfamilia) || L(a.familia) || t("p.noSub")));
    cuerpo.append(crear("p", "pend-falta-titulo", t("p.missing")));
    const lista = crear("ul", "pend-faltas");
    a.problemas.forEach((p) => lista.append(crear("li", esFoto(p) ? "foto" : "", L(p))));
    cuerpo.append(lista);
    const abrir = crear("a", "pend-abrir", t("p.open"));
    abrir.href = (datos.ficha || "#") + a.id;
    abrir.target = "_blank";
    abrir.rel = "noopener";
    const botones = crear("div", "pend-botones");
    botones.append(abrir);
    if (a.slug) {
      const ver = crear("button", "pend-abrir", t("p.see"));
      ver.type = "button";
      ver.onclick = () => verEnTienda(a, datos.tienda_buscar);
      botones.append(ver);
    }
    const hecho = crear("button", a.corregido ? "pend-abrir pend-hecho activo" : "pend-abrir pend-hecho", a.corregido ? t("p.undo") : t("p.done"));
    hecho.type = "button";
    hecho.onclick = () => marcarPendiente(a, Boolean(a.corregido));
    botones.append(hecho);
    cuerpo.append(botones);
    if (a.corregido) tarjeta.classList.add("corregida");

    tarjeta.append(foto, cuerpo);
    li.append(tarjeta);
    pista.append(li);
  });
  actualizarRiel();
}

async function marcarPendiente(a, quitar) {
  const respuesta = await fetch("/api/pendientes-corregido", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: a.id,
      sku: a.sku || "",
      nombre: a.nombre || "",
      problemas: a.problemas || [],
      quitar: Boolean(quitar),
    }),
  });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    avisar("No se pudo marcar", datos.mensaje || "Intentá de nuevo.");
    return;
  }
  pendFirma = "";
  if (!quitar && pendTipo === "Corregidos") {
    /* ya está en corregidos */
  } else if (!quitar) {
    /* sigue en la lista filtrada actual hasta recargar */
  }
  await cargarPendientes();
}

function pasoTarjeta() {
  const pista = $("pend-pista");
  const primera = pista.firstElementChild;
  const gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
  return primera ? primera.offsetWidth + gap : 300;
}
function moverPend(dir) {
  $("pend-pista").scrollBy({ left: dir * pasoTarjeta(), behavior: "smooth" });
}
$("pend-ant").onclick = () => moverPend(-1);
$("pend-sig").onclick = () => moverPend(1);
/* ficha del producto con los datos que publica la tienda, sin salir de la app */
let tiendaPedido = 0;
async function verEnTienda(a, buscar) {
  const pedido = ++tiendaPedido;
  $("tienda-nombre").textContent = a.nombre;
  $("tienda-sku").textContent = a.sku ? t("p.code", { s: a.sku }) : "";
  $("tienda-precio").textContent = t("p.loadingStore");
  $("tienda-stock").textContent = "";
  $("tienda-stock").className = "tienda-stock";
  $("tienda-foto").innerHTML = "";
  $("tienda-copiado").classList.add("oculto");
  $("tienda-abrir").onclick = () => buscarEnTienda($("tienda-nombre").textContent || a.nombre, buscar);
  $("tienda-modal").classList.remove("oculto");
  const respuesta = await fetch(`/api/tienda-producto?slug=${encodeURIComponent(a.slug)}`);
  const datos = await respuesta.json().catch(() => ({}));
  if (pedido !== tiendaPedido) return;
  if (!respuesta.ok || !datos.ok) {
    $("tienda-precio").textContent = datos.mensaje || t("p.noStoreItem");
    return;
  }
  const p = datos.producto;
  $("tienda-nombre").textContent = p.nombre || a.nombre;
  $("tienda-sku").textContent = [p.sku && t("p.code", { s: p.sku }), p.unidad && t("p.unitOf", { u: p.unidad })].filter(Boolean).join("  ·  ");
  $("tienda-precio").textContent = p.oferta && p.precio_oferta ? `${p.precio_oferta}  (antes ${p.precio_iva})` : p.precio_iva;
  const hay = Number(p.disponible) || 0;
  $("tienda-stock").textContent = hay > 0 ? `En stock · ${hay} disponibles` : "Sin stock";
  $("tienda-stock").classList.add(hay > 0 ? "si" : "no");
  const img = crear("img");
  img.alt = p.nombre;
  img.onerror = () => { $("tienda-foto").innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>${t("p.noStorePhoto2")}</span></div>`; };
  img.src = p.foto;
  $("tienda-foto").append(img);
}
async function buscarEnTienda(nombre, inicio) {
  const aviso = $("tienda-copiado");
  const campo = crear("textarea");
  campo.value = nombre;
  campo.style.cssText = "position:fixed;opacity:0";
  document.body.append(campo);
  campo.select();
  let copiado = document.execCommand("copy");
  campo.remove();
  if (!copiado) {
    copiado = await navigator.clipboard.writeText(nombre).then(() => true, () => false);
  }
  const ventana = window.open(inicio, "_blank", "noopener");
  aviso.textContent = copiado
    ? `Copiado: "${nombre}". En la tienda, pegalo en "Buscar por..." con Ctrl+V y dale Enter.`
    : `No se pudo copiar solo. Buscá en la tienda: ${nombre}`;
  aviso.classList.remove("oculto");
  return ventana;
}
function cerrarTienda() { $("tienda-modal").classList.add("oculto"); tiendaPedido++; }
$("tienda-cerrar").onclick = cerrarTienda;
$("tienda-modal").onclick = (e) => { if (e.target.id === "tienda-modal") cerrarTienda(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("tienda-modal").classList.contains("oculto")) cerrarTienda(); });

$("pend-pista").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { moverPend(1); e.preventDefault(); }
  if (e.key === "ArrowLeft") { moverPend(-1); e.preventDefault(); }
});

let rielMedidas = { maxScroll: 0, maxLeft: 0 };
function actualizarRiel() {
  const pista = $("pend-pista");
  const riel = $("pend-riel");
  const perilla = $("pend-perilla");
  const maxScroll = pista.scrollWidth - pista.clientWidth;
  const anchoRiel = riel.clientWidth;
  const anchoPerilla = Math.min(anchoRiel, Math.max(40, (anchoRiel * pista.clientWidth) / Math.max(1, pista.scrollWidth)));
  rielMedidas = { maxScroll, maxLeft: anchoRiel - anchoPerilla };
  perilla.style.width = `${anchoPerilla}px`;
  perilla.style.transform = `translate(${maxScroll > 0 ? (pista.scrollLeft / maxScroll) * rielMedidas.maxLeft : 0}px, -50%)`;
  $("pend-ant").disabled = pista.scrollLeft <= 4;
  $("pend-sig").disabled = pista.scrollLeft >= maxScroll - 4;
}
$("pend-pista").addEventListener("scroll", () => requestAnimationFrame(actualizarRiel), { passive: true });
window.addEventListener("resize", actualizarRiel);

$("pend-perilla").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const pista = $("pend-pista");
  const inicioX = e.clientX;
  const inicioScroll = pista.scrollLeft;
  const perilla = $("pend-perilla");
  perilla.setPointerCapture(e.pointerId);
  pista.style.scrollSnapType = "none";
  $("pend-riel").classList.add("arrastrando");
  const mover = (ev) => {
    if (!rielMedidas.maxLeft) return;
    pista.scrollLeft = inicioScroll + ((ev.clientX - inicioX) / rielMedidas.maxLeft) * rielMedidas.maxScroll;
  };
  const soltar = () => {
    $("pend-riel").classList.remove("arrastrando");
    pista.style.scrollSnapType = "";
    perilla.removeEventListener("pointermove", mover);
    perilla.removeEventListener("pointerup", soltar);
    perilla.removeEventListener("pointercancel", soltar);
  };
  perilla.addEventListener("pointermove", mover);
  perilla.addEventListener("pointerup", soltar);
  perilla.addEventListener("pointercancel", soltar);
});
$("pend-riel").addEventListener("pointerdown", (e) => {
  if (e.target === $("pend-perilla") || !rielMedidas.maxLeft) return;
  const caja = $("pend-riel").getBoundingClientRect();
  const proporcion = (e.clientX - caja.left - $("pend-perilla").offsetWidth / 2) / rielMedidas.maxLeft;
  $("pend-pista").scrollTo({ left: Math.min(1, Math.max(0, proporcion)) * rielMedidas.maxScroll, behavior: "smooth" });
});

/* arrastrar la fila con el mouse (con el dedo ya se desliza sola) */
(function arrastrarPista() {
  const pista = $("pend-pista");
  let toque = null;
  pista.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("a")) return;
    toque = { x: e.clientX, scroll: pista.scrollLeft, movido: false, id: e.pointerId };
  });
  pista.addEventListener("pointermove", (e) => {
    if (!toque || toque.id !== e.pointerId) return;
    const dx = e.clientX - toque.x;
    if (!toque.movido && Math.abs(dx) < 6) return;
    if (!toque.movido) {
      toque.movido = true;
      pista.classList.add("arrastrando");
      pista.setPointerCapture(e.pointerId);
    }
    pista.scrollLeft = toque.scroll - dx;
  });
  const soltar = () => {
    if (toque?.movido) {
      pista.classList.remove("arrastrando");
      const paso = pasoTarjeta();
      pista.scrollTo({ left: Math.round(pista.scrollLeft / paso) * paso, behavior: "smooth" });
    }
    toque = null;
  };
  pista.addEventListener("pointerup", soltar);
  pista.addEventListener("pointercancel", soltar);
})();

/* historial */
let historialDatos = [];
let historialCuenta = null;
let histReloj = null;
let histFrasesReloj = null;
const histAbiertos = new Set();
const claveEntrada = (e) => `${e.fecha}|${e.origen}|${e.accion}`;
const histFrases = () => [t("h.phrase1"), t("h.phrase2"), t("h.phrase3"), t("h.phrase4"), t("h.phrase5")];

function mostrarCargaHistorial(si) {
  const caja = $("hist-cargando");
  const pagina = $("historial");
  if (!caja || !pagina) return;
  clearInterval(histFrasesReloj);
  histFrasesReloj = null;
  pagina.classList.toggle("cargando-datos", si);
  caja.classList.toggle("oculto", !si);
  if (!si) return;
  let i = 0;
  const frases = histFrases();
  $("hist-cargando-texto").textContent = frases[0];
  histFrasesReloj = setInterval(() => {
    const lista = histFrases();
    i = (i + 1) % lista.length;
    $("hist-cargando-texto").textContent = lista[i];
  }, 1400);
}

async function cargarHistorial(animar = false, { silencioso = false } = {}) {
  clearTimeout(histReloj);
  if (!silencioso) mostrarCargaHistorial(true);
  try {
    const respuesta = await fetch("/api/historial");
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    historialDatos = datos.entradas || [];
    historialCuenta = datos.cuenta || null;
    pintarHistorial(animar === true);
  } finally {
    if (!silencioso) mostrarCargaHistorial(false);
  }
  histReloj = setTimeout(() => {
    if (!$("historial").classList.contains("oculto")) cargarHistorial(false, { silencioso: true });
  }, 20000);
}
$("hist-actualizar").onclick = async () => {
  const boton = $("hist-actualizar");
  if (boton.classList.contains("actualizando")) return;
  boton.classList.add("actualizando");
  boton.setAttribute("aria-busy", "true");
  $("hist-actualizar-texto").textContent = t("h.updating");
  const minimo = new Promise((listo) => setTimeout(listo, 1200));
  try {
    await Promise.all([cargarHistorial(true), minimo]);
  } finally {
    boton.classList.remove("actualizando");
    boton.removeAttribute("aria-busy");
    $("hist-actualizar-texto").textContent = t("hist.refresh");
  }
};
$("hist-buscar").oninput = () => pintarHistorial();

function textoValor(valor) {
  if (valor === null || valor === undefined || valor === "") return t("h.empty");
  return L(valor);
}

function pintarHistorial(animar = false) {
  armarHistorial();
  if (!animar) return;
  [...$("hist-resumen").children, ...$("hist-lista").children].forEach((nodo, i) => {
    nodo.style.setProperty("--i", Math.min(i, 12));
    nodo.classList.add("hist-aparece");
  });
}

function armarHistorial() {
  const elegido = drops["drop-origen"]?.valor;
  const origen = (ORIGENES.find(([, nombre]) => nombre === elegido) || ORIGENES[0])[0];
  const aguja = normal($("hist-buscar").value.trim());
  const visibles = historialDatos.filter((e) => {
    if (origen && e.origen !== origen) return false;
    if (!aguja) return true;
    const texto = [e.accion, e.detalle, LLargo(e.accion), LLargo(e.detalle), ...e.articulos.map((a) => `${a.sku} ${a.nombre} ${a.id}`)].join(" ");
    return normal(texto).includes(aguja);
  });

  const resumen = $("hist-resumen");
  resumen.innerHTML = "";
  const articulos = visibles.reduce((n, e) => n + (e.cambiados || 0), 0);
  const errores = visibles.reduce((n, e) => n + (e.errores || 0), 0);
  [
    [t("h.changes"), visibles.length.toLocaleString(loc())],
    [t("h.itemsChanged"), articulos.toLocaleString(loc())],
    [t("h.errors"), errores.toLocaleString(loc())],
    [t("h.last"), visibles[0] ? hace(new Date(visibles[0].fecha)) : "—"],
  ].forEach(([titulo, valor]) => {
    const dato = crear("div", "hist-dato");
    dato.append(crear("small", "", titulo), crear("strong", "", valor));
    resumen.append(dato);
  });

  const lista = $("hist-lista");
  lista.innerHTML = "";
  if (trabajoActual?.activo) {
    lista.append(entradaHistorial({
      fecha: new Date().toISOString(),
      origen: "web",
      usuario: trabajoActual.usuario || "",
      accion: trabajoActual.accion || t("h.running"),
      detalle: trabajoActual.texto || trabajoActual.detalle || "",
      estado: "ejecutando",
      cambiados: trabajoActual.cambiados || 0,
      errores: trabajoActual.errores || 0,
      articulos: [],
    }, new Date()));
  }
  if (!visibles.length && !trabajoActual?.activo) {
    lista.append(crear("p", "hist-vacio", historialDatos.length ? t("h.none") : t("h.noneYet")));
    return;
  }
  const hoy = new Date().toDateString();
  const ayer = new Date(Date.now() - 86400000).toDateString();
  let diaActual = "";
  visibles.forEach((e) => {
    const fecha = new Date(e.fecha);
    const dia = fecha.toDateString();
    if (dia !== diaActual) {
      diaActual = dia;
      const nombreDia = dia === hoy ? t("h.today") : dia === ayer ? t("h.yesterday")
        : fecha.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
      lista.append(crear("h3", "hist-dia", nombreDia));
    }
    lista.append(entradaHistorial(e, fecha));
  });
}

function entradaHistorial(e, fecha) {
  const caja = crear("div", `hist-entrada ${e.origen}`);
  const cabeza = crear("button", "hist-cabeza");
  cabeza.type = "button";
  cabeza.setAttribute("aria-expanded", "false");
  cabeza.append(crear("span", "hist-hora", fecha.toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" })));
  const centro = crear("span");
  const nombreOrigen = L((ORIGENES.find(([clave]) => clave === e.origen) || ["", e.origen])[1]);
  const accion = crear("span", "hist-accion", LLargo(e.accion) || t("h.change"));
  if (e.estado === "ejecutando") accion.append(crear("em", "hist-marca ejecutando", t("h.exec")));
  const seDetuvo = e.estado === "detenido" || /Se detuvo:/i.test(e.detalle || "");
  if (e.reanudado || /Detenido · Reanudado/i.test(e.accion || "")) {
    accion.append(crear("em", "hist-marca detenido", t("h.resumed")));
  } else if (seDetuvo) {
    accion.append(crear("em", "hist-marca detenido", t("h.stopped")));
  }
  if (e.revertido) accion.append(crear("em", "hist-marca revertido", t("h.reverted")));
  centro.append(crear("span", "hist-origen", e.usuario ? `${nombreOrigen} · ${e.usuario}` : nombreOrigen), accion);
  if (e.detalle) centro.append(crear("span", "hist-detalle", LLargo(e.detalle)));
  const numeros = crear("span", "hist-numeros");
  if (e.estado === "ejecutando") {
    cabeza.disabled = true;
    caja.classList.add("ejecutando");
    numeros.append(crear("span", "hist-num", `✓ ${(e.cambiados || 0).toLocaleString(loc())} ${t("h.changed")}`));
    if (e.errores) numeros.append(crear("span", "hist-num mal", `✕ ${e.errores} ${t("h.errors").toLowerCase()}`));
    numeros.append(crear("span", "hist-num", t("h.inProgress")));
  } else {
    numeros.append(crear("span", "hist-num", `✓ ${(e.cambiados || 0).toLocaleString(loc())} ${t("h.changed")}`));
    if (e.errores) numeros.append(crear("span", "hist-num mal", `✕ ${e.errores} ${t("h.errors").toLowerCase()}`));
    numeros.append(crear("span", "hist-flecha", "▼"));
  }
  cabeza.append(centro, numeros);

  if (e.estado === "ejecutando") {
    caja.append(cabeza);
    return caja;
  }

  const cuerpo = crear("div", "hist-articulos oculto");
  let armado = false;
  const alternar = (abrir) => {
    cuerpo.classList.toggle("oculto", !abrir);
    caja.classList.toggle("abierta", abrir);
    cabeza.setAttribute("aria-expanded", abrir ? "true" : "false");
    if (abrir) histAbiertos.add(claveEntrada(e)); else histAbiertos.delete(claveEntrada(e));
    if (abrir && !armado) {
      armado = true;
      armarTablaHistorial(cuerpo, e);
    }
  };
  cabeza.onclick = () => alternar(cuerpo.classList.contains("oculto"));
  caja.append(cabeza, cuerpo);
  if (histAbiertos.has(claveEntrada(e))) alternar(true);
  return caja;
}

function armarTablaHistorial(cuerpo, e) {
  const cuenta = e.cuenta || historialCuenta;
  const quien = crear("p", "hist-cuenta");
  quien.append(crear("span", "", t("h.account")));
  quien.append(crear("strong", "", cuenta ? cuenta.nombre || cuenta.correo : t("h.noAccount")));
  if (cuenta && cuenta.correo) quien.append(crear("small", "", cuenta.correo));
  cuerpo.append(quien);
  if (e.revertido) {
    cuerpo.append(crear("p", "hist-nota", t("h.revertedOn", { d: new Date(e.revertido).toLocaleString(loc(), { dateStyle: "short", timeStyle: "short" }) })));
  } else if (e.origen === "web" && e.id && e.estado !== "reversion" && e.cambiados) {
    const seDetuvo = e.estado === "detenido" || e.reanudable || /Se detuvo:/i.test(e.detalle || "");
    if (seDetuvo) {
      const reanudar = crear("button", "btn borde btn-reanudar hist-reanudar", t("h.resume"));
      reanudar.type = "button";
      reanudar.onclick = async () => {
        const respuesta = await fetch("/api/reanudar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: e.id }),
        });
        const datos = await respuesta.json();
        if (!datos.ok) {
          avisar("No se pudo reanudar", datos.mensaje || "Revisá la conexión e intentá de nuevo.");
          return;
        }
        empezarVigilanciaTrabajo();
        cargarHistorial();
      };
      cuerpo.append(reanudar);
    }
    const boton = crear("button", "btn borde btn-revertir hist-revertir", t("h.revert"));
    boton.type = "button";
    boton.onclick = () => pedirReversion(e.id);
    cuerpo.append(boton);
  }
  if (!e.articulos.length) {
    cuerpo.append(crear("p", "hist-nota", t("h.noList")));
    return;
  }
  const tabla = crear("table", "hist-tabla");
  const thead = crear("thead");
  const filaT = crear("tr");
  [t("h.sku"), t("h.item"), t("h.field"), t("h.before"), t("h.after")].forEach((titulo) => filaT.append(crear("th", "", titulo)));
  thead.append(filaT);
  const tbody = crear("tbody");
  tabla.append(thead, tbody);
  let mostrados = 0;
  const mas = crear("button", "btn borde hist-mas");
  mas.type = "button";
  function agregar(cantidad) {
    e.articulos.slice(mostrados, mostrados + cantidad).forEach((a) => {
      Object.entries(a.cambios || {}).forEach(([campo, [antes, despues]]) => {
        const fila = crear("tr");
        fila.append(
          crear("td", "", a.sku || a.id),
          crear("td", "", LLargo(a.nombre) || "—"),
          crear("td", "", L(campo)),
          crear("td", "hist-antes", textoValor(antes)),
          crear("td", "hist-despues", textoValor(despues)),
        );
        tbody.append(fila);
      });
    });
    mostrados = Math.min(e.articulos.length, mostrados + cantidad);
    const faltan = e.articulos.length - mostrados;
    mas.textContent = t("h.more", { n: Math.min(100, faltan), left: faltan });
    mas.classList.toggle("oculto", faltan <= 0);
  }
  mas.onclick = () => agregar(100);
  agregar(100);
  const botones = crear("div", "hist-botones");
  botones.append(mas);
  if (e.articulos.length > 100) {
    const consulta = e.id ? { id: e.id } : { fecha: e.fecha, accion: e.accion || "" };
    const excel = crear("a", "btn borde hist-excel", t("h.xlsx"));
    excel.href = `/api/historial.xlsx?${new URLSearchParams(consulta)}`;
    excel.setAttribute("download", "");
    botones.append(excel);
  }
  cuerpo.append(tabla, botones);
  if (e.total_articulos > e.articulos.length) {
    cuerpo.append(crear("p", "hist-nota", t("h.savedFirst", { n: e.articulos.length, t: e.total_articulos })));
  }
}

/* artículos compuestos: parejas, pegar piezas, vista previa y crear kit (demo) */
let kitActual = null;
let parejasDatos = null;
let parejasEstado = "listo";
let parejasSub = [];
let parejasSubsPendientes = [];

function etiquetasPareja() {
  return {
    listo: t("js.ready"),
    ya_tiene_kit: t("js.hasKit"),
    incompleto: t("js.missing"),
  };
}

function textoPiezaPar(pieza, rol) {
  if (!pieza) return rol === "condensadora" ? t("js.noCond") : t("js.noEvap");
  return pieza.sku || pieza.nombre || rol;
}

function pintarChipsParejas() {
  const caja = $("comp-chips");
  if (!caja || !parejasDatos) return;
  const conteo = parejasDatos.conteo || {};
  const labels = etiquetasPareja();
  caja.innerHTML = "";
  [["", t("js.all"), parejasDatos.total], ...Object.entries(labels).map(([k, nom]) => [k, nom, conteo[k] || 0])].forEach(([tipo, nombre, n]) => {
    const chip = crear("button", `pend-chip${tipo === parejasEstado ? " activo" : ""}`);
    chip.type = "button";
    chip.setAttribute("aria-pressed", tipo === parejasEstado ? "true" : "false");
    chip.append(document.createTextNode(nombre), crear("b", "", Number(n).toLocaleString(loc())));
    chip.onclick = () => {
      parejasEstado = tipo;
      pintarChipsParejas();
      pintarListaParejas();
    };
    caja.append(chip);
  });
}

function parejasVisibles() {
  const aguja = normal($("comp-lista-buscar")?.value || "");
  return (parejasDatos?.parejas || []).filter((par) => {
    if (parejasEstado && par.estado !== parejasEstado) return false;
    if (parejasSub.length && !par.subfamilias.some((s) => parejasSub.includes(s))) return false;
    if (!aguja) return true;
    const blob = normal([par.base, par.sku_kit, par.subfamilia, par.cond?.sku, par.evap?.sku, par.cond?.nombre, par.evap?.nombre].filter(Boolean).join(" "));
    return blob.includes(aguja);
  });
}

function pintarListaParejas() {
  const caja = $("comp-lista");
  if (!caja) return;
  const lista = parejasVisibles();
  const labels = etiquetasPareja();
  caja.innerHTML = "";
  $("comp-lista-conteo").textContent = parejasDatos
    ? t("js.showing", { n: lista.length.toLocaleString(loc()), t: parejasDatos.total.toLocaleString(loc()) })
    : "";
  if (!lista.length) {
    caja.append(crear("p", "nota", parejasDatos ? t("js.none") : t("js.loading")));
    return;
  }
  lista.forEach((par) => {
    const fila = crear("article", `comp-par ${par.estado}`);
    const izq = crear("div");
    izq.append(crear("strong", "", par.sku_kit || par.base));
    izq.append(crear("small", "", L(par.subfamilia) || "—"));
    const mid = crear("div");
    mid.append(crear("small", "", `${textoPiezaPar(par.cond, "condensadora")} + ${textoPiezaPar(par.evap, "evaporadora")}`));
    mid.append(crear("span", "comp-par-estado", labels[par.estado] || par.estado));
    const der = crear("div");
    const boton = crear("button", "btn rojo", par.estado === "listo" ? t("js.build") : t("js.open"));
    boton.type = "button";
    boton.disabled = !par.cond && !par.evap;
    boton.onclick = () => armarDesdePar(par);
    der.append(boton);
    fila.append(izq, mid, der);
    caja.append(fila);
  });
}

function armarDesdePar(par) {
  const skus = [par.cond, par.evap].filter(Boolean).map((p) => p.sku).filter(Boolean);
  $("comp-pega").value = skus.join("\n");
  $("comp-pega").scrollIntoView({ behavior: "smooth", block: "center" });
  buscarCompuestos();
}

async function cargarParejas() {
  const fecha = $("comp-lista-fecha");
  if (fecha) fecha.textContent = t("js.localRead");
  try {
    const respuesta = await fetch("/api/compuestos/parejas");
    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.ok) {
      if (fecha) fecha.textContent = datos.mensaje || t("js.localFail");
      return;
    }
    parejasDatos = datos;
    if (parejasEstado === "listo" && !(datos.conteo?.listo)) parejasEstado = "";
    if (fecha) fecha.textContent = t("js.localOk");
    armarDrop("drop-comp-sub", datos.subfamilias || [], t("js.all"), () => {
      parejasSub = drops["drop-comp-sub"]?.elegidas || [];
      pintarListaParejas();
    }, { buscar: true, todas: true, multiple: true });
    if (parejasSubsPendientes.length) {
      drops["drop-comp-sub"]?.marcarVarias(parejasSubsPendientes);
      parejasSub = drops["drop-comp-sub"]?.elegidas || [];
      parejasSubsPendientes = [];
    }
    pintarChipsParejas();
    pintarListaParejas();
  } catch {
    if (fecha) fecha.textContent = t("js.localFail");
  }
}

$("ir-parejas")?.addEventListener("click", () => {
  parejasSubsPendientes = hayTodas() ? [] : subsElegidas();
  irA("compuestos");
});
$("comp-lista-buscar")?.addEventListener("input", pintarListaParejas);

function colones(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return `₡${x.toLocaleString(loc(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function rellenarKitForm(kit) {
  const d = kit.kit || {};
  $("comp-nombre").value = d.nombre || "";
  $("comp-sku").value = d.sku || "";
  $("comp-unidad").value = d.unidad || "";
  $("comp-familia").value = d.familia || "";
  $("comp-subfamilia").value = d.subfamilia || "";
  $("comp-precio").value = d.precio ?? "";
  $("comp-costo").value = d.costo ?? "";
  $("comp-desc").value = d.descripcion || "";
  ["comp-nombre", "comp-sku", "comp-unidad", "comp-familia", "comp-subfamilia", "comp-precio", "comp-costo", "comp-desc"].forEach((id) => {
    $(id).parentElement?.classList.toggle("cambiado", Boolean($(id).value));
  });
}

function kitDesdeForm() {
  return {
    nombre: $("comp-nombre").value.trim(),
    sku: $("comp-sku").value.trim(),
    unidad: $("comp-unidad").value.trim(),
    familia: $("comp-familia").value.trim(),
    subfamilia: $("comp-subfamilia").value.trim(),
    precio: $("comp-precio").value.trim(),
    costo: $("comp-costo").value.trim(),
    descripcion: $("comp-desc").value.trim(),
  };
}

function pintarPiezas(piezas) {
  const caja = $("comp-hallados");
  caja.innerHTML = "";
  if (!piezas?.length) {
    caja.classList.add("oculto");
    return;
  }
  caja.classList.remove("oculto");
  caja.append(crear("h3", "opciones-titulo", t("js.pieces")));
  const tabla = crear("table", "comp-piezas");
  const cabeza = crear("tr");
  [t("tbl.role"), "SKU", t("tbl.name"), t("tbl.qty"), t("tbl.price"), t("tbl.cost"), t("tbl.stock"), ""].forEach((txt) => cabeza.append(crear("th", "", txt)));
  const thead = crear("thead");
  thead.append(cabeza);
  tabla.append(thead);
  const cuerpo = crear("tbody");
  piezas.forEach((p, i) => {
    const fila = crear("tr");
    fila.append(crear("td", "comp-rol", L(p.rol || "pieza")));
    fila.append(crear("td", "", p.sku || "—"));
    fila.append(crear("td", "", LLargo(p.nombre || "—")));
    const cant = document.createElement("input");
    cant.type = "number";
    cant.min = "1";
    cant.step = "1";
    cant.value = p.cantidad || 1;
    cant.onchange = () => {
      const n = Number(cant.value);
      kitActual.piezas[i].cantidad = n > 0 ? n : 1;
      const precio = kitActual.piezas.reduce((tot, x) => tot + Number(x.precio || 0) * Number(x.cantidad || 1), 0);
      const costo = kitActual.piezas.reduce((tot, x) => tot + Number(x.costo || 0) * Number(x.cantidad || 1), 0);
      kitActual.kit.precio = Math.round(precio * 100) / 100;
      kitActual.kit.costo = Math.round(costo * 100) / 100;
      $("comp-precio").value = kitActual.kit.precio;
      $("comp-costo").value = kitActual.kit.costo;
      pintarPreviaKit(kitActual);
    };
    const tdCant = crear("td");
    tdCant.append(cant);
    fila.append(tdCant);
    fila.append(crear("td", "", colones(p.precio)));
    fila.append(crear("td", "", colones(p.costo)));
    fila.append(crear("td", "", String(p.stock ?? "—")));
    const sacar = crear("button", "comp-sacar", "×");
    sacar.type = "button";
    sacar.setAttribute("aria-label", t("ui.unmark"));
    sacar.onclick = () => {
      kitActual.piezas.splice(i, 1);
      if (kitActual.piezas.length < 2) {
        $("comp-form").classList.add("oculto");
        $("comp-previa").classList.add("oculto");
        $("comp-validacion").textContent = t("js.need2");
        $("comp-validacion").className = "comp-validacion mal";
      }
      pintarPiezas(kitActual.piezas);
      if (kitActual.piezas.length >= 2) pintarPreviaKit(kitActual);
    };
    const tdSacar = crear("td");
    tdSacar.append(sacar);
    fila.append(tdSacar);
    cuerpo.append(fila);
  });
  tabla.append(cuerpo);
  caja.append(tabla);
}

function pintarValidacion(kit) {
  const caja = $("comp-validacion");
  const errores = kit.errores || [];
  const avisos = kit.avisos || [];
  caja.className = "comp-validacion";
  if (errores.length) {
    caja.classList.add("mal");
    caja.textContent = errores.join(" ");
  } else if (avisos.length) {
    caja.classList.add(kit.ok ? "ok" : "warn");
    caja.textContent = avisos.join(" ");
  } else if (kit.ok) {
    caja.classList.add("ok");
    caja.textContent = t("js.okPair");
  } else {
    caja.classList.add("mal");
    caja.textContent = kit.mensaje || t("js.need2");
  }
}

function pintarPreviaKit(kit) {
  const form = kitDesdeForm();
  const piezas = kit.piezas || [];
  $("comp-previa").classList.remove("oculto");
  $("comp-previa-resumen").innerHTML = piezas.length >= 2
    ? t("js.previewKit", { sku: form.sku || "—", n: piezas.length, min: Math.min(...piezas.map((p) => Number(p.stock) || 0)) })
    : t("js.need2");
  const cabeza = $("comp-previa-cabeza");
  cabeza.innerHTML = "";
  [t("tbl.role"), "SKU", t("tbl.name"), t("tbl.qty"), t("tbl.price"), t("tbl.cost"), t("tbl.stock")].forEach((txt) => cabeza.append(crear("th", "", txt)));
  const filas = $("comp-previa-filas");
  filas.innerHTML = "";
  piezas.forEach((p) => {
    const fila = crear("tr");
    fila.append(
      crear("td", "", L(p.rol || "pieza")),
      crear("td", "", p.sku || "—"),
      crear("td", "", LLargo(p.nombre || "—")),
      crear("td", "", String(p.cantidad || 1)),
      crear("td", "", colones(p.precio)),
      crear("td", "", colones(p.costo)),
      crear("td", "", String(p.stock ?? "—")),
    );
    filas.append(fila);
  });
  const total = crear("tr");
  total.append(
    crear("td", "", "KIT"),
    crear("td", "", form.sku || "—"),
    crear("td", "", form.nombre || "—"),
    crear("td", "", "1"),
    crear("td", "", colones(form.precio)),
    crear("td", "", colones(form.costo)),
    crear("td", "", String(Math.min(...piezas.map((p) => Number(p.stock) || 0)))),
  );
  filas.append(total);
  const llamadas = (kit.costo_api && kit.costo_api.llamadas) || (piezas.length + 1);
  $("comp-costo-api").textContent = t("js.cost", { n: llamadas, p: piezas.length });
  $("comp-crear").disabled = !kit.ok || piezas.length < 2;
}

async function buscarCompuestos() {
  const texto = $("comp-pega").value;
  $("comp-estado").textContent = t("js.searching");
  $("comp-buscar").disabled = true;
  try {
    const respuesta = await fetch("/api/compuestos/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    const datos = await respuesta.json();
    kitActual = datos;
    kitActual.piezas = datos.piezas || [];
    $("comp-estado").textContent = datos.encontradas
      ? t("js.found", { n: datos.encontradas })
      : (datos.mensaje || t("js.noneFound"));
    pintarPiezas(kitActual.piezas);
    if (kitActual.piezas.length >= 2) {
      $("comp-form").classList.remove("oculto");
      rellenarKitForm(kitActual);
      pintarValidacion(kitActual);
      pintarPreviaKit(kitActual);
    } else {
      $("comp-form").classList.add("oculto");
      $("comp-previa").classList.add("oculto");
      if (kitActual.piezas.length) {
        $("comp-form").classList.remove("oculto");
        pintarValidacion(kitActual);
      }
    }
  } catch {
    $("comp-estado").textContent = t("js.searchFail");
  } finally {
    $("comp-buscar").disabled = false;
  }
}

$("comp-buscar")?.addEventListener("click", buscarCompuestos);
$("comp-pega")?.addEventListener("paste", () => setTimeout(buscarCompuestos, 0));
$("comp-limpiar")?.addEventListener("click", () => {
  kitActual = null;
  $("comp-pega").value = "";
  $("comp-estado").textContent = "";
  $("comp-hallados").classList.add("oculto");
  $("comp-form").classList.add("oculto");
  $("comp-previa").classList.add("oculto");
});
["comp-nombre", "comp-sku", "comp-unidad", "comp-familia", "comp-subfamilia", "comp-precio", "comp-costo", "comp-desc"].forEach((id) => {
  $(id)?.addEventListener("input", () => {
    $(id).parentElement?.classList.toggle("cambiado", Boolean($(id).value.trim()));
    if (kitActual) pintarPreviaKit(kitActual);
  });
});
$("comp-excel")?.addEventListener("click", async () => {
  if (!kitActual || (kitActual.piezas || []).length < 2) return;
  const respuesta = await fetch("/api/compuestos.xlsx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ piezas: kitActual.piezas, kit: kitDesdeForm() }),
  });
  if (!respuesta.ok) {
    avisar(t("js.createFail"), t("js.searchFail"), [], { error: true });
    return;
  }
  const sku = kitDesdeForm().sku || "kit";
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(await respuesta.blob());
  enlace.download = `kit-${sku}.txt`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
});
$("comp-crear")?.addEventListener("click", async () => {
  if (!kitActual || (kitActual.piezas || []).length < 2) return;
  if (!kitActual.ok) {
    avisar(t("js.createFail"), kitActual.mensaje || t("js.need2"), kitActual.errores || []);
    return;
  }
  const form = kitDesdeForm();
  if (!form.nombre || !form.sku) {
    avisar(t("js.createFail"), t("js.needName"));
    return;
  }
  const ok = await confirmarAviso(
    t("js.createT"),
    t("js.createP", { sku: form.sku, name: form.nombre, parts: kitActual.piezas.map((p) => p.sku).join(" + ") }),
    [],
    t("js.createYes"),
  );
  if (!ok) return;
  $("comp-crear").disabled = true;
  $("comp-estado").textContent = t("js.creating");
  try {
    const respuesta = await fetch("/api/compuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: kitActual.piezas.map((p) => p.id),
        piezas: kitActual.piezas.map((p) => ({ id: p.id, cantidad: p.cantidad || 1 })),
        kit: form,
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.ok) {
      avisar(t("js.createFail"), datos.mensaje || t("js.createFail"), [], { error: true });
      $("comp-estado").textContent = datos.mensaje || t("js.createFail");
      return;
    }
    mostrarToast(t("js.createT"), t("js.created", { sku: datos.item.sku }));
    $("comp-estado").textContent = t("js.created", { sku: datos.item.sku });
    kitActual.ok = false;
    $("comp-crear").disabled = true;
    parejasDatos = null;
    cargarParejas();
  } catch {
    avisar(t("js.createFail"), t("js.searchFail"), [], { error: true });
  } finally {
    $("comp-crear").disabled = Boolean(!kitActual || !kitActual.ok);
  }
});

document.addEventListener("idioma-cambiado", () => {
  Object.values(drops).forEach((d) => d.repintar?.());
  if (catalogoFiltros.length) refrescarFiltro();
  if (historialDatos.length || !$("historial")?.classList.contains("oculto")) pintarHistorial();
  if ($("app") && !$("app").classList.contains("oculto")) cargarPendientes();
  if ($("menu-lugar") && window.__DEMO_MASIVO__) $("menu-lugar").textContent = t("menu.placeDemo");
  const badge = $("estado-servidor");
  if (badge && window.__DEMO_MASIVO__) badge.innerHTML = `<i></i>${t("ui.demoLocal")}`;
  if (parejasDatos) {
    pintarChipsParejas();
    pintarListaParejas();
  }
  if (kitActual) {
    if (kitActual.piezas?.length) pintarPiezas(kitActual.piezas);
    if (kitActual.piezas?.length >= 2) {
      pintarValidacion(kitActual);
      pintarPreviaKit(kitActual);
    }
  }
  if (ultimaPrevia && !$("previa-modal")?.classList.contains("oculto")) pintarVistaPrevia(ultimaPrevia);
  const miga = $("miga");
  const activo = document.querySelector(".item.activo .item-texto");
  if (miga && activo) miga.textContent = activo.textContent.trim();
});
