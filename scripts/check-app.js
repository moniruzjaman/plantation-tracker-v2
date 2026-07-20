const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.waitForTimeout(3000); // wait for client-side hydration
    
    // Get page title and key text content
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 3000);
    });
    
    console.log('=== PAGE TEXT (first 3000 chars) ===');
    console.log(bodyText);
    
    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(e => console.log(e));
    
    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach(e => console.log(e));
    
    // Take screenshot
    await page.screenshot({ path: '/home/z/my-project/download/app-screenshot.png', fullPage: false });
    console.log('\nScreenshot saved to /home/z/my-project/download/app-screenshot.png');
    
    // Check if Bangla text is visible
    const hasBangla = await page.evaluate(() => {
      return document.body.innerText.includes('বৃক্ষরোপণ') || document.body.innerText.includes('ড্যাশবোর্ড');
    });
    console.log('\nBangla text visible:', hasBangla);
    
    // Check for any visible error messages or red elements
    const errorElements = await page.evaluate(() => {
      const errors = [];
      // Check for React error boundaries
      document.querySelectorAll('[class*="error"]').forEach(el => {
        if (el.offsetHeight > 0) errors.push(el.textContent?.substring(0, 200));
      });
      return errors;
    });
    
    if (errorElements.length > 0) {
      console.log('\n=== VISIBLE ERROR ELEMENTS ===');
      errorElements.forEach(e => console.log(e));
    }
    
    // Check if the page components render
    const componentStatus = await page.evaluate(() => {
      const checks = {
        sidebar: !!document.querySelector('aside'),
        header: !!document.querySelector('header'),
        mainContent: !!document.querySelector('main'),
        navItems: document.querySelectorAll('nav button').length,
        statCards: document.querySelectorAll('[class*="Card"], [class*="card"]').length,
        charts: document.querySelectorAll('[class*="recharts"], svg.recharts-surface').length,
      };
      return checks;
    });
    console.log('\n=== COMPONENT STATUS ===');
    console.log(JSON.stringify(componentStatus, null, 2));
    
  } catch (err) {
    console.error('Navigation error:', err.message);
  }
  
  await browser.close();
})();