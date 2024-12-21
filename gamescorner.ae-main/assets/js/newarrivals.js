class NewArrivalsManager {
  constructor(apiBaseUrl = "http://localhost:5002/api") {
    this.apiBaseUrl = apiBaseUrl;

    // DOM Element References
    this.productsTableBody = document.getElementById("productsTableBody");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");
    this.productPrevButton = document.getElementById("new-arrival-prev");
    this.productNextButton = document.getElementById("new-arrival-next");

    this.fetchNewArrivals = this.fetchNewArrivals.bind(this);
    this.populateProductsTable = this.populateProductsTable.bind(this);
    this.initSlider = this.initSlider.bind(this);
  }

  async fetchNewArrivals() {
    try {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "block";
      }

      if (this.errorMessage) {
        this.errorMessage.textContent = "";
      }

      const url = `${this.apiBaseUrl}/latest-products`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (!data.products || data.products.length === 0) {
          console.warn("Products array is empty");
          this.populateProductsTable([]);
        } else {
          this.populateProductsTable(data.products);
        }
      } else {
        throw new Error(data.message || "Failed to fetch new arrivals");
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "none";
      }
    }
  }

  populateProductsTable(products) {
    if (!this.productsTableBody) {
      console.warn("Products table body not found");
      return;
    }

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "new-arrival__slider arrow-style-two";

    if (!products || products.length === 0) {
      const noProducts = document.createElement("div");
      noProducts.textContent = "No products found";
      noProducts.classList.add("no-products");
      sliderContainer.appendChild(noProducts);
      this.productsTableBody.appendChild(sliderContainer);
      return;
    }

    products.forEach((product) => {
      try {
        const productWrapper = document.createElement("div");

        // Handle pricing calculations
        const aedPricing =
          product.country_pricing?.find((p) => p.currency_code === "AED") ||
          product.country_pricing?.[0];
        const currentPrice = aedPricing ? aedPricing.unit_price : 0;
        const originalPrice = aedPricing
          ? aedPricing.discount
          : currentPrice * 1.5;

        productWrapper.innerHTML = `
          
            <div class="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
              <a href="product-details.html?id=${
                product._id
              }" class="product-card__thumb flex-center">
                <img src="${
                  product.image || "assets/images/thumbs/default.png"
                }" alt="${product.name || "Product"}" />
              </a>
              <div class="product-card__content mt-12">
                <div class="flex-align gap-6">
                 
                </div>
                <h6 class="title text-lg fw-semibold mt-12 mb-8">
                  <a href="product-details.html?id=${
                    product._id
                  }" class="link text-line-2">
                    ${product.name || "Unnamed Product"}
                  </a>
                </h6>
                <div class="flex-align gap-4">
                  <span class="text-main-600 text-md d-flex">
                    <i class="ph-fill ph-storefront"></i>
                  </span>
                  <span class="text-gray-500 text-xs">By Games Corner</span>
                </div>
  
                <div class="flex-between gap-8 mt-24 flex-wrap">
                  <div class="product-card__price">
                    ${
                      currentPrice
                        ? `
                      <span class="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                        AED ${currentPrice.toFixed(2)}
                      </span>
                    `
                        : ""
                    }
                    <span class="text-heading text-md fw-semibold">
                      AED ${originalPrice.toFixed(
                        2
                      )} <span class="text-gray-500 fw-normal">/Qty</span>
                    </span>
                  </div>
                  <button
                    class="product-card__cart btn btn-main py-11 px-24 rounded-pill flex-align gap-8"
                    data-product-id="${product._id}"
                    data-product-price="${currentPrice}"
                    data-product-discount="${originalPrice}"
                    data-product-quantity="1"
                    onclick="handleAddToCart(event)"
                  >
                    Add <i class="ph ph-shopping-cart"></i>
                  </button>
                </div>
              </div>
            </div>
          `;

        sliderContainer.appendChild(productWrapper);
      } catch (error) {
        console.error("Error processing product:", error);
      }
    });

    // Clear previous content and append the new slider
    this.productsTableBody.innerHTML = "";
    this.productsTableBody.appendChild(sliderContainer);

    // Initialize Slick slider
    this.initSlider();
  }

  initSlider() {
    if (typeof $ === "undefined" || typeof $.fn.slick === "undefined") {
      console.error("jQuery or Slick slider is not loaded");
      return;
    }

    $(".new-arrival__slider").slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      speed: 1500,
      dots: false,
      pauseOnHover: true,
      arrows: true,
      nextArrow: "#newArrival-next",
      prevArrow: "#newArrival-prev",
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            arrows: false,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            arrows: false,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            arrows: false,
          },
        },
      ],
    });
  }

  init() {
    this.fetchNewArrivals();
  }
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const newArrivalsManager = new NewArrivalsManager();
  newArrivalsManager.init();
});

function handleAddToCart(event) {
  event.preventDefault();

  const webtoken = localStorage.getItem("webtoken");
  if (!webtoken) {
    alert("Please login first");
    window.location.href = "account.html";
    return;
  }

  const button = event.target.closest("button");
  if (!button) {
    console.error("Unable to find the button element.");
    return;
  }

  const productId = button.getAttribute("data-product-id");
  const productPrice = button.getAttribute("data-product-price");
  const productDiscount = button.getAttribute("data-product-discount");
  const productCurrencyCode = button.getAttribute("data-product-currencycode");
  const productQuantity = button.getAttribute("data-product-quantity") || 1;
  const shippingprice = button.getAttribute("data-product-shipping");
  const taxamount = button.getAttribute("data-product-tax");
  const shippingtime = button.getAttribute("data-product-shippingtime");

  const productData = {
    productId,
    product_currecy_code: productCurrencyCode,
    product_quantity: parseInt(productQuantity, 10),
    product_price: parseFloat(productPrice),
    product_discount: parseFloat(productDiscount),
    shipping_price: parseInt(shippingprice) || 0,
    shipping_time: shippingtime || "",
    tax_amount: parseFloat(taxamount) || 0,
  };

  fetch("https://api.gamescorner.ae/api/web_cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${webtoken}`,
    },
    body: JSON.stringify(productData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          console.error("Error response:", text);
          throw new Error(text || "Network response was not ok");
        });
      }
      return response.json();
    })
    .then((data) => {
      const successAlert = document.createElement("div");
      successAlert.className =
        "alert alert-success position-fixed top-0 end-0 m-3";
      successAlert.style.zIndex = "9999";
      successAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="ph ph-check-circle me-2"></i>
                <span>Product added to cart successfully!</span>
            </div>
        `;

      const existingAlerts = document.querySelectorAll(".alert.alert-success");
      existingAlerts.forEach((alert) => alert.remove());

      document.body.appendChild(successAlert);

      setTimeout(() => {
        if (successAlert && successAlert.parentNode) {
          successAlert.remove();
        }
      }, 3000);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(
        "Error occurred while adding the product to the cart: " + error.message
      );
    });
}
