import { chromium } from 'playwright';

async function humanTypeTextarea(page, text) {
  const el = await page.$('textarea');
  if (!el) { console.log('   Textarea nao encontrada'); return; }
  await el.click();
  await page.waitForTimeout(400);
  for (const char of text) {
    await el.type(char, { delay: 30 + Math.random() * 70 });
  }
}

async function waitForAIResponse(page, prevCount, maxWait = 60) {
  console.log('   Esperando IA responder...');
  for (let i = 0; i < maxWait; i++) {
    await page.waitForTimeout(1000);
    const aiMsgs = await page.$$('.flex.gap-3.justify-start');
    if (aiMsgs.length > prevCount) {
      await page.waitForTimeout(3000);
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
    const cls = await btn.getAttribute('class') || '';
    if (cls.includes('rounded-xl') && cls.includes('text-xs')) {
      const text = (await btn.textContent())?.trim();
      const visible = await btn.isVisible();
      if (text && text.length > 2 && text.length < 60 && visible) opts.push(text);
    }
  }
  return opts;
}

async function clickOption(page, preferred) {
  await page.waitForTimeout(800 + Math.random() * 1500);
  for (const text of preferred) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const btnText = (await btn.textContent())?.trim();
      if (btnText && btnText.includes(text) && await btn.isVisible()) {
        console.log(`   -> Clicando: "${btnText}"`);
        await btn.click();
        return btnText;
      }
    }
  }
  const btns = await page.$$('button');
  for (const btn of btns) {
    const cls = await btn.getAttribute('class') || '';
    if (cls.includes('rounded-xl') && cls.includes('text-xs')) {
      const text = (await btn.textContent())?.trim();
      if (text && text.length > 2 && text.length < 60 && await btn.isVisible()) {
        console.log(`   -> Fallback: "${text}"`);
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
  const arrowBtn = await page.$('button:has(svg.lucide-arrow-up)');
  if (arrowBtn && await arrowBtn.isVisible()) {
    await arrowBtn.click();
    return true;
  }
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

async function ss(page, name) {
  await page.screenshot({ path: `test-screenshots/${name}.png`, fullPage: true });
  console.log(`   [screenshot: ${name}]`);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 120 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('   [CONSOLE ERROR]', msg.text());
  });

  // ═══════════════════════════════════════
  // 1. LOGIN
  // ═══════════════════════════════════════
  console.log('\n1. Login...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.waitForTimeout(600);
  await page.fill('input[type="email"]', 'eliel2801@gmail.com');
  await page.waitForTimeout(400);
  await page.fill('input[type="password"]', '35473547');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  console.log('   Esperando dashboard...');
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  await ss(page, 'h01-dashboard');

  // ═══════════════════════════════════════
  // 2. NUEVO PROYECTO - Click with JavaScript dispatch
  // ═══════════════════════════════════════
  console.log('\n2. Clicando "Nuevo Proyecto" via JS dispatch...');
  await page.waitForTimeout(1500);

  // Use evaluate to find and click the exact button
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent?.includes('Nuevo Proyecto') && btn.textContent?.includes('+') === false) {
        // Check the trimmed inner text
        const text = btn.innerText?.trim();
        if (text === 'Nuevo Proyecto' || text.includes('Nuevo Proyecto')) {
          btn.click();
          return `Clicked: "${text}"`;
        }
      }
    }
    // Try all buttons
    for (const btn of buttons) {
      if (btn.textContent?.trim().includes('Nuevo Proyecto')) {
        btn.click();
        return `Clicked (fallback): "${btn.textContent.trim()}"`;
      }
    }
    return 'NOT FOUND';
  });
  console.log('   Result:', clicked);

  // Wait for React state to update and re-render
  await page.waitForTimeout(3000);
  await ss(page, 'h02-after-click');

  // Check what's visible now
  const bodyText = await page.textContent('body');
  const hasNameChoice = bodyText.includes('Necesito crear un nombre') || bodyText.includes('Ya tengo un nombre');
  const hasTuNegocio = bodyText.includes('Tu Negocio');
  console.log('   Has name choice buttons:', hasNameChoice);
  console.log('   Has "Tu Negocio":', hasTuNegocio);

  if (!hasNameChoice) {
    console.log('   Formulario nao carregou. Tentando via URL/navigation...');
    // Log all visible buttons
    const visibleBtns = await page.$$eval('button', btns =>
      btns.filter(b => b.offsetParent !== null).map(b => `"${b.innerText?.trim()}"`)
    );
    console.log('   Botoes visiveis:', visibleBtns);

    // Try clicking again with Playwright locator
    const npBtn = page.locator('button', { hasText: 'Nuevo Proyecto' });
    const count = await npBtn.count();
    console.log(`   Encontrou ${count} botoes "Nuevo Proyecto"`);
    if (count > 0) {
      await npBtn.first().click({ force: true });
      console.log('   Force clicked!');
      await page.waitForTimeout(4000);
      await ss(page, 'h02b-force-click');

      const bodyText2 = await page.textContent('body');
      console.log('   Agora tem name choice:', bodyText2.includes('Necesito crear'));
    }
  }

  // ═══════════════════════════════════════
  // 3. "NECESITO CREAR UN NOMBRE"
  // ═══════════════════════════════════════
  console.log('\n3. Procurando "Necesito crear un nombre"...');
  await page.waitForTimeout(2000);

  try {
    await page.waitForSelector('text=Necesito crear un nombre', { timeout: 10000 });
    console.log('   Encontrou!');
  } catch {
    console.log('   Nao encontrou apos 10s. Verificando tela...');
    await ss(page, 'h03-debug');
    const allText = await page.textContent('body');
    console.log('   Texto na pagina (primeiros 500 chars):', allText.substring(0, 500));
  }

  const needsNameBtn = page.locator('button', { hasText: 'Necesito crear un nombre' });
  if (await needsNameBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.waitForTimeout(800);
    await needsNameBtn.click();
    console.log('   OK - Entrou no chat de naming');
    await page.waitForTimeout(3000);
    await ss(page, 'h03-chat-opened');
  } else {
    console.log('   Botao nao visivel, tentando encontrar por evaluate...');
    const found = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent?.includes('Necesito') || btn.textContent?.includes('crear un nombre')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });
    console.log('   Evaluate result:', found);
    await page.waitForTimeout(3000);
    await ss(page, 'h03-chat-opened');
  }

  // ═══════════════════════════════════════
  // 4. CHAT COM A IA
  // ═══════════════════════════════════════
  console.log('\n4. Iniciando chat...');
  await page.waitForTimeout(2000);

  // Check if textarea exists
  let textarea = await page.$('textarea');
  if (!textarea) {
    console.log('   Textarea nao encontrada, esperando...');
    await page.waitForSelector('textarea', { timeout: 10000 }).catch(() => {});
    textarea = await page.$('textarea');
  }

  if (textarea) {
    await humanTypeTextarea(page, 'Hola! Estoy creando una consultora digital premium. Ayudamos empresas a digitalizar su presencia con branding, web y estrategia. Queremos un nombre que suene moderno, profesional y exclusivo.');
    await page.waitForTimeout(600);
    await clickSend(page);
    console.log('   Mensagem enviada!');
  } else {
    console.log('   ERRO: textarea nao encontrada. Verificando botoes starter...');
    const starters = await page.$$eval('button:visible', btns =>
      btns.map(b => b.textContent?.trim()).filter(t => t && t.length > 10 && t.length < 80)
    );
    console.log('   Starters:', starters);
  }

  // ═══════════════════════════════════════
  // 5-9. CONVERSA COM A IA
  // ═══════════════════════════════════════
  let aiCount = 0;
  const preferredResponses = [
    ['Agencia digital', 'Consultoría', 'Servicios digitales', 'Tecnología'],
    ['Empresas', 'Empresas y marcas', 'B2B', 'Profesionales'],
    ['Premium', 'Moderno', 'Profesional', 'Elegante', 'Innovador'],
    ['Fusión de palabras', 'Nombre inventado', 'Abstracto'],
  ];

  const fallbackMessages = [
    'Es una consultora digital premium, hacemos branding, web y estrategia digital.',
    'Nuestro publico son empresas y profesionales que buscan calidad premium.',
    'Queremos algo elegante, moderno y profesional. Que inspire confianza.',
    'Me gusta la idea de un nombre inventado o fusion de palabras, corto y memorable.',
  ];

  for (let step = 0; step < 6; step++) {
    console.log(`\n${5 + step}. Resposta ${step + 1}...`);
    aiCount = await waitForAIResponse(page, aiCount);
    await scrollChatDown(page);
    await ss(page, `h0${4 + step}-resp${step + 1}`);

    let opts = await getVisibleOptions(page);
    console.log(`   Opcoes: [${opts.join(', ')}]`);

    if (opts.length > 0 && step < preferredResponses.length) {
      await clickOption(page, preferredResponses[step]);
    } else if (step < fallbackMessages.length && opts.length === 0) {
      console.log('   Digitando resposta manual...');
      await humanTypeTextarea(page, fallbackMessages[step]);
      await page.waitForTimeout(500);
      await clickSend(page);
    } else {
      console.log('   Sem opcoes e sem fallback - pode ser sugestao de nomes!');
      break;
    }
  }

  // ═══════════════════════════════════════
  // 10. ESCOLHER NOME
  // ═══════════════════════════════════════
  console.log('\n10. Procurando nomes sugeridos...');
  await page.waitForTimeout(3000);
  await scrollChatDown(page);
  await ss(page, 'h10-names');

  // Look for clickable name elements
  const nameClicked = await page.evaluate(() => {
    // Look for name buttons (typically have specific styling)
    const btns = document.querySelectorAll('button');
    const candidates = [];
    for (const btn of btns) {
      const text = btn.textContent?.trim();
      const cls = btn.className || '';
      if (text && text.length >= 3 && text.length <= 30 && btn.offsetParent !== null) {
        if (!['Siguiente', 'Volver', 'Cancelar', 'Copiar', 'Nuevo Proyecto', 'Mis Proyectos', 'Generar más nombres'].includes(text)) {
          if (cls.includes('font-semibold') || cls.includes('font-bold') || cls.includes('text-sm')) {
            candidates.push(text);
          }
        }
      }
    }
    // Click the first good candidate
    if (candidates.length > 0) {
      for (const btn of btns) {
        if (btn.textContent?.trim() === candidates[0] && btn.offsetParent !== null) {
          btn.click();
          return candidates[0];
        }
      }
    }
    return `No names found. Candidates checked: ${candidates.join(', ')}`;
  });
  console.log('   Nome escolhido:', nameClicked);
  await page.waitForTimeout(3000);

  // ═══════════════════════════════════════
  // 11. SIGUIENTE -> ESTRATEGIA
  // ═══════════════════════════════════════
  console.log('\n11. Avancando para Estrategia...');

  // Try Siguiente button
  const sigBtn = page.locator('button:has-text("Siguiente")').first();
  if (await sigBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await sigBtn.click();
    console.log('   Clicou Siguiente');
  } else {
    // Try strategy tab
    const tabs = page.locator('[role="tab"], button:has-text("Estrategia")');
    if (await tabs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await tabs.first().click();
      console.log('   Clicou tab Estrategia');
    }
  }
  await page.waitForTimeout(3000);
  await ss(page, 'h11-strategy');

  // ═══════════════════════════════════════
  // 12. "AUN NO TENGO" (sem identidade visual)
  // ═══════════════════════════════════════
  console.log('\n12. Selecionando "Aun no tengo"...');

  const noIdBtn = page.locator('button:has-text("no tengo")');
  if (await noIdBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await page.waitForTimeout(1000);
    await noIdBtn.click();
    console.log('   OK');
  } else {
    // Try evaluate
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent?.includes('no tengo') || btn.textContent?.includes('crearla')) {
          btn.click();
          break;
        }
      }
    });
  }
  await page.waitForTimeout(3000);
  await ss(page, 'h12-no-identity');

  // ═══════════════════════════════════════
  // 13. PREENCHER BRIEFING
  // ═══════════════════════════════════════
  console.log('\n13. Preenchendo briefing...');

  const textareas = await page.$$('textarea:visible');
  console.log(`   ${textareas.length} textareas`);

  for (const ta of textareas) {
    const ph = await ta.getAttribute('placeholder') || '';
    const val = await ta.inputValue();
    if (val) continue;

    const p = ph.toLowerCase();
    if (p.includes('diferencial') || p.includes('competencia')) {
      await ta.fill('Servicio integral de digitalizacion con enfoque premium y personalizado.');
    } else if (p.includes('cliente ideal') || p.includes('público')) {
      await ta.fill('Empresas medianas, emprendedores serios y profesionales 30-55 que valoran calidad.');
    } else if (p.includes('marca') && p.includes('admiras')) {
      await ta.fill('Apple, Stripe, Notion - por minimalismo, claridad y modernidad.');
    } else if (p.includes('competid')) {
      await ta.fill('Agencias de marketing locales y freelancers de diseño.');
    } else if (p.includes('persona famosa')) {
      await ta.fill('Jony Ive - minimalismo y atencion al detalle.');
    } else if (p.includes('color') && p.includes('no')) {
      await ta.fill('Evitar colores infantiles o demasiado vibrantes.');
    } else if (ph && !val) {
      await ta.fill('Premium, moderno y profesional.');
    }
    await page.waitForTimeout(200);
  }

  // Text inputs
  const inputs = await page.$$('input[type="text"]:visible');
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder') || '';
    const val = await inp.inputValue();
    if (val) continue;
    const p = ph.toLowerCase();
    if (p.includes('misión') || p.includes('proposito')) {
      await inp.fill('Transformar negocios con presencia digital premium.');
    } else if (p.includes('slogan')) {
      await inp.fill('Tu negocio, nuestra estrategia digital.');
    } else if (p.includes('mercado') || p.includes('geográf')) {
      await inp.fill('Espana y Europa');
    }
    await page.waitForTimeout(150);
  }

  // Click personality adjectives
  for (const adj of ['Moderno', 'Profesional', 'Minimalista', 'Elegante', 'Premium']) {
    try {
      const btn = page.locator(`button:has-text("${adj}")`).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(200);
      }
    } catch {}
  }

  // B2B
  try {
    const b2b = page.locator('button:has-text("B2B")').first();
    if (await b2b.isVisible({ timeout: 500 }).catch(() => false)) {
      await b2b.click();
    }
  } catch {}

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await ss(page, 'h13-briefing');

  // ═══════════════════════════════════════
  // 14. SIGUIENTE -> VISUAL
  // ═══════════════════════════════════════
  console.log('\n14. Indo para Visual...');
  const nextBtn2 = page.locator('button:has-text("Siguiente")').first();
  if (await nextBtn2.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nextBtn2.click();
  } else {
    const vizTab = page.locator('button:has-text("Visual")');
    if (await vizTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await vizTab.click();
    }
  }
  await page.waitForTimeout(3000);
  await ss(page, 'h14-visual');

  // ═══════════════════════════════════════
  // 15. PREENCHER VISUAL
  // ═══════════════════════════════════════
  console.log('\n15. Preenchendo dados finais...');
  const allInputs = await page.$$('input:visible');
  for (const inp of allInputs) {
    const ph = await inp.getAttribute('placeholder') || '';
    const val = await inp.inputValue();
    if (val) continue;
    if (ph.includes('+34') || ph.toLowerCase().includes('whatsapp')) {
      await inp.fill('+34 612 345 678');
    }
  }

  const hoursBtn = page.locator('button:has-text("Lun-Vie 9:00-18:00")');
  if (await hoursBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await hoursBtn.click();
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await ss(page, 'h15-visual-filled');

  // ═══════════════════════════════════════
  // 16. FINALIZAR
  // ═══════════════════════════════════════
  console.log('\n16. Finalizando...');
  const finBtn = page.locator('button:has-text("Finalizar Proyecto")');
  if (await finBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.waitForTimeout(1000);
    await finBtn.click();
    await page.waitForTimeout(2000);
    await ss(page, 'h16-confirm-modal');

    const confirmBtn = page.locator('button:has-text("Confirmar")');
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.waitForTimeout(1000);
      await confirmBtn.click();
      console.log('   ENVIADO!');
    }
  }

  await page.waitForTimeout(5000);
  await ss(page, 'h17-done');
  console.log('\nCONCLUIDO! Navegador aberto por 3 minutos...');
  await page.waitForTimeout(180000);
  await browser.close();
})();
