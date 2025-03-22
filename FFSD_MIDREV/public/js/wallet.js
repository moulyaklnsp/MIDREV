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

window.onload = function () {
            
    let savedBalance = localStorage.getItem("walletBalance");
    if (savedBalance) {
        document.getElementById("walletBalance").innerText = savedBalance;
    }
};
const playerName = "<%= playerName %>";
const playerCollege = "<%= playerCollege %>";
function buyProduct(productId, price) {
    let balance = parseFloat(document.getElementById("walletBalance").innerText);

    if (balance >= price) {
        balance -= price;
        document.getElementById("walletBalance").innerText = balance;

        // Save new balance (in localStorage)
        localStorage.setItem("walletBalance", balance);

        // Create a hidden form and submit to server
        let form = document.createElement("form");
        form.method = "POST";
        form.action = "/buy";

        let productInput = document.createElement("input");
        productInput.type = "hidden";
        productInput.name = "productId";
        productInput.value = productId;

        let priceInput = document.createElement("input");
        priceInput.type = "hidden";
        priceInput.name = "price";
        priceInput.value = price;

        let buyerInput = document.createElement("input");
        buyerInput.type = "hidden";
        buyerInput.name = "buyer";
        buyerInput.value = playerName; // Get from session

        let collegeInput = document.createElement("input");
        collegeInput.type = "hidden";
        collegeInput.name = "college";
        collegeInput.value = playerCollege; // Get from session

        form.appendChild(productInput);
        form.appendChild(priceInput);
        form.appendChild(buyerInput);
        form.appendChild(collegeInput);

        document.body.appendChild(form);
        form.submit();
    } else {
        alert("Insufficient funds!");
    }
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

