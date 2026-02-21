import { chromium } from 'playwright';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Capturar erros do console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`   ❌ CONSOLE ERROR: ${msg.text()}`);
    }
  });

  // Capturar erros de rede
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status() });
      console.log(`   ❌ NETWORK ERROR: ${response.status()} ${response.url().substring(0, 100)}`);
    }
  });

  // Capturar erros JS não tratados
  page.on('pageerror', error => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
    console.log(`   ❌ PAGE ERROR: ${error.message}`);
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

  await page.screenshot({ path: 'test-screenshots/submit-00-pos-login.png', fullPage: true });

  // Verificar se tem projetos (dashboard) → clicar Nuevo Proyecto
  const hasDashboard = await page.locator('text=Mis Proyectos').isVisible().catch(() => false)
    || await page.locator('text=Nuevo Proyecto').isVisible().catch(() => false);

  if (hasDashboard) {
    console.log('📋 Dashboard detectado. Clicando em "Nuevo Proyecto"...');
    const newBtn = page.locator('button:has-text("Nuevo Proyecto"), button:has-text("Nuevo")');
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await sleep(1500);
    }
  }

  // ═══════ PASSO 1: TU NEGOCIO ═══════
  console.log('\n📝 PASSO 1: Tu Negocio');

  const hasNameChoice = await page.locator('text=Ya tengo un nombre').isVisible().catch(() => false);
  if (hasNameChoice) {
    console.log('   → Selecionando "Ya tengo un nombre"');
    await page.click('text=Ya tengo un nombre');
    await sleep(1000);
  }

  const nameInput = page.locator('input[type="text"]').first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('TEST E2E - Empresa de Teste');
    await sleep(300);
  }

  const aboutTextarea = page.locator('textarea').first();
  if (await aboutTextarea.isVisible().catch(() => false)) {
    await aboutTextarea.fill('Empresa criada automaticamente pelo teste E2E para verificar se o submit funciona corretamente.');
    await sleep(300);
  }

  console.log('   → Clicando "Siguiente"');
  await page.click('button:has-text("Siguiente")');
  await sleep(2000);

  // ═══════ PASSO 2: ESTRATEGIA ═══════
  console.log('\n📝 PASSO 2: Estrategia');

  const hasIdentityChoice = await page.locator('text=quiero crearla').isVisible().catch(() => false);
  if (hasIdentityChoice) {
    console.log('   → Selecionando "Aún no tengo, quiero crearla"');
    await page.click('text=quiero crearla');
    await sleep(1500);
  }

  // Preencher textareas do briefing
  const allTextareas = page.locator('textarea:visible');
  const textareaCount = await allTextareas.count();
  console.log(`   → ${textareaCount} textareas encontrados`);

  const briefingTexts = [
    'Diferencial: teste automatizado E2E',
    'Público: teste automatizado E2E',
    'Celebridade: Apple por Steve Jobs',
    'Referências: Apple, Stripe, Linear',
    'Evitar: estilos corporativos',
    'Competidores: DesignRush, Brandemia',
    'Notas: logo provisório em Canva',
  ];

  for (let i = 0; i < Math.min(textareaCount, briefingTexts.length); i++) {
    const ta = allTextareas.nth(i);
    const currentValue = await ta.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await ta.fill(briefingTexts[i]);
      await sleep(150);
    }
  }

  // Preencher inputs
  const allInputs = page.locator('input[type="text"]:visible');
  const inputCount = await allInputs.count();
  console.log(`   → ${inputCount} inputs encontrados`);

  const briefingInputs = [
    'Missão: criar experiências digitais',
    'Slogan: Design que inspira',
    'Cores: Negro, Blanco, Azul',
    '2 semanas',
    '1000€',
  ];

  let inputIdx = 0;
  for (let i = 0; i < inputCount && inputIdx < briefingInputs.length; i++) {
    const inp = allInputs.nth(i);
    const currentValue = await inp.inputValue();
    const isReadonly = await inp.getAttribute('readonly');
    if ((!currentValue || currentValue.trim() === '') && !isReadonly) {
      await inp.fill(briefingInputs[inputIdx]);
      await sleep(150);
      inputIdx++;
    }
  }

  // Selecionar personalidades
  const personalities = ['Moderna', 'Premium'];
  for (const p of personalities) {
    const btn = page.locator(`button:text-is("${p}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(150);
    }
  }

  // Selecionar aplicações
  const apps = ['Logo', 'Sitio web'];
  for (const app of apps) {
    const btn = page.locator(`button:text-is("${app}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(150);
    }
  }

  // Ir para passo 3
  console.log('   → Clicando "Siguiente" para Passo 3...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  const nextBtn = page.locator('button:has-text("Siguiente")').last();
  await nextBtn.click();
  await sleep(2000);

  // ═══════ PASSO 3: VISUAL ═══════
  console.log('\n📝 PASSO 3: Visual');

  // Preencher campos de contato
  const step3Inputs = page.locator('input[type="text"]:visible, input[type="tel"]:visible, input[type="url"]:visible');
  const step3Count = await step3Inputs.count();
  console.log(`   → ${step3Count} campos encontrados`);

  const contactData = [
    '+34 612 000 000',
    '+34 965 000 000',
    '+34 612 000 000',
    'Lun-Vie 9:00-18:00',
    '@teste2e',
    '/teste2e',
    '@teste2e',
    '/in/teste2e',
    '/teste2e',
    '@teste2e',
    'www.teste2e.com',
  ];

  let contactIdx = 0;
  for (let i = 0; i < step3Count && contactIdx < contactData.length; i++) {
    const inp = step3Inputs.nth(i);
    const currentValue = await inp.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await inp.fill(contactData[contactIdx]);
      await sleep(100);
      contactIdx++;
    }
  }

  // Preencher "Quiénes somos"
  const step3Textareas = page.locator('textarea:visible');
  const step3TaCount = await step3Textareas.count();
  for (let i = 0; i < step3TaCount; i++) {
    const ta = step3Textareas.nth(i);
    const currentValue = await ta.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await ta.fill('Empresa de teste E2E criada automaticamente.');
      await sleep(200);
    }
  }

  await page.screenshot({ path: 'test-screenshots/submit-01-antes-enviar.png', fullPage: true });
  console.log('   📸 Screenshot antes de enviar');

  // ═══════ SUBMIT! ═══════
  console.log('\n🚀 ENVIANDO PROJETO...');

  // Scroll até o botão de submit
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);

  // Clicar "Finalizar Proyecto"
  const submitBtn = page.locator('button:has-text("Finalizar Proyecto")');
  const submitVisible = await submitBtn.isVisible().catch(() => false);
  console.log(`   → Botão "Finalizar Proyecto" visível: ${submitVisible}`);

  if (submitVisible) {
    await submitBtn.click();
    console.log('   → Clicou "Finalizar Proyecto"');
    await sleep(1500);

    await page.screenshot({ path: 'test-screenshots/submit-02-modal.png', fullPage: true });
    console.log('   📸 Screenshot do modal de confirmação');

    // Clicar "Confirmar envío"
    const confirmBtn = page.locator('button:has-text("Confirmar envío")');
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    console.log(`   → Botão "Confirmar envío" visível: ${confirmVisible}`);

    if (confirmVisible) {
      await confirmBtn.click();
      console.log('   → Clicou "Confirmar envío"');

      // Aguardar resposta (upload + insert)
      await sleep(8000);

      await page.screenshot({ path: 'test-screenshots/submit-03-resultado.png', fullPage: true });
      console.log('   📸 Screenshot do resultado');

      // Verificar se voltou ao dashboard (sucesso)
      const backToDashboard = await page.locator('text=Mis Proyectos').isVisible().catch(() => false);
      const hasTestProject = await page.locator('text=TEST E2E').isVisible().catch(() => false);
      const hasSuccessToast = await page.locator('text=éxito').isVisible().catch(() => false);
      const hasErrorToast = await page.locator('text=Error').isVisible().catch(() => false);

      console.log('\n═══════ RESULTADO ═══════');
      console.log(`   Dashboard visível: ${backToDashboard}`);
      console.log(`   Projeto TEST E2E encontrado: ${hasTestProject}`);
      console.log(`   Toast de sucesso: ${hasSuccessToast}`);
      console.log(`   Toast de erro: ${hasErrorToast}`);

      if (hasErrorToast) {
        // Capturar texto do toast de erro
        const errorText = await page.locator('[class*="toast"], [role="alert"]').textContent().catch(() => 'N/A');
        console.log(`   ❌ TEXTO DO ERRO: ${errorText}`);
      }
    } else {
      console.log('   ❌ Modal de confirmação não apareceu!');
    }
  } else {
    console.log('   ❌ Botão "Finalizar Proyecto" não encontrado!');
    // Tentar capturar o que está visível
    await page.screenshot({ path: 'test-screenshots/submit-02-sem-botao.png', fullPage: true });
  }

  // Relatório final
  console.log('\n═══════ RELATÓRIO DE ERROS ═══════');
  console.log(`Console errors: ${consoleErrors.length}`);
  consoleErrors.forEach((e, i) => console.log(`   ${i + 1}. ${e.substring(0, 200)}`));
  console.log(`Network errors (4xx/5xx): ${networkErrors.length}`);
  networkErrors.forEach((e, i) => console.log(`   ${i + 1}. [${e.status}] ${e.url.substring(0, 150)}`));

  if (consoleErrors.length === 0 && networkErrors.length === 0) {
    console.log('   ✅ Nenhum erro detectado!');
  }

  console.log('\n🔍 Browser aberto por 10 segundos...');
  await sleep(10000);
  await browser.close();
})();
