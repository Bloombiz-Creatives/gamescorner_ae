class ClassicProductsManager {
    constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
      this.apiBaseUrl = apiBaseUrl;
      this.dealsClassic = document.getElementById("dealsClassic");
      this.classicPrevButton = document.getElementById("clasic-prev");
      this.classicNextButton = document.getElementById("clasic-next");
      this.fetchClassicProducts = this.fetchClassicProducts.bind(this);
    }
  
    // Fetch classic products from the API
    async fetchClassicProducts() {
      try {
        const url = `${this.apiBaseUrl}/oldest-products`;
  
        const response = await fetch(url);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.success) {
          this.populateClassicProducts(data.products);
        } else {
          throw new Error("Failed to fetch classic products");
        }
      } catch (error) {
        console.error("Error fetching classic products:", error);
      }
    }
  
    // Populate classic products section
    populateClassicProducts(products) {
      if (!this.dealsClassic) {
        console.warn("Classic products container not found");
        return;
      }
  
      // Clear previous content
      this.dealsClassic.innerHTML = "";
  
      if (!products || products.length === 0) {
        const noProductsMessage = document.createElement("div");
        noProductsMessage.textContent = "No classic products found";
        noProductsMessage.classList.add("text-center", "py-3");
        this.dealsClassic.appendChild(noProductsMessage);
        return;
      }
  
      // Create a container for the Slick carousel
      const carouselContainer = document.createElement("div");
      carouselContainer.classList.add("classic-carousel");
  
      products.forEach((product) => {
        const pricing =
          product.country_pricing.find(
            (p) => p.country === "United Arab Emirates"
          ) || product.country_pricing[0];
  
        const classicItem = document.createElement("div");
        classicItem.classList.add("classic-item");
  
        const truncatedDescription = this.truncateDescription(
          this.stripHtmlTags(product.description) || "No description available",
          90
        );
  
        const truncatedName = this.truncatedName(
          this.stripHtmlTags(product.name) || "No name available",
          130
        );
  
        classicItem.innerHTML = `
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
                        ? `${pricing.currency_code} ${(pricing.discount + pricing.tax_amount).toFixed(2)}`
                        : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
  
        carouselContainer.appendChild(classicItem);
      });
  
      this.dealsClassic.appendChild(carouselContainer);
  
      // Initialize Slick carousel
      this.initCarousel();
    }
  
    initCarousel() {
      try {
        $(this.dealsClassic).find(".classic-carousel").slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow: this.classicPrevButton,
          nextArrow: this.classicNextButton,
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
  
    truncatedName(name, maxLength) {
      return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
    }
  
    stripHtmlTags(htmlString) {
      const doc = new DOMParser().parseFromString(htmlString, "text/html");
      return doc.body.textContent || "";
    }
  }
  
  // Initialize the manager
  document.addEventListener("DOMContentLoaded", () => {
    const classicProductsManager = new ClassicProductsManager();
    classicProductsManager.fetchClassicProducts();
  });
  