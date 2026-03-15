# Pabl.ING

Landing vaporwave, desktop fake Win95. React + Vite.

**Requisitos:** Node.js

```bash
npm install
```

Opcional: `.env` com `GEMINI_API_KEY` se for usar API.

**Dev:** `npm run dev` (porta 3589)

**Build:** `npm run build` → gera `dist/`

**Produção (PM2):**  
`npm run build`  
`pm2 start ecosystem.config.cjs`

Úteis: `pm2 logs`, `pm2 stop pabling`, `pm2 restart pabling`

Deploy: build + servir `dist` (ou rodar server.js com PM2).
