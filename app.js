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
  let vivo = true;
  function pintar() {
    if (!visible()) {
      vivo = false;
      if (lienzo.width > 2) {
        lienzo.width = 1;
        lienzo.height = 1;
      }
      return;
    }
    vivo = true;
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
  function arrancar() {
    if (vivo || !visible()) return;
    medir();
    crear();
    requestAnimationFrame(pintar);
  }
  medir();
  crear();
  window.addEventListener("resize", () => { if (visible()) { medir(); crear(); } });
  document.addEventListener("visibilitychange", arrancar);
  new MutationObserver(arrancar).observe($("login"), { attributes: true, attributeFilter: ["class"] });
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

  let vivo = true;
  function pintar(ahora) {
    if (!visible()) {
      vivo = false;
      if (lienzo.width > 2) {
        lienzo.width = 1;
        lienzo.height = 1;
      }
      return;
    }
    vivo = true;
    requestAnimationFrame(pintar);
    const dt = Math.min(100, ahora - anterior);
    anterior = ahora;
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
  function arrancar() {
    if (vivo || !visible()) return;
    medir();
    requestAnimationFrame(pintar);
  }
  medir();
  window.addEventListener("resize", () => { if (visible()) medir(); });
  document.addEventListener("visibilitychange", arrancar);
  new MutationObserver(arrancar).observe($("app"), { attributes: true, attributeFilter: ["class"] });
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
    buscar.placeholder = "Buscar…";
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
    boton.innerHTML = `<span>${estado.valor}</span><b>▼</b>`;
    raiz.classList.toggle("cambiado", inicial === "No cambiar" && estado.valor !== inicial);
  };
  const cerrar = () => {
    lista.classList.add("oculto");
    raiz.classList.remove("abierto");
  };
  function llenar(filtro) {
    cuerpo.innerHTML = "";
    const aguja = normal(filtro || "");
    const visibles = todas.filter((texto) => texto === "TODAS" || !aguja || normal(texto).includes(aguja));
    if (!visibles.length) {
      const nada = document.createElement("p");
      nada.className = "vacio";
      nada.textContent = "No hay coincidencias.";
      cuerpo.append(nada);
      return;
    }
    visibles.forEach((texto) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = texto;
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
    $("filtro-pop")?.classList.add("oculto");
    $("filtro")?.classList.remove("abierto");
    const abrir = lista.classList.contains("oculto");
    lista.classList.toggle("oculto", !abrir);
    raiz.classList.toggle("abierto", abrir);
    raiz.classList.remove("arriba");
    if (abrir) {
      const alto = Math.max(lista.offsetHeight, extra.arriba ? 280 : 0);
      const abajo = window.innerHeight - boton.getBoundingClientRect().bottom;
      const arriba = boton.getBoundingClientRect().top - 80;
      if (extra.arriba || (alto + 12 > abajo && arriba > abajo)) raiz.classList.add("arriba");
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
  };
  drops[id] = estado;
}
$("quitar-cambios").onclick = () => {
  ["drop-aplica", "drop-precio", "drop-unidad", "drop-seccion", "drop-estante"].forEach((id) => drops[id]?.reiniciar());
  ["pct", "estimado"].forEach((id) => {
    $(id).value = "";
    $(id).parentElement.classList.remove("cambiado");
  });
  $("estado").textContent = "Todos los campos quedaron en No cambiar.";
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

$("forma").onsubmit = async (evento) => {
  evento.preventDefault();
  const respuesta = await fetch("/api/entrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: $("usuario").value, contrasena: $("contra").value }),
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
  $("bienvenida-nombre").textContent = nombre;
  $("menu-nombre").textContent = nombre;
  $("menu-avatar").textContent = nombre.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  $("menu-lugar").textContent = datos.remoto ? "Acceso remoto" : "Solo esta computadora";
  const badge = $("estado-servidor");
  if (badge) {
    const online = datos.en_servidor || datos.remoto;
    badge.innerHTML = online
      ? `<i></i>Servidor online`
      : `<i></i>Servidor local en línea`;
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
  armarDrop("drop-estante", ["No cambiar", "Estante 9 si está vacío"], "No cambiar");
  armarDrop("drop-familia", datos.subfamilias, "Elegí una subfamilia", revisarVigilante, { buscar: true, todas: true });
  armarDrop("drop-tiempo", ["30 min", "60 min"], "Elegí el tiempo", revisarVigilante);
  armarDrop("drop-origen", ORIGENES.map(([, nombre]) => nombre), ORIGENES[0][1], () => pintarHistorial(true));
  $("inicio").classList.add("entra");
  $("app").classList.add("en-inicio");
  revisarLinea();
  cargarPendientes();
  empezarVigilanciaTrabajo();
  iniciarBucleCxc();
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
    li.textContent = f.titulo;
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
  const visibles = actual.opciones.filter((o) => !aguja || normal(o).includes(aguja));
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
    label.append(check, document.createElement("span"), document.createTextNode(opcion));
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
      chip.textContent = `${f.titulo}: ${opcion}`;
      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.textContent = "×";
      quitar.setAttribute("aria-label", "Quitar filtro");
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

$("filtro-btn").onclick = (evento) => {
  evento.stopPropagation();
  const abrir = $("filtro-pop").classList.contains("oculto");
  if (abrir) {
    document.querySelectorAll(".drop.abierto").forEach((drop) => {
      drop.classList.remove("abierto");
      drop.querySelector(".drop-lista")?.classList.add("oculto");
    });
  }
  $("filtro-pop").classList.toggle("oculto", !abrir);
  $("filtro").classList.toggle("abierto", abrir);
};
$("filtro-pop").onclick = (evento) => evento.stopPropagation();
$("filtro-buscar").oninput = pintarOpciones;
$("filtro-todo").onchange = () => {
  const actual = catalogoFiltros.find((f) => f.clave === categoria);
  if (!actual) return;
  const aguja = normal($("filtro-buscar").value);
  const visibles = actual.opciones.filter((o) => !aguja || normal(o).includes(aguja));
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
  $("filtro-pop").classList.add("oculto");
  $("filtro").classList.remove("abierto");
  revisarCobertura(true);
};
document.addEventListener("click", () => {
  $("filtro-pop").classList.add("oculto");
  $("filtro").classList.remove("abierto");
});

/* índice por subfamilia: combinaciones de valores de los filtros y cuántos artículos tiene cada una */
let indice = { claves: [], subfamilias: {}, fecha: null, construyendo: false };
let reintento = null;
let indiceErrorVisto = "";
let indiceEstabaConstruyendo = false;

function textoErrorZoho(mensaje) {
  const texto = String(mensaje || "").trim();
  const bajo = texto.toLowerCase();
  if (bajo.includes("6018") || bajo.includes("deshabilitada") || bajo.includes("disabled")) {
    return (
      "La cuenta de Zoho está deshabilitada. " +
      "Pedile a un administrador de Zoho que la reactive. " +
      "Mientras tanto la herramienta no puede leer ni escribir datos."
    );
  }
  return texto || "No se pudo completar la operación con Zoho.";
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
      caja.textContent = "Preparando lectura… consultando Zoho.";
    }
    return;
  }
  if (datos.consumo != null) {
    partes.push(`Última lectura: ${Number(datos.consumo).toLocaleString("es-CR")} APIs`);
  } else if (datos.costo_estimado != null) {
    partes.push(`Próxima lectura ≈ ${Number(datos.costo_estimado).toLocaleString("es-CR")} APIs`);
  }
  if (datos.restan != null) {
    const lim = datos.limite != null ? ` de ${Number(datos.limite).toLocaleString("es-CR")}` : "";
    partes.push(`Quedan ${Number(datos.restan).toLocaleString("es-CR")}${lim} hoy`);
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
  avisar("No se pudieron actualizar los datos", textoErrorZoho(error), [], { error: true });
}

function podarFiltros(lista) {
  const porClave = Object.fromEntries((lista || []).map((f) => [f.clave, new Set(f.opciones)]));
  Object.keys(filtros).forEach((clave) => {
    const validos = porClave[clave];
    if (!validos) {
      delete filtros[clave];
      return;
    }
    [...filtros[clave]].forEach((opcion) => {
      if (!validos.has(opcion)) filtros[clave].delete(opcion);
    });
    if (!filtros[clave].size) delete filtros[clave];
  });
}

async function refrescarOpcionesVivas() {
  const cat = await (await fetch("/api/catalogo")).json();
  podarFiltros(cat.filtros);
  armarFiltro(cat.filtros);
  const unidadActual = drops["drop-unidad"]?.valor || "No cambiar";
  armarDrop("drop-unidad", ["No cambiar", ...(cat.unidades || [])], "No cambiar");
  if (unidadActual !== "No cambiar" && (cat.unidades || []).includes(unidadActual)) {
    drops["drop-unidad"].elegir(unidadActual);
  }
  refrescarFiltro();
  return cat;
}

async function cargarIndice() {
  const respuesta = await fetch("/api/indice");
  if (!respuesta.ok) return;
  const antes = Object.keys(indice.subfamilias || {}).length;
  const clavesAntes = (indice.claves || []).join();
  indice = await respuesta.json();
  const ahora = Object.keys(indice.subfamilias || {}).length;
  const termino = indiceEstabaConstruyendo && !indice.construyendo;
  const fecha = indice.fecha ? new Date(indice.fecha) : null;
  $("indice-fecha").textContent = indice.construyendo
    ? textoAvanceIndice(indice)
    : fecha ? `Datos de ${fecha.toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}` : "Sin datos todavía";
  pintarIndiceCuota(indice);
  $("indice-actualizar").disabled = indice.construyendo;
  if (termino) avisarSiErrorIndice(indice);
  else if (indice.error && !indice.construyendo) avisarSiErrorIndice(indice);
  indiceEstabaConstruyendo = Boolean(indice.construyendo);
  if (listo && (termino || (indice.claves || []).join() !== clavesAntes)) {
    const cat = await refrescarOpcionesVivas();
    if (ahora && ahora !== antes && cat.subfamilias?.length) {
      armarDrop("drop-sub", cat.subfamilias, "Elegí una o varias subfamilias", () => {
        const panel = $("opciones");
        if (panel.classList.contains("oculto")) {
          panel.classList.remove("oculto");
          panel.classList.add("aparece");
        }
        revisarCobertura(false);
      }, { buscar: true, todas: true, multiple: true });
    }
  } else if (ahora && ahora !== antes && listo) {
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
      avisar("No se puede actualizar ahora", textoErrorZoho(cuota.mensaje), [], { error: true });
      return;
    }
    restan = cuota.restan;
    limite = cuota.limite;
  } catch {
    avisar("No se puede actualizar ahora", "No se pudo consultar Zoho. Revisá la conexión e intentá de nuevo.", [], { error: true });
    return;
  }
  const n = estimado != null ? Number(estimado).toLocaleString("es-CR") : "unas 60–70";
  const cuotaTxt = restan != null
    ? `Ahora quedan ${Number(restan).toLocaleString("es-CR")}${limite != null ? ` de ${Number(limite).toLocaleString("es-CR")}` : ""} llamadas hoy.`
    : "No se pudo leer la cuota en este momento.";
  const ok = await confirmarAviso(
    "Actualizar datos de Zoho",
    `Esto vuelve a leer TODO el catálogo de Zoho: activos, inactivos y los que no tienen subfamilia. Va a consumir aproximadamente ${n} llamadas a la API (1 por página de 200 artículos). ${cuotaTxt}`,
    [
      "Sirve para refrescar filtros, conteos y vista previa.",
      "Las opciones que ya no existen (por ejemplo una unidad que se eliminó) salen del filtro.",
      "No escribe cambios en los artículos; solo lee.",
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
    return largo ? `${subs.length} de ${total} subfamilias` : `${subs.length} de ${total}`;
  }
  if (subs.length === 1) return subs[0];
  if (subs.length === 2) return `${subs[0]} y ${subs[1]}`;
  return `${subs.slice(0, -1).join(", ")} y ${subs.at(-1)}`;
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
    const pasa = activos.every(([clave, set]) => {
      const i = indice.claves.indexOf(clave);
      return i >= 0 && i < valores.length && set.has(valores[i]);
    });
    return pasa ? total + n : total;
  }, 0);
}

function describirFiltros() {
  const partes = [];
  catalogoFiltros.forEach((f) => {
    const elegidos = filtros[f.clave] ? [...filtros[f.clave]] : [];
    if (!elegidos.length) return;
    const lista = elegidos.join(" o ");
    if (f.clave === "unidad") {
      const listaUnidad = elegidos.map((e) => (e === "No tienen unidad" ? "sin unidad" : e)).join(" o ");
      partes.push(elegidos.every((e) => e === "No tienen unidad") ? "sin unidad" : `unidad ${listaUnidad}`);
    }
    else if (f.clave === "estado") partes.push(elegidos.map((e) => e.toLowerCase() + "s").join(" o "));
    else if (f.clave === "familia") partes.push(elegidos.every((e) => e === "No tienen familia") ? "sin familia" : lista.toLowerCase());
    else if (f.clave === "tienda") partes.push(`"Aplica tienda en línea" ${lista.toLowerCase()}`);
    else if (f.clave === "precio") partes.push(`actualizar precio ${lista.toLowerCase()}`);
    else if (f.clave === "venta") partes.push(elegidos.map((e) => e.toLowerCase()).join(" o "));
    else if (f.clave === "cabys") partes.push(elegidos.map((e) => e.replace("Con", "con").replace("Sin", "sin")).join(" o "));
    else if (f.clave === "compuesto") partes.push(elegidos.map((e) => e.toLowerCase() + "s").join(" o "));
    else if (f.clave === "pareja") partes.push(elegidos.map((e) => e.toLowerCase()).join(" o "));
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
  const pos = (clave) => indice.claves.indexOf(clave);
  const pasa = (valores, salvo) => activos.every(([clave, set]) => {
    if (clave === salvo) return true;
    const i = pos(clave);
    return i >= 0 && i < valores.length && set.has(valores[i]);
  });
  const total = combos.reduce((t, [, n]) => t + n, 0);
  const filtrados = combos.reduce((t, [valores, n]) => (pasa(valores) ? t + n : t), 0);

  caja.innerHTML = "";
  const cabeza = crear("p", "resumen-sub-total");
  const dato = (clase, n, texto) => {
    const span = crear("span", clase);
    span.append(crear("b", "", n.toLocaleString("es-CR")), texto);
    cabeza.append(span);
  };
  dato("", total, `artículos en ${textoSubs()}`);
  if (activos.length) dato("con-filtro", filtrados, "con los filtros elegidos");
  const pista = crear("span", "resumen-sub-pista", "Clic en varias filas para combinar filtros. No se ocultan las demás.");
  cabeza.append(pista);
  caja.append(cabeza);

  const grupos = crear("div", "resumen-sub-grupos");
  catalogoFiltros.forEach((f) => {
    const i = indice.claves.indexOf(f.clave);
    if (i < 0) return;
    const cuenta = {};
    const cruzan = {};
    combos.forEach(([valores, n]) => {
      if (i >= valores.length) return;
      const valor = valores[i];
      if (valor == null || valor === "" || valor === "undefined") return;
      cuenta[valor] = (cuenta[valor] || 0) + n;
      if (pasa(valores, f.clave)) cruzan[valor] = (cruzan[valor] || 0) + n;
    });
    const filas = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
    if (!filas.length) return;
    const grupo = crear("div", "resumen-sub-grupo");
    grupo.append(crear("h4", "", f.titulo));
    filas.forEach(([valor]) => {
      const n = activos.length ? (cruzan[valor] || 0) : cuenta[valor];
      const fila = crear("div", filtros[f.clave]?.has(valor) ? "elegido" : "");
      if (activos.length && n === 0) fila.classList.add("sin-cruce");
      fila.setAttribute("role", "button");
      fila.tabIndex = 0;
      fila.title = n
        ? `Filtrar por ${f.titulo}: ${valor}`
        : `${valor} no coincide con los otros filtros marcados, pero lo podés sumar igual`;
      const aplicar = () => {
        const set = filtros[f.clave] || new Set();
        if (set.has(valor)) {
          set.delete(valor);
          if (!set.size) delete filtros[f.clave];
        } else {
          set.add(valor);
          filtros[f.clave] = set;
        }
        refrescarFiltro();
      };
      fila.onclick = (evento) => {
        evento.stopPropagation();
        aplicar();
      };
      fila.onkeydown = (evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          aplicar();
        }
      };
      fila.append(crear("span", "", valor || "(vacío)"), crear("span", "", n.toLocaleString("es-CR")));
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
    linea.innerHTML = n ? `Coinciden <b>${n}</b> artículos con los filtros.` : "Ningún artículo de esta subfamilia cumple los filtros.";
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
    ? `Coinciden <b>${total}</b> artículos en ${porSub.length - vacias.length} de ${porSub.length} subfamilias.`
    : "Ninguna subfamilia tiene artículos que cumplan los filtros.";
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
    if (filtros[f.clave]) {
      const vals = [...filtros[f.clave]];
      const vacios = {
        "No tienen unidad": "Solo artículos que no tienen unidad",
        "No tienen familia": "Solo artículos que no tienen familia",
        "Sin precio": "Solo artículos sin precio",
        "Sin imagen": "Solo artículos sin imagen",
        "Sin sección": "Solo artículos sin sección",
        "Sin CABYS": "Solo artículos sin CABYS",
        "Inactivo": "Solo artículos inactivos",
      };
      lineas.push(
        vals.length === 1 && vacios[vals[0]]
          ? vacios[vals[0]]
          : `Solo artículos con ${f.titulo}: ${vals.join(" o ")}`,
      );
    }
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
  if (drops["drop-estante"].valor.startsWith("Estante 9")) lineas.push("Estante: Estante 9 solo donde esté vacío");
  lineas.push("", "Esto escribe en Zoho.");
  return lineas.join("\n");
}

function textoCosto(costo) {
  if (!costo) return "";
  const n = costo.llamadas.toLocaleString("es-CR");
  let base;
  if (costo.modo === "rapido") {
    base = costo.llamadas
      ? `Costo: ${n} llamadas a la API de Zoho (2 por artículo: leerlo y escribirlo).`
      : "Costo: 0 llamadas a la API de Zoho.";
  } else {
    base = costo.paginas
      ? `Costo: unas ${n} llamadas a la API de Zoho (${costo.paginas} para leer todo el catálogo, porque los datos guardados tienen más de 12 horas, y 1 por artículo cambiado).`
      : `Costo: 1 llamada por artículo cambiado más 1 por cada página del catálogo, porque los datos guardados tienen más de 12 horas.`;
  }
  if (costo.restan != null) {
    const restan = Number(costo.restan).toLocaleString("es-CR");
    const limite = costo.limite != null ? ` de ${Number(costo.limite).toLocaleString("es-CR")}` : "";
    const despues = Math.max(0, Number(costo.restan) - Number(costo.llamadas || 0));
    base += ` Quedan ${restan}${limite} hoy; después de este cambio quedarían unas ${despues.toLocaleString("es-CR")}.`;
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
    $("estado").textContent = "Elegí al menos una subfamilia.";
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
    estante: drops["drop-estante"].valor.startsWith("Estante 9") ? "Estante 9" : "",
  });
}

let ultimoCosto = null;
$("previa").onclick = async () => {
  if (!subsElegidas().length) {
    $("estado").textContent = "Elegí al menos una subfamilia.";
    return;
  }
  if (!revisarCobertura(false)) {
    revisarCobertura(true);
    return;
  }
  $("estado").textContent = "Armando la vista previa…";
  const respuesta = await fetch("/api/vista-previa", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: pedidoActual(),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    $("estado").textContent = datos.mensaje || "No se pudo armar la vista previa.";
    return;
  }
  $("estado").textContent = "";
  const filas = $("previa-filas");
  filas.innerHTML = "";
  const soloLista = Array.isArray(datos.columnas);
  const cabeza = $("previa-cabeza");
  cabeza.innerHTML = "";
  ["SKU", "Artículo", "Subfamilia", ...(soloLista ? datos.columnas : ["Campo", "Antes", "Después"])]
    .forEach((titulo) => cabeza.append(crear("th", "", titulo)));
  $("previa-titulo").textContent = soloLista ? "Artículos por cambiar" : "Vista previa del cambio";
  $("previa-aplicar").classList.toggle("oculto", soloLista);
  if (soloLista) {
    datos.cambian.forEach((a) => {
      const fila = crear("tr");
      fila.append(crear("td", "", a.sku || "—"), crear("td", "", a.nombre), crear("td", "", a.subfamilia));
      a.valores.forEach((v) => fila.append(crear("td", "", v || "—")));
      filas.append(fila);
    });
    const total = datos.cambian.length;
    $("previa-resumen").innerHTML = total
      ? `Hay <b>${total.toLocaleString("es-CR")}</b> artículos con estas subfamilias y filtros. Todavía no elegiste ningún cambio; cuando marques uno, acá vas a ver el antes y el después.`
      : "Ningún artículo coincide con estas subfamilias y filtros.";
    ultimoCosto = null;
    $("previa-costo").textContent = "";
    $("previa-nota").textContent = datos.fecha
      ? `Datos de Zoho de ${new Date(datos.fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })} (no gasta llamadas).`
      : "Todavía no hay datos guardados de Zoho. Usá \"Actualizar datos\" en el filtro.";
    $("previa-modal").classList.remove("oculto");
    return;
  }
  datos.cambian.forEach((a) => {
    Object.entries(a.cambios).forEach(([campo, [antes, despues]]) => {
      const fila = crear("tr");
      fila.append(
        crear("td", "", a.sku || "—"), crear("td", "", a.nombre), crear("td", "", a.subfamilia), crear("td", "", campo),
        crear("td", "hist-antes", textoValor(antes)), crear("td", "hist-despues", textoValor(despues)),
      );
      filas.append(fila);
    });
  });
  const n = datos.cambian.length;
  $("previa-resumen").innerHTML = n
    ? `Se cambiarían <b>${n}</b> artículos.${datos.iguales ? ` Otros ${datos.iguales} ya tienen esos valores y no se tocan.` : ""}`
    : `Ningún artículo cambiaría.${datos.iguales ? ` Los ${datos.iguales} que coinciden ya tienen esos valores.` : ""}`;
  ultimoCosto = datos.costo;
  $("previa-costo").textContent = textoCosto(datos.costo);
  $("previa-nota").textContent = datos.fecha
    ? `Calculado con los datos de Zoho de ${new Date(datos.fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })} (no gasta llamadas). Al aplicar, se vuelve a leer Zoho para escribir sobre los valores más recientes.`
    : "Todavía no hay datos guardados de Zoho. Usá \"Actualizar datos\" en el filtro.";
  $("previa-aplicar").disabled = n === 0;
  $("previa-modal").classList.remove("oculto");
};
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

function esLecturaCxc(datos) {
  const tipo = String(datos?.tipo || "");
  return tipo === "cxc-lectura" || tipo === "cxc-filtro";
}

function pintarCxcLeyendo(datos) {
  const card = $("cxc-leyendo");
  if (!card) return;
  if (!datos?.activo) {
    card.classList.add("oculto");
    return;
  }
  $("cxc-estado")?.classList.add("oculto");
  const quien = datos.usuario || $("menu-nombre")?.textContent || "Alguien";
  const archivo = datos.detalle || datos.archivo || "";
  const hechos = Number(datos.hechos) || 0;
  const total = Number(datos.total) || 0;
  if ($("cxc-leyendo-quien")) $("cxc-leyendo-quien").textContent = quien;
  if ($("cxc-leyendo-accion")) {
    $("cxc-leyendo-accion").textContent = archivo
      ? `Leyendo ${archivo}`
      : (datos.accion || "Leyendo el archivo");
  }
  if ($("cxc-leyendo-detalle")) {
    $("cxc-leyendo-detalle").textContent = total
      ? `${hechos} de ${total} leídas`
      : (datos.texto || "Preparando la lectura…");
  }
  if ($("cxc-leyendo-avance")) {
    $("cxc-leyendo-avance").textContent = total && datos.texto ? datos.texto : "";
  }
  let eta = "";
  if (datos.faltan_texto) eta = `Tiempo estimado: ${datos.faltan_texto.replace(/^faltan unas? /, "")}`;
  else if (datos.faltan_segundos) eta = `Tiempo estimado: ${textoEtaLargo(datos.faltan_segundos)}`;
  if ($("cxc-leyendo-eta")) {
    $("cxc-leyendo-eta").textContent = eta
      ? `${quien}: leyendo · ${eta}`
      : `${quien}: leyendo el archivo`;
  }
  card.classList.remove("oculto");
}

function pintarTrabajoCard(datos) {
  const card = $("trabajo-card");
  if (!card) return;
  if (esLecturaCxc(datos) && datos?.activo) {
    pintarCxcLeyendo(datos);
    card.classList.add("oculto");
    card.classList.remove("leyendo");
    return;
  }
  if (!datos?.activo) pintarCxcLeyendo({ activo: false });
  if (!datos?.activo) {
    card.classList.add("oculto");
    card.classList.remove("leyendo");
    return;
  }
  const quien = datos.usuario || "Alguien";
  card.classList.remove("leyendo");
  if ($("trabajo-marca")) $("trabajo-marca").textContent = "Ejecutándose";
  $("trabajo-quien").textContent = quien;
  $("trabajo-accion").textContent = datos.accion || "Cambio en Zoho";
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
  const esCxc = String(datos.tipo || "").startsWith("cxc");
  if (datos.activo && !esCxc) {
    $("estado").textContent = datos.texto || "";
    $("detener").classList.remove("oculto");
  } else if (iba && !esCxc) {
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
  const unidad = datos.tipo === "cuentas" ? "cuentas" : "artículos";
  const unidadUna = datos.tipo === "cuentas" ? "cuenta" : "artículo";
  $("revertir-texto").textContent =
    `Se van a devolver ${datos.articulos.toLocaleString("es-CR")} ${unidad} a su valor de antes.\nCambio: ${datos.accion}`;
  $("revertir-costo").textContent =
    `Costo: hasta ${datos.llamadas.toLocaleString("es-CR")} llamadas a la API de Zoho (2 por ${unidadUna}: leerlo y escribirlo).`;
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

function textoBucleGlobal(datos) {
  const base = datos.texto || "Bucle activo";
  const cuando = cxcFmtProxima(datos.proxima);
  return cuando ? `${base} · ${cuando}` : base;
}

function pintarBucleGlobal(datos) {
  const badge = $("bucle-global");
  const texto = $("bucle-global-texto");
  const item = document.querySelector('.item[data-pagina="cxc"]');
  const prendido = Boolean(datos?.activo);
  if (badge) {
    badge.classList.toggle("oculto", !prendido);
    if (texto && prendido) texto.textContent = textoBucleGlobal(datos);
  }
  if (item) item.classList.toggle("vigilando", prendido);
}

async function mirarBucleGlobal() {
  if (!listo || !$("bucle-global")) return;
  try {
    const respuesta = await fetch("/api/cxc/bucle");
    if (!respuesta.ok) return;
    pintarBucleGlobal(await respuesta.json());
  } catch {
    /* ignore */
  }
}

setInterval(mirarBucleGlobal, 2000);
if ($("bucle-global")) {
  $("bucle-global").onclick = () => {
    const boton = document.querySelector('.item[data-pagina="cxc"]');
    if (boton) boton.click();
  };
}

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function hace(fecha) {
  const min = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.round(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  return fecha.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
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
  if (!datos.fecha) partes.push("Leyendo los artículos de Zoho por primera vez…");
  else {
    partes.push(`Mostrando ${datos.articulos.length} de ${datos.total} artículos`);
    if (datos.tienda?.fecha) {
      partes.push(`${datos.tienda.publicados.toLocaleString("es-CR")} publicados en la tienda, leída ${hace(new Date(datos.tienda.fecha))}`);
      partes.push(`la tienda se actualiza a las ${datos.tienda.horas.join(", ")}`);
    }
    partes.push(`datos de Zoho ${hace(new Date(datos.fecha))}`);
  }
  if (datos.revision?.activo) {
    const r = datos.revision;
    partes.push(r.total ? `revisando fotos de la tienda: ${r.hechos} de ${r.total}` : "revisando fotos de la tienda…");
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
    chip.append(document.createTextNode(nombre), crear("b", "", n.toLocaleString("es-CR")));
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
    ? "Cargando artículos…"
    : pendTipo === "Corregidos"
      ? "Todavía no marcaste ninguno como corregido."
      : "No hay artículos con ese problema. ¡Todo en orden!";
  datos.articulos.forEach((a, i) => {
    const li = crear("li");
    const tarjeta = crear("article", "pend-tarjeta");
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("aria-label", `${a.nombre}. Le falta: ${a.problemas.join(", ")}. ${i + 1} de ${datos.articulos.length}`);

    const foto = crear("div", "pend-foto");
    if (a.foto) {
      const img = crear("img");
      img.src = a.foto;
      img.alt = `Foto en la tienda de ${a.nombre}`;
      img.loading = "lazy";
      img.draggable = false;
      img.onerror = () => { foto.innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>No cargó la foto</span></div>`; };
      foto.append(img);
    } else {
      foto.innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>Sin foto</span></div>`;
    }
    if (a.tienda) foto.append(crear("span", "pend-insignia", "EN LA TIENDA"));
    const cuenta = crear("span", "pend-cuenta", a.problemas.length);
    cuenta.title = `${a.problemas.length} pendientes`;
    foto.append(cuenta);

    const cuerpo = crear("div", "pend-cuerpo");
    cuerpo.append(crear("span", "pend-sku", a.sku ? `SKU ${a.sku}` : "SIN SKU"));
    const nombre = crear("h3", "pend-nombre", a.nombre);
    nombre.title = a.nombre;
    cuerpo.append(nombre, crear("span", "pend-sub", a.subfamilia || a.familia || "Sin subfamilia"));
    cuerpo.append(crear("p", "pend-falta-titulo", "Le falta / revisar"));
    const lista = crear("ul", "pend-faltas");
    a.problemas.forEach((p) => lista.append(crear("li", esFoto(p) ? "foto" : "", p)));
    cuerpo.append(lista);
    const abrir = crear("a", "pend-abrir", "Abrir en Zoho ↗");
    abrir.href = datos.zoho + a.id;
    abrir.target = "_blank";
    abrir.rel = "noopener";
    const botones = crear("div", "pend-botones");
    botones.append(abrir);
    if (a.slug) {
      const ver = crear("button", "pend-abrir", "Ver en la tienda");
      ver.type = "button";
      ver.onclick = () => verEnTienda(a, datos.tienda_buscar);
      botones.append(ver);
    }
    const hecho = crear("button", a.corregido ? "pend-abrir pend-hecho activo" : "pend-abrir pend-hecho", a.corregido ? "Deshacer" : "Marcar como corregido");
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
  $("tienda-sku").textContent = a.sku ? `Código ${a.sku}` : "";
  $("tienda-precio").textContent = "Cargando…";
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
    $("tienda-precio").textContent = datos.mensaje || "No se pudo leer el producto de la tienda.";
    return;
  }
  const p = datos.producto;
  $("tienda-nombre").textContent = p.nombre || a.nombre;
  $("tienda-sku").textContent = [p.sku && `Código ${p.sku}`, p.unidad && `Unidad ${p.unidad}`].filter(Boolean).join("  ·  ");
  $("tienda-precio").textContent = p.oferta && p.precio_oferta ? `${p.precio_oferta}  (antes ${p.precio_iva})` : p.precio_iva;
  const hay = Number(p.disponible) || 0;
  $("tienda-stock").textContent = hay > 0 ? `En stock · ${hay} disponibles` : "Sin stock";
  $("tienda-stock").classList.add(hay > 0 ? "si" : "no");
  const img = crear("img");
  img.alt = p.nombre;
  img.onerror = () => { $("tienda-foto").innerHTML = `<div class="pend-sin-foto">${ICONO_FOTO}<span>La tienda no tiene foto</span></div>`; };
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
const HIST_FRASES = [
  "Refrescando…",
  "Jalando datos…",
  "Revisando cambios…",
  "Ordenando el historial…",
  "Casi listo…",
];

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
  $("hist-cargando-texto").textContent = HIST_FRASES[0];
  histFrasesReloj = setInterval(() => {
    i = (i + 1) % HIST_FRASES.length;
    $("hist-cargando-texto").textContent = HIST_FRASES[i];
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
  $("hist-actualizar-texto").textContent = "Actualizando";
  const minimo = new Promise((listo) => setTimeout(listo, 1200));
  try {
    await Promise.all([cargarHistorial(true), minimo]);
  } finally {
    boton.classList.remove("actualizando");
    boton.removeAttribute("aria-busy");
    $("hist-actualizar-texto").textContent = "Actualizar";
  }
};
$("hist-buscar").oninput = () => pintarHistorial();

function textoValor(valor) {
  if (valor === null || valor === undefined || valor === "") return "vacío";
  return String(valor);
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
    const texto = [e.accion, e.detalle, ...e.articulos.map((a) => `${a.sku} ${a.nombre} ${a.id}`)].join(" ");
    return normal(texto).includes(aguja);
  });

  const resumen = $("hist-resumen");
  resumen.innerHTML = "";
  const articulos = visibles.reduce((n, e) => n + (e.cambiados || 0), 0);
  const errores = visibles.reduce((n, e) => n + (e.errores || 0), 0);
  [
    ["Cambios registrados", visibles.length.toLocaleString("es-CR")],
    ["Artículos cambiados", articulos.toLocaleString("es-CR")],
    ["Errores", errores.toLocaleString("es-CR")],
    ["Último cambio", visibles[0] ? hace(new Date(visibles[0].fecha)) : "—"],
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
      accion: trabajoActual.accion || "Cambio en curso",
      detalle: trabajoActual.texto || trabajoActual.detalle || "",
      estado: "ejecutando",
      cambiados: trabajoActual.cambiados || 0,
      errores: trabajoActual.errores || 0,
      articulos: [],
    }, new Date()));
  }
  if (!visibles.length && !trabajoActual?.activo) {
    lista.append(crear("p", "hist-vacio", historialDatos.length ? "No hay cambios que coincidan." : "Todavía no hay cambios registrados."));
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
      const nombreDia = dia === hoy ? "Hoy" : dia === ayer ? "Ayer"
        : fecha.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" });
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
  cabeza.append(crear("span", "hist-hora", fecha.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })));
  const centro = crear("span");
  const nombreOrigen = (ORIGENES.find(([clave]) => clave === e.origen) || ["", e.origen])[1];
  const accion = crear("span", "hist-accion", e.accion || "Cambio");
  if (e.estado === "ejecutando") accion.append(crear("em", "hist-marca ejecutando", "- Ejecutándose"));
  const seDetuvo = e.estado === "detenido" || /Se detuvo:/i.test(e.detalle || "");
  if (e.reanudado || /Detenido · Reanudado/i.test(e.accion || "")) {
    accion.append(crear("em", "hist-marca detenido", "- Detenido · Reanudado"));
  } else if (seDetuvo) {
    accion.append(crear("em", "hist-marca detenido", "- Detenido"));
  }
  if (e.revertido) accion.append(crear("em", "hist-marca revertido", "- Revertido"));
  centro.append(crear("span", "hist-origen", e.usuario ? `${nombreOrigen} · ${e.usuario}` : nombreOrigen), accion);
  if (e.detalle) centro.append(crear("span", "hist-detalle", e.detalle));
  const numeros = crear("span", "hist-numeros");
  if (e.estado === "ejecutando") {
    cabeza.disabled = true;
    caja.classList.add("ejecutando");
    numeros.append(crear("span", "hist-num", `✓ ${(e.cambiados || 0).toLocaleString("es-CR")} cambiados`));
    if (e.errores) numeros.append(crear("span", "hist-num mal", `✕ ${e.errores} errores`));
    numeros.append(crear("span", "hist-num", "En curso"));
  } else {
    numeros.append(crear("span", "hist-num", `✓ ${(e.cambiados || 0).toLocaleString("es-CR")} cambiados`));
    if (e.errores) numeros.append(crear("span", "hist-num mal", `✕ ${e.errores} errores`));
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
  quien.append(crear("span", "", "Cuenta de Zoho que hizo el cambio"));
  quien.append(crear("strong", "", cuenta ? cuenta.nombre || cuenta.correo : "No se pudo leer de Zoho"));
  if (cuenta && cuenta.correo) quien.append(crear("small", "", cuenta.correo));
  cuerpo.append(quien);
  if (e.revertido) {
    cuerpo.append(crear("p", "hist-nota", `Revertido el ${new Date(e.revertido).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}.`));
  } else if (e.origen === "web" && e.id && e.estado !== "reversion" && e.cambiados && (e.articulos || []).some((a) => a.cambios && Object.keys(a.cambios).length)) {
    const seDetuvo = e.estado === "detenido" || e.reanudable || /Se detuvo:/i.test(e.detalle || "");
    if (seDetuvo) {
      const reanudar = crear("button", "btn borde btn-reanudar hist-reanudar", "Reanudar este cambio");
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
    const boton = crear("button", "btn borde btn-revertir hist-revertir", "Revertir este cambio");
    boton.type = "button";
    boton.onclick = () => pedirReversion(e.id);
    cuerpo.append(boton);
  }
  if (!e.articulos.length) {
    cuerpo.append(crear("p", "hist-nota", "Este cambio no tiene la lista de artículos guardada."));
    return;
  }
  const tabla = crear("table", "hist-tabla");
  const thead = crear("thead");
  const filaT = crear("tr");
  ["SKU / ID", "Artículo", "Campo", "Antes", "Después"].forEach((t) => filaT.append(crear("th", "", t)));
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
          crear("td", "", a.nombre || "—"),
          crear("td", "", campo === "correo_cxc" ? "Correo CXC" : campo),
          crear("td", "hist-antes", textoValor(antes)),
          crear("td", "hist-despues", textoValor(despues)),
        );
        tbody.append(fila);
      });
    });
    mostrados = Math.min(e.articulos.length, mostrados + cantidad);
    const faltan = e.articulos.length - mostrados;
    mas.textContent = `Mostrar ${Math.min(100, faltan)} más (quedan ${faltan})`;
    mas.classList.toggle("oculto", faltan <= 0);
  }
  mas.onclick = () => agregar(100);
  agregar(100);
  const botones = crear("div", "hist-botones");
  botones.append(mas);
  if (e.articulos.length > 100) {
    const consulta = e.id ? { id: e.id } : { fecha: e.fecha, accion: e.accion || "" };
    const excel = crear("a", "btn borde hist-excel", "Descargar Excel");
    excel.href = `/api/historial.xlsx?${new URLSearchParams(consulta)}`;
    excel.setAttribute("download", "");
    botones.append(excel);
  }
  cuerpo.append(tabla, botones);
  if (e.total_articulos > e.articulos.length) {
    cuerpo.append(crear("p", "hist-nota", `Se guardaron los primeros ${e.articulos.length} de ${e.total_articulos} artículos.`));
  }
}

/* artículos compuestos: pegar piezas, validar pareja, rellenar kit y crear en Zoho */
let kitActual = null;
let parejasDatos = null;
let parejasEstado = "listo";
let parejasSub = [];
let parejasSubsPendientes = [];
const PAREJAS_ETIQUETA = {
  listo: "Listos",
  ya_tiene_kit: "Ya tienen kit",
  incompleto: "Falta una pieza",
};

function textoPiezaPar(pieza, rol) {
  if (!pieza) return `Sin ${rol}`;
  return pieza.sku || pieza.nombre || rol;
}

function pintarChipsParejas() {
  const caja = $("comp-chips");
  if (!caja || !parejasDatos) return;
  const conteo = parejasDatos.conteo || {};
  caja.innerHTML = "";
  [["", "Todas", parejasDatos.total], ...Object.entries(PAREJAS_ETIQUETA).map(([k, nom]) => [k, nom, conteo[k] || 0])].forEach(([tipo, nombre, n]) => {
    const chip = crear("button", `pend-chip${tipo === parejasEstado ? " activo" : ""}`);
    chip.type = "button";
    chip.setAttribute("aria-pressed", tipo === parejasEstado ? "true" : "false");
    chip.append(document.createTextNode(nombre), crear("b", "", Number(n).toLocaleString("es-CR")));
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
  caja.innerHTML = "";
  $("comp-lista-conteo").textContent = parejasDatos
    ? `Mostrando ${lista.length.toLocaleString("es-CR")} de ${parejasDatos.total.toLocaleString("es-CR")} parejas`
    : "";
  if (!lista.length) {
    caja.append(crear("p", "nota", parejasDatos ? "No hay parejas con ese filtro." : "Cargando parejas…"));
    return;
  }
  lista.forEach((par) => {
    const fila = crear("article", `comp-par ${par.estado}`);
    const izq = crear("div");
    izq.append(crear("strong", "", par.sku_kit || par.base));
    izq.append(crear("small", "", par.subfamilia || "Sin subfamilia"));
    const mid = crear("div");
    mid.append(crear("small", "", `${textoPiezaPar(par.cond, "pieza A")} + ${textoPiezaPar(par.evap, "pieza B")}`));
    mid.append(crear("span", "comp-par-estado", PAREJAS_ETIQUETA[par.estado] || par.estado));
    const der = crear("div");
    const boton = crear("button", "btn rojo", par.estado === "listo" ? "Armar" : "Abrir");
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
  $("comp-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  $("comp-pega").scrollIntoView({ behavior: "smooth", block: "center" });
  buscarCompuestos();
}

async function cargarParejas() {
  const fecha = $("comp-lista-fecha");
  if (fecha) fecha.textContent = "Leyendo parejas en los datos locales…";
  try {
    const respuesta = await fetch("/api/compuestos/parejas");
    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.ok) {
      if (fecha) fecha.textContent = datos.mensaje || "No se pudieron armar las parejas.";
      return;
    }
    parejasDatos = datos;
    if (parejasEstado === "listo" && !(datos.conteo?.listo)) parejasEstado = "";
    if (fecha) {
      fecha.textContent = datos.fecha
        ? `Se arma con los datos locales de ${new Date(datos.fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}. No gasta APIs.`
        : "Se arma con los datos locales. No gasta APIs.";
    }
    armarDrop("drop-comp-sub", datos.subfamilias || [], "Todas las subfamilias", () => {
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
    if (fecha) fecha.textContent = "No se pudieron leer las parejas. Revisá la conexión.";
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
  return `₡${x.toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  caja.append(crear("h3", "opciones-titulo", "Piezas encontradas"));
  const tabla = crear("table", "comp-piezas");
  const cabeza = crear("tr");
  ["Rol", "SKU", "Nombre", "Cant.", "Precio", "Costo", "Stock", ""].forEach((t) => cabeza.append(crear("th", "", t)));
  const thead = crear("thead");
  thead.append(cabeza);
  tabla.append(thead);
  const cuerpo = crear("tbody");
  piezas.forEach((p, i) => {
    const fila = crear("tr");
    fila.append(crear("td", "comp-rol", p.rol || "pieza"));
    fila.append(crear("td", "", p.sku || "—"));
    fila.append(crear("td", "", p.nombre || "—"));
    const cant = document.createElement("input");
    cant.type = "number";
    cant.min = "1";
    cant.step = "1";
    cant.value = p.cantidad || 1;
    cant.onchange = () => {
      const n = Number(cant.value);
      kitActual.piezas[i].cantidad = n > 0 ? n : 1;
      const precio = kitActual.piezas.reduce((t, x) => t + Number(x.precio || 0) * Number(x.cantidad || 1), 0);
      const costo = kitActual.piezas.reduce((t, x) => t + Number(x.costo || 0) * Number(x.cantidad || 1), 0);
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
    sacar.setAttribute("aria-label", "Quitar");
    sacar.onclick = () => {
      kitActual.piezas.splice(i, 1);
      if (kitActual.piezas.length < 2) {
        $("comp-form").classList.add("oculto");
        $("comp-previa").classList.add("oculto");
        $("comp-validacion").textContent = "Hacen falta mínimo dos artículos.";
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
    caja.textContent = "Se pueden asociar. El SKU es nuevo para este conjunto.";
  } else {
    caja.classList.add("mal");
    caja.textContent = kit.mensaje || "Revisá las piezas.";
  }
}

function pintarPreviaKit(kit) {
  const form = kitDesdeForm();
  const piezas = kit.piezas || [];
  $("comp-previa").classList.remove("oculto");
  $("comp-previa-resumen").innerHTML = piezas.length >= 2
    ? `El kit <b>${form.sku || "—"}</b> asocia ${piezas.length} piezas. Stock vendible: el mínimo (${Math.min(...piezas.map((p) => Number(p.stock) || 0))}).`
    : "Hacen falta mínimo dos artículos.";
  const cabeza = $("comp-previa-cabeza");
  cabeza.innerHTML = "";
  ["", "SKU", "Nombre", "Cant.", "Precio", "Costo", "Stock"].forEach((t) => cabeza.append(crear("th", "", t)));
  const filas = $("comp-previa-filas");
  filas.innerHTML = "";
  piezas.forEach((p) => {
    const fila = crear("tr");
    fila.append(
      crear("td", "", p.rol || "pieza"),
      crear("td", "", p.sku || "—"),
      crear("td", "", p.nombre || "—"),
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
  let texto = `Costo: ${llamadas} llamadas a la API de Zoho (${piezas.length} para confirmar las piezas y 1 para crear el kit). La búsqueda usó los datos locales, no gasta llamadas.`;
  if (kit.restan != null) {
    const despues = Math.max(0, Number(kit.restan) - llamadas);
    texto += ` Quedan ${Number(kit.restan).toLocaleString("es-CR")}${kit.limite != null ? ` de ${Number(kit.limite).toLocaleString("es-CR")}` : ""} hoy; después quedarían unas ${despues.toLocaleString("es-CR")}.`;
  }
  $("comp-costo-api").textContent = texto;
  $("comp-crear").disabled = !kit.ok || piezas.length < 2;
}

async function buscarCompuestos() {
  const texto = $("comp-pega").value;
  $("comp-estado").textContent = "Buscando en los datos locales…";
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
      ? `Se encontraron ${datos.encontradas} artículo${datos.encontradas === 1 ? "" : "s"} en los datos${datos.fecha ? ` de ${new Date(datos.fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}` : ""}.`
      : (datos.mensaje || "No se encontró ninguno.");
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
    $("comp-estado").textContent = "No se pudo buscar. Revisá la conexión.";
  } finally {
    $("comp-buscar").disabled = false;
  }
}

$("comp-buscar").onclick = buscarCompuestos;
$("comp-pega").addEventListener("paste", () => setTimeout(buscarCompuestos, 0));
$("comp-limpiar").onclick = () => {
  kitActual = null;
  $("comp-pega").value = "";
  $("comp-estado").textContent = "";
  $("comp-hallados").classList.add("oculto");
  $("comp-form").classList.add("oculto");
  $("comp-previa").classList.add("oculto");
};
["comp-nombre", "comp-sku", "comp-unidad", "comp-familia", "comp-subfamilia", "comp-precio", "comp-costo", "comp-desc"].forEach((id) => {
  $(id).addEventListener("input", () => {
    $(id).parentElement?.classList.toggle("cambiado", Boolean($(id).value.trim()));
    if (kitActual) pintarPreviaKit(kitActual);
  });
});
$("comp-excel").onclick = async () => {
  if (!kitActual || (kitActual.piezas || []).length < 2) return;
  const respuesta = await fetch("/api/compuestos.xlsx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      piezas: kitActual.piezas,
      kit: kitDesdeForm(),
    }),
  });
  if (!respuesta.ok) {
    avisar("No se pudo armar el Excel", "Revisá la conexión e intentá de nuevo.", [], { error: true });
    return;
  }
  const sku = kitDesdeForm().sku || "kit";
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(await respuesta.blob());
  enlace.download = `kit-${sku}.xlsx`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
};
$("comp-crear").onclick = async () => {
  if (!kitActual || (kitActual.piezas || []).length < 2) return;
  if (!kitActual.ok) {
    avisar("No se puede crear el kit", kitActual.mensaje || "Esas piezas no se pueden asociar.", kitActual.errores || []);
    return;
  }
  const form = kitDesdeForm();
  if (!form.nombre || !form.sku) {
    avisar("Faltan datos", "El kit necesita nombre y un SKU nuevo.");
    return;
  }
  const llamadas = (kitActual.costo_api && kitActual.costo_api.llamadas) || (kitActual.piezas.length + 1);
  const ok = await confirmarAviso(
    "Crear kit en Zoho",
    `Se va a crear el artículo compuesto ${form.sku} (${form.nombre}) asociando ${kitActual.piezas.map((p) => p.sku).join(" + ")}. Las piezas sueltas no se editan.`,
    [
      `Tipo Kit, no ensamblaje.`,
      `Costo: ${llamadas} llamadas a la API.`,
      "Aplica tienda queda en No.",
    ],
    "Sí, crear",
  );
  if (!ok) return;
  $("comp-crear").disabled = true;
  $("comp-estado").textContent = "Creando el kit en Zoho…";
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
      avisar("No se pudo crear el kit", datos.mensaje || "Zoho no guardó el compuesto.", [], { error: true });
      $("comp-estado").textContent = datos.mensaje || "No se pudo crear.";
      return;
    }
    const consumo = datos.consumo != null ? datos.consumo : datos.llamadas;
    mostrarToast("Kit creado en Zoho", `${datos.item.sku} · ${consumo} APIs${datos.restan != null ? ` · quedan ${Number(datos.restan).toLocaleString("es-CR")}` : ""}`);
    $("comp-estado").textContent = `Listo: ${datos.item.sku} ya está en Zoho.`;
    kitActual.ok = false;
    $("comp-crear").disabled = true;
    parejasDatos = null;
    cargarParejas();
  } catch {
    avisar("No se pudo crear el kit", "No se pudo hablar con el servidor.", [], { error: true });
  } finally {
    $("comp-crear").disabled = Boolean(!kitActual || !kitActual.ok);
  }
};

let cxcFilas = [];
let cxcMesSel = null;
let cxcTiempoSel = null;
let cxcMontoSel = "todos";
const CXC_MONTO = [
  { id: "todos", label: "Todos" },
  { id: "cero", label: "Los que tengan 0" },
  { id: "negativo", label: "Negativo" },
  { id: "menos", label: "Menos de…" },
  { id: "mas", label: "Más de…" },
];
const CXC_BUCLE = [
  { id: "no", label: "No repetir" },
  { id: "hora", label: "Cada hora" },
  { id: "dia", label: "Cada día" },
  { id: "semana", label: "Cada semana" },
  { id: "mes", label: "Cada mes" },
];
const CXC_DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const CXC_PLANTILLA_DEFECTO = {
  asunto: "Estado de cuenta",
  cuerpo: "Hola:\n\nEste es un mensaje de muestra. El PDF y el listado van en el mismo correo, juntos.\n\nSaludos.\n\nEquipo de muestra",
};
let cxcBucleSel = "no";
let cxcBucleDia = 0;
let cxcBucleOrigen = "zoho";
const MESES_CXC = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function cxcIso(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function cxcDiaDelMes(year, month0, dia) {
  const ultimo = new Date(year, month0 + 1, 0).getDate();
  return Math.min(dia, ultimo);
}

function cxcOpcionesIzq() {
  const hoy = new Date();
  const lista = [{ tipo: "anio", label: "Año" }];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const anio = d.getFullYear() !== hoy.getFullYear() ? ` ${d.getFullYear()}` : "";
    lista.push({
      tipo: "mes",
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${MESES_CXC[d.getMonth()]}${anio}`,
    });
  }
  return lista;
}

function cxcLimitesMes(sel) {
  const hoy = new Date();
  const actual = sel && sel.tipo === "mes" && sel.year === hoy.getFullYear() && sel.month === hoy.getMonth();
  const inicio = new Date(sel.year, sel.month, 1);
  const fin = actual ? hoy : new Date(sel.year, sel.month + 1, 0);
  return { actual, inicio, fin, desde: cxcIso(inicio), hasta: cxcIso(fin) };
}

function cxcLabelRango(desde, hasta) {
  const a = String(desde || "").split("-").map(Number);
  const b = String(hasta || "").split("-").map(Number);
  if (a.length < 3 || b.length < 3 || !a[0] || !b[0]) return "Rango personalizado";
  const d1 = a[2];
  const d2 = b[2];
  const m1 = MESES_CXC[a[1] - 1];
  const m2 = MESES_CXC[b[1] - 1];
  if (a[0] === b[0] && a[1] === b[1]) return `${d1} al ${d2} de ${m1}`;
  if (a[0] === b[0]) return `${d1} de ${m1} al ${d2} de ${m2}`;
  return `${d1} de ${m1} ${a[0]} al ${d2} de ${m2} ${b[0]}`;
}

function cxcOpcionesDer(sel) {
  const hoy = new Date();
  if (!sel || sel.tipo === "anio") {
    const ops = [];
    for (let y = hoy.getFullYear(); y >= 2023; y -= 1) {
      const inicio = new Date(y, 0, 1);
      const fin = y === hoy.getFullYear() ? hoy : new Date(y, 11, 31);
      ops.push({
        modo: "anio",
        label: y === hoy.getFullYear() ? `${y} (este año)` : String(y),
        desde: cxcIso(inicio),
        hasta: cxcIso(fin),
      });
    }
    return ops;
  }
  const lim = cxcLimitesMes(sel);
  const ops = [];
  if (lim.actual) {
    const prev = new Date(sel.year, sel.month - 1, cxcDiaDelMes(sel.year, sel.month - 1, hoy.getDate()));
    ops.push({
      modo: "mes",
      label: `Hasta hoy (1 al ${hoy.getDate()} de ${MESES_CXC[sel.month]})`,
      desde: lim.desde,
      hasta: lim.hasta,
    });
    ops.push({
      modo: "corrido",
      label: `${prev.getDate()} de ${MESES_CXC[prev.getMonth()]} al ${hoy.getDate()} de ${MESES_CXC[sel.month]}`,
      desde: cxcIso(prev),
      hasta: lim.hasta,
    });
  } else {
    ops.push({
      modo: "mes",
      label: `Todo ${MESES_CXC[sel.month]}`,
      desde: lim.desde,
      hasta: lim.hasta,
    });
  }
  ops.push({
    modo: "personalizado",
    label: "Rango personalizado",
    desde: lim.desde,
    hasta: lim.hasta,
  });
  return ops;
}

function cxcMostrarRango(sel) {
  const caja = $("cxc-rango-caja");
  if (!caja) return;
  const personalizado = Boolean(sel && sel.modo === "personalizado");
  caja.classList.toggle("oculto", !personalizado);
  if (!personalizado) return;
  const desde = $("cxc-desde");
  const hasta = $("cxc-hasta");
  if (desde) desde.value = sel.desde || "";
  if (hasta) hasta.value = sel.hasta || "";
}

function cxcRango() {
  const izq = cxcOpcionesIzq();
  const base = cxcTiempoSel || cxcOpcionesDer(cxcMesSel || izq.find((x) => x.tipo === "mes") || izq[0])[0];
  if (base.modo !== "personalizado") return base;
  const desde = $("cxc-desde")?.value || base.desde;
  const hasta = $("cxc-hasta")?.value || base.hasta;
  return { ...base, desde, hasta, label: cxcLabelRango(desde, hasta) };
}

function cxcPeriodoTexto() {
  return cxcRango().label;
}

function cxcRangoValido() {
  const rango = cxcRango();
  if (!rango.desde || !rango.hasta) {
    avisar("Faltan fechas", "Poné desde y hasta para el rango personalizado.", [], { error: true });
    return null;
  }
  if (rango.desde > rango.hasta) {
    avisar("Rango al revés", "La fecha de inicio no puede ser después de la de fin.", [], { error: true });
    return null;
  }
  return rango;
}

let cxcBucleCorriendo = null;

function cxcGuardarSiHayBucle() {
  pintarEstadoBucle();
}

function iniciarFiltrosCxc() {
  if (!$("drop-cxc-mes")) return;
  const izq = cxcOpcionesIzq();
  if (!cxcMesSel) cxcMesSel = izq.find((x) => x.tipo === "mes") || izq[0];
  else {
    cxcMesSel = izq.find((x) => (
      (cxcMesSel.tipo === "anio" && x.tipo === "anio")
      || (x.tipo === "mes" && x.year === cxcMesSel.year && x.month === cxcMesSel.month)
    )) || cxcMesSel;
  }
  const armarTiempo = (reset) => {
    const esAnio = cxcMesSel.tipo === "anio";
    if ($("cxc-tiempo-etiqueta")) $("cxc-tiempo-etiqueta").textContent = esAnio ? "Año" : "Tiempo";
    const ops = cxcOpcionesDer(cxcMesSel);
    if (reset || !cxcTiempoSel) cxcTiempoSel = ops[0];
    else {
      cxcTiempoSel = ops.find((o) => o.modo === cxcTiempoSel.modo && o.desde === cxcTiempoSel.desde)
        || ops.find((o) => o.label === cxcTiempoSel.label)
        || ops[0];
    }
    cxcMostrarRango(cxcTiempoSel);
    armarDrop("drop-cxc-tiempo", ops.map((o) => o.label), cxcTiempoSel.label, (valor) => {
      cxcTiempoSel = ops.find((o) => o.label === valor) || ops[0];
      cxcMostrarRango(cxcTiempoSel);
      cxcGuardarSiHayBucle();
    }, { arriba: true });
  };
  armarDrop("drop-cxc-mes", izq.map((m) => m.label), cxcMesSel.label, (valor) => {
    cxcMesSel = izq.find((m) => m.label === valor) || izq[0];
    armarTiempo(true);
    cxcGuardarSiHayBucle();
  }, { arriba: true });
  armarTiempo(false);
  if (!$("drop-cxc-monto")) return;
  const monto = CXC_MONTO.find((o) => o.id === cxcMontoSel) || CXC_MONTO[0];
  const pide = cxcMontoSel === "menos" || cxcMontoSel === "mas";
  $("cxc-monto-caja")?.classList.toggle("oculto", !pide);
  if ($("cxc-monto-valor-etiqueta")) {
    $("cxc-monto-valor-etiqueta").textContent = cxcMontoSel === "menos" ? "Menos de" : "Más de";
  }
  armarDrop("drop-cxc-monto", CXC_MONTO.map((o) => o.label), monto.label, (valor) => {
    cxcMontoSel = (CXC_MONTO.find((o) => o.label === valor) || CXC_MONTO[0]).id;
    const pideMonto = cxcMontoSel === "menos" || cxcMontoSel === "mas";
    $("cxc-monto-caja")?.classList.toggle("oculto", !pideMonto);
    if ($("cxc-monto-valor-etiqueta")) {
      $("cxc-monto-valor-etiqueta").textContent = cxcMontoSel === "menos" ? "Menos de" : "Más de";
    }
    pintarCxc();
    cxcGuardarSiHayBucle();
  }, { arriba: true });
  if ($("cxc-monto-valor")) {
    $("cxc-monto-valor").oninput = () => {
      pintarCxc();
      cxcGuardarSiHayBucle();
    };
  }
  if ($("cxc-desde")) $("cxc-desde").onchange = () => cxcGuardarSiHayBucle();
  if ($("cxc-hasta")) $("cxc-hasta").onchange = () => cxcGuardarSiHayBucle();
  if ($("cxc-solo-pendiente")) $("cxc-solo-pendiente").onchange = () => cxcGuardarSiHayBucle();
}

function cxcMontoTexto() {
  if (cxcMontoSel === "cero") return "saldo 0";
  if (cxcMontoSel === "negativo") return "saldo negativo";
  const n = String($("cxc-monto-valor")?.value || "").trim();
  if (cxcMontoSel === "menos") return n ? `menos de ${n}` : "menos de (sin monto)";
  if (cxcMontoSel === "mas") return n ? `más de ${n}` : "más de (sin monto)";
  return "todos los montos";
}

function cxcBucleCuerpo() {
  const rango = cxcRango() || {};
  return {
    cada: cxcBucleSel,
    dia: cxcBucleDia,
    hora: $("cxc-bucle-hora")?.value || "08:00",
    origen: cxcBucleOrigen,
    periodo: rango.modo || "anio",
    desde: rango.desde || "",
    hasta: rango.hasta || "",
    periodo_texto: rango.label || "",
    solo_pendiente: Boolean($("cxc-solo-pendiente")?.checked),
    monto_sel: cxcMontoSel || "todos",
    monto_valor: $("cxc-monto-valor")?.value || "",
  };
}

function cxcFmtProxima(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-CR", {
    weekday: "long", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function pintarCajaBucle() {
  const pide = cxcBucleSel !== "no";
  $("cxc-bucle-caja")?.classList.toggle("oculto", !pide || cxcBucleSel === "hora");
  $("cxc-bucle-dia-caja")?.classList.toggle("oculto", cxcBucleSel !== "semana" && cxcBucleSel !== "mes");
  $("cxc-bucle-hora-caja")?.classList.toggle("oculto", cxcBucleSel === "hora" || !pide);
}

function armarDiaBucle() {
  if (!$("drop-cxc-bucle-dia")) return;
  const esMes = cxcBucleSel === "mes";
  const ops = esMes ? Array.from({ length: 31 }, (_, i) => String(i + 1)) : CXC_DIAS;
  if (esMes && (cxcBucleDia < 1 || cxcBucleDia > 31)) cxcBucleDia = 1;
  if (!esMes && (cxcBucleDia < 0 || cxcBucleDia > 6)) cxcBucleDia = 0;
  const inicial = esMes ? String(cxcBucleDia || 1) : (CXC_DIAS[cxcBucleDia] || CXC_DIAS[0]);
  armarDrop("drop-cxc-bucle-dia", ops, inicial, (valor) => {
    cxcBucleDia = esMes ? Number(valor) : CXC_DIAS.indexOf(valor);
    if (cxcBucleDia < 0) cxcBucleDia = 0;
    pintarEstadoBucle();
  }, { arriba: true });
}

function cxcBucleDifiere() {
  const corriendo = cxcBucleCorriendo;
  if (!corriendo?.activo) return cxcBucleSel !== "no";
  const cuerpo = cxcBucleCuerpo();
  return cuerpo.cada !== (corriendo.cada || "no")
    || Number(cuerpo.dia) !== Number(corriendo.dia || 0)
    || String(cuerpo.hora || "") !== String(corriendo.hora || "08:00")
    || String(cuerpo.periodo || "") !== String(corriendo.periodo || "")
    || String(cuerpo.desde || "") !== String(corriendo.desde || "")
    || String(cuerpo.hasta || "") !== String(corriendo.hasta || "")
    || String(cuerpo.monto_sel || "todos") !== String(corriendo.monto_sel || "todos")
    || String(cuerpo.monto_valor || "") !== String(corriendo.monto_valor || "")
    || Boolean(cuerpo.solo_pendiente) !== Boolean(corriendo.solo_pendiente);
}

function pintarEstadoBucle() {
  const boton = $("cxc-bucle-confirmar");
  const pide = cxcBucleSel !== "no" && cxcBucleDifiere();
  boton?.classList.toggle("oculto", !pide);
  if (!cxcBucleCorriendo?.activo) {
    const p = $("cxc-bucle-resumen");
    if (p) p.textContent = pide ? "Todavía no envía. Confirmá el inicio para que salga a esa hora." : "";
    return;
  }
  if (pide) {
    const p = $("cxc-bucle-resumen");
    if (p) p.textContent = "Sigue el bucle ya confirmado. Estos cambios no salen hasta que confirmes de nuevo.";
    return;
  }
  mostrarResumenBucle(cxcBucleCorriendo);
}

function mostrarResumenBucle(datos) {
  const p = $("cxc-bucle-resumen");
  if (!p) return;
  if (!datos?.activo) {
    p.textContent = "";
    return;
  }
  const cuando = cxcFmtProxima(datos.proxima);
  const filtros = datos.filtros || [cxcPeriodoTexto(), cxcMontoTexto()].filter(Boolean).join(" · ");
  p.textContent = `${datos.texto || "Bucle activo"}${filtros ? ` · ${filtros}` : ""}. Envía el correo (PDF y listado) a esas cuentas${cuando ? ` · próxima ${cuando}` : ""}.`;
  if (datos.error) p.textContent += ` Último error: ${datos.error}`;
}

async function guardarBucleCxc(confirmar) {
  if (!$("drop-cxc-bucle")) return null;
  const datos = await cxcLeer(await fetch("/api/cxc/bucle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...cxcBucleCuerpo(), confirmar: Boolean(confirmar) }),
  }));
  cxcBucleCorriendo = datos.activo ? datos : null;
  pintarBucleGlobal(datos);
  mostrarResumenBucle(datos);
  pintarEstadoBucle();
  return datos;
}

async function confirmarInicioBucle() {
  if (cxcBucleSel === "no") return;
  if ((cxcMontoSel === "menos" || cxcMontoSel === "mas") && !String($("cxc-monto-valor")?.value || "").trim()) {
    avisar("Falta el monto", "Poné la cantidad de Más de / Menos de antes de confirmar el bucle.", [], { error: true });
    return;
  }
  const boton = $("cxc-bucle-confirmar");
  if (boton) boton.disabled = true;
  try {
    await guardarBucleCxc(true);
    mostrarToast("Bucle confirmado", "A esa hora se envían los estados de cuenta. Arriba a la derecha queda marcado.");
  } catch (err) {
    avisar("No se pudo iniciar", err.message || "No se pudo hablar con el servidor.", [], { error: true });
  } finally {
    if (boton) boton.disabled = false;
  }
}

function cxcSelDesdePlan(plan) {
  if (!plan) return;
  if (plan.solo_pendiente != null && $("cxc-solo-pendiente")) {
    $("cxc-solo-pendiente").checked = Boolean(plan.solo_pendiente);
  }
  if (plan.monto_sel) cxcMontoSel = plan.monto_sel;
  if ($("cxc-monto-valor") && plan.monto_valor != null && plan.monto_valor !== "") {
    $("cxc-monto-valor").value = plan.monto_valor;
  }
  const desde = String(plan.desde || "");
  const [y, m] = desde.split("-").map(Number);
  const izq = cxcOpcionesIzq();
  if (plan.periodo === "anio") {
    cxcMesSel = izq.find((x) => x.tipo === "anio") || izq[0];
    const ops = cxcOpcionesDer(cxcMesSel);
    cxcTiempoSel = ops.find((o) => o.desde && o.desde.startsWith(String(y || ""))) || ops[0];
  } else if (y && m) {
    cxcMesSel = izq.find((x) => x.tipo === "mes" && x.year === y && x.month === m - 1)
      || izq.find((x) => x.tipo === "mes")
      || izq[0];
    const ops = cxcOpcionesDer(cxcMesSel);
    if (plan.periodo === "personalizado") {
      cxcTiempoSel = ops.find((o) => o.modo === "personalizado") || ops[ops.length - 1];
      if ($("cxc-desde")) $("cxc-desde").value = plan.desde || "";
      if ($("cxc-hasta")) $("cxc-hasta").value = plan.hasta || "";
    } else {
      cxcTiempoSel = ops.find((o) => o.desde === plan.desde && o.hasta === plan.hasta) || ops[0];
    }
  }
}

function pintarDropBucle() {
  const actual = CXC_BUCLE.find((o) => o.id === cxcBucleSel) || CXC_BUCLE[0];
  armarDrop("drop-cxc-bucle", CXC_BUCLE.map((o) => o.label), actual.label, onBucleCxcElegir, { arriba: true });
}

async function onBucleCxcElegir(valor) {
  const nuevo = (CXC_BUCLE.find((o) => o.label === valor) || CXC_BUCLE[0]).id;
  cxcBucleSel = nuevo;
  if (cxcBucleSel === "mes" && (cxcBucleDia < 1 || cxcBucleDia > 31)) cxcBucleDia = 1;
  if (cxcBucleSel === "semana" && (cxcBucleDia < 0 || cxcBucleDia > 6)) cxcBucleDia = 0;
  pintarCajaBucle();
  armarDiaBucle();
  if (cxcBucleSel === "no") {
    if (cxcBucleCorriendo?.activo) {
      try {
        await guardarBucleCxc(false);
      } catch (err) {
        if ($("cxc-bucle-resumen")) $("cxc-bucle-resumen").textContent = err.message || "No se pudo apagar el bucle.";
      }
    } else {
      cxcBucleCorriendo = null;
      pintarBucleGlobal({ activo: false });
      pintarEstadoBucle();
    }
    return;
  }
  pintarEstadoBucle();
}

async function iniciarBucleCxc() {
  if (!$("drop-cxc-bucle")) return;
  let guardado = { cada: "no", dia: 0, hora: "08:00", activo: false };
  try {
    guardado = await cxcLeer(await fetch("/api/cxc/bucle"));
  } catch {
    /* primera vez */
  }
  cxcBucleSel = guardado.activo ? (guardado.cada || "no") : "no";
  cxcBucleDia = Number(guardado.dia || 0);
  cxcBucleOrigen = guardado.origen || "zoho";
  cxcBucleCorriendo = guardado.activo ? guardado : null;
  if ($("cxc-bucle-hora")) $("cxc-bucle-hora").value = guardado.hora || "08:00";
  if (guardado.activo) cxcSelDesdePlan(guardado);
  iniciarFiltrosCxc();
  pintarDropBucle();
  pintarCajaBucle();
  armarDiaBucle();
  if ($("cxc-bucle-hora")) $("cxc-bucle-hora").onchange = () => pintarEstadoBucle();
  pintarBucleGlobal(guardado);
  pintarEstadoBucle();
}

if ($("cxc-bucle-confirmar")) $("cxc-bucle-confirmar").onclick = () => confirmarInicioBucle();

async function cxcLeer(respuesta) {
  const texto = await respuesta.text();
  let datos = {};
  try {
    datos = texto ? JSON.parse(texto) : {};
  } catch {
    const html = /<!DOCTYPE|<html[\s>]/i.test(texto || "");
    const corte = [502, 504, 520, 521, 522, 523, 524, 525, 526, 530].includes(respuesta.status);
    const extra = (html || corte)
      ? "La espera se cortó (no es un error de Zoho). Volvé a intentar; si es una foto, a veces tarda un rato."
      : ((texto || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || `Error ${respuesta.status}`);
    throw new Error(extra);
  }
  if (!respuesta.ok || datos.ok === false) {
    throw new Error(datos.mensaje || `Error ${respuesta.status}`);
  }
  return datos;
}

async function esperarTrabajoCxc(mensaje) {
  while (true) {
    await new Promise((r) => setTimeout(r, 800));
    const st = await cxcLeer(await fetch("/api/cxc/trabajo"));
    pintarCxcLeyendo(st.activo ? st : { activo: false });
    if (st.activo) continue;
    if (st.error) throw new Error(st.error);
    if (!st.datos || !st.datos.ok) throw new Error((st.datos && st.datos.mensaje) || mensaje);
    return st.datos;
  }
}

function cxcEtiqueta(estado) {
  return {
    listo: "Lista para enviar correo + PDF + listado",
    cambiar: "Al confirmar, se guarda este correo en CXC",
    igual: "Ese correo ya está en CXC",
    sin_cuenta: "No encontramos esa empresa en Zoho",
    sin_correo: "No hay correo para enviar",
    sin_campo: "Esa cuenta no tiene el campo CXC",
  }[estado] || estado;
}

function cxcPlata(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cxcVerCelda(texto, alClick) {
  const td = crear("td", "cxc-ver-td");
  if (!alClick) {
    td.textContent = "—";
    return td;
  }
  const btn = crear("button", "cxc-ver", texto);
  btn.type = "button";
  btn.onclick = alClick;
  td.append(btn);
  return td;
}

async function verPdfCxc(fila) {
  const rango = cxcRango();
  const q = new URLSearchParams({
    id: fila.contact_id,
    empresa: fila.cuenta || fila.empresa || "",
    periodo: rango.modo || "mes",
    desde: rango.desde,
    hasta: rango.hasta,
  });
  try {
    const respuesta = await fetch(`/api/cxc/pdf?${q}`);
    const tipo = respuesta.headers.get("content-type") || "";
    if (!respuesta.ok || !tipo.includes("pdf")) {
      const datos = await respuesta.json().catch(() => ({}));
      avisar("No se pudo abrir el PDF", datos.mensaje || "Zoho no devolvió el estado de cuenta.", [], { error: true });
      return;
    }
    const blob = await respuesta.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
  } catch {
    avisar("No se pudo abrir el PDF", "No se pudo hablar con el servidor.", [], { error: true });
  }
}

async function verListadoCxc(fila) {
  $("cxc-listado-titulo").textContent = fila.cuenta || fila.empresa || "Listado pendiente";
  $("cxc-listado-resumen").textContent = "Cargando facturas pendientes…";
  $("cxc-listado-filas").innerHTML = "";
  $("cxc-listado-modal").classList.remove("oculto");
  try {
    const rango = cxcRango();
    const respuesta = await fetch(`/api/cxc/listado?id=${encodeURIComponent(fila.contact_id)}&periodo=${encodeURIComponent(rango.modo || "mes")}&desde=${encodeURIComponent(rango.desde)}&hasta=${encodeURIComponent(rango.hasta)}`);
    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.ok) {
      $("cxc-listado-resumen").textContent = datos.mensaje || "No se pudo leer el listado.";
      return;
    }
    const n = (datos.facturas || []).length;
    $("cxc-listado-resumen").textContent = `${datos.cuenta || fila.cuenta || "Esta empresa"} · ${datos.periodo_texto || cxcPeriodoTexto()} · de ${datos.desde || ""} a ${datos.hasta || ""} · solo pendiente · ${n} factura${n === 1 ? "" : "s"}`;
    const cuerpo = $("cxc-listado-filas");
    if (!n) {
      const tr = crear("tr");
      const td = crear("td", "", "No hay facturas pendientes en Zoho para esta empresa.");
      td.colSpan = 6;
      tr.append(td);
      cuerpo.append(tr);
      return;
    }
    datos.facturas.forEach((fac) => {
      const tr = crear("tr");
      tr.append(
        crear("td", "", fac.numero || "—"),
        crear("td", "", fac.fecha || "—"),
        crear("td", "", fac.vence || "—"),
        crear("td", "", cxcPlata(fac.total)),
        crear("td", "", cxcPlata(fac.saldo)),
        crear("td", "", fac.estado || "—"),
      );
      cuerpo.append(tr);
    });
  } catch {
    $("cxc-listado-resumen").textContent = "No se pudo hablar con el servidor.";
  }
}

function cxcChecks() {
  return [...document.querySelectorAll("#cxc-filas input[type=checkbox]:not(:disabled)")];
}

function cxcReflejarTodas() {
  const todas = $("cxc-marcar-todas");
  if (!todas) return;
  const checks = cxcChecks();
  const n = checks.filter((c) => c.checked).length;
  todas.disabled = checks.length === 0;
  todas.checked = checks.length > 0 && n === checks.length;
  todas.indeterminate = n > 0 && n < checks.length;
}

function cxcSaldo(fila) {
  const n = Number(fila && fila.saldo);
  return Number.isFinite(n) ? n : 0;
}

function cxcFilasVisibles() {
  const tope = Number($("cxc-monto-valor")?.value);
  return cxcFilas
    .map((fila, i) => ({ fila, i }))
    .filter(({ fila }) => {
      const n = cxcSaldo(fila);
      if (cxcMontoSel === "cero") return n === 0;
      if (cxcMontoSel === "negativo") return n < 0;
      if (cxcMontoSel === "menos") {
        if (String($("cxc-monto-valor")?.value || "") === "") return true;
        return Number.isFinite(tope) && n < tope;
      }
      if (cxcMontoSel === "mas") {
        if (String($("cxc-monto-valor")?.value || "") === "") return true;
        return Number.isFinite(tope) && n > tope;
      }
      return true;
    });
}

function pintarCxc() {
  const cuerpo = $("cxc-filas");
  if (!cuerpo) return;
  cuerpo.innerHTML = "";
  cxcFilasVisibles().forEach(({ fila, i }) => {
    const tr = crear("tr");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.dataset.i = String(i);
    check.checked = fila.estado === "cambiar" || fila.estado === "igual" || fila.estado === "listo";
    if (!fila.contact_id) check.disabled = true;
    check.onchange = cxcReflejarTodas;
    const tdCheck = crear("td", "cxc-check-td");
    const casilla = crear("label", "cxc-fila-check");
    casilla.append(check, document.createElement("span"));
    tdCheck.append(casilla);
    const clase = (fila.estado === "cambiar") ? "cxc-estado-cambiar" : ((fila.estado === "igual" || fila.estado === "listo") ? "cxc-estado-igual" : "cxc-estado-mal");
    tr.append(
      tdCheck,
      crear("td", "", fila.empresa || fila.identificacion || `fila ${fila.fila}`),
      crear("td", "", fila.cuenta || "—"),
      crear("td", "", fila.oficial || "—"),
      crear("td", "", fila.cxc_actual || "—"),
      crear("td", "", fila.correo || "—"),
      crear("td", "", cxcPlata(cxcSaldo(fila))),
      crear("td", clase, fila.aviso ? `${cxcEtiqueta(fila.estado)}. ${fila.aviso}` : cxcEtiqueta(fila.estado)),
      cxcVerCelda("Ver PDF", fila.contact_id ? () => verPdfCxc(fila) : null),
      cxcVerCelda("Ver listado", fila.contact_id ? () => verListadoCxc(fila) : null),
    );
    cuerpo.append(tr);
  });
  cxcReflejarTodas();
}

function cxcMarcadas() {
  return [...document.querySelectorAll("#cxc-filas input[type=checkbox]:checked")]
    .map((el) => cxcFilas[Number(el.dataset.i)])
    .filter(Boolean);
}

function mostrarPreviaCxc(datos) {
  pintarCxcLeyendo({ activo: false });
  cxcFilas = datos.filas || [];
  const r = datos.resumen || {};
  const cambiar = r.cambiar || 0;
  const listo = r.listo || cxcFilas.filter((f) => f.estado === "listo").length;
  const conCuenta = cxcFilas.filter((f) => f.contact_id).length;
  const sinCuenta = r.sin_cuenta || 0;
  const deZoho = r.origen === "zoho";
  $("cxc-estado").classList.remove("oculto");
  if (deZoho) {
    $("cxc-estado").textContent = conCuenta
      ? `Vista previa: ${conCuenta} cuenta${conCuenta === 1 ? "" : "s"} de Zoho. El envío es un solo correo con PDF y listado. Todavía no se mandó nada.`
      : "Vista previa: Zoho no trajo cuentas con ese filtro.";
  } else {
    $("cxc-estado").textContent = cambiar
      ? `Vista previa: ${cambiar} cuenta${cambiar === 1 ? "" : "s"} listas para guardar el correo CXC. Todavía no se escribió nada.`
      : `Vista previa: leímos ${r.total || 0} empresas${conCuenta ? ` y ${conCuenta} coincidieron en Zoho` : " y ninguna coincidió con Zoho"}.`;
  }
  $("cxc-resumen").classList.remove("oculto");
  const extra = (r.avisos && r.avisos.length) ? ` ${r.avisos.join(" ")}` : "";
  $("cxc-resumen").textContent = (
    sinCuenta ? `${sinCuenta} no se encontraron en Zoho. ` : ""
  ) + `El correo lleva PDF y listado juntos · ${r.periodo_texto || cxcPeriodoTexto()} · de ${r.desde || ""} a ${r.hasta || ""} · solo pendiente.` + extra;
  $("cxc-tabla-caja").classList.remove("oculto");
  $("cxc-acciones").classList.toggle("oculto", conCuenta === 0);
  $("cxc-aplicar").classList.toggle("oculto", !cxcFilas.some((f) => f.contact_id && f.correo));
  pintarCxc();
}

function mostrarArchivoCxc(archivo, meta) {
  if (!$("cxc-drop-archivo")) return;
  $("cxc-drop").classList.add("con-archivo");
  $("cxc-drop-vacio").classList.add("oculto");
  $("cxc-drop-archivo").classList.remove("oculto");
  $("cxc-drop-nombre").textContent = archivo.name || "archivo";
  $("cxc-drop-meta").textContent = meta || "";
  const esFoto = String(archivo.type || "").startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(archivo.name || "");
  const thumb = $("cxc-drop-thumb");
  const icono = $("cxc-drop-icono");
  if (thumb.dataset.url) {
    URL.revokeObjectURL(thumb.dataset.url);
    delete thumb.dataset.url;
  }
  thumb.removeAttribute("src");
  thumb.classList.add("oculto");
  icono.textContent = esFoto ? "foto" : (/\.csv$/i.test(archivo.name || "") ? "csv" : "xlsx");
  icono.classList.remove("oculto");
}

function nombreJpg(nombre) {
  return String(nombre || "foto").replace(/\.[^.]+$/, "") + ".jpg";
}

async function achicarFoto(archivo) {
  if (!archivo || archivo.size < 350000) return archivo;
  let bitmap;
  try {
    bitmap = await createImageBitmap(archivo, { resizeWidth: 1600, resizeQuality: "medium" });
  } catch {
    try {
      bitmap = await createImageBitmap(archivo);
    } catch {
      return archivo;
    }
  }
  const maxLado = 1600;
  const lado = Math.max(bitmap.width, bitmap.height);
  const escala = lado > maxLado ? maxLado / lado : 1;
  const w = Math.max(1, Math.round(bitmap.width * escala));
  const h = Math.max(1, Math.round(bitmap.height * escala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d", { alpha: false }).drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.8));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return archivo;
  return new File([blob], nombreJpg(archivo.name), { type: "image/jpeg" });
}

async function subirCxc(archivo) {
  if (!archivo) return;
  const esFoto = String(archivo.type || "").startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(archivo.name || "");
  cxcBucleOrigen = "excel";
  mostrarArchivoCxc(archivo, esFoto ? "Foto · preparando…" : "Excel · leyendo y buscando en Zoho…");
  $("cxc-estado").classList.add("oculto");
  pintarCxcLeyendo({
    activo: true,
    tipo: "cxc-lectura",
    archivo: archivo.name,
    texto: esFoto ? "Achicando la foto…" : "Leyendo el archivo…",
  });
  $("cxc-tabla-caja").classList.add("oculto");
  $("cxc-resumen").classList.add("oculto");
  $("cxc-acciones").classList.add("oculto");
  let mandar = archivo;
  if (esFoto) {
    await new Promise((r) => setTimeout(r, 0));
    mandar = await achicarFoto(archivo);
    $("cxc-drop-meta").textContent = "Foto · leyendo y buscando en Zoho…";
    pintarCxcLeyendo({
      activo: true,
      tipo: "cxc-lectura",
      archivo: archivo.name,
      texto: "Leyendo la foto…",
    });
  }
  const form = new FormData();
  form.append("archivo", mandar, mandar.name);
  try {
    const rango = cxcRangoValido();
    if (!rango) return;
    const respuesta = await fetch(`/api/cxc/previa?periodo=${encodeURIComponent(rango.modo || "mes")}&desde=${encodeURIComponent(rango.desde)}&hasta=${encodeURIComponent(rango.hasta)}`, { method: "POST", body: form });
    let datos = await cxcLeer(respuesta);
    if (datos.trabajo) datos = await esperarTrabajoCxc("Leyendo el archivo y buscando las cuentas en Zoho…");
    $("cxc-drop-meta").textContent = esFoto ? "Foto cargada" : "Excel cargado";
    pintarCxcLeyendo({ activo: false });
    mostrarPreviaCxc(datos);
  } catch (error) {
    $("cxc-drop-meta").textContent = "No se pudo leer";
    pintarCxcLeyendo({ activo: false });
    $("cxc-estado").classList.remove("oculto");
    $("cxc-estado").textContent = error.message || "No se pudo leer el archivo.";
    $("cxc-tabla-caja")?.classList.add("oculto");
    $("cxc-acciones")?.classList.add("oculto");
    avisar(
      "No se pudo leer el archivo",
      error.message || "Ese archivo no tiene datos ni columnas válidas para estados de cuenta. Se necesita el nombre de la empresa y un correo.",
      [],
      { error: true },
    );
  }
}

async function filtrarCxcZoho() {
  $("cxc-estado").classList.add("oculto");
  pintarCxcLeyendo({
    activo: true,
    tipo: "cxc-filtro",
    archivo: "clientes de Zoho",
    texto: "Buscando en Zoho las cuentas con ese filtro…",
  });
  $("cxc-tabla-caja").classList.add("oculto");
  $("cxc-resumen").classList.add("oculto");
  $("cxc-acciones").classList.add("oculto");
  $("cxc-filtrar").disabled = true;
  cxcBucleOrigen = "zoho";
  try {
    const rango = cxcRangoValido();
    if (!rango) {
      pintarCxcLeyendo({ activo: false });
      return;
    }
    const respuesta = await fetch("/api/cxc/filtrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        periodo: rango.modo || "mes",
        desde: rango.desde,
        hasta: rango.hasta,
        periodo_texto: rango.label,
        solo_pendiente: Boolean($("cxc-solo-pendiente")?.checked),
      }),
    });
    let datos = await cxcLeer(respuesta);
    if (datos.trabajo) datos = await esperarTrabajoCxc("Cargando cuentas de Zoho…");
    mostrarPreviaCxc(datos);
  } catch (error) {
    pintarCxcLeyendo({ activo: false });
    $("cxc-estado").classList.remove("oculto");
    $("cxc-estado").textContent = error.message || "No se pudo hablar con el servidor.";
  } finally {
    $("cxc-filtrar").disabled = false;
  }
}

iniciarFiltrosCxc();
if ($("cxc-filtrar")) $("cxc-filtrar").onclick = filtrarCxcZoho;

function quitarArchivoCxc() {
  const thumb = $("cxc-drop-thumb");
  if (thumb?.dataset.url) {
    URL.revokeObjectURL(thumb.dataset.url);
    delete thumb.dataset.url;
    thumb.removeAttribute("src");
  }
  if ($("cxc-archivo")) $("cxc-archivo").value = "";
  $("cxc-drop")?.classList.remove("con-archivo");
  $("cxc-drop-archivo")?.classList.add("oculto");
  $("cxc-drop-vacio")?.classList.remove("oculto");
  $("cxc-drop-thumb")?.classList.add("oculto");
  $("cxc-drop-icono")?.classList.add("oculto");
  cxcFilas = [];
  $("cxc-tabla-caja")?.classList.add("oculto");
  $("cxc-resumen")?.classList.add("oculto");
  $("cxc-acciones")?.classList.add("oculto");
  $("cxc-estado")?.classList.add("oculto");
  $("cxc-estado").textContent = "";
  pintarCxcLeyendo({ activo: false });
}

if ($("cxc-archivo")) {
  const drop = $("cxc-drop");
  $("cxc-archivo").onchange = (e) => subirCxc(e.target.files && e.target.files[0]);
  drop.addEventListener("click", (e) => {
    if (e.target.closest("#cxc-quitar")) return;
    $("cxc-archivo").click();
  });
  $("cxc-quitar")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    quitarArchivoCxc();
  });
  ["dragenter", "dragover"].forEach((ev) => {
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("sobre"); });
  });
  ["dragleave", "drop"].forEach((ev) => {
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("sobre"); });
  });
  drop.addEventListener("drop", (e) => {
    const archivo = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    subirCxc(archivo);
  });
}

function cerrarListadoCxc() {
  $("cxc-listado-modal")?.classList.add("oculto");
}
if ($("cxc-listado-cerrar")) $("cxc-listado-cerrar").onclick = cerrarListadoCxc;
if ($("cxc-listado-modal")) {
  $("cxc-listado-modal").onclick = (e) => {
    if (e.target.id === "cxc-listado-modal") cerrarListadoCxc();
  };
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("cxc-listado-modal") && !$("cxc-listado-modal").classList.contains("oculto")) {
    cerrarListadoCxc();
  }
});

async function ponerCxcFilas(filas) {
  const listas = filas.filter((f) => f.contact_id && f.correo);
  if (!listas.length) {
    avisar("Nada para escribir", "Marcá al menos una cuenta con correo CXC. Esto solo guarda el mail, no manda el estado de cuenta.");
    return;
  }
  const ok = await confirmarAviso(
    "Poner correo CXC",
    `Se va a guardar el correo CXC en ${listas.length} cuenta${listas.length === 1 ? "" : "s"} de Zoho. El correo oficial no se toca y no se envía ningún estado de cuenta.`,
    listas.slice(0, 8).map((f) => `${f.cuenta || f.empresa}: ${f.cxc_actual || "vacío"} → ${f.correo}`),
    "Sí, poner CXC",
  );
  if (!ok) return;
  if ($("cxc-aplicar")) $("cxc-aplicar").disabled = true;
  $("cxc-estado").classList.remove("oculto");
  $("cxc-estado").textContent = "Aplicando correos CXC en Zoho…";
  try {
    const respuesta = await fetch("/api/cxc/aplicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filas: listas.map((f) => ({ ...f, estado: "cambiar" })) }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok === false) {
      const extra = (datos.fallos || []).slice(0, 6);
      avisar("No se pudo escribir", datos.mensaje || "Zoho no guardó los correos CXC. El campo sigue como estaba.", extra, { error: true });
      $("cxc-estado").textContent = datos.mensaje || "No se pudo escribir.";
      return;
    }
    let final = datos;
    if (datos.trabajo) {
      const fin = await esperarFinTrabajoCxc();
      final = fin.cxc_resultado || {};
    }
    if (!final.ok || !final.cambiados) {
      const extra = (final.fallos || []).slice(0, 6);
      avisar("No se pudo escribir", final.mensaje || "Zoho no guardó los correos CXC. El campo sigue como estaba.", extra, { error: true });
      $("cxc-estado").textContent = final.mensaje || "No se pudo escribir.";
      return;
    }
    $("cxc-estado").textContent = `Listo: ${final.cambiados} CXC escritos. No se envió ningún estado de cuenta.`;
    listas.forEach((f) => { f.cxc_actual = f.correo; f.estado = "igual"; });
    pintarCxc();
  } catch {
    avisar("No se pudo escribir", "No se pudo hablar con el servidor.", [], { error: true });
  } finally {
    if ($("cxc-aplicar")) $("cxc-aplicar").disabled = false;
  }
}

async function esperarFinTrabajoCxc() {
  while (true) {
    await new Promise((r) => setTimeout(r, 800));
    const st = await (await fetch("/api/trabajo")).json();
    pintarTrabajoCard(st);
    if (!st.activo) return st;
  }
}

if ($("cxc-marcar-todas")) {
  $("cxc-marcar-todas").onchange = () => {
    const on = $("cxc-marcar-todas").checked;
    cxcChecks().forEach((c) => { c.checked = on; });
    cxcReflejarTodas();
  };
}

if ($("cxc-aplicar")) {
  $("cxc-aplicar").onclick = () => ponerCxcFilas(cxcMarcadas());
}

if ($("cxc-enviar")) {
  $("cxc-enviar").onclick = async () => {
    const filas = cxcMarcadas().filter((f) => f.contact_id);
    if (!filas.length) {
      avisar("Nada para enviar", "Marcá al menos una cuenta que haya coincidido en Zoho.");
      return;
    }
    const ok = await confirmarAviso(
      "Enviar estados de cuenta",
      `Un solo correo por cuenta, con el PDF y el listado de pendientes juntos. El mensaje es el de la plantilla. Van ${filas.length} cuenta${filas.length === 1 ? "" : "s"} · ${cxcPeriodoTexto()}. Va al correo oficial y al CXC.`,
      filas.slice(0, 8).map((f) => `${f.cuenta || f.empresa} · ${[f.oficial, f.correo || f.cxc_actual].filter(Boolean).join(" · ")}`),
      "Sí, enviar",
    );
    if (!ok) return;
    $("cxc-enviar").disabled = true;
    $("cxc-estado").classList.remove("oculto");
    $("cxc-estado").textContent = "Enviando estados de cuenta…";
    try {
      const respuesta = await fetch("/api/cxc/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_ids: filas.map((f) => f.contact_id),
          periodo: cxcRango().modo || "mes",
          desde: cxcRango().desde,
          hasta: cxcRango().hasta,
        }),
      });
      let datos = await respuesta.json();
      if (!respuesta.ok || datos.ok === false) {
        avisar("No se pudo enviar", datos.mensaje || "Zoho no mandó los correos.", [], { error: true });
        $("cxc-estado").textContent = datos.mensaje || "No se pudo enviar.";
        return;
      }
      if (datos.trabajo) {
        const fin = await esperarFinTrabajoCxc();
        datos = fin.cxc_resultado || {};
      }
      if (!datos.ok && datos.ok !== undefined) {
        avisar("No se pudo enviar", datos.mensaje || "Zoho no mandó los correos.", [], { error: true });
        $("cxc-estado").textContent = datos.mensaje || "No se pudo enviar.";
        return;
      }
      mostrarToast("Estados de cuenta enviados", `${datos.enviados || 0} enviados${datos.errores ? ` · ${datos.errores} error` : ""}`);
      $("cxc-estado").textContent = `Listo: ${datos.enviados || 0} enviados${datos.errores ? `, ${datos.errores} con error` : ""}.`;
    } catch {
      avisar("No se pudo enviar", "No se pudo hablar con el servidor.", [], { error: true });
    } finally {
      $("cxc-enviar").disabled = false;
    }
  };
}

