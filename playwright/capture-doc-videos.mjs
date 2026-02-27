import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const scenariosPath = path.join(root, 'playwright', 'video-scenarios.json')
const mappingPath = path.join(root, 'data', 'docs-mapping.json')
const docsManifestPath = path.join(root, 'data', 'videos-manifest.json')
const outputDir = path.join(root, 'public', 'videos')

const baseUrl = process.env.DOCS_CAPTURE_BASE_URL
const userEmail = process.env.DOCS_CAPTURE_USER
const userPassword = process.env.DOCS_CAPTURE_PASSWORD
const limit = Number(process.env.DOCS_CAPTURE_LIMIT || '0')
const minSeconds = Number(process.env.DOCS_CAPTURE_MIN_SECONDS || '55')
const minMs = Math.max(12000, minSeconds * 1000)

if (!baseUrl || !userEmail || !userPassword) {
  throw new Error('Defina DOCS_CAPTURE_BASE_URL, DOCS_CAPTURE_USER e DOCS_CAPTURE_PASSWORD')
}

const rawScenarios = JSON.parse(await fs.readFile(scenariosPath, 'utf-8'))
const scenarios = limit > 0 ? rawScenarios.slice(0, limit) : rawScenarios
const mapping = JSON.parse(await fs.readFile(mappingPath, 'utf-8'))
const mappingBySlug = new Map(mapping.map((item) => [item.doc_slug, item]))
const manifest = JSON.parse(await fs.readFile(docsManifestPath, 'utf-8'))

function cleanText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function pickText(item) {
  if (!item) return 'modulo'
  return cleanText(item.title).split(' ').slice(0, 3).join(' ')
}

async function safeClick(page, selectors) {
  for (const selector of selectors) {
    const el = page.locator(selector).first()
    try {
      await el.waitFor({ state: 'visible', timeout: 1500 })
      await el.click({ timeout: 2000 })
      return true
    } catch {}
  }
  return false
}

async function safeFill(page, selectors, value) {
  for (const selector of selectors) {
    const el = page.locator(selector).first()
    try {
      await el.waitFor({ state: 'visible', timeout: 1500 })
      await el.fill(value, { timeout: 2000 })
      return true
    } catch {}
  }
  return false
}

async function gotoLogin(page) {
  for (const route of ['/auth/sign-in', '/auth', '/login']) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    if ((await page.locator('input[type="password"]').count()) > 0) return
  }
  throw new Error('Tela de login não encontrada')
}

async function doLogin(page) {
  const okUser = await safeFill(
    page,
    [
      'input[name="email"]',
      'input[name="username"]',
      'input[type="email"]',
      'input[placeholder*="e-mail" i]',
      'input[placeholder*="usuario" i]',
      'input[placeholder*="usuário" i]',
    ],
    userEmail,
  )
  const okPass = await safeFill(
    page,
    ['input[name="password"]', 'input[type="password"]', 'input[placeholder*="senha" i]'],
    userPassword,
  )
  if (!okUser || !okPass) throw new Error('Campos de login não encontrados')
  const submitted = await safeClick(
    page,
    ['button[type="submit"]', 'button:has-text("Entrar")', 'button:has-text("Login")', 'input[type="submit"]'],
  )
  if (!submitted) throw new Error('Botão de login não encontrado')
  await page.waitForLoadState('networkidle')
}

async function warmNavigation(page, item) {
  await page.mouse.move(200, 150)
  await page.waitForTimeout(350)
  await safeClick(page, ['button[aria-label="Buscar modulo"]', 'button[title="Buscar modulo"]'])
  await page.waitForTimeout(350)
  const term = pickText(item)
  const filled = await safeFill(
    page,
    [
      'input[placeholder*="Digite nome do modulo" i]',
      'input[placeholder*="Buscar modulo" i]',
      '[cmdk-input]',
      'input[type="text"]',
    ],
    term,
  )
  if (filled) {
    await page.waitForTimeout(500)
    const clicked = await safeClick(page, ['[cmdk-item]', '[role="option"]', '[role="listbox"] [role="option"]'])
    if (!clicked) {
      await page.keyboard.press('ArrowDown').catch(() => {})
      await page.keyboard.press('Enter').catch(() => {})
    }
    await page.waitForTimeout(1200)
  }

  await safeClick(page, ['button[aria-label*="Toggle menu" i]', '[data-sidebar="trigger"]'])
  await page.waitForTimeout(600)
  await safeClick(page, ['button[aria-label*="Toggle menu" i]', '[data-sidebar="trigger"]'])
  await page.waitForTimeout(500)
}

