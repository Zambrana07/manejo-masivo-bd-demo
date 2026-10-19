# Manejo masivo de bases de datos · Demo

Demo **100 % estática y simulada** para portafolio: cambios masivos por subfamilia, vigilante, historial y estimación de APIs.

- Sin backend, sin secretos, sin base de datos real.
- Datos inventados (`Subfamilia 1`, `Medida 1`, `Estante ejemplo 1`, …).
- `mock.js` responde a `/api/*` en el navegador.
- Estimador de llamadas a la API con fórmula ilustrativa (números irreales a propósito).

## Probar en local

```bash
npx --yes serve -l 5173
```

Abrí http://localhost:5173 → **Entrar como invitado**.

## Publicar en Vercel

1. Importá este repositorio en [vercel.com/new](https://vercel.com/new)
2. Framework: **Other**
3. Build Command: *(vacío)*
4. Output Directory: `.` *(o vacío)*
5. Deploy

No hace falta Root Directory: el repo es solo esta carpeta.
