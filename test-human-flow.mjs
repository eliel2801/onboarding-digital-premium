import { chromium } from 'playwright';

// Typing like a human - character by character with random delays
async function humanType(page, selector, text) {
  const el = await page.$(selector);
  if (!el) { console.log('   Elemento não encontrado:', selector); return; }
  await el.click();
  for (const char of text) {
    await el.type(char, { delay: 50 + Math.random() * 120 });
  }
}

async function humanTypeTextarea(page, text) {
  const el = await page.$('textarea');
  if (!el) { console.log('   Textarea não encontrada'); return; }
  await el.click();
  await page.waitForTimeout(300);
  for (const char of text) {
    await el.type(char, { delay: 40 + Math.random() * 100 });
  }
}

async function waitForAIResponse(page, prevCount, maxWait = 45) {
  console.log('   Esperando IA responder...');
  for (let i = 0; i < maxWait; i++) {
    await page.waitForTimeout(1000);
    const aiMsgs = await page.$$('.flex.gap-3.justify-start');
    if (aiMsgs.length > prevCount) {
      await page.waitForTimeout(2500); // wait for options to render
      return aiMsgs.length;
    }
  }
  console.log('   TIMEOUT esperando IA');
  return prevCount;
}

async function getVisibleOptions(page) {
  const btns = await page.$$('button');
  const opts = [];
  for (const btn of btns) {
    const cls = await btn.getAttribute('class');
    if (cls?.includes('rounded-xl') && cls?.includes('border-neutral-300') && cls?.includes('text-xs')) {
      const text = (await btn.textContent())?.trim();
      const visible = await btn.isVisible();
      if (text && text.length > 2 && text.length < 50 && visible) opts.push(text);
    }
  }
  return opts;
}

async function clickOption(page, preferred) {
  for (const text of preferred) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const btnText = (await btn.textContent())?.trim();
      const cls = await btn.getAttribute('class');
      if (btnText === text && cls?.includes('rounded-xl') && await btn.isVisible()) {
        await page.waitForTimeout(800 + Math.random() * 1200); // human pause before clicking
        console.log(`   → Clicando: "${text}"`);
        await btn.click();
        return text;
      }
    }
  }
  // Fallback: click first visible option
  const btns = await page.$$('button');
  for (const btn of btns) {
    const cls = await btn.getAttribute('class');
    if (cls?.includes('rounded-xl') && cls?.includes('border-neutral-300') && cls?.includes('text-xs')) {
      const text = (await btn.textContent())?.trim();
      if (text && text.length > 2 && await btn.isVisible()) {
        await page.waitForTimeout(600 + Math.random() * 800);
        console.log(`   → Clicando fallback: "${text}"`);
        await btn.click();
        return text;
      }
    }
  }
  return null;
}

async function clickSend(page) {
  const sendBtn = await page.$('button:has(svg.lucide-send)');
  if (sendBtn && await sendBtn.isVisible()) {
    await page.waitForTimeout(400);
    await sendBtn.click();
    return true;
  }
  // Try pressing Enter
  await page.press('textarea', 'Enter');
  return true;
}

