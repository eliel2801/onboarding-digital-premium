import { chromium } from 'playwright';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      errors.push(`[${res.status()}] ${res.url().substring(0, 120)}`);
    }
  });

  // ═══════════════════════════════════════
  // 1. LOGIN COMO ADMIN
  // ═══════════════════════════════════════
  console.log('1. LOGIN COMO ADMIN');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });

  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  await page.fill('input[type="password"]', '35473547');
  await page.click('button[type="submit"]');
  await sleep(4000);
  console.log('   Login completo');

  // ═══════════════════════════════════════
  // 2. ADMIN PANEL - GESTIONAR USUARIOS
  // ═══════════════════════════════════════
  console.log('\n2. ADMIN PANEL');

  // Clicar na aba "Gestionar"
  await page.click('text=Gestionar');
  await sleep(2000);
  console.log('   Aba Gestionar aberta');
  await page.screenshot({ path: 'test-screenshots/admin-02-panel.png', fullPage: true });

  // 2a. Criar usuario com role USER
  console.log('\n   2a. Criando usuario...');
  const testEmail = `teste-${Date.now()}@test.com`;

  const emailField = page.locator('input[placeholder*="usuario@"]');
  const passField = page.locator('input[placeholder*="nimo"]');
  await emailField.fill(testEmail);
  await passField.fill('test123456');

  // Verificar selector de role
  const adminRoleBtn = page.locator('button:text-is("Administrador")');
  const userRoleBtn = page.locator('button:text-is("Usuario")');
  if (await adminRoleBtn.isVisible()) {
    console.log('   Selector de Role visivel');
    await adminRoleBtn.click(); await sleep(200);
    console.log('   Testou "Administrador"');
    await userRoleBtn.click(); await sleep(200);
    console.log('   Voltou "Usuario"');
  }

  // Criar
  await page.click('button:has-text("Crear")');
  await sleep(5000);
  console.log(`   Usuario ${testEmail} criado`);
  await page.screenshot({ path: 'test-screenshots/admin-03-criado.png', fullPage: true });

  // 2b. Mudar role para Admin
  console.log('\n   2b. Hacer Admin...');
  const hacerAdminBtns = page.locator('button:has-text("Hacer Admin")');
  if (await hacerAdminBtns.count() > 0) {
    await hacerAdminBtns.first().click();
    await sleep(3000);
    console.log('   Role -> Admin');
  }
  await page.screenshot({ path: 'test-screenshots/admin-04-admin.png', fullPage: true });

  // 2c. Voltar para User
  console.log('   2c. Hacer Usuario...');
  const hacerUserBtns = page.locator('button:has-text("Hacer Usuario")');
  if (await hacerUserBtns.count() > 0) {
    await hacerUserBtns.first().click();
    await sleep(3000);
    console.log('   Role -> User');
  }

  // 2d. Desativar
  console.log('   2d. Desactivar...');
  const desactivarBtns = page.locator('button:has-text("Desactivar")');
  if (await desactivarBtns.count() > 0) {
    await desactivarBtns.first().click();
    await sleep(3000);
    console.log('   Conta desativada');
  }
  await page.screenshot({ path: 'test-screenshots/admin-05-banned.png', fullPage: true });

  // 2e. Reativar
  console.log('   2e. Reactivar...');
  const reactivarBtn = page.locator('button:has-text("Reactivar")');
  if (await reactivarBtn.count() > 0) {
    await reactivarBtn.first().click();
    await sleep(3000);
    console.log('   Conta reativada');
  }
  await page.screenshot({ path: 'test-screenshots/admin-06-reactivado.png', fullPage: true });

  // ═══════════════════════════════════════
  // 3. FORMULARIO COMPLETO DE ONBOARDING
  // ═══════════════════════════════════════
  console.log('\n\n3. FORMULARIO COMPLETO');

  // Ir para Dashboard
  await page.click('text=Todos los Proyectos');
  await sleep(2000);
  console.log('   Dashboard');

  // Clicar "Nuevo Proyecto"
  const newBtn = page.locator('button:has-text("Nuevo Proyecto")');
  await newBtn.waitFor({ state: 'visible', timeout: 10000 });
  await newBtn.click();
  await sleep(2000);
  console.log('   Nuevo Proyecto');

  // ─── TAB 1: TU NEGOCIO ───
  console.log('\n   TAB 1: Tu Negocio');
  await page.screenshot({ path: 'test-screenshots/form-01-negocio.png', fullPage: true });

  // Escolher "Ya tengo un nombre"
  const yaTengoBtn = page.locator('button:has-text("Ya tengo un nombre")');
  await yaTengoBtn.waitFor({ state: 'visible', timeout: 10000 });
  await yaTengoBtn.click();
  await sleep(1500);
  console.log('   -> "Ya tengo un nombre"');
  await page.screenshot({ path: 'test-screenshots/form-01b-pos-click.png', fullPage: true });

  // Nombre de la empresa (placeholder: "Escribe el nombre de tu empresa...")
  const nameInput = page.locator('input[placeholder*="nombre de tu empresa"]');
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.fill('Eandra Digital Agency');
  await sleep(500);
  console.log('   Nombre: Eandra Digital Agency');

  // Sobre la empresa (textarea: "Cuentanos que hace tu empresa...")
  const aboutTa = page.locator('textarea[placeholder*="hace tu empresa"]');
  await aboutTa.waitFor({ state: 'visible', timeout: 5000 });
  await aboutTa.fill('Agencia de marketing digital y desarrollo web especializada en soluciones tecnologicas innovadoras para empresas en Espana y Noruega. Ofrecemos branding, diseno web, SEO, campanas de publicidad digital y desarrollo de apps.');
  await sleep(300);
  console.log('   Sobre la empresa');

  // Email de la empresa (placeholder: "info@tuempresa.com")
  const emailBiz = page.locator('input[placeholder*="info@tuempresa"]');
  if (await emailBiz.isVisible().catch(() => false)) {
    await emailBiz.fill('contacto@eandra.com');
    console.log('   Email: contacto@eandra.com');
  }

  // Ano de fundacion (placeholder: "Ej: 2020")
  const yearInput = page.locator('input[placeholder*="2020"]');
  if (await yearInput.isVisible().catch(() => false)) {
    await yearInput.fill('2024');
    console.log('   Ano: 2024');
  }

  // Direccion (textarea: "Calle, numero, ciudad...")
  const addressTa = page.locator('textarea[placeholder*="Calle"]');
  if (await addressTa.isVisible().catch(() => false)) {
    await addressTa.fill('Calle Gran Via 28, Madrid, 28013');
    console.log('   Direccion: Calle Gran Via 28');
  }

  // Scroll para ver sector
  await page.evaluate(() => window.scrollTo(0, 600));
  await sleep(500);

  // Sector de actividad (button group)
  const sectorBtns = page.locator('button:has-text("Tecnolog")');
  if (await sectorBtns.first().isVisible().catch(() => false)) {
    await sectorBtns.first().click();
    await sleep(200);
    console.log('   Sector: Tecnologia');
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: 'test-screenshots/form-02-negocio-completo.png', fullPage: true });

  // Siguiente
  const sigBtn1 = page.locator('button:has-text("Siguiente")');
  await sigBtn1.click();
  await sleep(2000);
  console.log('   -> Siguiente');

  // ─── TAB 2: ESTRATEGIA ───
  console.log('\n   TAB 2: Estrategia de Marca');
  await page.screenshot({ path: 'test-screenshots/form-03-estrategia.png', fullPage: true });

  // Escolher "Aun no tengo, quiero crearla"
  const noIdentityBtn = page.locator('button:has-text("quiero crearla")');
  await noIdentityBtn.waitFor({ state: 'visible', timeout: 10000 });
  await noIdentityBtn.click();
  await sleep(1500);
  console.log('   -> "Aun no tengo, quiero crearla"');
  await page.screenshot({ path: 'test-screenshots/form-04-briefing.png', fullPage: true });

  // Diferencial (textarea: "Que te hace diferente")
  const diffTa = page.locator('textarea[placeholder*="diferente"]');
  if (await diffTa.isVisible().catch(() => false)) {
    await diffTa.fill('Combinamos experiencia en mercados nordicos y mediterraneos con estrategias digitales data-driven.');
    console.log('   Diferencial');
  }

  // Mision (input: "Democratizar el acceso")
  const missionInput = page.locator('input[placeholder*="Democratizar"]');
  if (await missionInput.isVisible().catch(() => false)) {
    await missionInput.fill('Transformar la presencia digital de empresas europeas con innovacion y tecnologia.');
    console.log('   Mision');
  }

  // Slogan (input: "Diseno que transforma")
  const sloganInput = page.locator('input[placeholder*="transforma"]');
  if (await sloganInput.isVisible().catch(() => false)) {
    await sloganInput.fill('Digital sin fronteras. Resultados sin limites.');
    console.log('   Slogan');
  }

  await page.evaluate(() => window.scrollTo(0, 600));
  await sleep(300);

  // Cliente ideal (textarea: "Describe edad, perfil")
  const clienteTa = page.locator('textarea[placeholder*="edad"]');
  if (await clienteTa.isVisible().catch(() => false)) {
    await clienteTa.fill('Startups tech, scale-ups y pymes europeas que buscan crecer digitalmente. Edad 28-50, fundadores y directores de marketing.');
    console.log('   Cliente ideal');
  }

  // Mercado geografico (input: "Espana, Europa")
  const geoInput = page.locator('input[placeholder*="Europa"]');
  if (await geoInput.isVisible().catch(() => false)) {
    await geoInput.fill('Espana, Noruega, Europa');
    console.log('   Mercado geografico');
  }

  // Tipo publico: B2B
  const b2bBtn = page.locator('button:has-text("Empresa (B2B)")');
  if (await b2bBtn.isVisible().catch(() => false)) {
    await b2bBtn.click();
    await sleep(200);
    console.log('   Publico: B2B');
  }

  await page.evaluate(() => window.scrollTo(0, 1200));
  await sleep(300);

  // Personalidades
  for (const p of ['Innovadora', 'Moderna', 'Premium', 'Confiable']) {
    const btn = page.locator(`button:text-is("${p}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click(); await sleep(100);
      console.log(`   Personalidad: ${p}`);
    }
  }

  // Valores
  for (const v of ['Innovaci', 'Calidad', 'Transparencia']) {
    const btn = page.locator(`button:has-text("${v}")`);
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click(); await sleep(100);
      console.log(`   Valor: ${v}`);
    }
  }

  // Tono
  const tonoBtn = page.locator('button:text-is("Profesional")');
  if (await tonoBtn.isVisible().catch(() => false)) {
    await tonoBtn.click(); await sleep(100);
    console.log('   Tono: Profesional');
  }

  await page.evaluate(() => window.scrollTo(0, 1800));
  await sleep(300);

  // Celebridad (textarea: "Apple por Steve Jobs")
  const celebTa = page.locator('textarea[placeholder*="Apple"]');
  if (await celebTa.isVisible().catch(() => false)) {
    await celebTa.fill('Como Apple por minimalismo, Spotify por accesibilidad, Tesla por innovacion.');
    console.log('   Celebridad');
  }

  // Referencias visuales (textarea: "Me gusta Apple por su minimalismo")
  const refTa = page.locator('textarea[placeholder*="minimalismo"]');
  if (await refTa.isVisible().catch(() => false)) {
    await refTa.fill('Vercel.com, Linear.app, Stripe.com - diseno minimalista y moderno.');
    console.log('   Referencias visuales');
  }

  await page.evaluate(() => window.scrollTo(0, 2400));
  await sleep(300);

  // Colores preferidos (input: "Azul oscuro y dorado")
  const colorsInput = page.locator('input[placeholder*="Azul oscuro"]');
  if (await colorsInput.isVisible().catch(() => false)) {
    await colorsInput.fill('Negro, blanco y azul electrico como acentos.');
    console.log('   Colores preferidos');
  }

  // Estilos a evitar (textarea: "No quiero parecer infantil")
  const avoidTa = page.locator('textarea[placeholder*="infantil"]');
  if (await avoidTa.isVisible().catch(() => false)) {
    await avoidTa.fill('Nada generico, corporativo aburrido ni clipart. Sin gradientes pasados de moda.');
    console.log('   Estilos a evitar');
  }

  await page.evaluate(() => window.scrollTo(0, 3000));
  await sleep(300);

  // Competidores (textarea: "Competidor A")
  const compTa = page.locator('textarea[placeholder*="Competidor"]');
  if (await compTa.isVisible().catch(() => false)) {
    await compTa.fill('1. Accenture - www.accenture.com\n2. Deloitte Digital - www.deloittedigital.com\n3. McKinsey Digital - www.mckinsey.com');
    console.log('   Competidores');
  }

  // Aplicaciones (button group)
  for (const a of ['Logo', 'Sitio web', 'Redes sociales']) {
    const btn = page.locator(`button:text-is("${a}")`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click(); await sleep(100);
      console.log(`   Aplicacion: ${a}`);
    }
  }

  await page.evaluate(() => window.scrollTo(0, 3600));
  await sleep(300);

  // Identidad actual (textarea: "Tengo un logo casero")
  const identNotesTa = page.locator('textarea[placeholder*="logo casero"]');
  if (await identNotesTa.isVisible().catch(() => false)) {
    await identNotesTa.fill('Desde cero. Queremos logo geometrico o tipografico, sin mascota.');
    console.log('   Notas identidad actual');
  }

  // Plazo (input: "2 semanas, 1 mes")
  const deadlineInput = page.locator('input[placeholder*="semanas"]');
  if (await deadlineInput.isVisible().catch(() => false)) {
    await deadlineInput.fill('6-8 semanas');
    console.log('   Plazo: 6-8 semanas');
  }

  // Presupuesto (input: "500, 1000-2000")
  const budgetInput = page.locator('input[placeholder*="500"]');
  if (await budgetInput.isVisible().catch(() => false)) {
    await budgetInput.fill('3000-8000 EUR');
    console.log('   Presupuesto: 3000-8000 EUR');
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: 'test-screenshots/form-05-estrategia-completo.png', fullPage: true });

  // Siguiente
  const sig2 = page.locator('button:has-text("Siguiente")').last();
  await sig2.click();
  await sleep(2000);
  console.log('   -> Siguiente');

  // ─── TAB 3: CONTACTO Y ENTREGA ───
  console.log('\n   TAB 3: Contacto y Entrega');
  await page.screenshot({ path: 'test-screenshots/form-06-visual.png', fullPage: true });

  // Quienes somos (textarea: "Somos una empresa fundada")
  const whoTa = page.locator('textarea[placeholder*="fundada"]');
  if (await whoTa.isVisible().catch(() => false)) {
    await whoTa.fill('Eandra Digital Agency es una agencia de marketing digital y desarrollo web con presencia en Espana y Noruega. Fundada en 2024, ayudamos a empresas a crecer digitalmente con estrategias de SEO, branding, publicidad y desarrollo de apps.');
    console.log('   Quienes somos');
  }

  await page.evaluate(() => window.scrollTo(0, 400));
  await sleep(300);

  // WhatsApp (tel input: "+34 600 000 000")
  const waInput = page.locator('input[type="tel"][placeholder*="600"]').first();
  if (await waInput.isVisible().catch(() => false)) {
    await waInput.fill('+34 612 345 678');
    console.log('   WhatsApp: +34 612 345 678');
  }

  // Telefono fijo (tel: "+34 900 000 000")
  const fijoInput = page.locator('input[type="tel"][placeholder*="900"]');
  if (await fijoInput.isVisible().catch(() => false)) {
    await fijoInput.fill('+34 912 345 678');
    console.log('   Fijo: +34 912 345 678');
  }

  // Telefono movil (second tel with "+34 600...")
  const movilInput = page.locator('input[type="tel"][placeholder*="600"]').last();
  if (await movilInput.isVisible().catch(() => false)) {
    await movilInput.fill('+34 698 765 432');
    console.log('   Movil: +34 698 765 432');
  }

  await page.evaluate(() => window.scrollTo(0, 800));
  await sleep(300);

  // Horario - clicar preset "Lun-Vie 9:00-18:00"
  const horarioPreset = page.locator('button:has-text("Lun-Vie")').first();
  if (await horarioPreset.isVisible().catch(() => false)) {
    await horarioPreset.click();
    await sleep(300);
    console.log('   Horario: Lun-Vie 9:00-18:00');
  }

  await page.evaluate(() => window.scrollTo(0, 1200));
  await sleep(300);

  // Redes sociales - all have placeholder "tuempresa"
  const socialInputs = page.locator('input[placeholder="tuempresa"]');
  const socialCount = await socialInputs.count();
  const socialValues = ['eandradigital', 'eandradigital', 'eandradigital', 'eandra', 'eandradigital', 'eandra_digital'];
  const socialNames = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'X/Twitter'];

  for (let i = 0; i < socialCount && i < socialValues.length; i++) {
    const inp = socialInputs.nth(i);
    if (await inp.isVisible().catch(() => false)) {
      await inp.fill(socialValues[i]);
      console.log(`   ${socialNames[i]}: ${socialValues[i]}`);
      await sleep(80);
    }
  }

  // Sitio web (placeholder: "www.tuempresa.com")
  const webInput = page.locator('input[placeholder*="www.tuempresa"]');
  if (await webInput.isVisible().catch(() => false)) {
    await webInput.fill('www.eandra.com');
    console.log('   Web: www.eandra.com');
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: 'test-screenshots/form-07-contacto-completo.png', fullPage: true });

  // ═══════════════════════════════════════
  // 4. ENVIAR
  // ═══════════════════════════════════════
  console.log('\n\n4. ENVIANDO');

  const submitBtn = page.locator('button:has-text("Finalizar")');
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await sleep(2000);
    console.log('   -> Finalizar Proyecto');
    await page.screenshot({ path: 'test-screenshots/form-08-modal.png', fullPage: true });

    // Modal de confirmacion
    const confirmBtn = page.locator('button:has-text("Confirmar")');
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await sleep(6000);
      console.log('   -> Confirmado!');
      await page.screenshot({ path: 'test-screenshots/form-09-resultado.png', fullPage: true });

      const hasDash = await page.locator('text=Todos los Proyectos').isVisible().catch(() => false);
      const hasProj = await page.locator('text=Eandra').isVisible().catch(() => false);
      console.log(`\n   Dashboard: ${hasDash ? 'OK' : 'FAIL'}`);
      console.log(`   Proyecto visible: ${hasProj ? 'OK' : 'FAIL'}`);
    }
  } else {
    console.log('   FAIL: Boton Finalizar no encontrado');
    await page.screenshot({ path: 'test-screenshots/form-08-sem-botao.png', fullPage: true });
  }

  // ═══════════════════════════════════════
  console.log('\n=======================================');
  console.log('RELATORIO FINAL');
  console.log('=======================================');
  const realErrors = errors.filter(e => !e.includes('favicon'));
  console.log(realErrors.length === 0 ? 'ZERO ERROS!' : `${realErrors.length} erros:`);
  realErrors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
  console.log('\nBrowser aberto 30s...');
  await sleep(30000);
  await browser.close();
})();
