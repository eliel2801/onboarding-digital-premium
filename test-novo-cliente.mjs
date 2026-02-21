import { chromium } from 'playwright';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Capturar erros
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE: ${msg.text()}`);
      console.log(`   ❌ ${msg.text().substring(0, 150)}`);
    }
  });
  page.on('response', res => {
    if (res.status() >= 400) {
      errors.push(`NETWORK [${res.status()}]: ${res.url()}`);
      console.log(`   ❌ [${res.status()}] ${res.url().substring(0, 120)}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`PAGE: ${err.message}`);
    console.log(`   ❌ PAGE ERROR: ${err.message.substring(0, 150)}`);
  });

  console.log('🚀 Abrindo aplicação...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // ═══════ LOGIN ═══════
  console.log('🔐 Fazendo login...');
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button:has-text("Acceder al portal")');
  await sleep(5000);

  // Dashboard → Nuevo Proyecto
  const hasDashboard = await page.locator('text=Mis Proyectos').isVisible().catch(() => false)
    || await page.locator('text=Nuevo Proyecto').isVisible().catch(() => false);
  if (hasDashboard) {
    console.log('📋 Dashboard → Nuevo Proyecto');
    const newBtn = page.locator('button:has-text("Nuevo Proyecto")');
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await sleep(1500);
    }
  }

  await page.screenshot({ path: 'test-screenshots/novo-00-inicio.png', fullPage: true });

  // ═══════════════════════════════════════
  // PASSO 1: NECESITO CREAR UN NOMBRE (IA)
  // ═══════════════════════════════════════
  console.log('\n📝 PASSO 1: Necesito crear un nombre');

  const needsName = page.locator('text=Necesito crear un nombre');
  if (await needsName.isVisible().catch(() => false)) {
    await needsName.click();
    await sleep(1500);
    console.log('   → Selecionou "Necesito crear un nombre"');
  }

  await page.screenshot({ path: 'test-screenshots/novo-01-chat-ia.png', fullPage: true });

  // Enviar mensagem no chat da IA
  console.log('   → Enviando mensagem para a IA...');

  // Clicar numa sugestão rápida do chat
  const suggestBtn = page.locator('button:has-text("Estoy creando una agencia de marketing digital")');
  if (await suggestBtn.isVisible().catch(() => false)) {
    await suggestBtn.click();
    console.log('   → Clicou na sugestão: "Estoy creando una agencia de marketing digital"');
  } else {
    // Se não tem sugestão, digitar no input
    const chatInput = page.locator('input[placeholder], textarea[placeholder]').last();
    if (await chatInput.isVisible().catch(() => false)) {
      await chatInput.fill('Estoy creando una agencia de marketing digital especializada en startups tecnológicas. Queremos un nombre moderno, corto y memorable.');
      await sleep(300);
      const sendBtn = page.locator('button:has-text("Enviar"), button[type="submit"]').last();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
      }
    }
  }

  // Aguardar resposta da IA (pode demorar)
  console.log('   ⏳ Aguardando resposta da IA (até 30s)...');
  await sleep(15000);

  await page.screenshot({ path: 'test-screenshots/novo-02-chat-resposta.png', fullPage: true });

  // Verificar se a IA deu opções/perguntas e responder
  const aiOptions = page.locator('.space-y-2 button, .flex.flex-wrap.gap-2 button');
  const optionCount = await aiOptions.count();
  console.log(`   → IA mostrou ${optionCount} opções/botões`);

  if (optionCount > 0) {
    // Clicar na primeira opção disponível
    const firstOption = aiOptions.first();
    const optionText = await firstOption.textContent();
    console.log(`   → Clicando opção: "${optionText?.substring(0, 50)}"`);
    await firstOption.click();
    await sleep(15000);

    await page.screenshot({ path: 'test-screenshots/novo-03-chat-opcao.png', fullPage: true });
  }

  // Verificar se apareceram nomes validados para escolher
  const nameButtons = page.locator('button:has-text("Elegir"), button:has-text("Elegido")');
  const nameCount = await nameButtons.count();
  console.log(`   → ${nameCount} nomes disponíveis para escolher`);

  // Se não teve nomes ainda, continuar conversando
  if (nameCount === 0) {
    console.log('   → IA ainda perguntando. Respondendo mais...');

    // Tentar responder a mais perguntas da IA
    const moreOptions = page.locator('.flex.flex-wrap.gap-2 button');
    const moreCount = await moreOptions.count();
    if (moreCount > 0) {
      const opt = moreOptions.first();
      const txt = await opt.textContent();
      console.log(`   → Clicando: "${txt?.substring(0, 50)}"`);
      await opt.click();
      await sleep(15000);
    } else {
      // Digitar resposta manual
      const chatInput = page.locator('input[type="text"]:visible').last();
      if (await chatInput.isVisible().catch(() => false)) {
        await chatInput.fill('Me gusta algo corto, de 1-2 palabras, que suene tech y moderno. Algo como Nexus, Pulse, Vertex.');
        await sleep(300);
        // Pressionar Enter
        await chatInput.press('Enter');
        await sleep(15000);
      }
    }

    await page.screenshot({ path: 'test-screenshots/novo-04-chat-continua.png', fullPage: true });
  }

  // Checar novamente se há nomes para selecionar
  const finalNameBtns = page.locator('button.w-full.text-left.p-3\\.5');
  const finalNameCount = await finalNameBtns.count();
  console.log(`   → ${finalNameCount} nomes validados encontrados`);

  if (finalNameCount > 0) {
    const firstName = finalNameBtns.first();
    await firstName.click();
    const selectedText = await firstName.textContent();
    console.log(`   ✅ Nome selecionado: "${selectedText?.substring(0, 50)}"`);
    await sleep(500);
  } else {
    // Se a IA não gerou nomes, usar o campo de nome direto
    console.log('   ⚠️ Nomes não apareceram. Preenchendo manualmente...');
    const nameField = page.locator('input[type="text"]').first();
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('NexPulse Digital');
      await sleep(300);
    }
  }

  // Preencher "Sobre la empresa" se existir campo
  const aboutField = page.locator('textarea:visible');
  const aboutCount = await aboutField.count();
  if (aboutCount > 0) {
    const ta = aboutField.first();
    const val = await ta.inputValue();
    if (!val || val.trim() === '') {
      await ta.fill('Agencia de marketing digital especializada en startups tecnológicas. Ofrecemos estrategias de growth hacking, SEO técnico y campañas de paid media para escalar negocios digitales.');
      await sleep(300);
    }
  }

  await page.screenshot({ path: 'test-screenshots/novo-05-nome-selecionado.png', fullPage: true });

  // Clicar Siguiente
  console.log('   → Clicando "Siguiente"...');
  const siguienteBtn = page.locator('button:has-text("Siguiente")');
  if (await siguienteBtn.isVisible().catch(() => false)) {
    await siguienteBtn.click();
    await sleep(2000);
  }

  await page.screenshot({ path: 'test-screenshots/novo-06-pos-negocio.png', fullPage: true });

  // ═══════════════════════════════════════
  // PASSO 2: NÃO TENHO IDENTIDADE VISUAL
  // ═══════════════════════════════════════
  console.log('\n📝 PASSO 2: Aún no tengo identidad visual');

  const noIdentity = page.locator('text=quiero crearla');
  if (await noIdentity.isVisible().catch(() => false)) {
    await noIdentity.click();
    await sleep(1500);
    console.log('   → Selecionou "Aún no tengo, quiero crearla"');
  }

  await page.screenshot({ path: 'test-screenshots/novo-07-briefing.png', fullPage: true });

  // Preencher briefing completo
  const textareas = page.locator('textarea:visible');
  const taCount = await textareas.count();
  console.log(`   → ${taCount} textareas no briefing`);

  const briefingTexts = [
    'Nos diferenciamos por usar inteligencia artificial y automatización avanzada en todas nuestras estrategias. Somos 100% data-driven y ofrecemos resultados medibles desde el día uno.',
    'Startups tecnológicas de 2-50 empleados, fundadores entre 25-40 años, con base en Europa y Latam. Perfil: CEO/CTO técnicos que valoran la eficiencia y los datos sobre la creatividad tradicional.',
    'Sería como Elon Musk — audaz, tecnológica, disruptiva. También como Stripe: limpia, developer-friendly, sofisticada sin ser pretenciosa.',
    '1. Linear — diseño limpio y ultra-moderno\n2. Vercel — tipografía bold con fondos oscuros\n3. Figma — colorido pero profesional y accesible',
    'Nada genérico ni corporativo aburrido. Evitar azul corporativo típico, iconos de stock, gradientes de los 2010. No quiero parecer una consultora Big4 ni una agencia de publicidad tradicional.',
    '1. Growth.Design — excelente storytelling visual\n2. Refactoring UI — diseño técnico premium\n3. Webflow — marca moderna y dev-friendly',
    'No tenemos nada aún, es un proyecto desde cero. Me gustaría un logo que funcione como ícono de app también. Algo geométrico o tipográfico, nada ilustrativo.',
  ];

  for (let i = 0; i < Math.min(taCount, briefingTexts.length); i++) {
    const ta = textareas.nth(i);
    const val = await ta.inputValue();
    if (!val || val.trim() === '') {
      await ta.fill(briefingTexts[i]);
      await sleep(150);
      console.log(`   ✏️ Textarea ${i + 1} preenchido`);
    }
  }

  // Preencher inputs
  const inputs = page.locator('input[type="text"]:visible');
  const inpCount = await inputs.count();
  console.log(`   → ${inpCount} inputs no briefing`);

  const briefingInputs = [
    'Impulsar startups al siguiente nivel con marketing basado en datos',
    'Data meets creativity. Results follow.',
    'Negro #0A0A0A, Verde neon #22C55E, Gris #6B7280',
    '4-6 semanas',
    '3000-5000€',
  ];

  let idx = 0;
  for (let i = 0; i < inpCount && idx < briefingInputs.length; i++) {
    const inp = inputs.nth(i);
    const val = await inp.inputValue();
    const ro = await inp.getAttribute('readonly');
    if ((!val || val.trim() === '') && !ro) {
      await inp.fill(briefingInputs[idx]);
      await sleep(150);
      console.log(`   ✏️ Input ${idx + 1}: "${briefingInputs[idx].substring(0, 40)}..."`);
      idx++;
    }
  }

  // Selecionar público: Empresa (B2B)
  console.log('   → Selecionando público: Empresa (B2B)');
  const b2bBtn = page.locator('button:has-text("Empresa (B2B)")');
  if (await b2bBtn.isVisible().catch(() => false)) {
    await b2bBtn.click();
    await sleep(200);
  }

  // Personalidades
  const personalities = ['Innovadora', 'Atrevida', 'Moderna', 'Premium'];
  for (const p of personalities) {
    const btn = page.locator(`button:text-is("${p}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(150);
      console.log(`   ✓ ${p}`);
    }
  }

  // Aplicações
  const apps = ['Logo', 'Sitio web', 'Redes sociales', 'Papelería corporativa', 'Merchandising'];
  for (const app of apps) {
    const btn = page.locator(`button:text-is("${app}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(150);
      console.log(`   ✓ ${app}`);
    }
  }

  await page.screenshot({ path: 'test-screenshots/novo-08-briefing-completo.png', fullPage: true });

  // Ir para passo 3
  console.log('\n   → Clicando "Siguiente" para Passo 3...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  const nextBtn = page.locator('button:has-text("Siguiente")').last();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await sleep(2000);
  }

  // ═══════════════════════════════════════
  // PASSO 3: VISUAL / CONTACTO
  // ═══════════════════════════════════════
  console.log('\n📝 PASSO 3: Visual / Contacto');

  await page.screenshot({ path: 'test-screenshots/novo-09-visual.png', fullPage: true });

  // Preencher "Quiénes somos"
  const step3Tas = page.locator('textarea:visible');
  const step3TaCount = await step3Tas.count();
  for (let i = 0; i < step3TaCount; i++) {
    const ta = step3Tas.nth(i);
    const val = await ta.inputValue();
    if (!val || val.trim() === '') {
      await ta.fill('NexPulse Digital es una agencia de marketing digital de nueva generación, fundada en 2026 en Barcelona. Combinamos inteligencia artificial, análisis de datos y creatividad estratégica para impulsar el crecimiento de startups tecnológicas en Europa y Latinoamérica.');
      await sleep(200);
    }
  }

  // Preencher campos de contato
  const step3Inputs = page.locator('input[type="text"]:visible, input[type="tel"]:visible, input[type="url"]:visible');
  const step3Count = await step3Inputs.count();
  console.log(`   → ${step3Count} campos de contato`);

  const contactData = [
    '+34 623 456 789',
    '+34 932 100 200',
    '+34 623 456 789',
    'Lun-Vie 10:00-19:00',
    '@nexpulsedigital',
    '/nexpulsedigital',
    '@nexpulse',
    '/company/nexpulse',
    '/nexpulsedigital',
    '@nexpulse',
    'www.nexpulse.com',
  ];

  let cIdx = 0;
  for (let i = 0; i < step3Count && cIdx < contactData.length; i++) {
    const inp = step3Inputs.nth(i);
    const val = await inp.inputValue();
    if (!val || val.trim() === '') {
      await inp.fill(contactData[cIdx]);
      await sleep(100);
      cIdx++;
    }
  }

  await page.screenshot({ path: 'test-screenshots/novo-10-visual-preenchido.png', fullPage: true });

  // ═══════ SUBMIT ═══════
  console.log('\n🚀 ENVIANDO PROJETO...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);

  const submitBtn = page.locator('button:has-text("Finalizar Proyecto")');
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    console.log('   → Clicou "Finalizar Proyecto"');
    await sleep(1500);

    await page.screenshot({ path: 'test-screenshots/novo-11-modal.png', fullPage: true });

    const confirmBtn = page.locator('button:has-text("Confirmar envío")');
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      console.log('   → Clicou "Confirmar envío"');
      await sleep(8000);

      await page.screenshot({ path: 'test-screenshots/novo-12-resultado.png', fullPage: true });

      const onDashboard = await page.locator('text=Mis Proyectos').isVisible().catch(() => false);
      const hasProject = await page.locator('text=NexPulse').isVisible().catch(() => false)
        || await page.locator('text=Pulse').isVisible().catch(() => false);

      console.log('\n═══════ RESULTADO ═══════');
      console.log(`   Dashboard visível: ${onDashboard}`);
      console.log(`   Projeto encontrado: ${hasProject}`);
    } else {
      console.log('   ❌ Modal não apareceu!');
    }
  } else {
    console.log('   ❌ Botão "Finalizar Proyecto" não encontrado!');
    await page.screenshot({ path: 'test-screenshots/novo-11-sem-botao.png', fullPage: true });
  }

  // Relatório
  console.log('\n═══════ ERROS ═══════');
  const realErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
  console.log(`   Erros reais: ${realErrors.length}`);
  realErrors.forEach((e, i) => console.log(`   ${i + 1}. ${e.substring(0, 200)}`));
  if (realErrors.length === 0) console.log('   ✅ Nenhum erro!');

  console.log('\n🔍 Browser aberto por 15s...');
  await sleep(15000);
  await browser.close();
})();
