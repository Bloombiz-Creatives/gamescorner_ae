class TodaysDealsManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.dealsTableBody = document.getElementById("dealsTableBody");
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.dealPrevButton = document.getElementById("deal-prev");
    this.dealNextButton = document.getElementById("deal-next");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");
    this.fetchTodaysDeals = this.fetchTodaysDeals.bind(this);
    this.populateDealsTable = this.populateDealsTable.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        this.fetchTodaysDeals(query);
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        const query = this.searchInput.value.trim();
        this.fetchTodaysDeals(query);
      });
    }
  }

  // Fetch today's deals from the API
  async fetchTodaysDeals(query = "") {
    try {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "block";
      if (this.errorMessage) this.errorMessage.textContent = "";

      let url = `${this.apiBaseUrl}/product-todays-deal`;
      if (query) {
        url += `?search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.populateDealsTable(data.products);
      } else {
        throw new Error("Failed to fetch today's deals");
      }
    } catch (error) {
      console.error("Error fetching today's deals:", error);
      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "none";
    }
  }

  // Populate today's deals table
  populateDealsTable(products) {
    if (!this.dealsTableBody) {
      console.warn("Deals table body not found");
      return;
    }

    // Clear previous content
    this.dealsTableBody.innerHTML = "";

    if (!products || products.length === 0) {
      const noProductsMessage = document.createElement("div");
      noProductsMessage.textContent = "No today's deals found";
      noProductsMessage.classList.add("text-center", "py-3");
      this.dealsTableBody.appendChild(noProductsMessage);
      return;
    }

    // Create a container for the Slick carousel
    const carouselContainer = document.createElement("div");
    carouselContainer.classList.add("deals-carousel");

    products.forEach((product) => {
      const pricing =
        product.country_pricing.find(
          (p) => p.country === "United Arab Emirates"
        ) || product.country_pricing[0];

      const dealItem = document.createElement("div");
      dealItem.classList.add("deals-item");

      const truncatedDescription = this.truncateDescription(
        this.stripHtmlTags(product.description) || "No description available",
        90
      );

      dealItem.innerHTML = `
        <div class="product-card__content mt-20 flex-grow">
          <h6 class="title text-lg fw-semibold mt-8   text-line-1">
            <a href="product-details.html?id=${product._id}" class="link">${
              product.name || "Unnamed Product"
            }</a>
          </h6> 
          <div class="flex-align gap-16 mt-10">
           <div class="w-160 h-160 rounded-12 border border-gray-100 flex-shrink-0">
              <a href="product-details.html?id=${product._id}" class="link">
                <img
                  src="${product.image || "assets/images/default-image.png"}"
                  alt="${product.name}"
                  style="width: 160px; height: 160px; object-fit: cover; border-radius: 12px;"
                />
              </a>
            </div>
            <div class="product-details">
              <div class="product-description ">
                <p class="text-sm text-gray-600 line-clamp-5">${truncatedDescription}</p>
              </div>
              <div class="product-card__price flex gap-8">
                <span class="text-heading text-md fw-semibold d-block">
                  ${
                    pricing
                      ? `${pricing.currency_code} ${pricing.discount.toFixed(
                          2
                        )}`
                      : "N/A"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      carouselContainer.appendChild(dealItem);
    });

    this.dealsTableBody.appendChild(carouselContainer);
    
    // Initialize Slick carousel
    this.initCarousel();
  }

  initCarousel() {
    try {
      $(this.dealsTableBody).find('.deals-carousel').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: this.dealPrevButton,
        nextArrow: this.dealNextButton,
        infinite: true,
        autoplay: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      });
    } catch (error) {
      console.error("Error initializing Slick carousel:", error);
    }
  }

  truncateDescription(description, maxLength) {
    return description.length > maxLength
      ? description.slice(0, maxLength) + "..."
      : description;
  }

  stripHtmlTags(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  }
}

// Initialize the manager
document.addEventListener('DOMContentLoaded', () => {
  const todaysDealsManager = new TodaysDealsManager();
  todaysDealsManager.fetchTodaysDeals();
});