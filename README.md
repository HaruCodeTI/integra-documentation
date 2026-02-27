# Integra Docs

Portal público de documentação do Integra ERP com conteúdo em MDX, sidebar por módulos, busca textual e manifesto de vídeos.

## Scripts

- `npm run scaffold:docs`
- `npm run generate:index`
- `npm run validate:content`
- `npm run videos:manifest`
- `npm run videos:capture`
- `npm run dev`
- `npm run build`

## Captura de Vídeos

- Variáveis obrigatórias:
- `DOCS_CAPTURE_BASE_URL`
- `DOCS_CAPTURE_USER`
- `DOCS_CAPTURE_PASSWORD`
- Variáveis opcionais:
- `DOCS_CAPTURE_LIMIT` para rodar apenas os N primeiros cenários
- `DOCS_CAPTURE_MIN_SECONDS` para definir duração mínima de cada vídeo

Exemplo:

```bash
DOCS_CAPTURE_BASE_URL="https://staging.integra-erp.app.br" \
DOCS_CAPTURE_USER="admin" \
DOCS_CAPTURE_PASSWORD="admin" \
DOCS_CAPTURE_LIMIT=12 \
DOCS_CAPTURE_MIN_SECONDS=60 \
npm run videos:capture
```

## Deploy Cloudflare Pages

- Build command: `npm run build`
- Build output: `out`
