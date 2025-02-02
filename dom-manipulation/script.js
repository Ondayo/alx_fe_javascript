document.addEventListener("DOMContentLoaded", function () {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteBtn = document.getElementById("newQuote");
    const categoryFilter = document.getElementById("categoryFilter");
    const exportBtn = document.getElementById("exportQuotes");
    const importFileInput = document.getElementById("importFile");

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [
        { text: "The best way to predict the future is to create it.", category: "Motivation" },
        { text: "Do what you can, with what you have, where you are.", category: "Perseverance" },
        { text: "Dream big and dare to fail.", category: "Inspiration" }
    ];

    function saveQuotes() {
        localStorage.setItem("quotes", JSON.stringify(quotes));
    }

    function showRandomQuote() {
        let filteredQuotes = getFilteredQuotes();
        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes available.";
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        quoteDisplay.innerHTML = `<p>${quote.text} <strong>(${quote.category})</strong></p>`;

        sessionStorage.setItem("lastQuote", JSON.stringify(quote));
    }

    function populateCategories() {
        let uniqueCategories = [...new Set(quotes.map(q => q.category))];
        categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
        uniqueCategories.forEach(category => {
            let option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        let savedFilter = localStorage.getItem("selectedCategory");
        if (savedFilter) {
            categoryFilter.value = savedFilter;
        }
    }

    function filterQuotes() {
        let selectedCategory = categoryFilter.value;
        localStorage.setItem("selectedCategory", selectedCategory);
        showRandomQuote();
    }

    function getFilteredQuotes() {
        let selectedCategory = categoryFilter.value;
        if (selectedCategory === "all") {
            return quotes;
        }
        return quotes.filter(q => q.category === selectedCategory);
    }

    function createAddQuoteForm() {
        const formContainer = document.createElement("div");

        const quoteInput = document.createElement("input");
        quoteInput.id = "newQuoteText";
        quoteInput.type = "text";
        quoteInput.placeholder = "Enter a new quote";

        const categoryInput = document.createElement("input");
        categoryInput.id = "newQuoteCategory";
        categoryInput.type = "text";
        categoryInput.placeholder = "Enter quote category";

        const addQuoteBtn = document.createElement("button");
        addQuoteBtn.textContent = "Add Quote";
        addQuoteBtn.addEventListener("click", addQuote);

        formContainer.appendChild(quoteInput);
        formContainer.appendChild(categoryInput);
        formContainer.appendChild(addQuoteBtn);

        document.body.appendChild(formContainer);
    }

    function addQuote() {
        const newQuoteText = document.getElementById("newQuoteText").value.trim();
        const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

        if (newQuoteText === "" || newQuoteCategory === "") {
            alert("Please enter both quote text and category.");
            return;
        }

        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        populateCategories();

        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";

        alert("New quote added!");
    }

    function exportQuotes() {
        const dataStr = JSON.stringify(quotes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "quotes.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function (event) {
            try {
                const importedQuotes = JSON.parse(event.target.result);
                if (Array.isArray(importedQuotes)) {
                    quotes.push(...importedQuotes);
                    saveQuotes();
                    populateCategories();
                    alert("Quotes imported successfully!");
                } else {
                    alert("Invalid file format!");
                }
            } catch (error) {
                alert("Error reading file!");
            }
        };
        fileReader.readAsText(event.target.files[0]);
    }

    newQuoteBtn.addEventListener("click", showRandomQuote);
    exportBtn.addEventListener("click", exportQuotes);
    importFileInput.addEventListener("change", importFromJsonFile);

    createAddQuoteForm();
    populateCategories();

    const lastQuote = sessionStorage.getItem("lastQuote");
    if (lastQuote) {
        const parsedQuote = JSON.parse(lastQuote);
        quoteDisplay.innerHTML = `<p>${parsedQuote.text} <strong>(${parsedQuote.category})</strong></p>`;
    } else {
        showRandomQuote();
    }
});
