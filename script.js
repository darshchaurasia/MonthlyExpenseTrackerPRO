let expenses = [];
let totalExpenses = 0;

document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const expense = { id: Date.now(), description, amount };
    expenses.push(expense);
    
    addExpenseToList(expense);
    updateTotal(amount);
    
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

function updateTotal(amount) {
    totalExpenses += amount;
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}

function deleteExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const index = expenses.indexOf(expense);
    expenses.splice(index, 1);
    updateTotal(-expense.amount);
    
    const element = document.getElementById(id);
    document.getElementById('expense-list').removeChild(element);
}

function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    const description = prompt("Edit the description", expense.description);
    const amount = parseFloat(prompt("Edit the amount", expense.amount));
    
    if (description !== null && !isNaN(amount)) {
        expense.description = description;
        expense.amount = amount;
        updateExpenseDisplay(expense);
        recalculateTotal();
    }
}

function updateExpenseDisplay(expense) {
    const element = document.getElementById(expense.id);
    element.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)} 
                         <button onclick="editExpense(${expense.id})">Edit</button>
                         <button onclick="deleteExpense(${expense.id})">Delete</button>`;
}

function recalculateTotal() {
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}
