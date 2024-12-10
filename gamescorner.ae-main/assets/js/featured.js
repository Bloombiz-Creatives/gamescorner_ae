class FeaturedManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.featuredTableBody = document.getElementById("featuredTableBody");
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");
    this.fetchFeatured = this.fetchFeatured.bind(this);
    this.populateFeaturedTable = this.populateFeaturedTable.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        this.fetchFeatured(query);
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        const query = this.searchInput.value.trim();
        this.fetchFeatured(query);
      });
    }
  }

  async fetchFeatured(query = "") {
    try {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "block";
      if (this.errorMessage) this.errorMessage.textContent = "";

      let url = `${this.apiBaseUrl}/product-featured`;
      if (query) {
        url += `?search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.populateFeaturedTable(data.products);
      } else {
        throw new Error("Failed to fetch featured products");
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "none";
    }
  }

  populateFeaturedTable(products) {
    if (!this.featuredTableBody) {
      console.warn("Featured table body not found");
      return;
    }

    this.featuredTableBody.innerHTML = "";

    if (!products || products.length === 0) {
      const noProductsMessage = document.createElement("div");
      noProductsMessage.textContent = "No featured products found";
      noProductsMessage.classList.add("text-center", "py-3");
      this.featuredTableBody.appendChild(noProductsMessage);
      return;
    }

    // Wrap the products in a container for slick to initialize
    const carouselWrapper = document.createElement("div");
    carouselWrapper.classList.add("slick-carousel");

    products.forEach((product) => {
      const pricing =
        product.country_pricing.find(
          (p) => p.country === "United Arab Emirates"
        ) || product.country_pricing[0];

      const productItem = document.createElement("div");
      productItem.classList.add("flex-align");

      const truncatedDescription = this.truncateDescription(
        this.stripHtmlTags(product.description) || "No description available",
        90
      );

      productItem.innerHTML = `
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

      carouselWrapper.appendChild(productItem);
    });

    this.featuredTableBody.appendChild(carouselWrapper);
    this.initCarousel();
  }

  initCarousel() {
    $(".slick-carousel").slick({
      prevArrow: "#feature-prev",
      nextArrow: "#feature-next",
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      arrows: true,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    });
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

const featuredManager = new FeaturedManager();
featuredManager.fetchFeatured();
