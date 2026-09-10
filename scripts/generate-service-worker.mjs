import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const distDirectory = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', distDirectory);
const serviceWorkerPath = new URL('sw.js', distDirectory);

const html = await readFile(indexPath, 'utf8');
const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)]
    .map(match => match[1]);

const stylesheetUrls = assetUrls.filter(url => url.endsWith('.css'));
const stylesheetContents = await Promise.all(
    stylesheetUrls.map(url => readFile(new URL(url.slice(1), distDirectory), 'utf8'))
);

const fontUrls = stylesheetContents.flatMap(css =>
    [...css.matchAll(/url\((['"]?)([^)'"]+\.(?:woff2?|ttf))\1\)/g)]
        .map(match => new URL(match[2], 'https://local.invalid/assets/index.css').pathname)
);
const appShell = [...new Set([
    '/',
    '/manifest.webmanifest',
    '/apple-touch-icon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    ...assetUrls,
    ...fontUrls
])];

const version = createHash('sha256')
    .update(appShell.join('|'))
    .digest('hex')
    .slice(0, 12);

const serviceWorker = `const CACHE_NAME = 'digital-clock-${version}';
const APP_SHELL = ${JSON.stringify(appShell, null, 4)};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith('digital-clock-') && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put('/', copy));
                    }
                    return response;
                })
                .catch(() => caches.match('/', { ignoreVary: true }))
        );
        return;
    }

    event.respondWith(
        caches.match(request, { ignoreVary: true }).then(cached => {
            if (cached) return cached;

            return fetch(request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});
`;

await writeFile(serviceWorkerPath, serviceWorker, 'utf8');

console.log(`Generated ${serviceWorkerPath.pathname}`);
console.log(`Cache: digital-clock-${version}`);
console.log('Precached files:');
appShell.forEach(file => console.log(`  ${file}`));
