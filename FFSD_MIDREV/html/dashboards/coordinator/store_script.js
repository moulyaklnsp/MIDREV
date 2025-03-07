document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const imageUrl = document.getElementById('productImage').value;
    const coordinatorName = document.getElementById('coordinatorName').value;
    const collegeName = document.getElementById('collegeName').value;

    const product = {
        name,
        price,
        imageUrl,
        coordinator: coordinatorName,
        college: collegeName
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));

    displayProducts();
    displayProductsForOrganizer(); // Update organizer page immediately
    document.getElementById('productForm').reset();
});

function displayProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productContainer = document.getElementById('products');
    productContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h4>${product.name}</h4>
            <p class="price">Price: ₹${product.price}</p>
            <p class="added-by">Added by: ${product.coordinator} (${product.college})</p>
        </div>
        `;
        productContainer.appendChild(productCard);
    });
}

// Function to display products on the organizer's page
function displayProductsForOrganizer() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productContainer = document.getElementById('organizerProducts');

    if (!productContainer) return; // Prevent errors if the element is not on this page

    productContainer.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>₹${product.price}</td>
            <td>${product.coordinator}</td>
            <td>${product.college}</td>
        `;
        productContainer.appendChild(row);
    });
}

// Load products for both the coordinator and organizer
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    displayProductsForOrganizer();
});
