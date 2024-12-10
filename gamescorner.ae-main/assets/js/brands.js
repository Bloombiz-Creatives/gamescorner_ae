
class BrandManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;

    // DOM Element References
    this.brandsTableBody = document.getElementById("brandsTableBody");
    this.brandPrevButton = document.getElementById("brand-prev");
    this.brandNextButton = document.getElementById("brand-next");
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");

    this.fetchBrands = this.fetchBrands.bind(this);
    this.populateBrandsTable = this.populateBrandsTable.bind(this);
    this.initSlider = this.initSlider.bind(this);

    this.addEventListeners();
  }

  addEventListeners() {
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        this.fetchBrands(query);
      });
    }

    if (this.searchInput) {
      let debounceTimer;
      this.searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = this.searchInput.value.trim();
          this.fetchBrands(query);
        }, 300);
      });
    }
  }

  async fetchBrands(query = "") {
    try {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "block";
      }

      if (this.errorMessage) {
        this.errorMessage.textContent = "";
      }

      let url = `${this.apiBaseUrl}/brand`;
      if (query) {
        url += `?name=${encodeURIComponent(query)}`;
      }

      console.log("Fetching brands from URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (!data.brands || data.brands.length === 0) {
          console.warn("Brands array is empty");
          this.populateBrandsTable([]);
        } else {
          this.populateBrandsTable(data.brands);
        }
      } else {
        throw new Error(data.message || "Failed to fetch brands");
      }
    } catch (error) {
      console.error("Detailed error fetching brands:", error);

      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "none";
      }
    }
  }

  // Populate brands table
  populateBrandsTable(brands) {
    if (!this.brandsTableBody) {
      console.warn("Brands table body not found");
      return;
    }

    // Destroy existing Slick slider if it exists
    if ($(this.brandsTableBody).hasClass('slick-initialized')) {
      $(this.brandsTableBody).slick('unslick');
    }

    // Clear previous content
    this.brandsTableBody.innerHTML = "";

    if (!brands || brands.length === 0) {
      const row = document.createElement("div");
      row.textContent = "No brands found";
      row.classList.add("brand-item", "no-brands");
      this.brandsTableBody.appendChild(row);
      return;
    }

    brands.forEach((brand) => {
      try {
        const brandItem = document.createElement("div");
        brandItem.classList.add("brand-item");

        const imageSrc = brand.image || "assets/images/thumbs/brand1.png";

        brandItem.innerHTML = `
        <a href="shop.html?brand=${brand._id}" class="brand-link">
          <img src="${imageSrc}" alt="${brand.name || 'Brand'}">
        </a>        `;

        this.brandsTableBody.appendChild(brandItem);
      } catch (error) {
        console.error(`Error processing brand`, error);
      }
    });

    // Initialize Slick slider after populating brands
    this.initSlider();
  }

  // Initialize Slick slider
  initSlider() {
    if (typeof $ === 'undefined' || typeof $.fn.slick === 'undefined') {
      console.error('jQuery or Slick slider is not loaded');
      return;
    }

    $(this.brandsTableBody).slick({
      slidesToShow: 8,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $('html').attr('dir') === 'rtl' ? true : false,
      speed: 900,
      infinite: true,
      nextArrow: '#brand-next',
      prevArrow: '#brand-prev',
      responsive: [
        {
          breakpoint: 1599,
          settings: {
            slidesToShow: 7,
            arrows: false,
          }
        },
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 6,
            arrows: false,
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 5,
            arrows: false,
          }
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 4,
            arrows: false,
          }
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 3,
            arrows: false,
          }
        },
        {
          breakpoint: 359,
          settings: {
            slidesToShow: 2,
            arrows: false,
          }
        },
      ]
    });
  }

  // Initialize the component
  init() {
    // Ensure fetchBrands is called on initial load to populate the table.
    this.fetchBrands();
  }
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const brandManager = new BrandManager();
  brandManager.init();
});