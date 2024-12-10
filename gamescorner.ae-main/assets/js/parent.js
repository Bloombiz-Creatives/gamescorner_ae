
class ParentImageManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;

    // DOM Element References
    this.parentTableBody = document.getElementById("parentTableBody");
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.loadingIndicator = document.getElementById("loadingIndicator");  
    this.errorMessage = document.getElementById("errorMessage");

    // Bind methods to preserve context
    this.fetchParentImages = this.fetchParentImages.bind(this);
    this.populateParentTable = this.populateParentTable.bind(this);
    this.initSlider = this.initSlider.bind(this);

    // Add event listeners
    this.addEventListeners();
  }

  addEventListeners() {
    if (this.searchBtn) {
      this.searchBtn.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        this.fetchParentImages(query);
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        const query = this.searchInput.value.trim();
        this.fetchParentImages(query);
      });
    }
  }

  // Fetch parent categories from the API
  async fetchParentImages(query = "") {
    try {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "block";
      if (this.errorMessage) this.errorMessage.textContent = "";

      let url = `${this.apiBaseUrl}/category`;
      if (query) {
        url += `?parent_category=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.populateParentTable(data.categories);
      } else {
        throw new Error("Failed to fetch parent categories");
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "none";
    }
  }

  // Populate parent categories table
  populateParentTable(categories) {
    if (!this.parentTableBody) {
      console.warn("Parent table body not found");
      return;
    }

    // Destroy existing Slick slider if it exists
    if ($(this.parentTableBody).hasClass('slick-initialized')) {
      $(this.parentTableBody).slick('unslick');
    }

    this.parentTableBody.innerHTML = "";

    if (!categories || categories.length === 0) {
      const noCategoriesMessage = document.createElement("div");
      noCategoriesMessage.textContent = "No parent categories found";
      noCategoriesMessage.classList.add("text-center", "py-3");
      this.parentTableBody.appendChild(noCategoriesMessage);
      return;
    }
    
    categories.forEach((category) => {      
      const name =
        typeof category.parent_category === "string"
          ? category.parent_category
          : "Unnamed Category";
      const imageSrc =
        typeof category.image === "string" ? category.image : null;

      const categoryItem = document.createElement("div");
      categoryItem.classList.add("feature-item", "text-center");

      categoryItem.innerHTML = `
        <div class="feature-item__thumb rounded-circle">
          <a href="shop.html?id=${category._id}" class="w-100 h-100 flex-center">
            <img src="${imageSrc}" alt="${name}" class="parentcat-img" style="object-fit: contain; ">
          </a>
        </div>
        <div class="feature-item__content mt-16">
          <h6 class="text-lg mb-8">
            <a href="shop.html" class="text-inherit">${name}</a>
          </h6>
        </div>
      `;

      // Append the category item to the table body
      this.parentTableBody.appendChild(categoryItem);
    });

    // Initialize Slick slider after populating the categories
    this.initSlider();
  }

  // Initialize Slick slider
  initSlider() {
    if (typeof $ === 'undefined' || typeof $.fn.slick === 'undefined') {
      console.error('jQuery or Slick slider is not loaded');
      return;
    }

    $(this.parentTableBody).slick({
      slidesToShow: 10,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      draggable: true,
      rtl: $('html').attr('dir') === 'rtl' ? true : false,
      infinite: true,
      nextArrow: '#feature-item-wrapper-next',
      prevArrow: '#feature-item-wrapper-prev',
      responsive: [
        {
          breakpoint: 1699,
          settings: {
            slidesToShow: 9,
          }
        },
        {
          breakpoint: 1599,
          settings: {
            slidesToShow: 8,
          }
        },
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 6,
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 5,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
          }
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 3,
          }
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 359,
          settings: {
            slidesToShow: 1,
          }
        },
      ]
    });
  }

  init() {
    this.fetchParentImages();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const parentImageManager = new ParentImageManager();
  parentImageManager.init();
});