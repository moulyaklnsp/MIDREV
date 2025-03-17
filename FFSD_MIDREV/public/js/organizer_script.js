document.addEventListener("DOMContentLoaded", function () {
    displaySalesReport();
    displayAllProducts();
});

// Display all added products across colleges
function displayAllProducts() {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let productTable = document.getElementById('productListTable');

    productTable.innerHTML = `
        <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Coordinator</th>
            <th>College</th>
            <th>Image</th>
        </tr>
    `;

    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>₹${product.price}</td>
            <td>${product.coordinator}</td>
            <td>${product.college}</td>
            <td><img src="${product.imageUrl}" alt="${product.name}" width="50"></td>
        `;
        productTable.appendChild(row);
    });
}
// Display sales report for the organizer
function displaySalesReport() {
    let sales = JSON.parse(localStorage.getItem('sales')) || [];
    let reportTable = document.getElementById('salesReportTable');

    reportTable.innerHTML = `
        <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Coordinator</th>
            <th>College</th>
            <th>Date</th>
        </tr>
    `;

    sales.forEach(sale => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sale.name}</td>
            <td>₹${sale.price}</td>
            <td>${sale.coordinator}</td>
            <td>${sale.college}</td>
            <td>${sale.date}</td>
        `;
        reportTable.appendChild(row);
    });

    console.log("Sales data loaded:", sales);
}