async function runListFlow(page, item) {
  await safeFill(
    page,
    [
      'input[placeholder*="buscar" i]',
      'input[placeholder*="pesquisar" i]',
      'input[placeholder*="filtro" i]',
      'input[type="search"]',
    ],
    pickText(item),
  )
  await page.keyboard.press('Enter').catch(() => {})
  await page.waitForTimeout(1300)
  await safeClick(page, ['button:has-text("Buscar")', 'button:has-text("Filtrar")', 'button:has-text("Aplicar")'])
  await page.waitForTimeout(1100)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(700)
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(700)
}

function fakeValue(name, slug) {
  const tail = `${Date.now()}`.slice(-6)
  const key = cleanText(name).toLowerCase()
  if (key.includes('email')) return `docs.${tail}@integra-erp.app.br`
  if (key.includes('telefone') || key.includes('celular')) return '67999990000'
  if (key.includes('cnpj')) return '12345678000190'
  if (key.includes('cpf')) return '12345678901'
  if (key.includes('cep')) return '79080050'
  if (key.includes('senha')) return 'Senha@123'
  if (key.includes('valor') || key.includes('preco') || key.includes('quantidade')) return '100'
  return `${slug.split('/').pop()} ${tail}`
}

async function fillForm(page, slug) {
  const fields = page.locator('input:not([type="hidden"]):not([readonly]), textarea:not([readonly])')
  const count = await fields.count()
  let total = 0
  for (let i = 0; i < count && total < 8; i += 1) {
    const field = fields.nth(i)
    if (!(await field.isVisible().catch(() => false))) continue
    if (!(await field.isEditable().catch(() => false))) continue
    const type = ((await field.getAttribute('type').catch(() => 'text')) || 'text').toLowerCase()
    if (['file', 'radio', 'checkbox', 'submit', 'button'].includes(type)) continue
    const name = `${(await field.getAttribute('name').catch(() => '')) || ''} ${(await field.getAttribute('placeholder').catch(() => '')) || ''}`
    const value = fakeValue(name, slug)
    if (type === 'date') {
      await field.fill('2026-02-27').catch(() => {})
    } else {
      await field.fill(value).catch(() => {})
    }
    total += 1
    await page.waitForTimeout(180)
  }

  const selects = page.locator('select')
  const selectCount = await selects.count()
  for (let i = 0; i < selectCount && i < 3; i += 1) {
    const sel = selects.nth(i)
    if (!(await sel.isVisible().catch(() => false))) continue
    const options = await sel.locator('option').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('value')).filter((value) => value && value.trim().length > 0),
    )
    if (options.length > 0) {
      await sel.selectOption(String(options[0])).catch(() => {})
      await page.waitForTimeout(180)
    }
  }
}

async function runCreateAndEditFlow(page, item, scenario) {
  const created = await safeClick(
    page,
    [
      'button:has-text("Novo")',
      'button:has-text("Nova")',
      'button:has-text("Cadastrar")',
      'button:has-text("Criar")',
      'button:has-text("Adicionar")',
      'a:has-text("Novo")',
      'a:has-text("Nova")',
      'a:has-text("Cadastrar")',
    ],
  )

  if (created) {
    await page.waitForTimeout(1300)
    await fillForm(page, scenario.docSlug)
    await page.waitForTimeout(700)
    await safeClick(
      page,
      [
        'button:has-text("Salvar")',
        'button:has-text("Cadastrar")',
        'button:has-text("Criar")',
        'button:has-text("Confirmar")',
        'button[type="submit"]',
      ],
    )
    await page.waitForTimeout(2200)
  }

  await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(1000)

  const editOpen = await safeClick(
    page,
    [
      'button:has-text("Editar")',
      'a:has-text("Editar")',
      'button[title="Editar"]',
      'a[title="Editar"]',
      '[aria-label="Editar"]',
    ],
  )

  if (editOpen) {
    await page.waitForTimeout(1100)
    await fillForm(page, scenario.docSlug)
    await safeClick(page, ['button:has-text("Salvar")', 'button:has-text("Atualizar")', 'button[type="submit"]'])
    await page.waitForTimeout(1900)
  }
}

