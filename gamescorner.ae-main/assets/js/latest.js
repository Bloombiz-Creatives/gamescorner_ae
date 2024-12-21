class LatestProductsManager {
    constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
      this.apiBaseUrl = apiBaseUrl;
      this.dealsLatest = document.getElementById("dealsLatest");
      this.latestPrevButton = document.getElementById("lat-prev");
      this.latestNextButton = document.getElementById("late-next");
      this.fetchLatestProducts = this.fetchLatestProducts.bind(this);
    }
  
    // Fetch latest products from the API
    async fetchLatestProducts() {
      try {
        const url = `${this.apiBaseUrl}/latest-products`;
  
        const response = await fetch(url);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.success) {
          this.populateLatestProducts(data.products);
        } else {
          throw new Error("Failed to fetch latest products");
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    }
  
    // Populate latest products section
    populateLatestProducts(products) {
      if (!this.dealsLatest) {
        console.warn("Latest products container not found");
        return;
      }
  
      // Clear previous content
      this.dealsLatest.innerHTML = "";
  
      if (!products || products.length === 0) {
        const noProductsMessage = document.createElement("div");
        noProductsMessage.textContent = "No latest products found";
        noProductsMessage.classList.add("text-center", "py-3");
        this.dealsLatest.appendChild(noProductsMessage);
        return;
      }
  
      // Create a container for the Slick carousel
      const carouselContainer = document.createElement("div");
      carouselContainer.classList.add("latest-carousel");
  
      products.forEach((product) => {
        const pricing =
          product.country_pricing.find(
            (p) => p.country === "United Arab Emirates"
          ) || product.country_pricing[0];
  
        const latestItem = document.createElement("div");
        latestItem.classList.add("latest-item");

        const truncatedDescription = this.truncateDescription(
            this.stripHtmlTags(product.description) || "No description available",
            90
          );
    
          const truncatedName = this.truncatedName(
            this.stripHtmlTags(product.name) || "No name available", 130
          );
  
        latestItem.innerHTML = `
          <div class="product-card__content mt-20 flex-grow">
            <h6 class="title text-lg fw-semibold mt-8 text-line-1">
              <a href="product-details.html?id=${product._id}" class="link">
                ${truncatedName}
              </a>
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
                <div class="product-description">
                    <p class="text-sm text-gray-600 line-clamp-5">${truncatedDescription}</p>
                </div>
                <div class="product-card__price flex gap-8">
                  <span class="text-heading text-md fw-semibold d-block">
                    ${
                      pricing
                        ? `${pricing.currency_code} ${pricing.discount.toFixed(2)}`
                        : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
  
        carouselContainer.appendChild(latestItem);
      });
  
      this.dealsLatest.appendChild(carouselContainer);
  
      // Initialize Slick carousel
      this.initCarousel();
    }
  
    initCarousel() {
      try {
        $(this.dealsLatest).find(".latest-carousel").slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow: this.latestPrevButton,
          nextArrow: this.latestNextButton,
          infinite: true,
          autoplay: true,
          responsive: [
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
          ],
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
    
      truncatedName(name, maxLength){
        return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
      }
    
      stripHtmlTags(htmlString) {
        const doc = new DOMParser().parseFromString(htmlString, "text/html");
        return doc.body.textContent || "";
      }
    
  }
  
  // Initialize the manager
  document.addEventListener("DOMContentLoaded", () => {
    const latestProductsManager = new LatestProductsManager();
    latestProductsManager.fetchLatestProducts();
  });
  