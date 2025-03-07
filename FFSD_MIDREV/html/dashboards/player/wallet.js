function displayItems() {
    const storeItemsContainer = document.querySelector(".store-items");
    storeItemsContainer.innerHTML = ""; // Clear existing items

    // Retrieve products from localStorage
    let products = JSON.parse(localStorage.getItem('products')) || [];

    // Generate product cards
    products.forEach(product => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("item");
        itemElement.innerHTML = `
            <img src="${product.imageurl}" alt="${product.name}">
            <p>${product.name}</p>
            <p>Price: $${product.price}</p>
            <button onclick="purchaseItem('${product.name}', ${product.price})">Buy Now</button>
        `;
        storeItemsContainer.appendChild(itemElement);
        console.log(`price: ${product.price}`)
    });
}

document.addEventListener("DOMContentLoaded", displayItems);

function addFunds() {
    let amount = prompt("Enter amount to add:");
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        let balance = parseFloat(document.getElementById("walletBalance").innerText);
        balance += parseFloat(amount);
        document.getElementById("walletBalance").innerText = balance.toFixed(2);
        alert(`$${amount} added to your wallet!`);
    } else {
        alert("Invalid amount. Please enter a valid number.");
    }
}

function purchaseItem(itemName, price) {
    let balance = parseFloat(document.getElementById("walletBalance").innerText);
    console.log(`balance:${balance}`);
    if (balance >= price) {
        balance -= price;
        document.getElementById("walletBalance").innerText = balance.toFixed(2);
        alert(`Purchase successful! You bought a ${itemName}. It will be delivered soon.`);
    } else {
        alert("Insufficient balance! Please add funds to your wallet.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    displayProducts();
});

function displayProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productContainer = document.getElementById('chesshiveProducts');
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
                <p class="price">Price: <span>$${product.price}</span></p>
                <p class="added-by">Added by: <strong>${product.coordinator}</strong> (${product.college})</p>
                <button class="buy-btn" onclick="buyProduct('${product.name}', ${product.price}, '${product.coordinator}', '${product.college}')">
                    Buy Now
                </button>
            </div>
        `;
        productContainer.appendChild(productCard);
    });
}


function buyProduct(name, price, coordinator, college) {
    let balance = parseFloat(document.getElementById("walletBalance").innerText);
    console.log(`balance:${balance}`);
    if (balance >= price) {
        balance -= price;
        document.getElementById("walletBalance").innerText = balance.toFixed(2);
        alert(`You have purchased ${name} for $${price}.`);

        let sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales.push({ name, price, coordinator, college, date: new Date().toLocaleString() });
        localStorage.setItem('sales', JSON.stringify(sales));

        updateOrganizerReport();
    } else {
        alert("Insufficient balance! Please add funds to your wallet.");
    }
}

function updateOrganizerReport() {
    let sales = JSON.parse(localStorage.getItem('sales')) || [];
    localStorage.setItem('sales', JSON.stringify(sales));
}


function purchaseSubscription(price) {
    let balance = parseFloat(document.getElementById("walletBalance").innerText);
    if (balance >= price) {
        balance -= price;
        document.getElementById("walletBalance").innerText = balance.toFixed(2);
        alert("Subscription activated successfully!");
    } else {
        alert("Insufficient balance! Please add funds to your wallet.");
    }
}

document.querySelectorAll(".plan").forEach(planElement => {
    planElement.addEventListener("click", () => {
        let planName = planElement.querySelector("h3").textContent; // Get the plan name

        if (planName === "Basic Plan") {
            document.getElementById("subscription-level").textContent = "Basic Plan";
        } else if (planName === "Premium Plan") {
            document.getElementById("subscription-level").textContent = "Premium Plan";
        }
    });
});

