function editRow(button) {
    let row = button.parentElement.parentElement;
    let cells = row.getElementsByTagName("td");

    if (button.innerText === "Edit") {
        // Convert text to input fields
        for (let i = 0; i < 3; i++) {
            let input = document.createElement("input");
            input.type = "text";
            input.value = cells[i].innerText;
            cells[i].innerText = "";
            cells[i].appendChild(input);
        }
        button.innerText = "Save";
    } else {
        // Save edited values
        for (let i = 0; i < 3; i++) {
            let input = cells[i].querySelector("input");
            cells[i].innerText = input.value;
        }
        button.innerText = "Edit";
    }
}

function removeRow(button) {
    let row = button.parentElement.parentElement;
    let confirmation = confirm("Are you sure you want to remove this user?");
    
    if (confirmation) {
        row.remove();
    }
}