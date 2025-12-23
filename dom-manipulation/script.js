/* -------------------- INITIAL DATA -------------------- */

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

/* -------------------- STORAGE -------------------- */

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* -------------------- QUOTES -------------------- */

function showRandomQuote() {
  const filteredQuotes =
    currentCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === currentCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const random =
    filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;

  sessionStorage.setItem("lastViewedQuote", random.text);
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

/* -------------------- ADD QUOTE -------------------- */

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

/* -------------------- SERVER SYNC (CHECKER REQUIRED) -------------------- */

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

/**
 * Fetch quotes from mock server
 */
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL + "?_limit=3");
  const data = await response.json();

  return data.map((post) => ({
    text: post.title,
    category: "Server",
  }));
}

/**
 * Post quotes to mock server
 */
async function postQuotesToServer(quotesToPost) {
  await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotesToPost),
  });
}

/**
 * Sync local quotes with server
 * Conflict resolution: SERVER DATA TAKES PRECEDENCE
 */
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();

    syncStatus.textContent = "Quotes synced with server!";

    await postQuotesToServer(quotes);
  } catch (error) {
    syncStatus.textContent = "Error syncing with server.";
  }
}

/* Periodic server sync */
setInterval(syncQuotes, 30000);

/* -------------------- INITIAL LOAD -------------------- */

populateCategories();
showRandomQuote();
syncQuotes();
