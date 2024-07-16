// script.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            displayTable(data.customers, data.transactions);
            setupFilter(data.customers, data.transactions);
            setupGraph(data.customers, data.transactions);

            // Display default selected customer transactions
            const defaultCustomer = data.customers[0].id;
            updateGraph(defaultCustomer, data.transactions);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function displayTable(customers, transactions) {
    const tableBody = document.querySelector('#customerTable tbody');
    tableBody.innerHTML = '';
    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
        `;
        tableBody.appendChild(row);
    });
}

function setupFilter(customers, transactions) {
    const customerFilter = document.getElementById('customerFilter');
    const amountFilter = document.getElementById('amountFilter');
    const customerSelect = document.getElementById('customerSelect');

    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });

    customerFilter.addEventListener('input', () => filterTable(customers, transactions));
    amountFilter.addEventListener('input', () => filterTable(customers, transactions));
    customerSelect.addEventListener('change', () => {
        const customerId = parseInt(customerSelect.value);
        updateGraph(customerId, transactions);
    });
}

function filterTable(customers, transactions) {
    const customerFilterValue = document.getElementById('customerFilter').value.toLowerCase();
    const amountFilterValue = document.getElementById('amountFilter').value;
    const tableBody = document.querySelector('#customerTable tbody');
    tableBody.innerHTML = '';

    const filteredTransactions = transactions.filter(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const matchesCustomer = customer.name.toLowerCase().includes(customerFilterValue);
        const matchesAmount = !amountFilterValue || transaction.amount == amountFilterValue;
        return matchesCustomer && matchesAmount;
    });

    filteredTransactions.forEach(transaction => {
        const customer = customers.find(c => c.id === transaction.customer_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
        `;
        tableBody.appendChild(row);
    });
}

function setupGraph(customers, transactions) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    window.transactionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Transaction Amount Per Day  ',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateGraph(customerId, transactions) {
    const customerTransactions = transactions.filter(t => t.customer_id === customerId);
    const groupedTransactions = customerTransactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) acc[date] = 0;
        acc[date] += transaction.amount;
        return acc;
    }, {});

    const labels = Object.keys(groupedTransactions);
    const data = Object.values(groupedTransactions);

    window.transactionChart.data.labels = labels;
    window.transactionChart.data.datasets[0].data = data;
    window.transactionChart.update();
}
