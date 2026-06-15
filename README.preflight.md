# Trae Preflight

This folder is prepared for `wangxt-994-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18294
- API_PORT: 19294
- WEB_PORT: 20294
- DB_PORT: 21294
- REDIS_PORT: 22294

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
