// Makes Simply Linked installable ("Add to Home Screen"). Deliberately caches NOTHING:
// patient information must never be stored on the device, and the app always loads fresh.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* network only */ });
