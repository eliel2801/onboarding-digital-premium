import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // --- Login ---
  console.log('1. Abrindo app...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button[type="submit"]');
  console.log('2. Login enviado...');
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  console.log('3. Dashboard carregado');

  // --- Clicar "Nuevo Proyecto" ---
  console.log('4. Clicando "Nuevo Proyecto"...');
  await page.click('button:has-text("Nuevo Proyecto")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss-01-nuevo.png', fullPage: true });
  console.log('   Screenshot: ss-01-nuevo.png');

  // --- Clicar "Necesito crear un nombre" ---
  console.log('5. Clicando "Necesito crear un nombre"...');
  const needsNameBtn = await page.$('button:has-text("Necesito crear un nombre")');
  if (needsNameBtn) {
    await needsNameBtn.click();
    await page.waitForTimeout(1500);
    console.log('   Entrou no chat!');
  } else {
    console.log('   ERRO: Botao "Necesito crear un nombre" nao encontrado');
    // Try screenshot to see what's on screen
    await page.screenshot({ path: 'ss-error.png', fullPage: true });
  }
  await page.screenshot({ path: 'ss-02-chat.png', fullPage: true });
  console.log('   Screenshot: ss-02-chat.png');

  // --- Enviar primeira mensagem ---
  console.log('6. Enviando primeira mensagem...');

  // Check if there are quick option buttons first
  const quickBtn = await page.$('button:has-text("Quiero crear una marca para mi negocio")');
  if (quickBtn) {
    await quickBtn.click();
    console.log('   Clicou botao rapido');
  } else {
    // Type manually
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('Tengo un estudio audiovisual en Alicante. Hacemos producción de video, podcasts, fotografía profesional y contenido digital para marcas.');
      await page.waitForTimeout(300);
      await page.click('button:has(svg.lucide-send), button:last-of-type');
    }
  }

  // Wait for AI response
  console.log('7. Esperando resposta da IA...');
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'ss-03-resposta1.png', fullPage: true });
  console.log('   Screenshot: ss-03-resposta1.png');

  // --- Check if there are option buttons from AI ---
  const optionButtons = await page.$$('button.px-3\\.5');
  console.log(`   Encontrou ${optionButtons.length} botoes de opcao`);

  // If there are option buttons, click a relevant one
  if (optionButtons.length > 0) {
    // Look for relevant options
    const allButtons = await page.$$eval('button', buttons =>
      buttons.map(b => b.textContent?.trim()).filter(t => t && t.length < 40)
    );
    console.log('   Botoes encontrados:', allButtons.slice(-15));

    // Try to click sector-related button
    let clicked = false;
    for (const text of ['Tecnología', 'Otro', 'Creativo', 'Audiovisual']) {
      const btn = await page.$(`button:has-text("${text}")`);
      if (btn && await btn.isVisible()) {
        await btn.click();
        clicked = true;
        console.log(`   Clicou opcao: "${text}"`);
        break;
      }
    }
    if (!clicked) {
      // Click the first option button that looks relevant
      const firstOpt = optionButtons[0];
      if (firstOpt) {
        const txt = await firstOpt.textContent();
        await firstOpt.click();
        console.log(`   Clicou primeira opcao: "${txt}"`);
      }
    }
  } else {
    // Type a response manually if no options
    console.log('   Sem botoes de opcao, digitando resposta...');
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('Es un estudio audiovisual y creativo en Alicante. Producimos videos, podcasts, fotos y contenido digital para empresas y marcas.');
      await page.waitForTimeout(300);
      // Click send button
      const sendBtns = await page.$$('button');
      for (const btn of sendBtns.reverse()) {
        const svg = await btn.$('svg.lucide-send');
        if (svg) {
          await btn.click();
          console.log('   Mensagem enviada');
          break;
        }
      }
    }
  }

  // Wait for second AI response
  console.log('8. Esperando segunda resposta...');
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'ss-04-resposta2.png', fullPage: true });
  console.log('   Screenshot: ss-04-resposta2.png');

  // --- Continue conversation - answer more questions ---
  const optionButtons2 = await page.$$eval('button', buttons =>
    buttons.map(b => ({ text: b.textContent?.trim(), visible: b.offsetParent !== null }))
      .filter(b => b.text && b.text.length < 40 && b.visible)
  );
  console.log('   Botoes visiveis:', optionButtons2.map(b => b.text).slice(-10));

  // Try clicking relevant options for audiovisual studio
  for (const text of ['Profesionales 30-50', 'Empresas B2B', 'Jóvenes 18-30', 'Moderno e innovador', 'Premium y exclusivo', 'Creativo']) {
    const btn = await page.$(`button:has-text("${text}")`);
    if (btn && await btn.isVisible()) {
      await btn.click();
      console.log(`   Clicou: "${text}"`);
      break;
    }
  }

  // Wait for response
  console.log('9. Esperando terceira resposta...');
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'ss-05-resposta3.png', fullPage: true });
  console.log('   Screenshot: ss-05-resposta3.png');

  // Continue clicking options
  for (const text of ['Moderno e innovador', 'Premium y exclusivo', 'Creativo y fresco', 'Profesional y serio', 'Cercano y cálido']) {
    const btn = await page.$(`button:has-text("${text}")`);
    if (btn && await btn.isVisible()) {
      await btn.click();
      console.log(`   Clicou: "${text}"`);
      break;
    }
  }

  console.log('10. Esperando quarta resposta...');
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'ss-06-resposta4.png', fullPage: true });
  console.log('   Screenshot: ss-06-resposta4.png');

  // Continue - name style
  for (const text of ['Nombre inventado', 'Fusión de palabras', 'Palabra real', 'Nombre propio']) {
    const btn = await page.$(`button:has-text("${text}")`);
    if (btn && await btn.isVisible()) {
      await btn.click();
      console.log(`   Clicou: "${text}"`);
      break;
    }
  }

  console.log('11. Esperando nomes sugeridos...');
  await page.waitForTimeout(15000);
  await page.screenshot({ path: 'ss-07-nomes.png', fullPage: true });
  console.log('   Screenshot: ss-07-nomes.png');

  // Final screenshot
  await page.screenshot({ path: 'ss-final.png', fullPage: true });
  console.log('DONE! Navegador aberto por 5 min.');

  await page.waitForTimeout(300000);
  await browser.close();
})();
