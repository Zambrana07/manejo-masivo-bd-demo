/* Demo estática: intercepta fetch(/api/...) con datos ficticios. Sin servidor real. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const LS_HIST = "demo-masivo-historial";
  const LS_VIG = "demo-masivo-vigilante";
  const LS_CORR = "demo-masivo-corregidos";
  const LS_SES = "demo-masivo-sesion";

  let catalogo = null;
  let listo = null;
  let sesion = null;
  try {
    sesion = JSON.parse(sessionStorage.getItem(LS_SES) || "null");
  } catch {
    sesion = null;
  }

  const trabajo = {
    texto: "",
    activo: false,
    detenido: false,
    entrada: null,
    usuario: "",
    accion: "",
    inicio: null,
    hechos: 0,
    total: 0,
    faltan_segundos: null,
    faltan_texto: null,
    cambiados: 0,
    errores: 0,
    detalle: "",
    aviso_toast: null,
    reanudar: false,
  };

  let vigEstado = {
    activo: false,
    subfamilia: "",
    minutos: 30,
    fotos: false,
    sin_stock: false,
    con_stock: false,
  };
  try {
    vigEstado = { ...vigEstado, ...JSON.parse(localStorage.getItem(LS_VIG) || "{}") };
  } catch { /* ignore */ }

  let bitacora = [
    "demo: modo invitado activo — datos ficticios.",
    "demo: no hay conexión a un servidor real.",
  ];
  let vigTimer = null;
  let indiceConstruyendo = false;
  let indiceHecho = 0;
  let indiceTotal = 5;

  function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  function blobRespuesta(nombre, texto) {
    const blob = new Blob([texto], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombre}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  async function cargar() {
    if (listo) return listo;
    listo = (async () => {
      const res = await originalFetch("data/catalogo_demo.json");
      catalogo = await res.json();
      if (!localStorage.getItem(LS_HIST)) {
        localStorage.setItem(LS_HIST, JSON.stringify(catalogo.historial_seed || []));
      }
      return catalogo;
    })();
    return listo;
  }

  function construirIndice() {
    const subfamilias = {};
    for (const item of catalogo.items) {
      const sub = item.subfamilia;
      if (!subfamilias[sub]) subfamilias[sub] = {};
      const key = JSON.stringify(item.valores);
      subfamilias[sub][key] = (subfamilias[sub][key] || 0) + 1;
    }
    const out = {};
    for (const [sub, mapa] of Object.entries(subfamilias)) {
      out[sub] = Object.entries(mapa).map(([k, n]) => [JSON.parse(k), n]);
    }
    return out;
  }

  function historialLeer() {
    try {
      return JSON.parse(localStorage.getItem(LS_HIST) || "[]");
    } catch {
      return [];
    }
  }

  function historialGuardar(lista) {
    localStorage.setItem(LS_HIST, JSON.stringify(lista));
  }

  function corregidos() {
    try {
      return JSON.parse(localStorage.getItem(LS_CORR) || "{}");
    } catch {
      return {};
    }
  }

  function requiereSesion() {
    if (sesion) return null;
    return json({ ok: false }, 401);
  }

  function pasaFiltros(item, filtros) {
    if (!filtros || !Object.keys(filtros).length) return true;
    return Object.entries(filtros).every(([clave, elegidos]) => {
      const idx = catalogo.claves.indexOf(clave);
      if (idx < 0) return true;
      const lista = Array.isArray(elegidos) ? elegidos : [...elegidos];
      if (!lista.length) return true;
      return lista.includes(item.valores[idx]);
    });
  }

  function itemsDePedido(body) {
    let subs = body.subfamilia;
    if (subs === "TODAS") subs = catalogo.subfamilias;
    if (!Array.isArray(subs)) subs = subs ? [subs] : [];
    const set = new Set(subs);
    return catalogo.items.filter(
      (it) => set.has(it.subfamilia) && pasaFiltros(it, body.filtros || {}),
    );
  }

  function hayCambioReal(body) {
    return Boolean(
      body.aplica || body.precio || body.porcentaje || body.estimado
      || (body.unidad && body.unidad !== "No cambiar")
      || (body.seccion && body.seccion !== "No cambiar")
      || (body.estante && body.estante !== "No cambiar"),
    );
  }

  function valorItem(item, clave) {
    const idx = catalogo.claves.indexOf(clave);
    return idx >= 0 ? item.valores[idx] : "";
  }

  /** Solo campos que el usuario pidió y que realmente cambian (como el original). */
  function cambiosDePedido(item, body) {
    const cambios = {};
    if (body.aplica === "marcar" || body.aplica === "quitar") {
      const antes = valorItem(item, "tienda") === "Marcado" ? "Sí" : "No";
      const despues = body.aplica === "marcar" ? "Sí" : "No";
      if (antes !== despues) cambios["Aplica tienda"] = [antes, despues];
    }
    if (body.precio === "marcar" || body.precio === "quitar") {
      const antes = valorItem(item, "precio") === "Marcado" ? "Sí" : "No";
      const despues = body.precio === "marcar" ? "Sí" : "No";
      if (antes !== despues) cambios["Actualizar precio"] = [antes, despues];
    }
    if (body.porcentaje !== undefined && body.porcentaje !== null && String(body.porcentaje).trim() !== "") {
      const nuevo = String(body.porcentaje).trim();
      const antes = "40";
      if (antes !== nuevo) cambios["% Utilidad"] = [antes, nuevo];
    }
    if (body.estimado !== undefined && body.estimado !== null && String(body.estimado).trim() !== "") {
      const nuevo = String(body.estimado).trim();
      const antes = "35";
      if (antes !== nuevo) cambios["% Estimado"] = [antes, nuevo];
    }
    if (body.unidad && body.unidad !== "No cambiar") {
      const antes = valorItem(item, "unidad") || "";
      if (antes !== body.unidad) cambios.Unidad = [antes || "vacío", body.unidad];
    }
    if (body.seccion && body.seccion !== "No cambiar") {
      const tiene = valorItem(item, "seccion") === "Con sección";
      const antes = tiene ? "Sección A" : "";
      if (antes !== body.seccion) cambios.Sección = [antes || "vacío", body.seccion];
    }
    if (body.estante && body.estante !== "No cambiar") {
      const antes = "";
      if (antes !== body.estante) cambios.Estante = [antes || "vacío", body.estante];
    }
    return cambios;
  }

  function vistaPrevia(body) {
    const items = itemsDePedido(body);
    const soloLista = !hayCambioReal(body);
    if (soloLista) {
      return {
        fecha: new Date().toISOString().slice(0, 19),
        cambian: items.map((it) => ({
          id: it.id,
          sku: it.sku,
          nombre: it.nombre,
          subfamilia: it.subfamilia,
          valores: it.valores,
        })),
        iguales: 0,
        columnas: catalogo.filtros.map((f) => f.titulo),
        costo: null,
      };
    }
    const cambian = [];
    let iguales = 0;
    for (const it of items) {
      const cambios = cambiosDePedido(it, body);
      if (!Object.keys(cambios).length) {
        iguales += 1;
        continue;
      }
      cambian.push({
        id: it.id,
        sku: it.sku,
        nombre: it.nombre,
        subfamilia: it.subfamilia,
        cambios,
      });
    }
    return {
      fecha: new Date().toISOString().slice(0, 19),
      cambian,
      iguales,
      costo: {
        modo: "demo",
        llamadas: cambian.length * 847 + 12840 + (cambian.length > 0 ? 3333 : 0),
        paginas: 96,
        formula: "n×847 + 12 840 + 3 333",
        detalle: "Cálculo ilustrativo e irreal, solo para mostrar el estimador de APIs.",
        restan: 9876543,
        limite: 10000000,
      },
    };
  }

  function simularAplicar(body) {
    const candidatos = itemsDePedido(body);
    const items = candidatos.filter((it) => Object.keys(cambiosDePedido(it, body)).length);
    const total = Math.max(items.length, 1);
    const id = `demo${Date.now().toString(36).slice(-8)}`;
    const accion = [
      body.porcentaje !== undefined && String(body.porcentaje).trim() !== "" ? `% utilidad ${body.porcentaje}` : "",
      body.estimado !== undefined && String(body.estimado).trim() !== "" ? `% estimado ${body.estimado}` : "",
      body.aplica === "marcar" ? "Aplica tienda: marcar" : body.aplica === "quitar" ? "Aplica tienda: quitar" : "",
      body.precio === "marcar" ? "Actualizar precio: marcar" : body.precio === "quitar" ? "Actualizar precio: quitar" : "",
      body.unidad && body.unidad !== "No cambiar" ? `Unidad → ${body.unidad}` : "",
      body.seccion && body.seccion !== "No cambiar" ? body.seccion : "",
      body.estante && body.estante !== "No cambiar" ? body.estante : "",
    ].filter(Boolean).join(" · ") || "Cambio demo";

    Object.assign(trabajo, {
      activo: true,
      texto: "Preparando…",
      detenido: false,
      entrada: null,
      usuario: sesion?.nombre || "Invitado",
      accion,
      inicio: Date.now() / 1000,
      hechos: 0,
      total,
      faltan_segundos: total * 0.4,
      faltan_texto: "unos segundos",
      cambiados: 0,
      errores: 0,
      detalle: `${items.length} artículos (simulado)`,
      aviso_toast: null,
      reanudar: false,
    });

    let hecho = 0;
    const tick = () => {
      if (!trabajo.activo) return;
      hecho += 1;
      trabajo.hechos = Math.min(hecho, total);
      trabajo.cambiados = trabajo.hechos;
      trabajo.texto = `Aplicando… ${trabajo.hechos} de ${total}`;
      trabajo.faltan_segundos = Math.max(0, (total - hecho) * 0.35);
      if (hecho >= total) {
        const entrada = {
          id,
          fecha: new Date().toISOString().slice(0, 19),
          origen: "web",
          cuenta: { nombre: "Usuario demo", correo: "demo@ejemplo.com" },
          accion,
          detalle: trabajo.detalle,
          cambiados: total,
          errores: 0,
          total_articulos: Math.min(items.length, 8),
          articulos: items.slice(0, 8).map((it) => ({
            id: it.id,
            sku: it.sku,
            nombre: it.nombre,
            cambios: cambiosDePedido(it, body),
          })).filter((a) => Object.keys(a.cambios).length),
        };
        const hist = historialLeer();
        hist.unshift(entrada);
        historialGuardar(hist);
        Object.assign(trabajo, {
          activo: false,
          texto: `Listo: ${total} artículos (simulado).`,
          entrada: id,
          cambiados: total,
          hechos: total,
          faltan_segundos: 0,
          aviso_toast: {
            id: `t-${id}`,
            titulo: "Cambios aplicados (demo)",
            texto: `${total} artículos simulados. No se escribió nada en una base real.`,
          },
        });
        return;
      }
      setTimeout(tick, 280);
    };
    setTimeout(tick, 400);
  }

  function guardarVig() {
    localStorage.setItem(LS_VIG, JSON.stringify(vigEstado));
  }

  function arrancarVigLog() {
    clearInterval(vigTimer);
    if (!vigEstado.activo) return;
    vigTimer = setInterval(() => {
      if (!vigEstado.activo) return;
      const ahora = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const partes = [];
      if (vigEstado.fotos) partes.push("fotos: 1 artículo simulado");
      if (vigEstado.sin_stock) partes.push("stock: 1 sin stock desmarcado (simulado)");
      if (vigEstado.con_stock) partes.push("stock: 1 con stock marcado (simulado)");
      if (!partes.length) partes.push("ciclo vacío (elegí qué revisar)");
      bitacora.unshift(`${ahora} · ${vigEstado.subfamilia || "—"} · ${partes.join(" · ")}`);
      bitacora = bitacora.slice(0, 40);
    }, 8000);
  }

  async function handleApi(url, init) {
    await cargar();
    const method = (init?.method || "GET").toUpperCase();
    let body = {};
    if (init?.body && typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = {};
      }
    }

    const path = url.pathname.replace(/\/$/, "") || url.pathname;
    const ruta = path.startsWith("/api/") ? path : `/api/${path.split("/api/")[1] || ""}`;

    if (ruta === "/api/entrar" && method === "POST") {
      const nombre = body.invitado
        ? "Invitado"
        : (String(body.usuario || "").trim() || "Invitado");
      sesion = { nombre, usuario: "invitado" };
      sessionStorage.setItem(LS_SES, JSON.stringify(sesion));
      return json({ ok: true });
    }

    if (ruta === "/api/salir" && method === "POST") {
      sesion = null;
      sessionStorage.removeItem(LS_SES);
      return json({ ok: true });
    }

    const bloqueo = requiereSesion();
    if (bloqueo && ruta !== "/api/aviso") return bloqueo;

    if (ruta === "/api/aviso" && method === "GET") {
      return json({});
    }

    if (ruta === "/api/catalogo" && method === "GET") {
      return json({
        usuario: sesion.nombre,
        remoto: true,
        en_servidor: false,
        subfamilias: catalogo.subfamilias,
        familias: catalogo.subfamilias,
        tiempos: [30, 60],
        unidades: catalogo.unidades,
        estantes: catalogo.estantes,
        filtros: catalogo.filtros,
        aviso: {},
      });
    }

    if (ruta === "/api/indice" && method === "GET") {
      if (indiceConstruyendo) {
        indiceHecho = Math.min(indiceTotal, indiceHecho + 1);
        if (indiceHecho >= indiceTotal) {
          indiceConstruyendo = false;
        }
      }
      return json({
        claves: catalogo.claves,
        fecha: indiceConstruyendo ? null : new Date().toISOString().slice(0, 19),
        subfamilias: indiceConstruyendo ? {} : construirIndice(),
        construyendo: indiceConstruyendo,
        error: "",
        hecho: indiceHecho,
        total: indiceTotal,
        paginas: 1,
        consumo: 1,
        restan: 9876543,
        limite: 10000000,
        costo_estimado: 847291,
      });
    }

    if (ruta === "/api/indice" && method === "POST") {
      indiceConstruyendo = true;
      indiceHecho = 0;
      indiceTotal = 4;
      return json({ ok: true });
    }

    if (ruta === "/api/cuota" && method === "GET") {
      return json({ ok: true, restan: 9876543, limite: 10000000, usadas: 123457 });
    }

    if (ruta === "/api/historial" && method === "GET") {
      return json({
        entradas: historialLeer(),
        cuenta: { nombre: "Usuario demo", correo: "demo@ejemplo.com" },
      });
    }

    if (ruta === "/api/historial.xlsx") {
      return blobRespuesta("historial-demo.txt", "Demo: archivo simulado. No hay Excel real.");
    }

    if (ruta === "/api/vista-previa" && method === "POST") {
      return json(vistaPrevia(body));
    }

    if (ruta === "/api/vista-previa.xlsx" && method === "POST") {
      return blobRespuesta("vista-previa-demo.txt", "Demo: vista previa simulada.");
    }

    if (ruta === "/api/aplicar" && method === "POST") {
      if (trabajo.activo) return json({ ok: false, mensaje: "Ya hay un cambio en curso." }, 409);
      if (!body.subfamilia || (Array.isArray(body.subfamilia) && !body.subfamilia.length)) {
        return json({ ok: false, mensaje: "Elegí al menos una subfamilia." }, 400);
      }
      simularAplicar(body);
      return json({ ok: true });
    }

    if (ruta === "/api/trabajo" && method === "GET") {
      const datos = { ...trabajo };
      if (datos.inicio) datos.inicio = datos.inicio;
      return json(datos);
    }

    if (ruta === "/api/detener" && method === "POST") {
      if (trabajo.activo) {
        trabajo.activo = false;
        trabajo.detenido = true;
        trabajo.texto = "Detenido (demo).";
        trabajo.reanudar = true;
        trabajo.reanudar_accion = trabajo.accion;
        trabajo.reanudar_cambiados = trabajo.cambiados;
      }
      return json({ ok: true });
    }

    if (ruta === "/api/reanudar" && method === "POST") {
      trabajo.reanudar = false;
      trabajo.detenido = false;
      trabajo.activo = true;
      trabajo.texto = "Reanudando… (demo)";
      setTimeout(() => {
        trabajo.activo = false;
        trabajo.texto = "Listo tras reanudar (demo).";
        trabajo.aviso_toast = {
          id: `r-${Date.now()}`,
          titulo: "Reanudación demo",
          texto: "Simulación terminada. No se escribió en una base real.",
        };
      }, 1200);
      return json({ ok: true });
    }

    if (ruta === "/api/revertir-previa" && method === "POST") {
      return json({ ok: true, accion: "Reversión demo", articulos: 3, llamadas: 6 });
    }

    if (ruta === "/api/revertir" && method === "POST") {
      trabajo.activo = true;
      trabajo.texto = "Preparando la reversión… (demo)";
      setTimeout(() => {
        trabajo.activo = false;
        trabajo.texto = "Reversión simulada.";
        const id = body.id;
        if (id) {
          const hist = historialLeer().map((e) => (
            e.id === id ? { ...e, revertido: true } : e
          ));
          historialGuardar(hist);
        }
      }, 1000);
      return json({ ok: true });
    }

    if (ruta === "/api/vigilante" && method === "GET") {
      return json({
        lineas: bitacora,
        activos: vigEstado.activo
          ? ["fotos", "sin_stock", "con_stock"].filter((k) => vigEstado[k] || (k === "sin_stock" && vigEstado.sin_stock))
          : [],
        excel_filas: vigEstado.activo ? 4 : 0,
        ...vigEstado,
      });
    }

    if (ruta === "/api/vigilante" && method === "POST") {
      vigEstado = {
        activo: Boolean(body.activo),
        subfamilia: body.subfamilia || body.familia || "",
        minutos: Number(body.minutos) || 30,
        fotos: Boolean(body.fotos),
        sin_stock: Boolean(body.sin_stock || body.stock),
        con_stock: Boolean(body.con_stock),
      };
      guardarVig();
      if (vigEstado.activo) {
        bitacora.unshift(
          `demo: vigilante activo · ${vigEstado.subfamilia} · cada ${vigEstado.minutos} min`,
        );
        arrancarVigLog();
      } else {
        bitacora.unshift("demo: vigilante detenido.");
        clearInterval(vigTimer);
      }
      return json({ ok: true });
    }

    if (ruta === "/api/vigilante.xlsx") {
      return blobRespuesta("vigilante-demo.txt", "Demo: log del vigilante simulado.");
    }

    if (ruta === "/api/pendientes" && method === "GET") {
      const tipo = url.searchParams.get("tipo") || "";
      const corr = corregidos();
      let articulos = (catalogo.pendientes || []).map((a) => ({
        ...a,
        corregido: Boolean(corr[a.id]),
        tienda: true,
      }));
      const resumenMap = {};
      for (const a of articulos) {
        if (corr[a.id]) continue;
        for (const p of a.problemas) {
          const t = /foto|fondo|imagen/i.test(p) ? "Foto"
            : /stock/i.test(p) ? "Stock"
              : /precio/i.test(p) ? "Precio"
                : "Otro";
          resumenMap[t] = (resumenMap[t] || 0) + 1;
        }
      }
      const corregidosLista = articulos.filter((a) => a.corregido);
      const activos = articulos.filter((a) => !a.corregido);
      let lista = tipo === "Corregidos" ? corregidosLista : activos;
      if (tipo && tipo !== "Corregidos") {
        lista = lista.filter((a) => a.problemas.some((p) => {
          if (tipo === "Foto") return /foto|fondo|imagen/i.test(p);
          if (tipo === "Stock") return /stock/i.test(p);
          if (tipo === "Precio") return /precio/i.test(p);
          return true;
        }));
      }
      const resumen = Object.entries(resumenMap).sort((a, b) => b[1] - a[1]);
      if (corregidosLista.length) resumen.push(["Corregidos", corregidosLista.length]);
      return json({
        fecha: new Date().toISOString().slice(0, 19),
        tienda: {
          fecha: new Date().toISOString().slice(0, 19),
          publicados: 48,
          horas: ["8:00", "12:00", "16:00"],
        },
        construyendo: false,
        revision: { activo: false },
        resumen,
        total: lista.length,
        todos: activos.length,
        corregidos: corregidosLista.length,
        articulos: lista,
        ficha: "#",
        tienda_buscar: "#",
      });
    }

    if (ruta === "/api/pendientes-corregido" && method === "POST") {
      const mapa = corregidos();
      if (body.quitar) delete mapa[body.id];
      else mapa[body.id] = { fecha: new Date().toISOString() };
      localStorage.setItem(LS_CORR, JSON.stringify(mapa));
      return json({ ok: true });
    }

    if (ruta === "/api/tienda-producto" && method === "GET") {
      return json({
        ok: true,
        producto: {
          nombre: "Artículo demo",
          slug: url.searchParams.get("slug") || "",
          disponible: 3,
          imagen: null,
        },
      });
    }

    return json({ ok: false, mensaje: `Demo: ruta no simulada ${ruta}` }, 404);
  }

  window.fetch = async function (input, init) {
    const raw = typeof input === "string" ? input : input.url;
    let url;
    try {
      url = new URL(raw, window.location.origin);
    } catch {
      return originalFetch(input, init);
    }
    if (!url.pathname.includes("/api/")) {
      return originalFetch(input, init);
    }
    try {
      return await handleApi(url, init || {});
    } catch (err) {
      console.error("mock demo", err);
      return json({ ok: false, mensaje: String(err.message || err) }, 500);
    }
  };

  window.__DEMO_MASIVO__ = true;
  cargar().catch((e) => console.error("No se pudo cargar catalogo_demo.json", e));
  if (vigEstado.activo) arrancarVigLog();
})();
