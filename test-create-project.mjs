import { chromium } from 'playwright';

const URL = 'http://localhost:3000';
const EMAIL = 'eliel2801@gmail.com';
const PASSWORD = '35473547';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  console.log('1. Navigating...');
  await page.goto(URL);
  await page.waitForLoadState('networkidle');

  console.log('2. Logging in...');
  await page.locator('input[type="email"]').waitFor({ timeout: 10000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(4000);

  // TAB 1: Tu Negocio
  console.log('3. Tab 1 - Ya tengo un nombre...');
  await page.locator('text=Ya tengo un nombre').click();
  await page.waitForTimeout(1500);

  await page.locator('input[placeholder="Escribe el nombre de tu empresa..."]').fill('Café Digital Barcelona');
  await page.locator('textarea[placeholder*="Cuéntanos qué hace"]').fill('Cafetería moderna especializada en café de especialidad y experiencias digitales. Ubicados en Barcelona, combinamos café artesanal con tecnología.');
  await page.locator('input[placeholder="info@tuempresa.com"]').fill('info@cafedigital.es');
  await page.locator('input[placeholder="Ej: 2020"]').fill('2024');
  await page.locator('textarea[placeholder*="Calle, número"]').fill('Carrer de València 234, 08007 Barcelona');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  console.log('4. Tab 1 -> Siguiente...');
  await page.locator('button:has-text("Siguiente")').first().click();
  await page.waitForTimeout(2000);

  // TAB 2: Estrategia
  console.log('5. Tab 2 - "Aún no tengo, quiero crearla"...');
  await page.locator('text=Aún no tengo, quiero crearla').click();
  await page.waitForTimeout(2000);

  // Fill visible textareas after selecting identity option
  const tas = await page.locator('textarea:visible').all();
  console.log(`  Found ${tas.length} textareas`);
  for (const ta of tas) {
    const val = await ta.inputValue();
    const ph = await ta.getAttribute('placeholder').catch(() => '');
    if (!val && ph) {
      if (ph.toLowerCase().includes('público') || ph.toLowerCase().includes('target') || ph.toLowerCase().includes('audiencia')) {
        await ta.fill('Jóvenes profesionales de 25-40 años, nómadas digitales y amantes del café artesanal en Barcelona.');
        console.log('  - Filled target audience');
      } else if (ph.toLowerCase().includes('competid')) {
        await ta.fill('Starbucks, Satan\'s Coffee Corner, Nomad Coffee Lab');
        console.log('  - Filled competitors');
      } else if (!val) {
        await ta.fill('Ambiente moderno, minimalista, con toques industriales y acogedores.');
        console.log(`  - Filled textarea: ${ph.substring(0, 40)}`);
      }
    }
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  console.log('6. Tab 2 -> Siguiente...');
  const nextBtn2 = page.locator('button:has-text("Siguiente")').first();
  if (await nextBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextBtn2.click();
    await page.waitForTimeout(2000);
  } else {
    // Click Visual tab directly
    await page.locator('button:has-text("Visual")').click();
    await page.waitForTimeout(2000);
  }

  // TAB 3: Visual
  console.log('7. Tab 3...');
  await page.screenshot({ path: 'screenshot-tab3.png', fullPage: true });

  // Log what's on the page
  const bodyText3 = await page.locator('body').innerText();
  console.log('Tab 3 first 600 chars:', bodyText3.substring(0, 600));

  // Fill WhatsApp if visible
  const allInputs = await page.locator('input:visible').all();
  for (const inp of allInputs) {
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    if (ph && (ph.includes('+34') || ph.toLowerCase().includes('whatsapp'))) {
      await inp.fill('+34 612 345 678');
      console.log('  - Filled WhatsApp');
    }
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Submit
  console.log('8. Looking for submit button...');
  const allButtons = await page.locator('button:visible').all();
  for (const btn of allButtons) {
    const text = await btn.innerText().catch(() => '');
    console.log(`  Button: "${text.trim()}"`);
  }

  const submitBtn = page.locator('button:has-text("Enviar Proyecto"), button:has-text("Finalizar"), button:has-text("Enviar")').first();
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitBtn.click();
    console.log('9. Clicked submit!');
    await page.waitForTimeout(2000);

    const confirmBtn = page.locator('button:has-text("Confirmar")').last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      console.log('10. Confirmed!');
      await page.waitForTimeout(4000);
    }
  } else {
    console.log('  Submit button not found');
  }

  await page.screenshot({ path: 'screenshot-final.png', fullPage: true });
  console.log('11. Done! Waiting 15s...');
  await page.waitForTimeout(15000);
  await browser.close();
})();
