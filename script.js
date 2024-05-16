let expenses = [];
let totalExpenses = 0;
let expenseChart; // This will hold the chart instance

// Event listener for form submission
document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    if (!isNaN(amount)) {
        const expense = { id: Date.now(), description, amount };
        expenses.push(expense);
        
        addExpenseToList(expense);
        updateTotal();
        createExpenseChart();
        saveExpensesToLocalStorage();
    }
    
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
});

// Function to add a new expense to the list
function addExpenseToList(expense) {
    const node = document.createElement("div");
    node.setAttribute("id", expense.id);
    node.classList.add('expense-item'); // This class should handle specific styling
    node.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)}
                       <button onclick="editExpense(${expense.id})">Edit</button>
                       <button onclick="deleteExpense(${expense.id})">Delete</button>`;
    document.getElementById('expense-list').appendChild(node);

    applyThemeToNewElement(node); // Ensure new element adheres to current theme
}

// Function to update the total displayed
function updateTotal() {
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}

// Function to delete an expense
function deleteExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const index = expenses.indexOf(expense);
    expenses.splice(index, 1);
    updateTotal();
    const element = document.getElementById(id);
    document.getElementById('expense-list').removeChild(element);
    createExpenseChart();
    saveExpensesToLocalStorage();
}

// Function to edit an existing expense
function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const description = prompt("Edit the description", expense.description);
    const newAmount = parseFloat(prompt("Edit the amount", expense.amount));
    
    if (description !== null && !isNaN(newAmount)) {
        expense.description = description;
        expense.amount = newAmount;
        updateExpenseDisplay(expense);
        updateTotal();
        createExpenseChart();
        saveExpensesToLocalStorage();
    }
}

// Function to update the display of an edited expense
function updateExpenseDisplay(expense) {
    const element = document.getElementById(expense.id);
    element.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)} 
                         <button onclick="editExpense(${expense.id})">Edit</button>
                         <button onclick="deleteExpense(${expense.id})">Delete</button>`;
}

// Function to create or update the expense chart
function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) {
        expenseChart.destroy(); // Destroy the existing chart instance if exists
    }
    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: expenses.map(expense => expense.description),
            datasets: [{
                label: 'Expenses',
                data: expenses.map(expense => expense.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
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

// Function to toggle dark mode across all relevant elements
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');

    // Update all dynamic elements to reflect the current theme
    const elementsToUpdate = document.querySelectorAll('.expense-item, input, button, .chart-container');
    elementsToUpdate.forEach(element => {
        element.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
    });

    createExpenseChart(); // Update the chart to reflect the theme change
});

// Function to download the expense list as a PDF
document.getElementById('download-pdf').addEventListener('click', downloadPDF);

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the canvas element and its data URL
    const canvas = document.getElementById('expenseChart');
    const canvasImg = canvas.toDataURL('image/png', 1.0);

    let y = 10; // Initial vertical position

    doc.text('Monthly Expenses', 10, y);
    y += 10; // Adjust y coordinate to below the title

    // Draw image (Chart) - adjust the dimensions as needed
    doc.addImage(canvasImg, 'PNG', 10, y, 180, 100);
    y += 110; // Adjust y coordinate to below the image

    expenses.forEach(expense => {
        doc.text(`${expense.description}: $${expense.amount.toFixed(2)}`, 10, y);
        y += 10; // Increment y coordinate for each expense
    });

    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 10, y);

    doc.save('monthly_expenses.pdf');
}


// Functions to handle local storage
function saveExpensesToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadExpensesFromLocalStorage() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
        expenses.forEach(expense => addExpenseToList(expense));
        updateTotal();
        createExpenseChart();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadExpensesFromLocalStorage();
    createExpenseChart();
});

function applyThemeToNewElement(element) {
    element.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
}

// Function to download the expense list as a CSV
document.getElementById('download-csv').addEventListener('click', function() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Description,Amount\n"; // Column headers

    expenses.forEach(expense => {
        let row = `${expense.description},${expense.amount}`;
        csvContent += row + "\n";
    });

    // Add a formula to calculate the total at the bottom of the CSV
    csvContent += "Total,=SUM(B2:B" + (expenses.length + 1) + ")\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link); // Required for Firefox

    link.click();
    document.body.removeChild(link);
});
