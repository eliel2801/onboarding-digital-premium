import { chromium } from 'playwright';

async function waitForNewAIMessage(page, previousAICount) {
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1000);
    // AI messages have the Bot icon + specific structure
    const aiMsgs = await page.$$('.flex.gap-3.justify-start');
    if (aiMsgs.length > previousAICount) {
      // Wait a bit more for rendering options/suggestions
      await page.waitForTimeout(2000);
      return aiMsgs.length;
    }
  }
  console.log('   TIMEOUT esperando resposta IA');
  return previousAICount;
}

async function clickFirstVisibleOption(page) {
  // Find option buttons inside AI messages (the ones with rounded-xl border-neutral-300)
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    const trimmed = text?.trim();
    // Skip navigation buttons, send buttons, etc.
    if (!trimmed || trimmed.length > 40 || trimmed.length < 3) continue;
    if (['Siguiente', 'Volver', 'Buscar', 'Copiar'].includes(trimmed)) continue;

    const cls = await btn.getAttribute('class');
    // Option buttons have rounded-xl and border-neutral-300
    if (cls?.includes('rounded-xl') && cls?.includes('border-neutral-300') && cls?.includes('text-xs')) {
      const visible = await btn.isVisible();
      if (visible) {
        console.log(`   Clicando opción: "${trimmed}"`);
        await btn.click();
        return trimmed;
      }
    }
  }
  console.log('   No se encontraron botones de opción');
  return null;
}

