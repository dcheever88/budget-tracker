let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;

    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
        updateBudget();
    }
};

request.onerror = function(e) {
    console.log("error!" + e.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    budgetObjectStore.add(record);
};

function updateBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_budget'], 'readwrite');

                const budgetObjectStore = transaction.objectStore('new_budget');

                budgetObjectStore.clear();

                alert('Budget updates submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

window.addEventListener('online', updateBudget);