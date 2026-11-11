const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  // Deterministic weather; no dependency on external APIs during tests.
  await page.route('https://api.open-meteo.com/**', route => route.fulfill({
    json: { current: { precipitation: 0, weather_code: 0 } }
  }));
});

test('home loads, theme persists and no runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Tecnología que');
  await expect(page.locator('#disponible')).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('mobile menu opens, closes on navigation and supports Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir navegación' });
  await expect(page.locator('.menu')).not.toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.locator('.menu a[href="#proyectos"]').click();
  await expect(page.locator('.menu')).not.toBeVisible();
});

test('diagnostic and quote feed the contact message', async ({ page }) => {
  await page.goto('/');
  for (let step = 0; step < 4; step++) await page.locator('#diag-body .opt').first().click();
  await expect(page.locator('#diag-body')).toContainText('Parte por un diagnóstico de tu red');
  await page.getByRole('button', { name: 'Usar este mensaje' }).click();
  await expect(page.locator('#f-mensaje')).toHaveValue(/Hice el diagnóstico/);
  await expect(page.locator('#f-servicio')).toHaveValue('Redes');
  await page.locator('#q-sitio').check();
  await expect(page.locator('#q-tam')).toHaveText('Proyecto pequeño');
  await page.locator('#q-add').click();
  await expect(page.locator('#f-mensaje')).toHaveValue(/Sitio web para presentar mi negocio/);
  await expect(page.locator('#f-correo')).toHaveAttribute('href', /mailto:.*body=/);
});

test('mascot responds, respects server failures, and terminal controls states', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.Kori.despertar());
  await page.locator('#ping-btn').click();
  await expect(page.locator('#ping-out')).toContainText('ms entre tú y este sitio');
  await page.route('**/*ping=*', route => route.fulfill({ status: 503 }));
  expect(await page.evaluate(() => window.Kori.medir())).toBeNull();
  await page.locator('#term-open').click();
  await expect(page.locator('#terminal')).toBeVisible();
  await page.locator('#term-input').fill('kori dormir');
  await page.locator('#term-input').press('Enter');
  await expect(page.locator('#ping')).toHaveClass(/is-asleep/);
  await page.locator('#term-input').fill('kori lluvia');
  await page.locator('#term-input').press('Enter');
  await expect(page.locator('#ping')).toHaveClass(/is-rainy/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#terminal')).not.toBeVisible();
  await expect(page.locator('#term-open')).toBeFocused();
});

test('no horizontal overflow at 320, 390, 768 and 1440 pixels', async ({ page }) => {
  const pages = ['/', '/bitacora/index.html', '/bitacora/router-on-a-stick.html', '/casos/biblionexo.html', '/tarjeta.html', '/404.html'];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }
});

test('automated accessibility checks in light, dark and mobile modes', async ({ page }) => {
  // Audit settled colors, not intermediate frames of a theme transition.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const mode of ['light', 'dark', 'mobile']) {
    await page.setViewportSize({ width: mode === 'mobile' ? 390 : 1440, height: 900 });
    await page.goto('/');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, mode === 'dark' ? 'dark' : 'light');
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary}))})), mode).toEqual([]);
  }
});

test('inner pages have valid navigation, QR and no runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const path of ['/bitacora/index.html', '/bitacora/router-on-a-stick.html', '/casos/biblionexo.html', '/tarjeta.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
  }
  await expect(page.locator('#qr svg')).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion disables animation and failed form validation focuses message', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.ping .head').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.locator('#f-copiar').click();
  await expect(page.locator('#f-mensaje')).toBeFocused();
  await expect(page.locator('#f-nota')).toHaveText('Escribe primero qué necesitas.');
});

test('access index filters projects and links to real destinations', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('#accesos .acceso-row');
  await expect(rows).toHaveCount(7);
  // Todos los enlaces externos abren en pestaña nueva y son seguros.
  const externos = page.locator('#accesos a[target="_blank"]');
  const total = await externos.count();
  expect(total).toBeGreaterThan(5);
  for (let i = 0; i < total; i++) {
    await expect(externos.nth(i)).toHaveAttribute('rel', /noopener/);
    await expect(externos.nth(i)).toHaveAttribute('href', /^https:\/\//);
  }
  // Filtro «Código»: ningún proyecto queda fuera, todos tienen repositorio.
  await page.locator('.accesos-filters button[data-filter="codigo"]').click();
  await expect(page.locator('#accesos .acceso-row:visible')).toHaveCount(7);
  // Filtro «En línea»: solo los que tienen demo publicada.
  await page.locator('.accesos-filters button[data-filter="online"]').click();
  await expect(page.locator('#accesos .acceso-row:visible')).toHaveCount(4);
  await expect(page.locator('.accesos-filters button[data-filter="online"]')).toHaveAttribute('aria-pressed', 'true');
  // Volver a todos restaura el índice completo.
  await page.locator('.accesos-filters button[data-filter="todos"]').click();
  await expect(page.locator('#accesos .acceso-row:visible')).toHaveCount(7);
  // El ancla del menú lleva a la sección sin quedar tapada por el nav pegajoso.
  await page.locator('.menu a[href="#accesos"]').click();
  await page.waitForTimeout(600);
  const nav = await page.locator('.nav').boundingBox();
  const eyebrow = await page.locator('#accesos .eyebrow').boundingBox();
  expect(eyebrow.y).toBeGreaterThan(nav.y + nav.height);
});

test('capture desktop, mobile and dark theme for visual review', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.Kori.despertar();
  });
  await page.screenshot({ path: testInfo.outputPath('escritorio-claro.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
  await page.screenshot({ path: testInfo.outputPath('escritorio-oscuro.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
  await page.locator('#proyectos').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('proyectos.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath('movil.png'), animations: 'disabled' });
});
