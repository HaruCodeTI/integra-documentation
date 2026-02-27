import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const scenariosPath = path.join(root, 'playwright', 'video-scenarios.json')
const docsManifestPath = path.join(root, 'data', 'videos-manifest.json')
const outputDir = path.join(root, 'public', 'videos')

const baseUrl = process.env.DOCS_CAPTURE_BASE_URL
const userEmail = process.env.DOCS_CAPTURE_USER
const userPassword = process.env.DOCS_CAPTURE_PASSWORD

if (!baseUrl || !userEmail || !userPassword) {
  throw new Error('Defina DOCS_CAPTURE_BASE_URL, DOCS_CAPTURE_USER e DOCS_CAPTURE_PASSWORD')
}

const scenarios = JSON.parse(await fs.readFile(scenariosPath, 'utf-8'))
const manifest = JSON.parse(await fs.readFile(docsManifestPath, 'utf-8'))

const browser = await chromium.launch({ headless: true })

for (const scenario of scenarios) {
  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  })

  const page = await context.newPage()
  const video = page.video()
  await page.goto(`${baseUrl}/auth/sign-in`, { waitUntil: 'networkidle' })
  await page.getByLabel('E-mail').fill(userEmail)
  await page.getByLabel('Senha').fill(userPassword)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: 'networkidle' })

  for (const selector of scenario.requiredSelectors) {
    await page.waitForSelector(selector, { timeout: 15000 })
  }

  await page.waitForTimeout(7000)
  await context.close()
  const videoPath = await video.path()
  const fileName = `${scenario.docSlug.replaceAll('/', '-')}-v2.mp4`
  await fs.copyFile(videoPath, path.join(outputDir, fileName))

  const manifestEntry = manifest.find((item) => item.docSlug === scenario.docSlug)
  if (manifestEntry) {
    manifestEntry.videoPath = `/videos/${fileName}`
    manifestEntry.capturedAt = new Date().toISOString()
  }

}

await fs.writeFile(docsManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
await browser.close()
