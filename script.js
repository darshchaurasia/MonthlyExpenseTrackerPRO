let expenses = [];
let totalExpenses = 0;
let expenseChart; // This will hold the chart instance

document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const expense = { id: Date.now(), description, amount };
    expenses.push(expense);
    
    addExpenseToList(expense);
    updateTotal();
    createExpenseChart();
    
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
});

function addExpenseToList(expense) {
    const node = document.createElement("div");
    node.setAttribute("id", expense.id);
    node.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)} 
                       <button onclick="editExpense(${expense.id})">Edit</button>
                       <button onclick="deleteExpense(${expense.id})">Delete</button>`;
    document.getElementById('expense-list').appendChild(node);
}

function updateTotal() {
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}

function deleteExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const index = expenses.indexOf(expense);
    expenses.splice(index, 1);
    updateTotal();
    
    const element = document.getElementById(id);
    document.getElementById('expense-list').removeChild(element);
    createExpenseChart();
}

function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const description = prompt("Edit the description", expense.description);
    const oldAmount = expense.amount;
    const newAmount = parseFloat(prompt("Edit the amount", expense.amount));
    
    if (description !== null && !isNaN(newAmount)) {
        expense.description = description;
        expense.amount = newAmount;
        updateExpenseDisplay(expense);
        updateTotal();
        createExpenseChart();
    }
}

function updateExpenseDisplay(expense) {
    const element = document.getElementById(expense.id);
    element.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)} 
                         <button onclick="editExpense(${expense.id})">Edit</button>
                         <button onclick="deleteExpense(${expense.id})">Delete</button>`;
}

function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) {
        expenseChart.destroy(); // Destroy the existing chart instance if exists
    }
    expenseChart = new Chart(ctx, {
        type: 'bar', // Can change to 'line', 'pie', etc.
        data: {
            labels: expenses.map(expense => expense.description),
            datasets: [{
                label: 'Expenses',
                data: expenses.map(expense => expense.amount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Download PDF function
document.getElementById('download-pdf').addEventListener('click', downloadPDF);

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10; // initial vertical position
    doc.text('Monthly Expenses', 10, y);
    y += 10;

    expenses.forEach(expense => {
        doc.text(`${expense.description}: $${expense.amount.toFixed(2)}`, 10, y);
        y += 10;
    });

    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 10, y);
    
    doc.save('monthly_expenses.pdf');
}
