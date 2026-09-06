const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing Warlords 2 Clone - Detailed Debug...\n');
    
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        let errors = [];
        let errorLocations = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                // Try to get location
                const loc = msg.location();
                if (loc) errorLocations.push(`${loc.url}:${loc.lineNumber}`);
            }
        });
        page.on('pageerror', err => {
            errors.push(err.message + '\n' + err.stack);
        });
        
        // Load the page
        await page.goto('file:///C:/Users/lion_/OneDrive/Minimax/Warlords2/index.html');
        await page.waitForTimeout(1500);
        
        console.log('✓ Page loaded');
        
        // Click New Game
        await page.click('text=New Game');
        await page.waitForTimeout(500);
        console.log('✓ Main menu clicked');
        
        // Select Humans
        await page.click('.faction-card.humans');
        await page.waitForTimeout(1500);
        console.log('✓ Faction selected, game started');
        
        // Try clicking on the map to trigger interactions
        const canvas = await page.$('#game-canvas');
        if (canvas) {
            const box = await canvas.boundingBox();
            // Click center of canvas
            await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
            await page.waitForTimeout(500);
            console.log('✓ Canvas clicked');
        }
        
        // Click End Turn
        await page.click('#end-turn-btn');
        await page.waitForTimeout(1000);
        console.log('✓ End Turn clicked');
        
        // Another turn
        await page.click('#end-turn-btn');
        await page.waitForTimeout(1000);
        console.log('✓ Second turn');
        
        // Report
        console.log('\n--- Console Errors ---');
        if (errors.length > 0) {
            errors.forEach((e, i) => {
                console.log(`❌ Error ${i+1}:`, e.substring(0, 200));
                if (errorLocations[i]) console.log('   Location:', errorLocations[i]);
            });
        } else {
            console.log('✅ No JavaScript errors!');
        }
        
        await browser.close();
        console.log('\n✅ Tests completed!');
        
    } catch (e) {
        console.log('❌ Test failed:', e.message);
    }
})();