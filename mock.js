/* Demo de portafolio: mismas pantallas que la herramienta, con datos inventados.
   No llama a Zoho, no usa secretos y no escribe nada real. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const CLAVES = ["unidad", "estado", "familia", "imagen", "tienda", "precio", "venta", "stock", "seccion", "cabys", "compuesto", "pareja"];
  const FILTROS = [
    { clave: "unidad", titulo: "Unidades", opciones: ["No tienen unidad", "Medida 1", "Medida 2", "Medida 3"] },
    { clave: "estado", titulo: "Estado", opciones: ["Activo", "Inactivo"] },
    { clave: "familia", titulo: "Familia", opciones: ["Con familia", "No tienen familia"] },
    { clave: "imagen", titulo: "Imagen", opciones: ["Con imagen", "Sin imagen"] },
    { clave: "tienda", titulo: "Aplica tienda en línea", opciones: ["Marcado", "Sin marcar"] },
    { clave: "precio", titulo: "Actualizar precio", opciones: ["Con marcar", "Sin marcar"] },
    { clave: "venta", titulo: "Precio de venta", opciones: ["Con precio", "Sin precio"] },
    { clave: "stock", titulo: "Stock", opciones: ["Con stock", "Stock en 0"] },
    { clave: "seccion", titulo: "Sección", opciones: ["Con sección", "Sin sección"] },
    { clave: "cabys", titulo: "CABYS", opciones: ["Con CABYS", "Sin CABYS"] },
    { clave: "compuesto", titulo: "Artículo compuesto", opciones: ["Compuesto", "Simple"] },
    { clave: "pareja", titulo: "Pareja de kit", opciones: ["Listo para kit", "Ya tiene kit", "Falta una pieza", "No aplica"] },
  ];
  const SUBS = ["Grupo muestra A", "Grupo muestra B", "Grupo muestra C", "Grupo muestra D"];

  function foto(color, texto) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><rect width="640" height="640" fill="${color}"/><text x="320" y="330" text-anchor="middle" fill="white" font-size="42" font-family="sans-serif">${texto}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function item(parcial) {
    const base = {
      unidad: "Medida 1", estado: "Activo", familia: "Con familia", imagen: "Con imagen",
      tienda: "Sin marcar", precioFlag: "Sin marcar", venta: "Con precio", stockFlag: "Con stock",
      seccion: "Con sección", cabys: "Con CABYS", compuesto: "Simple", pareja: "No aplica",
      rate: 12500, stock: 4, clase: "C", estante: "", seccionValor: "Sección A",
      problemas: [], corregido: false, slug: "", rol: "",
    };
    const it = Object.assign(base, parcial);
    it.filtros = {
      unidad: it.unidad, estado: it.estado, familia: it.familia, imagen: it.imagen,
      tienda: it.tienda, precio: it.precioFlag, venta: it.venta, stock: it.stockFlag,
      seccion: it.seccion, cabys: it.cabys, compuesto: it.compuesto, pareja: it.pareja,
    };
    if (!it.slug && it.imagen === "Con imagen") it.slug = it.sku.toLowerCase();
    if (!it.foto && it.imagen === "Con imagen") it.foto = foto("#3a3f4b", it.sku);
    return it;
  }

  const items = [
    item({ id: "d1", sku: "M-01", nombre: "Artículo muestra 01", subfamilia: SUBS[0], tienda: "Sin marcar", imagen: "Sin imagen", stock: 6, stockFlag: "Con stock", problemas: ["Sin imagen"], foto: "" }),
    item({ id: "d2", sku: "M-02", nombre: "Artículo muestra 02", subfamilia: SUBS[0], tienda: "Marcado", unidad: "Medida 2", rate: 3200, stock: 0, stockFlag: "Stock en 0", problemas: ["Stock en 0"] }),
    item({ id: "d3", sku: "M-03", nombre: "Artículo muestra 03", subfamilia: SUBS[0], unidad: "No tienen unidad", seccion: "Sin sección", seccionValor: "", cabys: "Sin código", tienda: "Sin marcar", problemas: ["Sin código", "Sin sección"] }),
    item({ id: "d4", sku: "M-04", nombre: "Artículo muestra 04", subfamilia: SUBS[1], tienda: "Marcado", precioFlag: "Con marcar", rate: 8900, stock: 12 }),
    item({ id: "d5", sku: "M-05", nombre: "Artículo muestra 05", subfamilia: SUBS[1], estado: "Inactivo", tienda: "Sin marcar", imagen: "Sin imagen", venta: "Sin precio", rate: 0, problemas: ["Sin imagen", "Sin precio"], foto: "" }),
    item({ id: "d6", sku: "M-06", nombre: "Artículo muestra 06", subfamilia: SUBS[1], familia: "No tienen familia", tienda: "Sin marcar", estante: "", stock: 2 }),
    item({ id: "d7", sku: "M-07", nombre: "Artículo muestra 07", subfamilia: SUBS[2], unidad: "Medida 3", tienda: "Marcado", rate: 450, stock: 80 }),
    item({ id: "d8", sku: "M-08", nombre: "Artículo muestra 08", subfamilia: SUBS[2], unidad: "Medida 3", tienda: "Sin marcar", imagen: "Con imagen", problemas: ["Foto no cuadrada (1024×559)"], foto: foto("#6b4a2a", "M-08") }),
    item({ id: "d9", sku: "M-09", nombre: "Artículo muestra 09", subfamilia: SUBS[3], tienda: "Marcado", rate: 15600, stock: 3 }),
    item({ id: "d10", sku: "M-10", nombre: "Artículo muestra 10", subfamilia: SUBS[3], tienda: "Marcado", stock: 0, stockFlag: "Stock en 0", problemas: ["Stock en 0"] }),
    item({ id: "c1", sku: "P-A1", nombre: "Pieza muestra A1", subfamilia: SUBS[3], rol: "pieza A", pareja: "Listo para kit", rate: 1800, stock: 2, costo: 900 }),
    item({ id: "e1", sku: "P-B1", nombre: "Pieza muestra B1", subfamilia: SUBS[3], rol: "pieza B", pareja: "Listo para kit", rate: 950, stock: 2, costo: 400 }),
    item({ id: "c2", sku: "P-A2", nombre: "Pieza muestra A2", subfamilia: SUBS[3], rol: "pieza A", pareja: "Falta una pieza", rate: 2400, stock: 1, costo: 1100 }),
    item({ id: "c3", sku: "P-A3", nombre: "Pieza muestra A3", subfamilia: SUBS[3], rol: "pieza A", pareja: "Ya tiene kit", rate: 3100, stock: 1, costo: 1500 }),
    item({ id: "e3", sku: "P-B3", nombre: "Pieza muestra B3", subfamilia: SUBS[3], rol: "pieza B", pareja: "Ya tiene kit", rate: 1400, stock: 1, costo: 700 }),
    item({ id: "k1", sku: "C-03", nombre: "Conjunto muestra 03", subfamilia: SUBS[3], compuesto: "Compuesto", pareja: "Ya tiene kit", rate: 4500, stock: 1, costo: 2200 }),
  ];

  const clientes = [
    { id: "cli1", empresa: "Cuenta muestra 1", cuenta: "Cuenta muestra 1", oficial: "uno@correo.falso", cxc: "", correo: "aviso1@correo.falso", saldo: 820000 },
    { id: "cli2", empresa: "Cuenta muestra 2", cuenta: "Cuenta muestra 2", oficial: "dos@correo.falso", cxc: "dos@correo.falso", correo: "dos@correo.falso", saldo: 150000 },
    { id: "cli3", empresa: "Cuenta muestra 3", cuenta: "Cuenta muestra 3", oficial: "tres@correo.falso", cxc: "", correo: "", saldo: 0 },
    { id: "cli4", empresa: "Cuenta muestra 4", cuenta: "Cuenta muestra 4", oficial: "cuatro@correo.falso", cxc: "", correo: "aviso4@correo.falso", saldo: -12000 },
    { id: "cli5", empresa: "Cuenta muestra 5", cuenta: "", oficial: "", cxc: "", correo: "nadie@correo.falso", saldo: 0 },
    { id: "cli6", empresa: "Cuenta muestra 6", cuenta: "Cuenta muestra 6", oficial: "seis@correo.falso", cxc: "", correo: "aviso6@correo.falso", saldo: 2400000 },
  ];

  let sesion = null;
  try { sesion = JSON.parse(sessionStorage.getItem("demo-zoho-sesion") || "null"); } catch { sesion = null; }
  let indiceFecha = Date.now() - 3600_000;
  let construyendo = false;
  let hechoIndice = 0;
  let totalIndice = 0;
  let cuota = 4800;
  const historial = [{
    id: "h1", fecha: new Date(Date.now() - 86400000).toISOString(), origen: "web", usuario: "Invitado",
    accion: "Aplicar en la tienda", detalle: "Ejemplo ya guardado en la demo", estado: "listo",
    cambiados: 1, errores: 0, revertido: "",
    articulos: [{ id: "d4", sku: "M-04", nombre: "Artículo muestra 04", cambios: { "Aplica tienda en línea": ["Sin marcar", "Marcado"] } }],
  }];
  let seq = 2;
  const trabajo = vacioTrabajo();
  const cxcJob = { activo: false, texto: "", datos: null, error: null, tipo: "", archivo: "", usuario: "", accion: "", hechos: 0, total: 0, inicio: 0, faltan_segundos: null, faltan_texto: null };
  const vigilante = { activo: false, subfamilia: "", minutos: 30, fotos: false, sin_stock: false, con_stock: false, lineas: ["Demo lista. Nada se escribió en Zoho."], filas: [] };
  let bucle = { activo: false, cada: "no", dia: 0, hora: "08:00", origen: "zoho", proxima: "", ultima: "", error: "", usuario: "Invitado", periodo: "anio", desde: "", hasta: "", periodo_texto: "", solo_pendiente: true, monto_sel: "todos", monto_valor: "" };
  let plantilla = {
    asunto: "Estado de cuenta",
    cuerpo: "Hola:\n\nEste es un mensaje de muestra. El PDF y el listado van en el mismo correo, juntos.\n\nSaludos.\n\nEquipo de muestra",
  };
  let cola = [];

  function vacioTrabajo() {
    return {
      texto: "", activo: false, detenido: false, entrada: null, usuario: "", accion: "", detalle: "",
      tipo: "", hechos: 0, total: 0, faltan_segundos: null, faltan_texto: null, cambiados: 0, errores: 0,
      aviso_toast: null, reanudar: false, inicioMs: 0, pasos: [],
    };
  }

  function faltaTexto(segundos) {
    if (segundos == null) return null;
    if (segundos < 60) return `faltan unos ${Math.max(1, Math.round(segundos))} s`;
    return `faltan unos ${Math.max(1, Math.round(segundos / 60))} min`;
  }

  function json(status, data) {
    return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  }

  function exigir() {
    if (!sesion) return json(401, { ok: false });
    return null;
  }

  function indiceBody() {
    const subs = {};
    items.forEach((it) => {
      const vals = CLAVES.map((c) => it.filtros[c]);
      const key = vals.join("\u0001");
      const bolsa = subs[it.subfamilia] || (subs[it.subfamilia] = {});
      bolsa[key] = (bolsa[key] || 0) + 1;
    });
    const subfamilias = {};
    Object.entries(subs).forEach(([sub, mapa]) => {
      subfamilias[sub] = Object.entries(mapa).map(([k, n]) => [k.split("\u0001"), n]);
    });
    return {
      claves: CLAVES, fecha: construyendo ? indiceFecha : indiceFecha, subfamilias,
      construyendo, error: "", hecho: hechoIndice, total: totalIndice, paginas: 4,
      consumo: construyendo ? null : 4, restan: cuota, limite: 5000, costo_estimado: 4,
    };
  }

  function catalogo() {
    return {
      usuario: sesion.nombre, remoto: false, en_servidor: false,
      subfamilias: SUBS, familias: ["FAMILIA DEMO"], tiempos: [30, 60],
      unidades: ["Medida 1", "Medida 2", "Medida 3"], filtros: FILTROS, aviso: {},
    };
  }

  function elegidos(body) {
    let lista = items.slice();
    const pedidas = body.subfamilia === "TODAS" ? SUBS : [].concat(body.subfamilia || []);
    if (pedidas.length) lista = lista.filter((it) => pedidas.includes(it.subfamilia));
    const filtros = body.filtros || {};
    Object.entries(filtros).forEach(([clave, vals]) => {
      if (vals && vals.length) lista = lista.filter((it) => vals.includes(it.filtros[clave]));
    });
    return lista;
  }

  function planCambio(it, body) {
    const cambios = {};
    if (body.aplica === "marcar" && it.filtros.tienda !== "Marcado") cambios["Aplica tienda en línea"] = [it.filtros.tienda, "Marcado"];
    if (body.aplica === "quitar" && it.filtros.tienda !== "Sin marcar") cambios["Aplica tienda en línea"] = [it.filtros.tienda, "Sin marcar"];
    if (body.precio === "marcar" && it.filtros.precio !== "Con marcar") cambios["Actualizar precio"] = [it.filtros.precio, "Con marcar"];
    if (body.precio === "quitar" && it.filtros.precio !== "Sin marcar") cambios["Actualizar precio"] = [it.filtros.precio, "Sin marcar"];
    if (body.porcentaje) cambios["Porcentaje de utilidad"] = ["—", `${body.porcentaje}%`];
    if (body.estimado) cambios["% Estimado de utilidad"] = ["—", `${body.estimado}%`];
    if (body.unidad && body.unidad !== it.unidad) cambios.Unidad = [it.unidad, body.unidad];
    if (body.seccion === "Sección A" && it.seccionValor !== "Sección A") cambios["Sección"] = [it.seccionValor || "vacío", "Sección A"];
    if (body.estante === "Estante 9" && !it.estante) cambios.Estante = ["vacío", "Estante 9"];
    return cambios;
  }

  function aplicarCambio(it, cambios) {
    Object.entries(cambios).forEach(([campo, [, despues]]) => {
      if (campo === "Aplica tienda en línea") it.filtros.tienda = it.tienda = despues;
      if (campo === "Actualizar precio") it.filtros.precio = it.precioFlag = despues;
      if (campo === "Unidad") {
        it.unidad = despues;
        it.filtros.unidad = despues;
      }
      if (campo === "Sección") {
        it.seccionValor = despues;
        it.seccion = "Con sección";
        it.filtros.seccion = "Con sección";
      }
      if (campo === "Estante") it.estante = despues;
    });
  }

  function costo(n) {
    return { modo: "rapido", llamadas: n * 2, paginas: 0, restan: cuota, limite: 5000 };
  }

  function vista(body) {
    const lista = elegidos(body);
    const cambian = [];
    let iguales = 0;
    lista.forEach((it) => {
      const cambios = planCambio(it, body);
      if (Object.keys(cambios).length) cambian.push({ sku: it.sku, nombre: it.nombre, subfamilia: it.subfamilia, id: it.id, cambios });
      else iguales += 1;
    });
    const hayCambio = ["aplica", "precio", "porcentaje", "estimado", "unidad", "estante"].some((k) => body[k]) || body.seccion === "Sección A";
    if (!hayCambio) {
      return {
        columnas: ["Unidad", "Tienda", "Stock", "Precio"],
        cambian: lista.map((it) => ({ sku: it.sku, nombre: it.nombre, subfamilia: it.subfamilia, valores: [it.unidad, it.filtros.tienda, String(it.stock), String(it.rate)] })),
        fecha: indiceFecha,
      };
    }
    return { cambian, iguales, costo: costo(cambian.length), fecha: indiceFecha };
  }

  function arrancar(accion, detalle, pasos, tipo) {
    if (trabajo.activo || cxcJob.activo) return false;
    Object.assign(trabajo, vacioTrabajo(), {
      activo: true, usuario: sesion.nombre, accion, detalle, tipo: tipo || "",
      total: pasos.length, hechos: 0, texto: pasos[0] ? pasos[0].texto : "Preparando…",
      inicioMs: Date.now(), pasos,
    });
    return true;
  }

  function tick() {
    if (construyendo) {
      hechoIndice = Math.min(totalIndice, hechoIndice + 1);
      if (hechoIndice >= totalIndice) {
        construyendo = false;
        indiceFecha = Date.now();
        cuota = Math.max(0, cuota - 4);
      }
    }
    if (trabajo.activo && trabajo.pasos.length) {
      const paso = Math.min(trabajo.pasos.length, Math.floor((Date.now() - trabajo.inicioMs) / 450) + 1);
      for (let i = trabajo.hechos; i < paso; i += 1) {
        const p = trabajo.pasos[i];
        if (p && p.hacer) p.hacer();
        trabajo.cambiados += p && p.cuenta ? 1 : 0;
      }
      trabajo.hechos = paso;
      const actual = trabajo.pasos[Math.min(paso, trabajo.pasos.length) - 1];
      trabajo.texto = actual ? actual.texto : trabajo.texto;
      const faltan = trabajo.total > paso ? ((Date.now() - trabajo.inicioMs) / paso) * (trabajo.total - paso) / 1000 : null;
      trabajo.faltan_segundos = faltan;
      trabajo.faltan_texto = faltaTexto(faltan);
      if (paso >= trabajo.pasos.length) {
        const entrada = trabajo._entrada;
        trabajo.activo = false;
        trabajo.texto = trabajo._fin || `Listo. Cambiados ${trabajo.cambiados}.`;
        trabajo.faltan_segundos = null;
        trabajo.faltan_texto = null;
        trabajo.entrada = entrada ? entrada.id : trabajo.entrada;
        if (trabajo._toast) trabajo.aviso_toast = trabajo._toast;
        trabajo.pasos = [];
      }
    }
    if (cxcJob.activo && cxcJob.total) {
      const paso = Math.min(cxcJob.total, Math.floor((Date.now() - cxcJob.inicio) / 350));
      cxcJob.hechos = paso;
      cxcJob.texto = `Leyendo ${paso} de ${cxcJob.total}`;
      const faltan = paso && paso < cxcJob.total ? ((Date.now() - cxcJob.inicio) / paso) * (cxcJob.total - paso) / 1000 : null;
      cxcJob.faltan_segundos = faltan;
      cxcJob.faltan_texto = faltaTexto(faltan);
      if (paso >= cxcJob.total && cxcJob._datos) {
        cxcJob.datos = cxcJob._datos;
        cxcJob.activo = false;
        cxcJob.texto = "Listo";
        cxcJob.faltan_segundos = null;
        cxcJob.faltan_texto = null;
      }
    }
    if (vigilante.activo && vigilante.fotos) {
      const pendiente = items.find((it) => it.sku === "M-01" && it.filtros.imagen === "Sin imagen");
      if (pendiente && Date.now() - (vigilante.desde || 0) > 2500) {
        pendiente.filtros.imagen = pendiente.imagen = "Con imagen";
        pendiente.foto = foto("#2f6f4e", pendiente.sku);
        pendiente.problemas = pendiente.problemas.filter((p) => p !== "Sin imagen");
        const linea = `${new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}  ${pendiente.sku} ya tiene foto. En la demo se deja listo, sin escribir en Zoho.`;
        vigilante.lineas.unshift(linea);
        vigilante.filas.unshift([pendiente.sku, pendiente.nombre, "Foto nueva"]);
        vigilante.fotos = false;
      }
    }
  }
  setInterval(tick, 400);

  function empezarAplicar(body) {
    const previa = vista(body);
    const lista = previa.cambian || [];
    if (!lista.length || previa.columnas) return json(400, { ok: false, mensaje: "No hay artículos para cambiar con esos filtros." });
    const id = `h${seq++}`;
    const tocados = [];
    const pasos = lista.map((fila) => ({
      texto: `Cambiando ${fila.sku}`,
      cuenta: true,
      hacer() {
        const it = items.find((x) => x.id === fila.id);
        if (it) aplicarCambio(it, fila.cambios);
        tocados.push({ id: fila.id, sku: fila.sku, nombre: fila.nombre, cambios: fila.cambios });
      },
    }));
    if (!arrancar("Cambio de catálogo", `${lista.length} artículos demo`, pasos)) {
      return json(409, { ok: false, mensaje: "Ya hay un cambio en curso." });
    }
    trabajo._entrada = null;
    trabajo._fin = `Listo. Cambiados ${lista.length}. Errores 0.`;
    trabajo._toast = { id: `t-${id}`, titulo: "Cambios aplicados", texto: `${lista.length} artículos de la demo.` };
    trabajo._alCerrar = () => {
      const entrada = {
        id, fecha: new Date().toISOString(), origen: "web", usuario: sesion.nombre,
        accion: "Cambio de catálogo", detalle: `${lista.length} artículos demo`, estado: "listo",
        cambiados: lista.length, errores: 0, articulos: tocados, revertido: "",
      };
      historial.unshift(entrada);
      trabajo.entrada = id;
      cuota = Math.max(0, cuota - lista.length * 2);
    };
    const original = trabajo.pasos;
    const ultimo = original[original.length - 1];
    const hacer = ultimo.hacer;
    ultimo.hacer = () => { hacer(); trabajo._alCerrar(); };
    return json(200, { ok: true });
  }

  function pendientes(tipo) {
    const problemas = {};
    items.forEach((it) => {
      if (it.corregido) return;
      it.problemas.forEach((p) => { problemas[p] = (problemas[p] || 0) + 1; });
    });
    const resumen = Object.entries(problemas);
    const corregidos = items.filter((it) => it.corregido).length;
    resumen.push(["Corregidos", corregidos]);
    let articulos = items.filter((it) => (tipo === "Corregidos" ? it.corregido : it.problemas.length && !it.corregido));
    if (tipo && tipo !== "Corregidos") articulos = articulos.filter((it) => it.problemas.includes(tipo));
    return {
      fecha: indiceFecha,
      total: items.length,
      todos: items.filter((it) => it.problemas.length && !it.corregido).length,
      resumen,
      zoho: "#demo-",
      tienda_buscar: "https://example.com/buscar",
      tienda: { fecha: Date.now() - 7200_000, publicados: items.filter((it) => it.filtros.tienda === "Marcado").length, horas: ["6:00", "12:00", "18:00"] },
      articulos: articulos.map((it) => ({
        id: it.id, sku: it.sku, nombre: it.nombre, subfamilia: it.subfamilia, problemas: it.problemas.slice(),
        foto: it.foto || "", tienda: it.filtros.tienda === "Marcado", slug: it.slug, corregido: it.corregido,
      })),
      construyendo: false,
      revision: { activo: false },
    };
  }

  function filaCxc(c, i) {
    let estado = "cambiar";
    if (!c.cuenta) estado = c.correo ? "sin_cuenta" : "sin_correo";
    else if (!c.correo) estado = "sin_correo";
    else if (c.cxc && c.correo.toLowerCase() === c.cxc.toLowerCase()) estado = "igual";
    return {
      fila: i + 2, empresa: c.empresa, identificacion: "", correo: c.correo, contact_id: c.cuenta ? c.id : "",
      cuenta: c.cuenta, oficial: c.oficial, cxc_actual: c.cxc, cxc_campo_id: "demo", aviso: "",
      estado, saldo: c.saldo,
    };
  }

  function resumenCxc(filas, origen) {
    return {
      ok: true,
      filas,
      resumen: {
        total: filas.length,
        cambiar: filas.filter((f) => f.estado === "cambiar").length,
        igual: filas.filter((f) => f.estado === "igual").length,
        listo: filas.filter((f) => f.estado === "listo").length,
        sin_cuenta: filas.filter((f) => f.estado === "sin_cuenta").length,
        sin_correo: filas.filter((f) => f.estado === "sin_correo").length,
        origen, periodo: "anio", periodo_texto: "este año",
        desde: `${new Date().getFullYear()}-01-01`, hasta: new Date().toISOString().slice(0, 10), avisos: [],
      },
    };
  }

  function clientesZoho() {
    return clientes.filter((c) => c.cuenta).map((c, i) => {
      const fila = filaCxc({ ...c, correo: c.cxc || c.oficial }, i);
      fila.estado = fila.correo ? "listo" : "sin_correo";
      fila.origen = "zoho";
      return fila;
    });
  }

  async function leerSubida(init) {
    const body = init && init.body;
    if (!(body instanceof FormData)) return { nombre: "archivo.xlsx", emails: [] };
    const file = body.get("archivo");
    if (!file) return { nombre: "archivo.xlsx", emails: [] };
    const texto = await file.text();
    const emails = texto.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
    return { nombre: file.name || "archivo.xlsx", emails: [...new Set(emails.map((e) => e.toLowerCase()))] };
  }

  function empezarLectura(nombre, filas) {
    if (cxcJob.activo || trabajo.activo) return json(409, { ok: false, mensaje: "Ya hay una carga en curso." });
    Object.assign(cxcJob, {
      activo: true, texto: `Leyendo ${nombre}`, datos: null, error: null, tipo: "cxc-lectura",
      archivo: nombre, usuario: sesion.nombre, accion: `Leyendo ${nombre}`, hechos: 0, total: Math.max(filas.length, 1),
      inicio: Date.now(), faltan_segundos: null, faltan_texto: null, _datos: resumenCxc(filas, "archivo"),
    });
    return json(200, { ok: true, trabajo: true });
  }

  function parejas() {
    const pares = [
      { base: "GRP-01", sku_kit: "C-01", subfamilia: SUBS[3], estado: "listo", cond: pieza("c1", "pieza A"), evap: pieza("e1", "pieza B") },
      { base: "GRP-02", sku_kit: "C-02", subfamilia: SUBS[3], estado: "falta", cond: pieza("c2", "pieza A"), evap: null },
      { base: "GRP-03", sku_kit: "C-03", subfamilia: SUBS[3], estado: "existe", cond: pieza("c3", "pieza A"), evap: pieza("e3", "pieza B") },
    ];
    return {
      ok: true, fecha: indiceFecha, total: pares.length, subfamilias: SUBS, parejas: pares,
      conteo: { listo: 1, falta: 1, existe: 1 },
    };
  }

  function pieza(id, rol) {
    const it = items.find((x) => x.id === id);
    if (!it) return null;
    return { id: it.id, sku: it.sku, nombre: it.nombre, rol, cantidad: 1, precio: it.rate, costo: it.costo || Math.round(it.rate * 0.7), stock: it.stock };
  }

  function buscarPiezas(texto) {
    const lineas = String(texto || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const piezas = [];
    const vistos = new Set();
    lineas.forEach((linea) => {
      const q = linea.toLowerCase();
      const it = items.find((x) => x.sku.toLowerCase() === q || x.nombre.toLowerCase().includes(q) || q.includes(x.sku.toLowerCase()));
      if (it && !vistos.has(it.id)) {
        vistos.add(it.id);
        piezas.push(pieza(it.id, it.rol || "pieza"));
      }
    });
    const ok = piezas.length >= 2;
    return {
      ok, piezas, encontradas: piezas.length, fecha: indiceFecha,
      mensaje: ok ? "" : "Hacen falta mínimo dos artículos.",
      errores: ok ? [] : ["Pegá al menos dos SKU, uno por línea."],
      avisos: [],
      kit: ok ? {
        nombre: `Kit ${piezas.map((p) => p.sku).join(" + ")}`,
        sku: `${piezas[0].sku}-KIT`,
        unidad: "Medida 1", familia: "FAMILIA DEMO", subfamilia: SUBS[3],
        precio: piezas.reduce((n, p) => n + Number(p.precio || 0), 0),
        costo: piezas.reduce((n, p) => n + Number(p.costo || 0), 0),
        descripcion: "Kit armado en la demo. No existe en Zoho.",
      } : {},
      costo_api: { llamadas: piezas.length + 1 }, restan: cuota, limite: 5000,
    };
  }

  function hoja(filas) {
    const csv = filas.map((r) => r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    return new Response(`\uFEFF${csv}`, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8" } });
  }

  function pdfDemo(nombre) {
    const texto = `Estado de cuenta demo - ${nombre}`.replace(/[()\\]/g, " ");
    const stream = `BT /F1 18 Tf 48 120 Td (${texto}) Tj ET`;
    const body = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 420 240]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${stream.length}>>stream
${stream}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Size 6/Root 1 0 R>>
%%EOF`;
    return new Response(body, { status: 200, headers: { "Content-Type": "application/pdf" } });
  }

  function proximaBucle(plan) {
    const ahora = new Date();
    if (plan.cada === "hora") return new Date(ahora.getTime() + 3600_000).toISOString();
    if (plan.cada === "dia" || plan.cada === "semana" || plan.cada === "mes") {
      const [hh, mm] = String(plan.hora || "08:00").split(":");
      const nxt = new Date(ahora);
      nxt.setHours(Number(hh) || 8, Number(mm) || 0, 0, 0);
      if (nxt <= ahora) nxt.setDate(nxt.getDate() + (plan.cada === "semana" ? 7 : plan.cada === "mes" ? 30 : 1));
      return nxt.toISOString();
    }
    return "";
  }

  function etiquetaBucle(plan) {
    if (!plan.activo || plan.cada === "no") return "No se repite";
    if (plan.cada === "hora") return "Cada hora";
    if (plan.cada === "dia") return `Cada día a las ${plan.hora}`;
    if (plan.cada === "semana") return `Cada ${["lunes","martes","miércoles","jueves","viernes","sábado","domingo"][Number(plan.dia) || 0]} a las ${plan.hora}`;
    return `El día ${plan.dia || 1} de cada mes a las ${plan.hora}`;
  }

  function etiquetaFiltrosBucle(plan) {
    const partes = [];
    if (plan.periodo_texto) partes.push(plan.periodo_texto);
    if (plan.monto_sel === "cero") partes.push("saldo 0");
    else if (plan.monto_sel === "negativo") partes.push("saldo negativo");
    else if (plan.monto_sel === "menos" && plan.monto_valor) partes.push(`menos de ${plan.monto_valor}`);
    else if (plan.monto_sel === "mas" && plan.monto_valor) partes.push(`más de ${plan.monto_valor}`);
    return partes.join(" · ");
  }

  window.fetch = async (input, init = {}) => {
    const crudo = typeof input === "string" ? input : input.url;
    const url = new URL(crudo, location.origin);
    if (!url.pathname.startsWith("/api/")) return originalFetch(input, init);
    tick();
    const ruta = url.pathname;
    const metodo = (init.method || "GET").toUpperCase();
    let body = {};
    if (init.body && typeof init.body === "string") {
      try { body = JSON.parse(init.body); } catch { body = {}; }
    }

    if (ruta === "/api/entrar" && metodo === "POST") {
      const usuario = String(body.usuario || "").trim().toLowerCase();
      const contra = String(body.contrasena || "");
      if (!((usuario === "invitado" && contra === "demo") || (usuario === "demo" && contra === "demo"))) {
        return json(401, { ok: false, mensaje: "En la demo entrá con usuario invitado y contraseña demo." });
      }
      sesion = { usuario, nombre: "Invitado" };
      sessionStorage.setItem("demo-zoho-sesion", JSON.stringify(sesion));
      return json(200, { ok: true });
    }
    if (ruta === "/api/salir") {
      sesion = null;
      sessionStorage.removeItem("demo-zoho-sesion");
      return json(200, { ok: true });
    }
    const no = exigir();
    if (no) return no;

    if (ruta === "/api/aviso") return json(200, {});
    if (ruta === "/api/catalogo") return json(200, catalogo());
    if (ruta === "/api/indice" && metodo === "GET") return json(200, indiceBody());
    if (ruta === "/api/indice" && metodo === "POST") {
      construyendo = true; hechoIndice = 0; totalIndice = 4;
      return json(200, { ok: true });
    }
    if (ruta === "/api/cuota") return json(200, { ok: true, restan: cuota, limite: 5000 });
    if (ruta === "/api/vista-previa") return json(200, vista(body));
    if (ruta === "/api/vista-previa.xlsx") {
      const previa = vista(body);
      const filas = [["SKU", "Artículo", "Subfamilia"]];
      (previa.cambian || []).forEach((a) => {
        if (a.cambios) Object.entries(a.cambios).forEach(([campo, vals]) => filas.push([a.sku, a.nombre, a.subfamilia, campo, vals[0], vals[1]]));
        else filas.push([a.sku, a.nombre, a.subfamilia, ...(a.valores || [])]);
      });
      return hoja(filas);
    }
    if (ruta === "/api/aplicar") return empezarAplicar(body);
    if (ruta === "/api/detener") {
      if (trabajo.activo) {
        trabajo.activo = false;
        trabajo.detenido = true;
        trabajo.reanudar = true;
        trabajo.texto = `Detenido. Cambiados ${trabajo.cambiados}.`;
        const id = `h${seq++}`;
        historial.unshift({
          id, fecha: new Date().toISOString(), origen: "web", usuario: sesion.nombre,
          accion: trabajo.accion || "Cambio detenido", detalle: trabajo.texto, estado: "detenido",
          cambiados: trabajo.cambiados, errores: 0, articulos: [], reanudable: true, revertido: "",
        });
        trabajo.entrada = id;
      }
      return json(200, { ok: true });
    }
    if (ruta === "/api/reanudar") {
      trabajo.activo = false;
      trabajo.reanudar = false;
      trabajo.texto = "En la demo el cambio detenido queda anotado. No queda nada a medias en Zoho.";
      return json(200, { ok: true });
    }
    if (ruta === "/api/trabajo") {
      if (!trabajo.activo && cxcJob.activo) {
        return json(200, {
          activo: true, tipo: cxcJob.tipo, texto: cxcJob.texto, accion: cxcJob.accion,
          detalle: cxcJob.archivo, usuario: cxcJob.usuario, hechos: cxcJob.hechos, total: cxcJob.total,
          faltan_segundos: cxcJob.faltan_segundos, faltan_texto: cxcJob.faltan_texto,
        });
      }
      const copia = { ...trabajo };
      delete copia.pasos;
      delete copia._entrada;
      delete copia._fin;
      delete copia._toast;
      delete copia._alCerrar;
      return json(200, copia);
    }
    if (ruta === "/api/historial") {
      return json(200, { entradas: historial, cuenta: { nombre: "Cuenta demo", correo: "demo@ejemplo.com" } });
    }
    if (ruta === "/api/historial.xlsx") return hoja([["Código", "Campo", "Antes", "Después"], ["M-04", "Aplica tienda", "Sin marcar", "Marcado"]]);
    if (ruta === "/api/revertir-previa") {
      const entrada = historial.find((e) => e.id === body.id);
      if (!entrada) return json(404, { ok: false, mensaje: "Ese cambio no está en la demo." });
      return json(200, { ok: true, articulos: entrada.articulos.length || entrada.cambiados || 1, accion: entrada.accion, tipo: "articulos", llamadas: (entrada.articulos.length || 1) * 2 });
    }
    if (ruta === "/api/revertir") {
      const entrada = historial.find((e) => e.id === body.id);
      if (!entrada) return json(404, { ok: false, mensaje: "Ese cambio no está en la demo." });
      (entrada.articulos || []).forEach((a) => {
        const it = items.find((x) => x.id === a.id);
        if (!it) return;
        const invertido = {};
        Object.entries(a.cambios || {}).forEach(([campo, [antes, despues]]) => { invertido[campo] = [despues, antes]; });
        aplicarCambio(it, invertido);
      });
      entrada.revertido = new Date().toISOString();
      const pasos = [{ texto: "Revirtiendo el cambio de la demo", cuenta: true, hacer() {} }];
      arrancar("Reversión", entrada.accion, pasos);
      trabajo._fin = "Listo. El cambio de la demo volvió al valor anterior.";
      trabajo._toast = { id: `rev-${entrada.id}`, titulo: "Cambio revertido", texto: entrada.accion };
      return json(200, { ok: true });
    }
    if (ruta === "/api/pendientes") return json(200, pendientes(url.searchParams.get("tipo") || ""));
    if (ruta === "/api/pendientes-corregido") {
      const it = items.find((x) => x.id === body.id);
      if (it) it.corregido = !body.quitar;
      return json(200, { ok: true });
    }
    if (ruta === "/api/tienda-producto") {
      const it = items.find((x) => x.slug === url.searchParams.get("slug"));
      if (!it) return json(404, { ok: false, mensaje: "Ese producto no está en la demo." });
      return json(200, {
        ok: true,
        producto: {
          nombre: it.nombre, sku: it.sku, unidad: it.unidad, precio_iva: `₡${Number(it.rate).toLocaleString("es-CR")}`,
          disponible: it.stock, foto: it.foto || "",
        },
      });
    }
    if (ruta === "/api/vigilante" && metodo === "GET") {
      return json(200, { ...vigilante, excel_filas: vigilante.filas.length, lineas: vigilante.lineas.slice(0, 40) });
    }
    if (ruta === "/api/vigilante" && metodo === "POST") {
      Object.assign(vigilante, {
        activo: Boolean(body.activo), subfamilia: body.subfamilia || "", minutos: body.minutos || 30,
        fotos: Boolean(body.fotos), sin_stock: Boolean(body.sin_stock), con_stock: Boolean(body.con_stock),
        desde: Date.now(),
      });
      if (vigilante.activo) vigilante.lineas.unshift(`${new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}  Vigilante demo activo (${vigilante.subfamilia || "TODAS"}).`);
      return json(200, { ok: true });
    }
    if (ruta === "/api/vigilante.xlsx") return hoja([["Hora", "SKU", "Qué pasó"], ...vigilante.filas]);
    if (ruta === "/api/compuestos/parejas") return json(200, parejas());
    if (ruta === "/api/compuestos/buscar") return json(200, buscarPiezas(body.texto));
    if (ruta === "/api/compuestos.xlsx") {
      const kit = body.kit || {};
      const filas = [["SKU", "Nombre", "Cantidad"], [kit.sku, kit.nombre, 1]];
      (body.piezas || []).forEach((p) => filas.push([p.sku || p.id, "", p.cantidad || 1]));
      return hoja(filas);
    }
    if (ruta === "/api/compuestos" && metodo === "POST") {
      const kit = body.kit || {};
      if (items.some((it) => it.sku === kit.sku)) return json(400, { ok: false, mensaje: "Ese SKU ya existe en la demo." });
      items.push(item({
        id: `k${seq++}`, sku: kit.sku, nombre: kit.nombre, subfamilia: kit.subfamilia || SUBS[3],
        compuesto: "Compuesto", pareja: "Ya tiene kit", rate: Number(kit.precio) || 0, stock: 1, costo: Number(kit.costo) || 0,
      }));
      cuota = Math.max(0, cuota - 3);
      historial.unshift({
        id: `h${seq++}`, fecha: new Date().toISOString(), origen: "web", usuario: sesion.nombre,
        accion: "Crear kit", detalle: kit.sku, estado: "listo", cambiados: 1, errores: 0, revertido: "",
        articulos: [{ id: kit.sku, sku: kit.sku, nombre: kit.nombre, cambios: { Kit: ["no existía", "creado en la demo"] } }],
      });
      return json(200, { ok: true, item: { sku: kit.sku, nombre: kit.nombre }, consumo: 3, restan: cuota });
    }
    if (ruta === "/api/cxc/bucle" && metodo === "GET") {
      return json(200, { ok: true, ...bucle, texto: etiquetaBucle(bucle), filtros: etiquetaFiltrosBucle(bucle) });
    }
    if (ruta === "/api/cxc/bucle" && metodo === "POST") {
      if (body.cada && body.cada !== "no" && !body.confirmar) {
        return json(400, { ok: false, mensaje: "El bucle no arranca solo. Usá Confirmar inicio de bucle." });
      }
      bucle = {
        ...bucle, ...body,
        activo: Boolean(body.confirmar) && body.cada && body.cada !== "no",
        usuario: sesion.nombre,
        error: "",
      };
      bucle.proxima = bucle.activo ? proximaBucle(bucle) : "";
      return json(200, { ok: true, ...bucle, texto: etiquetaBucle(bucle), filtros: etiquetaFiltrosBucle(bucle) });
    }
    if (ruta === "/api/cxc/plantilla" && metodo === "GET") {
      return json(200, { ok: true, ...plantilla });
    }
    if (ruta === "/api/cxc/plantilla" && metodo === "POST") {
      plantilla = {
        asunto: String(body.asunto || "").trim() || plantilla.asunto,
        cuerpo: String(body.cuerpo || "").trim() || plantilla.cuerpo,
      };
      return json(200, { ok: true, ...plantilla });
    }
    if (ruta === "/api/cxc/trabajo") {
      return json(200, {
        ok: true, activo: cxcJob.activo, texto: cxcJob.texto, error: cxcJob.error,
        datos: cxcJob.activo ? null : cxcJob.datos, tipo: cxcJob.tipo, archivo: cxcJob.archivo,
        usuario: cxcJob.usuario, accion: cxcJob.accion, hechos: cxcJob.hechos, total: cxcJob.total,
        faltan_segundos: cxcJob.faltan_segundos, faltan_texto: cxcJob.faltan_texto,
      });
    }
    if (ruta === "/api/cxc/previa") {
      const subida = await leerSubida(init);
      let filas;
      if (subida.emails.length) {
        filas = subida.emails.map((correo, i) => filaCxc({
          id: `mail${i}`, empresa: correo.split("@")[1], cuenta: `Cuenta demo ${i + 1}`,
          oficial: `oficial@${correo.split("@")[1]}`, cxc: "", correo, saldo: 100000 * (i + 1),
        }, i));
      } else {
        filas = clientes.map(filaCxc);
      }
      bucle.origen = "excel";
      return empezarLectura(subida.nombre, filas);
    }
    if (ruta === "/api/cxc/filtrar") {
      if (cxcJob.activo || trabajo.activo) return json(409, { ok: false, mensaje: "Ya hay una carga en curso." });
      const filas = clientesZoho();
      Object.assign(cxcJob, {
        activo: true, texto: "Cargando clientes de Zoho…", datos: null, error: null, tipo: "cxc-filtro",
        archivo: "clientes de Zoho", usuario: sesion.nombre, accion: "Leyendo clientes de Zoho",
        hechos: 0, total: filas.length, inicio: Date.now(), _datos: resumenCxc(filas, "zoho"),
      });
      bucle.origen = "zoho";
      return json(200, { ok: true, trabajo: true });
    }
    if (ruta === "/api/cxc/pdf") return pdfDemo(url.searchParams.get("empresa") || "cliente demo");
    if (ruta === "/api/cxc/listado") {
      const id = url.searchParams.get("id");
      const c = clientes.find((x) => x.id === id) || { cuenta: "Cuenta demo", saldo: 50000 };
      const facturas = c.saldo > 0 ? [
        { numero: "F-1001", fecha: `${new Date().getFullYear()}-02-12`, vence: `${new Date().getFullYear()}-03-12`, total: c.saldo, saldo: c.saldo, estado: "Pendiente" },
      ] : [];
      return json(200, { ok: true, cuenta: c.cuenta || c.empresa, facturas, periodo_texto: "este año", desde: `${new Date().getFullYear()}-01-01`, hasta: new Date().toISOString().slice(0, 10) });
    }
    if (ruta === "/api/cxc/aplicar") {
      const filas = body.filas || [];
      filas.forEach((f) => {
        const c = clientes.find((x) => x.id === f.contact_id);
        if (c) c.cxc = f.correo;
      });
      const pasos = filas.map((f) => ({ texto: `Escribiendo CXC ${f.cuenta || f.empresa}`, cuenta: true, hacer() {} }));
      if (!arrancar("Poner correo CXC", `${filas.length} cuentas`, pasos, "cxc")) {
        return json(409, { ok: false, mensaje: "Ya hay un cambio en curso." });
      }
      trabajo._fin = "Listo";
      trabajo.cxc_resultado = { ok: true, cambiados: filas.length, errores: 0, mensaje: `${filas.length} correos CXC en la demo` };
      trabajo._toast = { id: `cxc-${Date.now()}`, titulo: "Correos CXC actualizados", texto: `${filas.length} cuentas de la demo` };
      historial.unshift({
        id: `h${seq++}`, fecha: new Date().toISOString(), origen: "web", usuario: sesion.nombre,
        accion: "Correo CXC", detalle: `${filas.length} cuentas`, estado: "listo", cambiados: filas.length, errores: 0, revertido: "",
        articulos: filas.map((f) => ({ id: f.contact_id, sku: "", nombre: f.cuenta || f.empresa, cambios: { correo_cxc: [f.cxc_actual || "", f.correo] } })),
      });
      return json(200, { ok: true, trabajo: true });
    }
    if (ruta === "/api/cxc/enviar") {
      const n = (body.contact_ids || []).length;
      const pasos = Array.from({ length: Math.max(1, n) }, (_, i) => ({
        texto: `Enviando ${i + 1} de ${n} (demo)`,
        cuenta: true,
        hacer() {},
      }));
      if (!arrancar("Enviar estados de cuenta", `${n} cuentas`, pasos, "cxc")) {
        return json(409, { ok: false, mensaje: "Ya hay un cambio en curso." });
      }
      trabajo._fin = "Listo";
      trabajo.cxc_resultado = { ok: true, enviados: n, errores: 0, mensaje: "En la demo no se envió ningún correo real." };
      trabajo._toast = { id: `cxc-env-${Date.now()}`, titulo: "Estados de cuenta (demo)", texto: `${n} envíos ficticios. No salió ningún correo.` };
      historial.unshift({
        id: `h${seq++}`, fecha: new Date().toISOString(), origen: "web", usuario: sesion.nombre,
        accion: "Estado de cuenta", detalle: `${n} enviados (demo)`, estado: "listo", cambiados: n, errores: 0, revertido: "",
        articulos: [],
      });
      return json(200, { ok: true, trabajo: true });
    }
    return json(404, { ok: false, mensaje: "Esa ruta no está en la demo." });
  };

  function engancharInvitado() {
    const boton = document.getElementById("entrar-invitado");
    if (!boton || boton.dataset.listo) return;
    boton.dataset.listo = "1";
    boton.addEventListener("click", () => {
      document.getElementById("usuario").value = "invitado";
      document.getElementById("contra").value = "demo";
      document.getElementById("forma").requestSubmit();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", engancharInvitado);
  else engancharInvitado();
  window.__DEMO_ZOHO__ = true;
})();
