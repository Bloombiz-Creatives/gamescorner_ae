document.addEventListener("DOMContentLoaded", () => {
  const searchInput1 = document.getElementById("searchInput1");
  const searchResults1 = document.getElementById("searchResults1");
  const searchForm1 = document.querySelector(".search-box");

  const searchInput2 = document.getElementById("searchInput2");
  const searchResults2 = document.getElementById("searchResults2");
  const searchForm2 = document.querySelector(".form-location-wrapper");

  // Search Form 1: Handle input and search
  searchInput1.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (!query) {
      searchResults1.style.display = "none";
      searchResults1.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/product?tags=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.products.length > 0) {
        const allTags = data.products.map((product) => product.tags);
        const uniqueTags = [...new Set(allTags)];

        const sortedTags = uniqueTags.sort((a, b) => {
          const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
          return bStartsWith - aStartsWith;
        });

        searchResults1.innerHTML = sortedTags
          .map(
            (tag) => `
              <a href="search.html?tags=${encodeURIComponent(tag)}" class="dropdown-item">
                ${tag}
              </a>
            `
          )
          .join("");
        searchResults1.style.display = "block";
      } else {
        searchResults1.innerHTML = '<span class="dropdown-item">No results found</span>';
        searchResults1.style.display = "block";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      searchResults1.innerHTML = '<span class="dropdown-item">Error fetching results</span>';
      searchResults1.style.display = "block";
    }
  });

  // Search Form 2: Handle input and search
  searchInput2.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (!query) {
      searchResults2.style.display = "none";
      searchResults2.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/product?tags=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.products.length > 0) {
        const allTags = data.products.map((product) => product.tags);
        const uniqueTags = [...new Set(allTags)];

        const sortedTags = uniqueTags.sort((a, b) => {
          const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
          return bStartsWith - aStartsWith;
        });

        searchResults2.innerHTML = sortedTags
          .map(
            (tag) => `
              <a href="search.html?tags=${encodeURIComponent(tag)}" class="dropdown-item">
                ${tag}
              </a>
            `
          )
          .join("");
        searchResults2.style.display = "block";
      } else {
        searchResults2.innerHTML = '<span class="dropdown-item">No results found</span>';
        searchResults2.style.display = "block";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      searchResults2.innerHTML = '<span class="dropdown-item">Error fetching results</span>';
      searchResults2.style.display = "block";
    }
  });

  // Handle form submission for both forms
  searchForm1.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput1.value.trim();
    if (!query) return;

    try {
      const response = await fetch(`http://localhost:5002/api/product?tags=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.products.length > 0) {
        window.location.href = `search.html?tags=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
      }
    } catch (error) {
      console.error("Error checking tags:", error);
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
  });

  searchForm2.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput2.value.trim();
    if (!query) return;

    try {
      const response = await fetch(`http://localhost:5002/api/product?tags=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.products.length > 0) {
        window.location.href = `search.html?tags=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
      }
    } catch (error) {
      console.error("Error checking tags:", error);
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
  });

  // Handle Enter key for both inputs
  searchInput1.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchForm1.dispatchEvent(new Event("submit"));
    }
  });

  searchInput2.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchForm2.dispatchEvent(new Event("submit"));
    }
  });

  // Close dropdown on clicking outside
  document.addEventListener("click", (e) => {
    const isClickInsideSearchBox1 = searchForm1.contains(e.target);
    const isClickInsideSearchResults1 = searchResults1.contains(e.target);
    const isClickInsideSearchBox2 = searchForm2.contains(e.target);
    const isClickInsideSearchResults2 = searchResults2.contains(e.target);

    // Check if the click is outside the search input or results and close dropdown if true
    if (!isClickInsideSearchBox1 && !isClickInsideSearchResults1) {
      searchResults1.style.display = "none";
    }
    if (!isClickInsideSearchBox2 && !isClickInsideSearchResults2) {
      searchResults2.style.display = "none";
    }
  });
});
