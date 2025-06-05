import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to run the Python scraper
function runScraper() {
    console.log('Starting Python scraper...');
    const pythonProcess = spawn('python', ['selenium_scr.py'], {
        cwd: __dirname
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python scraper output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python scraper error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python scraper exited with code ${code}`);
        if (code === 0) {
            console.log('Scraping completed successfully');
        } else {
            console.error('Scraping failed');
        }
    });
}

// Run the scraper first
runScraper();

// Start the Node.js server
console.log('Starting Node.js server...');
import('./index.js').catch(err => {
    console.error('Failed to start server:', err);
}); 