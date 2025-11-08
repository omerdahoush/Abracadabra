const esbuild = require('esbuild');

// Vercel provides the environment variable. 
// This script ensures it's embedded in the bundled client-side code.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.warn(`
----------------------------------------------------------------
Warning: API_KEY environment variable is not set.
The application will not function without it.
Please add it to your Vercel project's Environment Variables.
----------------------------------------------------------------
    `);
}

esbuild.build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: 'public/index.js',
    minify: true,
    sourcemap: 'inline',
    target: 'es2020',
    define: {
        // Replace process.env.API_KEY in the source code with the actual value.
        'process.env.API_KEY': `"${apiKey || ''}"`,
    },
    loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
    },
}).then(() => {
    console.log('Build finished successfully.');
}).catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});
