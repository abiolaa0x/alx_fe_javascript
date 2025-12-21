/* -------------------- DATA SETUP -------------------- */

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Learning never exhausts the mind.", category: "Education" },
  { text: "Simplicity is the soul of efficiency.", category: "Programming" },
  { text: "Knowledge is power.", category: "Motivation" },
];

let currentCategory = localStorage.getItem("selectedCategory") || "all";

/* -------------------- DOM ELEMENTS -------------------- */

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

/* -------------------- STORAGE FUNCTIONS -------------------- */

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastQuote", quote);
}

/* -------------------- QUOTE DISPLAY -------------------- */

function showRandomQuote() {
  const filtered =
    currentCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === currentCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  saveLastViewedQuote(randomQuote.text);
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

/* -------------------- ADD QUOTES -------------------- */

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

/* -------------------- CATEGORY FILTER -------------------- */

function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];

  categoryFilter.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === currentCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  currentCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", currentCategory);
  showRandomQuote();
}

categoryFilter.addEventListener("change", filterQuotes);

/* -------------------- JSON IMPORT / EXPORT -------------------- */

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

/* -------------------- SERVER SYNC SIMULATION -------------------- */

async function syncWithServer() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=3",
    );
    const serverData = await response.json();

    const serverQuotes = serverData.map((post) => ({
      text: post.title,
      category: "Server",
    }));

    // Conflict resolution: SERVER WINS
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();

    syncStatus.textContent = "Data synced with server (server took precedence)";
  } catch (error) {
    syncStatus.textContent = "Sync failed.";
  }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

/* -------------------- INITIAL LOAD -------------------- */

populateCategories();
showRandomQuote();
syncWithServer();
