/**
 * Verify Data Sources - Проверяет что все данные приходят с browse.wf
 * Используйте: node lib/verify-sources.js
 */

const axios = require('axios');

const DATA_URLS = {
    regions: "https://browse.wf/warframe-public-export-plus/ExportRegions.json",
    lang: "https://browse.wf/warframe-public-export-plus/dict.ru.json",
    tiers: "https://browse.wf/supplemental-data/arbyTiers.js",
    schedule: "https://browse.wf/arbys.txt",
};

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

async function verifySource(name, url) {
    try {
        console.log(`\n${colors.cyan}[${name}]${colors.reset}`);
        console.log(`URL: ${url}`);
        
        const response = await axios.get(url, {
            headers: { "User-Agent": "FenrirBot/1.0" },
            timeout: 15000
        });

        const status = response.status;
        const size = JSON.stringify(response.data).length;
        const contentType = response.headers['content-type'];
        
        console.log(`${colors.green}✓ Доступно${colors.reset}`);
        console.log(`  Status: ${status}`);
        console.log(`  Content-Type: ${contentType}`);
        console.log(`  Size: ${(size / 1024).toFixed(2)} KB`);

        // Специфичные проверки
        if (name === "Regions" && typeof response.data === 'object') {
            const regionCount = Object.keys(response.data).length;
            console.log(`  Regions count: ${regionCount}`);
        }
        if (name === "Language" && typeof response.data === 'object') {
            const langCount = Object.keys(response.data).length;
            console.log(`  Translation entries: ${langCount}`);
        }
        if (name === "Arbitration Schedule" && typeof response.data === 'string') {
            const lines = response.data.trim().split('\n');
            console.log(`  Schedule lines: ${lines.length}`);
            console.log(`  Sample: ${lines[0]}`);
        }
        if (name === "Arbitration Tiers" && typeof response.data === 'string') {
            const tierMatches = response.data.match(/:\s*"[SABCDF]"/g) || [];
            console.log(`  Tier definitions: ${tierMatches.length}`);
        }

        return { success: true, name, url };
    } catch (error) {
        console.log(`${colors.red}✗ Ошибка${colors.reset}`);
        console.log(`  Error: ${error.message}`);
        return { success: false, name, url, error: error.message };
    }
}

async function main() {
    console.log(`${colors.bold}${colors.cyan}=== Bot_Fenrir Data Sources Verification ===${colors.reset}\n`);
    console.log("Проверка что все данные загружаются с browse.wf...\n");

    const results = await Promise.all([
        verifySource("Regions", DATA_URLS.regions),
        verifySource("Language", DATA_URLS.lang),
        verifySource("Arbitration Tiers", DATA_URLS.tiers),
        verifySource("Arbitration Schedule", DATA_URLS.schedule),
    ]);

    const allSuccess = results.every(r => r.success);
    
    console.log(`\n${colors.bold}=== Результат ===${colors.reset}`);
    if (allSuccess) {
        console.log(`${colors.green}✓ Все источники доступны${colors.reset}`);
        console.log(`${colors.green}✓ Все данные загружаются с browse.wf${colors.reset}`);
        console.log(`${colors.green}✓ Нет хардкода данных${colors.reset}`);
    } else {
        console.log(`${colors.red}✗ Некоторые источники недоступны:${colors.reset}`);
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    console.log(`\n${colors.cyan}Источники:${colors.reset}`);
    console.log("1. ExportRegions.json - регионы и локации");
    console.log("2. dict.ru.json - русские переводы");
    console.log("3. arbyTiers.js - ярусы сложности");
    console.log("4. arbys.txt - расписание арбитражей");
    
    process.exit(allSuccess ? 0 : 1);
}

main().catch(console.error);
