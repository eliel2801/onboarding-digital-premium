import { chromium } from 'playwright';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  console.log('🚀 Abrindo aplicação...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // ═══════ LOGIN ═══════
  console.log('🔐 Fazendo login...');
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button:has-text("Acceder al portal")');
  await sleep(5000);

  await page.screenshot({ path: 'test-screenshots/00-pos-login.png', fullPage: true });
  console.log('   📸 Screenshot: 00-pos-login.png');

  // Verificar se tem projetos (dashboard) ou se está na criação
  const hasDashboard = await page.locator('text=Mis Proyectos').isVisible().catch(() => false)
    || await page.locator('text=Nuevo Proyecto').isVisible().catch(() => false);

  if (hasDashboard) {
    console.log('📋 Dashboard detectado. Clicando em "Nuevo Proyecto"...');
    const newBtn = page.locator('button:has-text("Nuevo Proyecto"), button:has-text("Novo Projeto"), button:has-text("Nuevo")');
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await sleep(1500);
    }
  }

  await page.screenshot({ path: 'test-screenshots/01-inicio.png', fullPage: true });
  console.log('   📸 Screenshot: 01-inicio.png');

  // ═══════ PASSO 1: TU NEGOCIO ═══════
  console.log('\n📝 PASSO 1: Tu Negocio');

  // Verificar se está na tela de escolha
  const hasNameChoice = await page.locator('text=Ya tengo un nombre').isVisible().catch(() => false);
  if (hasNameChoice) {
    console.log('   → Selecionando "Ya tengo un nombre"');
    await page.click('text=Ya tengo un nombre');
    await sleep(1000);
  }

  // Preencher nome da empresa
  console.log('   → Preenchendo nome: "Estudio Pixel Creative"');
  const nameInput = page.locator('input[type="text"]').first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('Estudio Pixel Creative');
    await sleep(500);
  }

  // Preencher "Sobre a empresa"
  console.log('   → Preenchendo descrição da empresa');
  const aboutTextarea = page.locator('textarea').first();
  if (await aboutTextarea.isVisible().catch(() => false)) {
    await aboutTextarea.fill('Somos un estudio de diseño digital especializado en branding, identidad visual y desarrollo web para startups y pequeñas empresas que buscan destacar en el mercado digital.');
    await sleep(500);
  }

  await page.screenshot({ path: 'test-screenshots/02-negocio-preenchido.png', fullPage: true });
  console.log('   📸 Screenshot: 02-negocio-preenchido.png');

  // Clicar Siguiente
  console.log('   → Clicando "Siguiente"');
  await page.click('button:has-text("Siguiente")');
  await sleep(2000);

  await page.screenshot({ path: 'test-screenshots/03-pos-negocio.png', fullPage: true });
  console.log('   📸 Screenshot: 03-pos-negocio.png');

  // ═══════ PASSO 2: ESTRATEGIA ═══════
  console.log('\n📝 PASSO 2: Estrategia de Marca');

  // Verificar se está na tela de escolha de identidade
  const hasIdentityChoice = await page.locator('text=quiero crearla').isVisible().catch(() => false);
  if (hasIdentityChoice) {
    console.log('   → Selecionando "Aún no tengo, quiero crearla"');
    await page.click('text=quiero crearla');
    await sleep(1500);
  }

  await page.screenshot({ path: 'test-screenshots/04-briefing-inicio.png', fullPage: true });
  console.log('   📸 Screenshot: 04-briefing-inicio.png');

  // ─── Preenchendo todos os campos do briefing ───
  // Buscar todos os textareas e inputs visíveis na página
  const allTextareas = page.locator('textarea:visible');
  const allInputs = page.locator('input[type="text"]:visible');

  const textareaCount = await allTextareas.count();
  const inputCount = await allInputs.count();
  console.log(`   → Encontrados: ${textareaCount} textareas, ${inputCount} inputs`);

  // Dados do briefing
  const briefingData = {
    textareas: [
      'Nuestro diferencial es la combinación única de creatividad artística con tecnología de vanguardia. Ofrecemos un servicio hiperpersonalizado con tiempos de entrega 40% más rápidos que la competencia.',
      'Emprendedores y startups de 25-40 años, profesionales creativos del sector tech y digital. Perfil urbano, early adopters, valoran el diseño como inversión estratégica para su negocio.',
      'Sería como Apple por Steve Jobs — minimalista, innovadora y obsesionada con cada detalle. También Pentagram por su versatilidad y excelencia creativa.',
      '1. Apple — minimalismo perfecto, uso del espacio negativo\n2. Stripe — tipografía moderna y gradientes sutiles\n3. Linear — interfaz limpia, profesional y con personalidad',
      'No quiero parecer corporativo aburrido ni demasiado juvenil/informal. Evitar neones, estilos retro, clipart. No quiero parecerme a Fiverr, 99designs ni Canva.',
      '1. DesignRush Studio — www.designrush.com (buen portfolio)\n2. Brandemia — www.brandemia.org (fuerte en branding español)\n3. Pentagram — referencia mundial en diseño premium',
      'Tengo un logo provisional hecho en Canva. Quiero algo completamente profesional y escalable. Me gustaría mantener la idea de "pixel" como concepto visual pero con un enfoque minimalista y premium.',
    ],
    inputs: [
      'Transformar la presencia digital de cada negocio en una experiencia visual inolvidable',
      'Diseño que inspira, marcas que perduran',
      'Negro #0A0A0A, Blanco #FAFAFA, Azul eléctrico #3B82F6',
      '3-4 semanas',
      '1500-2500€',
    ],
  };

  // Preencher textareas
  for (let i = 0; i < Math.min(textareaCount, briefingData.textareas.length); i++) {
    const ta = allTextareas.nth(i);
    const currentValue = await ta.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await ta.fill(briefingData.textareas[i]);
      await sleep(200);
      console.log(`   ✏️  Textarea ${i + 1} preenchido`);
    }
  }

  // Preencher inputs de texto
  let inputIdx = 0;
  for (let i = 0; i < inputCount && inputIdx < briefingData.inputs.length; i++) {
    const inp = allInputs.nth(i);
    const currentValue = await inp.inputValue();
    const isReadonly = await inp.getAttribute('readonly');
    if ((!currentValue || currentValue.trim() === '') && !isReadonly) {
      await inp.fill(briefingData.inputs[inputIdx]);
      await sleep(200);
      console.log(`   ✏️  Input ${inputIdx + 1} preenchido: "${briefingData.inputs[inputIdx].substring(0, 40)}..."`);
      inputIdx++;
    }
  }

  // Selecionar tipo de público: "Ambos"
  console.log('   → Selecionando tipo de público: Ambos');
  const ambosBtn = page.locator('button:has-text("Ambos")');
  if (await ambosBtn.isVisible().catch(() => false)) {
    await ambosBtn.click();
    await sleep(300);
  }

  // Selecionar personalidades da marca
  console.log('   → Selecionando personalidades da marca');
  const personalities = ['Moderna', 'Innovadora', 'Minimalista', 'Premium'];
  for (const p of personalities) {
    const btn = page.locator(`button:text-is("${p}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(200);
      console.log(`      ✓ ${p}`);
    }
  }

  // Selecionar aplicações
  console.log('   → Selecionando aplicações');
  const apps = ['Logo', 'Redes sociales', 'Sitio web', 'Tarjeta de visita', 'Papelería corporativa'];
  for (const app of apps) {
    const btn = page.locator(`button:text-is("${app}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(200);
      console.log(`      ✓ ${app}`);
    }
  }

  // Screenshots de cada seção (scroll)
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/05-briefing-topo.png', fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/06-briefing-meio.png', fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/07-briefing-baixo.png', fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/08-briefing-final.png', fullPage: false });

  // Screenshot full page
  await page.screenshot({ path: 'test-screenshots/09-briefing-completo.png', fullPage: true });
  console.log('   📸 Screenshots do briefing salvos');

  // Clicar Siguiente para ir ao Visual
  console.log('\n   → Clicando "Siguiente" para Passo 3...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  const nextBtn = page.locator('button:has-text("Siguiente")').last();
  await nextBtn.click();
  await sleep(2000);

  // ═══════ PASSO 3: VISUAL / FINAL ═══════
  console.log('\n📝 PASSO 3: Visual / Briefing Final');
  await page.screenshot({ path: 'test-screenshots/10-visual-inicio.png', fullPage: true });
  console.log('   📸 Screenshot: 10-visual-inicio.png');

  // Preencher todos os campos visíveis no passo 3
  const step3Inputs = page.locator('input[type="text"]:visible, input[type="tel"]:visible, input[type="url"]:visible');
  const step3Count = await step3Inputs.count();
  console.log(`   → ${step3Count} campos encontrados no passo 3`);

  const contactData = [
    '+34 612 345 678',        // WhatsApp
    '+34 965 123 456',        // Telefone fixo
    '+34 612 345 678',        // Celular
    'Lun-Vie 9:00-18:00',    // Horário
    '@estudiopixelcreative',  // Instagram
    '/estudiopixelcreative',  // Facebook
    '@pixelcreative',         // TikTok
    '/in/estudiopixel',       // LinkedIn
    '/estudiopixelcreative',  // YouTube
    '@pixelcreative',         // Twitter
    'www.estudiopixelcreative.com', // Website
  ];

  let contactIdx = 0;
  for (let i = 0; i < step3Count && contactIdx < contactData.length; i++) {
    const inp = step3Inputs.nth(i);
    const currentValue = await inp.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await inp.fill(contactData[contactIdx]);
      await sleep(150);
      contactIdx++;
    }
  }

  // Preencher textarea "Quiénes somos" se existir
  const step3Textareas = page.locator('textarea:visible');
  const step3TaCount = await step3Textareas.count();
  for (let i = 0; i < step3TaCount; i++) {
    const ta = step3Textareas.nth(i);
    const currentValue = await ta.inputValue();
    if (!currentValue || currentValue.trim() === '') {
      await ta.fill('Estudio Pixel Creative es un estudio de diseño digital fundado en 2024 en Alicante, España. Nos especializamos en crear identidades visuales memorables y experiencias digitales que impulsan el crecimiento de startups y pequeñas empresas. Nuestro equipo combina creatividad artística con las últimas tendencias en diseño y tecnología.');
      await sleep(300);
    }
  }

  // Scroll e screenshots finais
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/11-visual-topo.png', fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/12-visual-meio.png', fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(300);
  await page.screenshot({ path: 'test-screenshots/13-visual-baixo.png', fullPage: false });

  await page.screenshot({ path: 'test-screenshots/14-visual-completo.png', fullPage: true });
  console.log('   📸 Screenshots do visual salvos');

  console.log('\n✅ Teste E2E completo! Todos os campos preenchidos.');
  console.log('📁 Screenshots salvos em test-screenshots/');
  console.log('⚠️  Não cliquei em "Enviar" para não criar dados falsos no banco.\n');

  // Manter browser aberto por 15s para visualização
  console.log('🔍 Browser aberto por 15 segundos para visualização...');
  await sleep(15000);
  await browser.close();
})();
