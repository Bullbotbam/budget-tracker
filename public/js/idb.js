let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (e) {
	const db = e.target.result;
	db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (e) {
	// when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
	db = e.target.result;

	if (navigator.onLine) {
		uploadtransaction();
	}
};

request.onerror = function (e) {
	// log error here
	console.log(e.target.errorCode);
};

function saveRecord(record) {
	const transaction = db.transaction(['new_transaction'], 'readwrite');

	const transactionObjectStore = transaction.objectStore('new_transaction');

	// add record to your store with add method.
	transactionObjectStore.add(record);
}

function uploadtransaction() {
	// open a transaction on your pending db
	const transaction = db.transaction(['new_transaction'], 'readwrite');

	// access your pending object store
	const transactionObjectStore = transaction.objectStore('new_transaction');

	// get all records from store and set to a variable
	const getAll = transactionObjectStore.getAll();

	getAll.onsuccess = function () {
		// if there was data in indexedDb's store, let's send it to the api server
		if (getAll.result.length > 0) {
			fetch('/api/transaction', {
				method: 'POST',
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
			})
				.then((response) => response.json())
				.then((serverResponse) => {
					if (serverResponse.message) {
						throw new Error(serverResponse);
					}

					const transaction = db.transaction(['new_transaction'], 'readwrite');
					const transactionObjectStore =
						transaction.objectStore('new_transaction');
					// clear all items in your store
					transactionObjectStore.clear();
				})
				.catch((err) => {
					// set reference to redirect back here
					console.log(err);
					// saveRecord(formData);
				});
		}
	};
}

// listen for app coming back online
window.addeListener('online', uploadtransaction);
