import { chromium } from 'playwright';

async function waitForAIResponse(page, prevCount) {
  // Wait until a new AI message appears
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const msgs = await page.$$('.flex.gap-3.justify-start');
    if (msgs.length > prevCount) return msgs.length;
  }
  return prevCount;
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // --- Login ---
  console.log('1. Login...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   OK');

  // --- Nuevo Proyecto ---
  console.log('2. Nuevo Proyecto...');
  await page.click('button:has-text("Nuevo Proyecto")');
  await page.waitForTimeout(1500);

  // --- Necesito crear un nombre ---
  console.log('3. Chat IA...');
  await page.click('button:has-text("Necesito crear un nombre")');
  await page.waitForTimeout(1500);

  // --- Mensaje 1: Describir el estudio audiovisual ---
  console.log('4. Enviando descripción del estudio...');
  const textarea = await page.$('textarea');
  await textarea.fill('Tengo un estudio audiovisual en Alicante, España. Hacemos producción de video profesional, podcasts, fotografía para marcas y contenido digital. Queremos un nombre que suene moderno y creativo.');
  await page.waitForTimeout(300);

  // Click send button
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const hasSend = await btn.$('svg');
    const text = await btn.textContent();
    if (hasSend && !text?.trim()) {
      // This is likely the send icon-only button
      const isDisabled = await btn.getAttribute('disabled');
      if (!isDisabled) {
        await btn.click();
        break;
      }
    }
  }
  // Fallback: try clicking the last enabled button near textarea
  await page.waitForTimeout(500);

  console.log('5. Esperando resposta 1...');
  let aiCount = 0;
  aiCount = await waitForAIResponse(page, aiCount);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ss2-01-resp1.png', fullPage: true });
  console.log(`   AI respondeu (${aiCount} msgs). Screenshot: ss2-01-resp1.png`);

  // --- Check for option buttons and click one ---
  const clickOption = async (preferredTexts) => {
    for (const text of preferredTexts) {
      const btns = await page.$$('button');
      for (const btn of btns) {
        const btnText = await btn.textContent();
        if (btnText?.trim() === text && await btn.isVisible()) {
          await btn.click();
          console.log(`   Clicou: "${text}"`);
          return true;
        }
      }
    }
    // Fallback: click any visible option button
    const btns = await page.$$('button');
    for (const btn of btns) {
      const cls = await btn.getAttribute('class');
      const btnText = await btn.textContent();
      if (cls?.includes('rounded-xl') && cls?.includes('border-neutral-300') && btnText?.trim().length < 35 && btnText?.trim().length > 3) {
        const visible = await btn.isVisible();
        if (visible) {
          await btn.click();
          console.log(`   Fallback clicou: "${btnText?.trim()}"`);
          return true;
        }
      }
    }
    return false;
  };

  // --- Resposta 2 ---
  console.log('6. Respondendo pregunta 2...');
  await clickOption(['Empresas B2B', 'Profesionales 30-50', 'Empresas y marcas', 'Audiovisual', 'Creatividad']);

  console.log('7. Esperando resposta 2...');
  aiCount = await waitForAIResponse(page, aiCount);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ss2-02-resp2.png', fullPage: true });
  console.log(`   AI respondeu (${aiCount} msgs). Screenshot: ss2-02-resp2.png`);

  // --- Resposta 3 ---
  console.log('8. Respondendo pregunta 3...');
  await clickOption(['Moderno e innovador', 'Premium y exclusivo', 'Creativo y fresco', 'Moderno']);

  console.log('9. Esperando resposta 3...');
  aiCount = await waitForAIResponse(page, aiCount);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ss2-03-resp3.png', fullPage: true });
  console.log(`   AI respondeu (${aiCount} msgs). Screenshot: ss2-03-resp3.png`);

  // --- Agora deveria ter NOMES! Se ainda pergunta, responder ---
  const hasSuggestions = await page.$('button:has-text("Haz clic para elegir")');
  if (!hasSuggestions) {
    console.log('10. Ainda sem nomes, respondendo mais uma...');
    await clickOption(['Nombre inventado', 'Fusión de palabras', 'Palabra real']);

    console.log('11. Esperando nomes...');
    aiCount = await waitForAIResponse(page, aiCount);
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'ss2-04-final.png', fullPage: true });
  console.log('   Screenshot final: ss2-04-final.png');

  // --- Scroll up to see full conversation ---
  const chatArea = await page.$('.overflow-y-auto');
  if (chatArea) {
    await chatArea.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'ss2-05-top.png', fullPage: true });
    console.log('   Screenshot top: ss2-05-top.png');
  }

  console.log('\nDONE! Navegador aberto por 5 min.');
  await page.waitForTimeout(300000);
  await browser.close();
})();
