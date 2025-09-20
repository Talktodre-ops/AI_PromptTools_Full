const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function testWebsite() {
  console.log('🚀 Starting website testing...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  });

  const page = await browser.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  try {
    console.log('📱 Setting viewport for desktop...');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('🌐 Navigating to localhost:3001...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take homepage screenshot
    console.log('📸 Taking homepage screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, 'homepage-desktop.png'),
      fullPage: true
    });

    // Test animations and interactions
    console.log('✨ Testing animations...');
    await page.evaluate(() => {
      // Trigger any hover effects
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot after animations
    await page.screenshot({
      path: path.join(screenshotsDir, 'homepage-animated.png'),
      fullPage: true
    });

    // Test mobile viewport
    console.log('📱 Testing mobile viewport...');
    await page.setViewport({ width: 375, height: 812 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({
      path: path.join(screenshotsDir, 'homepage-mobile.png'),
      fullPage: true
    });

    // Test tablet viewport
    console.log('📱 Testing tablet viewport...');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({
      path: path.join(screenshotsDir, 'homepage-tablet.png'),
      fullPage: true
    });

    // Test navigation - click "Start Creating" button
    console.log('🎯 Testing navigation...');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      // Look for the start button
      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 2000));

      const startButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button =>
          button.textContent.includes('Start Creating') ||
          button.textContent.includes('Create Text Prompts')
        );
      });

      if (startButton) {
        console.log('🎯 Found start button, clicking...');
        await startButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Take screenshot of prompt interface
        await page.screenshot({
          path: path.join(screenshotsDir, 'prompt-interface.png'),
          fullPage: true
        });
      }
    } catch (error) {
      console.log('⚠️ Could not find start button:', error.message);
    }

    // Performance metrics
    console.log('⚡ Collecting performance metrics...');
    const metrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      };
    });

    console.log('📊 Performance Metrics:');
    console.log(`  Load Time: ${metrics.loadTime}ms`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  First Paint: ${metrics.firstPaint}ms`);
    console.log(`  First Contentful Paint: ${metrics.firstContentfulPaint}ms`);

    // Accessibility test
    console.log('♿ Running accessibility checks...');
    const accessibilityResults = await page.evaluate(() => {
      const results = {
        imagesWithAlt: 0,
        imagesWithoutAlt: 0,
        headingStructure: [],
        buttonsWithText: 0,
        buttonsWithoutText: 0,
      };

      // Check images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.alt && img.alt.trim() !== '') {
          results.imagesWithAlt++;
        } else {
          results.imagesWithoutAlt++;
        }
      });

      // Check heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        results.headingStructure.push({
          tag: heading.tagName,
          text: heading.textContent.substring(0, 50) + '...'
        });
      });

      // Check buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent.trim() !== '' || button.getAttribute('aria-label')) {
          results.buttonsWithText++;
        } else {
          results.buttonsWithoutText++;
        }
      });

      return results;
    });

    console.log('♿ Accessibility Results:');
    console.log(`  Images with alt text: ${accessibilityResults.imagesWithAlt}`);
    console.log(`  Images without alt text: ${accessibilityResults.imagesWithoutAlt}`);
    console.log(`  Buttons with text/label: ${accessibilityResults.buttonsWithText}`);
    console.log(`  Buttons without text/label: ${accessibilityResults.buttonsWithoutText}`);
    console.log(`  Heading structure: ${accessibilityResults.headingStructure.length} headings found`);

    // Save test results
    const testResults = {
      timestamp: new Date().toISOString(),
      performance: metrics,
      accessibility: accessibilityResults,
      screenshots: [
        'homepage-desktop.png',
        'homepage-animated.png',
        'homepage-mobile.png',
        'homepage-tablet.png',
        'prompt-interface.png'
      ]
    };

    await fs.writeFile(
      path.join(screenshotsDir, 'test-results.json'),
      JSON.stringify(testResults, null, 2)
    );

    console.log('✅ Website testing completed successfully!');
    console.log(`📁 Screenshots and results saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error during testing:', error);

    // Take error screenshot
    try {
      await page.screenshot({
        path: path.join(screenshotsDir, 'error-screenshot.png'),
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError);
    }
  } finally {
    console.log('🔚 Closing browser...');
    await browser.close();
  }
}

// Run the test
testWebsite().catch(console.error);