async function runFlow(page, scenario, item) {
  if (scenario.docSlug === 'acesso-e-navegacao/acessando-o-sistema') {
    await gotoLogin(page)
    await doLogin(page)
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
    await warmNavigation(page, item)
    return
  }

  if (scenario.docSlug === 'acesso-e-navegacao/recuperacao-de-senha') {
    await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'networkidle' })
    await safeFill(
      page,
      ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]', 'input[placeholder*="usuario" i]'],
      userEmail,
    )
    await page.waitForTimeout(500)
    await safeClick(page, ['button[type="submit"]', 'button:has-text("Enviar")', 'button:has-text("Recuperar")'])
    await page.waitForTimeout(2200)
    return
  }

  await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'networkidle' })

  for (const selector of scenario.requiredSelectors || []) {
    await page.waitForSelector(selector, { timeout: 12000 }).catch(() => {})
  }

  await warmNavigation(page, item)
  await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(900)
  await runListFlow(page, item)

  if (scenario.route.startsWith('/report') || scenario.docSlug.startsWith('relatorios/')) {
    await safeClick(page, ['button:has-text("Exportar")', 'a:has-text("Exportar")'])
    await page.waitForTimeout(1800)
    return
  }

  await runCreateAndEditFlow(page, item, scenario)
}

async function createLoggedState(browser) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await gotoLogin(page)
  await doLogin(page)
  const storagePath = path.join(root, 'playwright', '.storage-state.json')
  await ctx.storageState({ path: storagePath })
  await ctx.close()
  return storagePath
}

const browser = await chromium.launch({ headless: true })
const storageStatePath = await createLoggedState(browser)

for (let i = 0; i < scenarios.length; i += 1) {
  const scenario = scenarios[i]
  const item = mappingBySlug.get(scenario.docSlug)
  const label = item ? `${item.pdf_section_id} ${item.title}` : scenario.docSlug
  const started = Date.now()

  console.log(`[${i + 1}/${scenarios.length}] Iniciando ${label}`)

  const authOnly =
    scenario.docSlug === 'acesso-e-navegacao/acessando-o-sistema' ||
    scenario.docSlug === 'acesso-e-navegacao/recuperacao-de-senha'

  const context = await browser.newContext({
    storageState: authOnly ? undefined : storageStatePath,
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  })

  const page = await context.newPage()
  const video = page.video()

  try {
    await runFlow(page, scenario, item)

    const elapsed = Date.now() - started
    if (elapsed < minMs) {
      await page.waitForTimeout(minMs - elapsed)
    }

    await context.close()

    const tempPath = await video.path()
    const stat = await fs.stat(tempPath)
    const fileName = `${scenario.docSlug.replaceAll('/', '-')}-v2.mp4`
    const finalPath = path.join(outputDir, fileName)

    if (stat.size > 1024 * 80) {
      await fs.copyFile(tempPath, finalPath)
      const manifestEntry = manifest.find((entry) => entry.docSlug === scenario.docSlug)
      if (manifestEntry) {
        manifestEntry.videoPath = `/videos/${fileName}`
        manifestEntry.capturedAt = new Date().toISOString()
        manifestEntry.durationSec = Math.max(minSeconds, Math.round((Date.now() - started) / 1000))
      }
      console.log(`[${i + 1}/${scenarios.length}] Finalizado ${label}`)
    } else {
      console.error(`[${i + 1}/${scenarios.length}] Vídeo descartado por tamanho baixo (${label})`)
    }
  } catch (error) {
    await context.close().catch(() => {})
    console.error(`[${i + 1}/${scenarios.length}] Falha ${label}`)
    console.error(error)
  }
}

await fs.writeFile(docsManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
await browser.close()
