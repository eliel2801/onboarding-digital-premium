import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await page.goto('http://localhost:3000');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Login OK');

  // Nuevo Proyecto > Necesito crear un nombre
  await page.click('button:has-text("Nuevo Proyecto")');
  await page.waitForTimeout(1500);
  await page.click('button:has-text("Necesito crear un nombre")');
  await page.waitForTimeout(1500);
  console.log('Chat aberto');

  // Msg 1: Descripción del estudio
  await page.fill('textarea', 'Tengo un estudio audiovisual en Alicante, España. Hacemos producción de video profesional, podcasts, fotografía para marcas y contenido digital. Queremos un nombre que suene moderno y creativo.');
  await page.waitForTimeout(300);
  // Press Enter to send
  await page.press('textarea', 'Enter');
  console.log('Msg 1 enviada');

  // Wait for AI response
  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'ss3-01.png', fullPage: true });
  console.log('Screenshot 1');

  // Click relevant option button
  for (const t of ['Empresas B2B', 'Empresas y marcas', 'Profesionales 30-50', 'Público general']) {
    const b = await page.$(`button:text-is("${t}")`);
    if (b && await b.isVisible()) { await b.click(); console.log('Clicou:', t); break; }
  }
  // Fallback: type
  await page.waitForTimeout(1000);

  // Wait AI
  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'ss3-02.png', fullPage: true });
  console.log('Screenshot 2');

  // Click option
  for (const t of ['Moderno e innovador', 'Premium y exclusivo', 'Creativo y fresco']) {
    const b = await page.$(`button:text-is("${t}")`);
    if (b && await b.isVisible()) { await b.click(); console.log('Clicou:', t); break; }
  }

  // Wait AI - should be names now!
  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'ss3-03.png', fullPage: true });
  console.log('Screenshot 3');

  // If there are more options, click one more
  for (const t of ['Nombre inventado (Kodak)', 'Fusión de palabras (Instagram)', 'Palabra real (Apple)']) {
    const b = await page.$(`button:text-is("${t}")`);
    if (b && await b.isVisible()) { await b.click(); console.log('Clicou:', t); break; }
  }

  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'ss3-04-final.png', fullPage: true });
  console.log('Screenshot final');

  console.log('DONE! Navegador aberto 5 min.');
  await page.waitForTimeout(300000);
  await browser.close();
})();
