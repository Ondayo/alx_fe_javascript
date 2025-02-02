document.addEventListener("DOMContentLoaded", function () {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteBtn = document.getElementById("newQuote");
    const categoryFilter = document.getElementById("categoryFilter");
    const exportBtn = document.getElementById("exportQuotes");
    const importFileInput = document.getElementById("importFile");

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

    function saveQuotes() {
        localStorage.setItem("quotes", JSON.stringify(quotes));
    }

    async function fetchServerQuotes() {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/posts");
            const data = await response.json();

            const serverQuotes = data.map(post => ({
                text: post.title,
                category: "General" // Simulated category
            }));

            mergeQuotes(serverQuotes);
        } catch (error) {
            console.error("Error fetching server quotes:", error);
        }
    }

    function mergeQuotes(serverQuotes) {
        let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

        let newQuotes = serverQuotes.filter(sq => !localQuotes.some(lq => lq.text === sq.text));

        if (newQuotes.length > 0) {
            quotes = [...localQuotes, ...newQuotes];
            saveQuotes();
            populateCategories();
            alert(`${newQuotes.length} new quotes synced from server.`);
        }
    }

    async function addQuoteToServer(quote) {
        try {
            await fetch("https://jsonplaceholder.typicode.com/posts", {
                method: "POST",
                body: JSON.stringify(quote),
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error adding quote to server:", error);
        }
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
        return selectedCategory === "all"
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);
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

        const newQuote = { text: newQuoteText, category: newQuoteCategory };

        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        addQuoteToServer(newQuote);

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

    setInterval(fetchServerQuotes, 10000); // Sync with server every 10 seconds
});
