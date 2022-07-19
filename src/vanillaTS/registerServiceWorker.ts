import { register, unregister } from 'register-service-worker';
if (process.env.NODE_ENV === 'production') {
	register(`${process.env.BASE_URL}service-worker.js`, {
		ready () {
		// console.log('App is being served from cache by a service worker');
		},
		registered () {
		// document.dispatchEvent(registeredEvent);
		},
		cached () {
		// console.log('Content has been cached for offline use.');
		},
		updatefound () {
		// console.log('New content is downloading.');
		},
		updated () {
			// console.log('updated in registeredServiceWorker');
			const updateEvent = new CustomEvent('updateEvent');
			document.dispatchEvent(updateEvent);
			unregister();
		 },
		offline () {
			const offlineEvent = new CustomEvent('offlineEvent');
			document.dispatchEvent(offlineEvent);
		},
		error (error) {
			console.error('Error during service worker registration:', error);
		}
	});
}