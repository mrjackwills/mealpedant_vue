// This, and the manifest.json, is to kill any installations of the old version of the site
// can probably be removed in 180 days from today (2023-10-19), meaning after 2024-04-16

self.addEventListener('install', () => {
	// Skip over the "waiting" lifecycle state, to ensure that our
	// new service worker is activated immediately, even if there's
	// another tab open controlled by our older service worker code.
	self.skipWaiting();
});
  
self.addEventListener('activate', () => {
	// Optional: Get a list of all the current open windows/tabs under
	// our service worker's control, and force them to reload.
	// This can "unbreak" any open windows/tabs as soon as the new
	// service worker activates, rather than users having to manually reload.
	self.clients.matchAll({
		type: 'window'
	}).then((windowClients) => {
		windowClients.forEach((windowClient) => {
			windowClient.navigate(windowClient.url);
		});
	});
});