function cerrarPlantillaCxc() {
  $("cxc-plantilla-modal")?.classList.add("oculto");
}

async function abrirPlantillaCxc() {
  const modal = $("cxc-plantilla-modal");
  if (!modal) return;
  let datos = CXC_PLANTILLA_DEFECTO;
  try {
    datos = await cxcLeer(await fetch("/api/cxc/plantilla"));
  } catch {
    /* usa el texto por defecto */
  }
  if ($("cxc-plantilla-asunto")) $("cxc-plantilla-asunto").value = datos.asunto || CXC_PLANTILLA_DEFECTO.asunto;
  if ($("cxc-plantilla-cuerpo")) $("cxc-plantilla-cuerpo").value = datos.cuerpo || CXC_PLANTILLA_DEFECTO.cuerpo;
  modal.classList.remove("oculto");
  $("cxc-plantilla-cuerpo")?.focus();
}

async function guardarPlantillaCxc() {
  const asunto = ($("cxc-plantilla-asunto")?.value || "").trim();
  const cuerpo = ($("cxc-plantilla-cuerpo")?.value || "").trim();
  if (!cuerpo) {
    avisar("Falta el mensaje", "Escribí el texto que se va a pegar en todos los correos.", [], { error: true });
    return;
  }
  try {
    await cxcLeer(await fetch("/api/cxc/plantilla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asunto, cuerpo }),
    }));
    cerrarPlantillaCxc();
    mostrarToast("Plantilla guardada", "Ese texto se va a pegar en todos los estados de cuenta.");
  } catch (err) {
    avisar("No se pudo guardar", err.message || "No se pudo hablar con el servidor.", [], { error: true });
  }
}

if ($("cxc-plantilla")) $("cxc-plantilla").onclick = () => abrirPlantillaCxc();
if ($("cxc-plantilla-cerrar")) $("cxc-plantilla-cerrar").onclick = () => cerrarPlantillaCxc();
if ($("cxc-plantilla-guardar")) $("cxc-plantilla-guardar").onclick = () => guardarPlantillaCxc();
if ($("cxc-plantilla-modal")) {
  $("cxc-plantilla-modal").onclick = (e) => {
    if (e.target.id === "cxc-plantilla-modal") cerrarPlantillaCxc();
  };
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("cxc-plantilla-modal") && !$("cxc-plantilla-modal").classList.contains("oculto")) {
    cerrarPlantillaCxc();
  }
});