async function scrollChatDown(page) {
  const chatArea = await page.$('.overflow-y-auto');
  if (chatArea) {
    await chatArea.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(300);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ═══════════════════════════════════════
  // 1. LOGIN
  // ═══════════════════════════════════════
  console.log('\n🔑 1. Abrindo app e fazendo login...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });

  await page.waitForTimeout(800);
  await page.fill('input[type="email"]', 'eliel2801@gmail.com');
  await page.waitForTimeout(600);
  await page.fill('input[type="password"]', '35473547');
  await page.waitForTimeout(700);

  await page.click('button[type="submit"]');
  console.log('   Login enviado');
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Dashboard carregado');
  await page.screenshot({ path: 'test-screenshots/human-01-dashboard.png', fullPage: true });

  // ═══════════════════════════════════════
  // 2. NUEVO PROYECTO
  // ═══════════════════════════════════════
  console.log('\n📋 2. Clicando "Nuevo Proyecto"...');
  await page.waitForTimeout(1200);
  const nuevoBtn = await page.$('button:has-text("Nuevo Proyecto")');
  if (nuevoBtn) {
    await nuevoBtn.click();
    console.log('   ✓ Abrindo novo projeto');
  } else {
    console.log('   ⚠ Botão "Nuevo Proyecto" não encontrado, tentando alternativas...');
    // Try other possible buttons
    const addBtn = await page.$('button:has(svg.lucide-plus)');
    if (addBtn) await addBtn.click();
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/human-02-nuevo.png', fullPage: true });

  // ═══════════════════════════════════════
  // 3. NECESITO CREAR UN NOMBRE (sem nome)
  // ═══════════════════════════════════════
  console.log('\n💬 3. Selecionando "Necesito crear un nombre"...');
  await page.waitForTimeout(1000);
  const needNameBtn = await page.$('button:has-text("Necesito crear un nombre")');
  if (needNameBtn) {
    await needNameBtn.click();
    console.log('   ✓ Entrou no chat de criação de nome');
  } else {
    console.log('   ⚠ Botão não encontrado, capturando tela...');
    await page.screenshot({ path: 'test-screenshots/human-03-error.png', fullPage: true });
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/human-03-chat.png', fullPage: true });

  // ═══════════════════════════════════════
  // 4. CONVERSAR NO CHAT - Descrever o negócio
  // ═══════════════════════════════════════
  console.log('\n✍️  4. Descrevendo o negócio no chat...');

  // Check if there's a textarea or quick options first
  const quickBtn = await page.$('button:has-text("Quiero crear una marca")');
  if (quickBtn && await quickBtn.isVisible()) {
    await page.waitForTimeout(1500);
    console.log('   Encontrou botão rápido, mas vou digitar manualmente como humano...');
  }

  const textarea = await page.$('textarea');
  if (textarea) {
    await humanTypeTextarea(page, 'Hola! Estoy montando una empresa de servicios digitales, especialmente onboarding digital y transformación para negocios. Ayudamos a empresas a digitalizar su presencia online con branding, web y estrategia.');
    await page.waitForTimeout(800);
    await clickSend(page);
    console.log('   ✓ Mensagem enviada');
  } else {
    console.log('   ⚠ Textarea não encontrada');
  }

  // ═══════════════════════════════════════
  // 5. ESPERAR E RESPONDER IA - Loop de conversa
  // ═══════════════════════════════════════
  let aiCount = 0;

  // --- Resposta 1 ---
  console.log('\n🤖 5. Esperando primeira resposta da IA...');
  aiCount = await waitForAIResponse(page, aiCount);
  await scrollChatDown(page);
  await page.screenshot({ path: 'test-screenshots/human-04-resp1.png', fullPage: true });

  let opts = await getVisibleOptions(page);
  console.log('   Opções:', opts);

  if (opts.length > 0) {
    await clickOption(page, ['Agencia digital', 'Consultoría digital', 'Servicios digitales', 'Agencia de marketing', 'Tecnología']);
  } else {
    // Type manually
    await humanTypeTextarea(page, 'Es una agencia de servicios digitales. Hacemos onboarding digital, branding, diseño web y estrategia digital para negocios que quieren profesionalizar su presencia online.');
    await clickSend(page);
  }

  // --- Resposta 2 ---
  console.log('\n🤖 6. Esperando segunda resposta...');
  aiCount = await waitForAIResponse(page, aiCount);
  await scrollChatDown(page);
  await page.screenshot({ path: 'test-screenshots/human-05-resp2.png', fullPage: true });

  opts = await getVisibleOptions(page);
  console.log('   Opções:', opts);

  if (opts.length > 0) {
    await clickOption(page, ['Empresas y marcas', 'Empresas B2B', 'Emprendedores', 'Profesionales 30-50', 'Pequeñas empresas']);
  } else {
    await humanTypeTextarea(page, 'Nuestro público son empresas pequeñas y medianas, emprendedores y profesionales que necesitan digitalizar su negocio de forma premium.');
    await clickSend(page);
  }

  // --- Resposta 3 ---
  console.log('\n🤖 7. Esperando terceira resposta...');
  aiCount = await waitForAIResponse(page, aiCount);
  await scrollChatDown(page);
  await page.screenshot({ path: 'test-screenshots/human-06-resp3.png', fullPage: true });

  opts = await getVisibleOptions(page);
  console.log('   Opções:', opts);

  if (opts.length > 0) {
    await clickOption(page, ['Premium y exclusivo', 'Moderno e innovador', 'Profesional y serio', 'Elegante y sofisticado']);
  } else {
    await humanTypeTextarea(page, 'Queremos transmitir algo premium, moderno y profesional. Que inspire confianza pero también innovación.');
    await clickSend(page);
  }

  // --- Resposta 4 (estilo de nome) ---
  console.log('\n🤖 8. Esperando sugestões de estilo de nome...');
  aiCount = await waitForAIResponse(page, aiCount);
  await scrollChatDown(page);
  await page.screenshot({ path: 'test-screenshots/human-07-resp4.png', fullPage: true });

  opts = await getVisibleOptions(page);
  console.log('   Opções:', opts);

  if (opts.length > 0) {
    await clickOption(page, ['Nombre inventado', 'Fusión de palabras', 'Palabra real', 'Nombre abstracto']);
  } else {
    await humanTypeTextarea(page, 'Me gustaría un nombre inventado o una fusión de palabras, algo único que suene bien y sea fácil de recordar.');
    await clickSend(page);
  }

  // --- Resposta 5 (nomes sugeridos!) ---
  console.log('\n🤖 9. Esperando NOMES SUGERIDOS...');
  aiCount = await waitForAIResponse(page, aiCount);
  await page.waitForTimeout(3000); // extra wait for names to render
  await scrollChatDown(page);
  await page.screenshot({ path: 'test-screenshots/human-08-names.png', fullPage: true });

  // Look for name buttons (bigger, bolder buttons with suggested names)
  const allBtns = await page.$$('button');
  let nameButtons = [];
  for (const btn of allBtns) {
    const cls = await btn.getAttribute('class');
    const text = (await btn.textContent())?.trim();
    if (text && text.length > 2 && text.length < 30 && await btn.isVisible()) {
      if (cls?.includes('font-semibold') || cls?.includes('font-bold')) {
        nameButtons.push({ text, btn });
      }
    }
  }

  if (nameButtons.length > 0) {
    console.log('   Nomes sugeridos:', nameButtons.map(n => n.text));
    // Pick the first good name
    const chosen = nameButtons[0];
    await page.waitForTimeout(2000); // think about it...
    console.log(`\n🎯 10. Escolhendo nome: "${chosen.text}"`);
    await chosen.btn.click();
  } else {
    // Maybe options are regular buttons
    opts = await getVisibleOptions(page);
    console.log('   Opções restantes:', opts);
    if (opts.length > 0) {
      await clickOption(page, opts); // click whatever is there
    }

    // Wait for one more response
    console.log('\n🤖 10. Mais uma resposta...');
    aiCount = await waitForAIResponse(page, aiCount);
    await scrollChatDown(page);
    await page.screenshot({ path: 'test-screenshots/human-09-more.png', fullPage: true });

    opts = await getVisibleOptions(page);
    if (opts.length > 0) {
      console.log('   Opções finais:', opts);
      await clickOption(page, opts);
    }
  }

  // Wait for final response after choosing name
  console.log('\n🤖 11. Esperando confirmação do nome...');
  aiCount = await waitForAIResponse(page, aiCount);
  await scrollChatDown(page);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/human-10-confirmed.png', fullPage: true });

  // Check if there's a confirmation or next step
  opts = await getVisibleOptions(page);
  console.log('   Opções pós-nome:', opts);

  // If there's a confirm/accept button
  for (const text of ['Confirmar', 'Me gusta', 'Aceptar', 'Siguiente', 'Continuar']) {
    const btn = await page.$(`button:has-text("${text}")`);
    if (btn && await btn.isVisible()) {
      await page.waitForTimeout(1000);
      await btn.click();
      console.log(`   → Clicou: "${text}"`);
      break;
    }
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-screenshots/human-11-final.png', fullPage: true });

  console.log('\n✅ CONCLUÍDO! Navegador aberto por 3 minutos para você ver...');
  await page.waitForTimeout(180000);
  await browser.close();
})();