async function clickSpecificOption(page, preferred) {
  for (const text of preferred) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const btnText = (await btn.textContent())?.trim();
      if (btnText === text) {
        const visible = await btn.isVisible();
        if (visible) {
          console.log(`   Clicando: "${text}"`);
          await btn.click();
          return text;
        }
      }
    }
  }
  // Fallback to first visible option
  return clickFirstVisibleOption(page);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // === LOGIN ===
  console.log('1. Login...');
  await page.goto('http://localhost:3000');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   OK');

  // === NUEVO PROYECTO ===
  console.log('2. Nuevo Proyecto...');
  await page.click('button:has-text("Nuevo Proyecto")');
  await page.waitForTimeout(1500);

  // === NECESITO CREAR UN NOMBRE ===
  console.log('3. Entrando en chat IA...');
  await page.click('button:has-text("Necesito crear un nombre")');
  await page.waitForTimeout(1500);
  console.log('   OK');

  // === MENSAJE 1: Descripción del estudio ===
  console.log('4. Enviando descripción del estudio audiovisual...');
  const textarea = await page.$('textarea');
  await textarea.fill('Tengo un estudio audiovisual en Alicante, España. Hacemos producción de video profesional, podcasts, fotografía para marcas y contenido digital. Queremos un nombre que suene moderno y creativo.');
  await page.waitForTimeout(300);

  // Click the send button
  const sendBtn = await page.$('button:has(svg.lucide-send)');
  if (sendBtn) {
    await sendBtn.click();
  } else {
    await page.press('textarea', 'Enter');
  }
  console.log('   Enviada!');

  // === ESPERAR RESPUESTA 1 ===
  console.log('5. Esperando respuesta 1 (tipo de negocio)...');
  let aiCount = 0;
  aiCount = await waitForNewAIMessage(page, aiCount);
  await page.screenshot({ path: 'ss4-01-resp1.png', fullPage: true });
  console.log(`   AI respondió (${aiCount} msgs). Screenshot: ss4-01-resp1.png`);

  // List visible options
  const listOptions = async () => {
    const btns = await page.$$('button');
    const opts = [];
    for (const btn of btns) {
      const cls = await btn.getAttribute('class');
      if (cls?.includes('rounded-xl') && cls?.includes('border-neutral-300') && cls?.includes('text-xs')) {
        const text = (await btn.textContent())?.trim();
        if (text && text.length > 2 && text.length < 40) opts.push(text);
      }
    }
    return opts;
  };

  let opts = await listOptions();
  console.log('   Opciones visibles:', opts);

  // === CLICK OPCIÓN 1 (tipo de negocio) ===
  console.log('6. Seleccionando tipo de negocio...');
  await clickSpecificOption(page, ['Productora audiovisual', 'Estudio creativo', 'Agencia de marketing', 'Consultoría de contenidos']);

  // === ESPERAR RESPUESTA 2 ===
  console.log('7. Esperando respuesta 2 (público objetivo)...');
  aiCount = await waitForNewAIMessage(page, aiCount);
  await page.screenshot({ path: 'ss4-02-resp2.png', fullPage: true });
  console.log(`   AI respondió (${aiCount} msgs). Screenshot: ss4-02-resp2.png`);

  opts = await listOptions();
  console.log('   Opciones visibles:', opts);

  // === CLICK OPCIÓN 2 (público) ===
  console.log('8. Seleccionando público...');
  await clickSpecificOption(page, ['Empresas y marcas', 'Empresas B2B', 'Profesionales 30-50', 'Jóvenes 18-30']);

  // === ESPERAR RESPUESTA 3 ===
  console.log('9. Esperando respuesta 3 (personalidad)...');
  aiCount = await waitForNewAIMessage(page, aiCount);
  await page.screenshot({ path: 'ss4-03-resp3.png', fullPage: true });
  console.log(`   AI respondió (${aiCount} msgs). Screenshot: ss4-03-resp3.png`);

  opts = await listOptions();
  console.log('   Opciones visibles:', opts);

  // === CLICK OPCIÓN 3 (personalidad) ===
  console.log('10. Seleccionando personalidad...');
  await clickSpecificOption(page, ['Moderno e innovador', 'Creativo y fresco', 'Premium y exclusivo']);

  // === ESPERAR NOMBRES ===
  console.log('11. Esperando propuesta de NOMBRES...');
  aiCount = await waitForNewAIMessage(page, aiCount);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss4-04-nombres.png', fullPage: true });
  console.log(`   AI respondió (${aiCount} msgs). Screenshot: ss4-04-nombres.png`);

  // Check for name suggestion buttons
  const nameBtns = await page.$$('button.text-sm.font-semibold');
  console.log(`   Botones de nombre encontrados: ${nameBtns.length}`);

  // Check for SUGERENCIAS-based buttons (with specific styling)
  const allBtns = await page.$$('button');
  let nameButtonsFound = [];
  for (const btn of allBtns) {
    const cls = await btn.getAttribute('class');
    if (cls?.includes('font-semibold') && cls?.includes('rounded-xl') && !cls?.includes('text-xs')) {
      const text = (await btn.textContent())?.trim();
      if (text && text.length > 1 && text.length < 30) {
        nameButtonsFound.push(text);
      }
    }
  }
  console.log('   Nombres sugeridos:', nameButtonsFound);

  // If no names yet but there are options, click one more
  if (nameButtonsFound.length === 0) {
    console.log('12. Sin nombres aún, intentando una opción más...');
    opts = await listOptions();
    console.log('   Opciones:', opts);
    if (opts.length > 0) {
      await clickFirstVisibleOption(page);
      console.log('13. Esperando nombres...');
      aiCount = await waitForNewAIMessage(page, aiCount);
      await page.waitForTimeout(2000);
    }
  }

  // Scroll chat to see all
  const chatArea = await page.$('.overflow-y-auto');
  if (chatArea) {
    await chatArea.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'ss4-05-final.png', fullPage: true });
  console.log('   Screenshot final: ss4-05-final.png');

  // Scroll to top to see full conversation
  if (chatArea) {
    await chatArea.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'ss4-06-top.png', fullPage: true });
    console.log('   Screenshot top: ss4-06-top.png');
  }

  console.log('\nDONE! Navegador aberto por 5 min.');
  await page.waitForTimeout(300000);
  await browser.close();
})();
