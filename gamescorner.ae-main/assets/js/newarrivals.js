
class NewArrivalsManager {
  constructor(apiBaseUrl = "http://localhost:5002/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.webtoken = localStorage.getItem("webtoken");
    this.products = {};

    // DOM Element References
    this.productsTableBody = document.getElementById("productsTableBody");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");
    this.productPrevButton = document.getElementById("newArrival-prev");
    this.productNextButton = document.getElementById("newArrival-next");

    // Bind methods to instance
    this.fetchNewArrivals = this.fetchNewArrivals.bind(this);
    this.populateProductsTable = this.populateProductsTable.bind(this);
    this.initSlider = this.initSlider.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.showAttributeModal = this.showAttributeModal.bind(this);

    // Initialize modal
    this.initializeModal();
  }

  initializeModal() {
    const modalHTML = `
    <div id="attributeModal" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-0">
            <form id="attributeForm">
              <!-- Product Header -->
              <div class="d-flex gap-3 mb-4">
                <div class="product-image" style="width: 150px; height: 150px;">
                  <img id="modalProductImage" src="" alt="" style="width: 50%; height: 30%; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="product-info">
                  <p id="modalProductName" class="mb-2" style="font-size: 15px;"></p>
                  <div class="pricing">
                    <div class="current-price">
                      <span class="currency">AED</span>
                      <span id="modalCurrentPrice" class="fw-bold "></span>
                    </div>
                    <div class="original-price">
                      <span class="text-decoration-line-through text-muted">AED</span>
                      <span id="modalOriginalPrice" class="text-decoration-line-through text-muted"></span>
                      <span id="modalDiscount" class="ms-2 text-success"></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Attributes Container -->
              <div id="attributesContainer" class="mb-4">
                <!-- Attributes will be dynamically inserted here -->
              </div>

              <!-- Quantity and Add to Cart -->
              <div class="d-flex justify-content-between align-items-center">
                <div class="quantity-selector d-flex align-items-center gap-2">
                  <label>Quantity:</label>
                  <input type="number" class="form-control" id="quantity" name="product_quantity" value="1" min="1" style="width: 80px;">
                </div>
                <button type="submit" class="btn btn-warning px-4">Add to Cart</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`;


    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('attributeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitAttributeForm(e);
    });
  }

  async fetchNewArrivals() {
    try {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "block";
      if (this.errorMessage) this.errorMessage.textContent = "";

      const response = await fetch(`${this.apiBaseUrl}/latest-products`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (data.success) {        
        (data.products || []).forEach(product => {
          this.products[product._id] = product;
        });
        this.populateProductsTable(data.products || []);
      } else {
        throw new Error(data.message || "Failed to fetch new arrivals");
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      if (this.errorMessage) this.errorMessage.textContent = `Error: ${error.message}`;
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "none";
    }
  }

  createProductCard(product) {
    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
    const currentPrice = aedPricing?.unit_price || 0;
    const discountedPrice = aedPricing?.discount;
    

    return `
      <div class="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
        <a href="product-details.html?id=${product._id}" class="product-card__thumb flex-center">
          <img src="${product.image || "assets/images/thumbs/default.png"}" alt="${product.name || "Product"}" />
        </a>
        <div class="product-card__content mt-12">
          <h6 class="title text-lg fw-semibold mt-12 mb-8">
            <a href="product-details.html?id=${product._id}" class="link text-line-2">
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
              ${discountedPrice ?
        `<span class="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                   AED ${currentPrice.toFixed(2)}
                 </span>
                 <span class="text-heading text-md fw-semibold">
                   AED ${discountedPrice.toFixed(2)}
                 </span>` :
        `<span class="text-heading text-md fw-semibold">
                   AED ${currentPrice.toFixed(2)}
                 </span>`
      }
              <span class="text-gray-500 fw-normal">/Qty</span>
            </div>
            <button class="btn btn-main py-11 px-24 rounded-pill flex-align gap-8" 
                    onclick="window.newArrivalsManager.handleAddToCart('${product._id}')">
              Add <i class="ph ph-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>`;
  }

  populateProductsTable(products) {
    if (!this.productsTableBody) {
      console.warn("Products table body not found");
      return;
    }

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "new-arrival__slider arrow-style-two";

    if (!products || products.length === 0) {
      sliderContainer.innerHTML = '<div class="no-products">No products found</div>';
    } else {
      products.forEach(product => {
        const slideWrapper = document.createElement("div");
        slideWrapper.className = "slide-item";
        slideWrapper.innerHTML = this.createProductCard(product);
        sliderContainer.appendChild(slideWrapper);
      });
    }

    this.productsTableBody.innerHTML = "";
    this.productsTableBody.appendChild(sliderContainer);
    this.initSlider();
  }

  async handleAddToCart(productId) {
    if (!this.webtoken) {
      alert("Please login to add items to cart");
      window.location.href = "account.html";
      return;
    }

    try {
      const product = this.products[productId];
      if (!product) {
        throw new Error("Product not found");
      }

      const attributes = await Promise.all(
        product.attributes.map(async (attr) => {
          try {
            const response = await fetch(`${this.apiBaseUrl}/attributes/${attr.attribute._id}`);
            if (!response.ok) throw new Error(`Failed to fetch attribute ${attr.attribute._id}`);
            const data = await response.json();
            return data.attribute;
          } catch (error) {
            console.error(`Error fetching attribute ${attr.attribute._id}:`, error);
            return null;
          }
        })
      );

      const validAttributes = attributes.filter(attr => attr !== null);
      this.showAttributeModal(productId, validAttributes, product.name);
    } catch (error) {
      console.error("Error handling add to cart:", error);
      this.showError("Failed to load product options");
    }
  }

  async fetchAttributes() {
    try {
      const promises = attributeIds.map(id =>
        fetch(`${this.apiBaseUrl}/attributes/${id}`).then(res => res.json())
      );

      const responses = await Promise.all(promises);
      return responses.map(response => response.attribute || []).flat();
    } catch (error) {
      console.error("Error fetching attributes:", error);
      return [];
    }
  }

  showAttributeModal(productId, attributes, productName) {
    const product = this.products[productId];
    if (!product) return;

    const modalProductName = document.getElementById('modalProductName');
    const modalProductImage = document.getElementById('modalProductImage');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalDiscount = document.getElementById('modalDiscount');
    const container = document.getElementById('attributesContainer');

    // Set product details
    modalProductName.textContent = productName;
    modalProductImage.src = product.image || "assets/images/thumbs/default.png";
    modalProductImage.alt = productName;

    // Set pricing  
    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED");
    const currentPrice = aedPricing?.discount || aedPricing?.unit_price || 0;
    const originalPrice = aedPricing?.unit_price || 0;
    const discountPercentage = aedPricing?.discount ?
      Math.round(((originalPrice - aedPricing.discount) / originalPrice) * 100) : 0;

    modalCurrentPrice.textContent = currentPrice.toFixed(2);
    modalOriginalPrice.textContent = discountPercentage > 0 ? originalPrice.toFixed(2) : '';
    modalDiscount.textContent = discountPercentage > 0 ? `(${discountPercentage}% off)` : '';

    container.innerHTML = "";

    // Process product attributes with exact names
    product.attributes.forEach(productAttr => {
      const attribute = attributes.find(attr => attr._id === productAttr.attribute._id);
      if (!attribute) return;

      const wrapper = document.createElement("div");
      wrapper.className = "mb-3";

      const label = document.createElement("div");
      label.className = "d-flex justify-content-between align-items-center mb-2";
      label.innerHTML = `
        <span class="fw-medium">${attribute.name}</span>
        <span class="text-danger" id="${attribute.name}-error"></span>
      `;

      wrapper.appendChild(label);

      const select = document.createElement("select");
      select.className = "form-select";
      select.name = attribute.name; // Use exact attribute name
      select.required = true;

      // Add default option
      select.innerHTML = `<option value="" disabled selected>Select ${attribute.name}</option>`;

      if (attribute.value && Array.isArray(attribute.value)) {
        attribute.value
          .filter(val => productAttr.attribute.attribute_values.includes(val._id))
          .forEach(val => {
            select.innerHTML += `<option value="${val.value}">${val.value}</option>`;
          });
      }

      wrapper.appendChild(select);
      container.appendChild(wrapper);
    });

    if (product.color && !attributes.some(attr => attr.name.toLowerCase() === "color")) {
      const wrapper = document.createElement("div");
      wrapper.className = "mb-3";

      const label = document.createElement("div");
      label.className = "d-flex justify-content-between align-items-center mb-2";
      label.innerHTML = `
        <span class="fw-medium">Color</span>
        <span class="text-danger" id="color-error"></span>
      `;

      wrapper.appendChild(label);

      const select = document.createElement("select");
      select.className = "form-select";
      select.name = "color";
      select.required = true;

      select.innerHTML = `
        <option value="" disabled selected>Select Color</option>
        ${product.color.map(color => `
          <option value="${color.name}" data-color="${color.color_code}">${color.name}</option>
        `).join("")}
      `;

      wrapper.appendChild(select);
      container.appendChild(wrapper);
    }


    // Store productId for form submission
    container.dataset.productId = productId;

    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('attributeModal'));
    modal.show();
  }


  async submitAttributeForm(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const productId = document.getElementById('attributesContainer').dataset.productId;

  try {
    const product = this.products[productId];
    if (!product) {
      throw new Error("Product not found");
    }

    // Clear previous error messages
    document.querySelectorAll('[id$="-error"]').forEach(elem => {
      elem.textContent = '';
    });

    // Initialize attributes object
    const attributes = {};
    const missingAttributes = [];

    // Validate product attributes
    if (product.attributes && Array.isArray(product.attributes)) {
      product.attributes.forEach(attr => {
        if (!attr.attribute || !attr.attribute.name) return;
        
        const attributeName = attr.attribute.name;
        const value = formData.get(attributeName);
        
        if (!value) {
          missingAttributes.push(attributeName);
          const errorElem = document.getElementById(`${attributeName}-error`);
          if (errorElem) {
            errorElem.textContent = 'Required';
          }
        } else {
          attributes[attributeName] = value;
        }
      });
    }

    // Handle color attribute
    if (product.color && product.color.length > 0) {
      const colorValue = formData.get('color');
      if (!colorValue) {
        missingAttributes.push('color');
        const errorElem = document.getElementById('color-error');
        if (errorElem) {
          errorElem.textContent = 'Required';
        }
      } else {
        attributes['color'] = colorValue;
      }
    }

    if (missingAttributes.length > 0) {
      throw new Error(`Please select: ${missingAttributes.join(', ')}`);
    }

    // const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
    if (!aedPricing) throw new Error("Product pricing not found");
    

    const payload = {
      product: productId,
      product_quantity: parseInt(formData.get('product_quantity')) || 1,
      attributes,
      product_currecy_code: aedPricing.currency_code || '',
      product_price: parseFloat(aedPricing.unit_price),
      product_discount: parseFloat(aedPricing.discount) || 0,
      shipping_price: parseFloat(aedPricing.shipping_price) || 0,
      shipping_time: aedPricing.shipping_time || '',
      tax_amount: parseFloat(aedPricing.tax_amount) || 0
    };

    const response = await fetch(`${this.apiBaseUrl}/web_cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.webtoken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to add item to cart");
    }

    this.showSuccess(data.message || "Item added to cart successfully");
    
    // Close modal and update cart count
    const modal = bootstrap.Modal.getInstance(document.getElementById('attributeModal'));
    modal.hide();

    if (typeof updateCartCount === 'function') {
      updateCartCount();
    }

  } catch (error) {
    console.error("Error adding to cart:", error);
    this.showError(error.message);
  }
}

  initSlider() {
    if (typeof $ === "undefined" || typeof $.fn.slick === "undefined") {
      console.error("jQuery or Slick slider is not loaded");
      return;
    }

    const $slider = $(".new-arrival__slider");
    if ($slider.hasClass('slick-initialized')) {
      $slider.slick('unslick');
    }

    $slider.slick({
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
            arrows: false
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            arrows: false
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            arrows: false
          }
        }
      ]
    });
  }

  showSuccess(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-success position-fixed top-0 end-0 m-3";
    alert.style.zIndex = "9999";
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="ph ph-check-circle me-2"></i>
        <span>${message}</span>
      </div>`;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  showError(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger position-fixed top-0 end-0 m-3";
    alert.style.zIndex = "9999";
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="ph ph-x-circle me-2"></i>
        <span>${message}</span>
      </div>`;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  init() {
    this.fetchNewArrivals();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.newArrivalsManager = new NewArrivalsManager();
  window.newArrivalsManager.init();
});