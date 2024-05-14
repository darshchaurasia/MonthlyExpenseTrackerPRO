import { db, addDoc, collection, getDocs, deleteDoc, doc } from './firebaseConfig.js';

let totalExpenses = 0;

document.getElementById('expense-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    // Add the expense to Firestore
    try {
        const docRef = await addDoc(collection(db, "expenses"), {
            description: description,
            amount: amount,
            timestamp: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
        displayExpenses();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
    
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
});

async function displayExpenses() {
    const querySnapshot = await getDocs(collection(db, "expenses"));
    const expensesContainer = document.getElementById('expense-list');
    expensesContainer.innerHTML = ''; // Clear existing entries
    totalExpenses = 0; // Reset total expenses
    
    querySnapshot.forEach((doc) => {
        const expense = doc.data();
        expense.id = doc.id;
        addExpenseToList(expense);
        totalExpenses += expense.amount;
    });
    
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}

function addExpenseToList(expense) {
    const node = document.createElement("div");
    node.setAttribute("id", expense.id);
    node.innerHTML = `${expense.description}: $${expense.amount.toFixed(2)} 
                       <button onclick="deleteExpense('${expense.id}')">Delete</button>`;
    document.getElementById('expense-list').appendChild(node);
}

async function deleteExpense(id) {
    await deleteDoc(doc(db, "expenses", id));
    console.log("Document successfully deleted!");
    displayExpenses();
}

document.getElementById('download-pdf').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const pdfDoc = new jsPDF();
    const querySnapshot = await getDocs(collection(db, "expenses"));
    
    let y = 20; // initial vertical position
    pdfDoc.setFontSize(14);
    pdfDoc.text('Monthly Expenses', 10, y);
    y += 10;

    let totalExpenses = 0;
    querySnapshot.forEach((docSnapshot) => {
        const expense = docSnapshot.data();
        pdfDoc.text(`${expense.description}: $${expense.amount.toFixed(2)}`, 10, y);
        y += 10;
        totalExpenses += expense.amount;
    });

    pdfDoc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 10, y);
    pdfDoc.save('monthly_expenses.pdf');
});

