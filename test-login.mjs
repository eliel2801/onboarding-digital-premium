import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Abrindo app em http://localhost:3000 ...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Esperar o input de email
  console.log('Esperando tela de login...');
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });

  // Preencher email
  await page.fill('input[type="email"]', 'eliel@cbeiendom.no');
  console.log('Email preenchido');

  // Preencher senha
  await page.fill('input[type="password"]', '35473547');
  console.log('Senha preenchida');

  // Clicar "Acceder al portal"
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  console.log('Botão de login clicado');

  // Esperar carregamento pós-login
  console.log('Esperando app carregar...');
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle');

  console.log('Login completo!');
  console.log('URL atual:', page.url());

  // Screenshot
  await page.screenshot({ path: 'screenshot-app.png', fullPage: true });
  console.log('Screenshot salvo: screenshot-app.png');

  // Manter navegador aberto por 5 minutos
  console.log('Navegador aberto por 5 minutos...');
  await page.waitForTimeout(300000);
  await browser.close();
})();
