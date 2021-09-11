const APP_PREFIX = 'budget-tracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-version_01';
const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/manifest.json',
	'/css/style.css',
	'/js/idb.js',
	'/js/index.js',
	'/icons/icon-72x72.png',
	'/icons/icon-96x96.png',
	'/icons/icon-128x128.png',
	'/icons/icon-144x144.png',
	'/icons/icon-152x152.png',
	'/icons/icon-192x192.png',
	'/icons/icon-384x384.png',
	'/icons/icon-512x512.png',
];

self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			console.log('installing cache : ' + CACHE_NAME);
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

console.log('No soup 4 U file!');

self.addEventListener('fetch', function (e) {
	if (e.request.url.includes('/api/')) {
		e.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(e.request)
						.then((response) => {
							// If the response was good, clone it and store it in the cache.
							if (response.status === 200) {
								cache.put(e.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							// Network request failed, try to get it from the cache.
							return cache.match(e.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}
	e.respondWith(
		fetch(e.request).catch(function () {
			return caches.match(e.request).then(function (response) {
				if (response) {
					return response;
				} else if (e.request.headers.get('accept').includes('text/html')) {
					// return the cached home page for all requests for html pages
					return caches.match('/');
				}
			});
		})
	);
});
