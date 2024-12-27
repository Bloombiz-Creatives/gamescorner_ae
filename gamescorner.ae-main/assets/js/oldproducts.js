class OldProductsManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.webtoken = localStorage.getItem("webtoken");
    this.products = {};
    this.productsTableBody = document.getElementById("oldProductsTableBody");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.errorMessage = document.getElementById("errorMessage");

    // Bind methods to instance
    this.fetchOldProducts = this.fetchOldProducts.bind(this);
    this.populateProductsTable = this.populateProductsTable.bind(this);
    this.showAttributeModal = this.showAttributeModal.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.submitAttributeForm = this.submitAttributeForm.bind(this);
    this.createProductCard = this.createProductCard.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);

    // Initialize the component
    this.initializeModal();
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
                      <span id="modalCurrentPrice" class="fw-bold"></span>
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

    // Remove existing modal if it exists
    const existingModal = document.getElementById('attributeModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add form submit event listener
    const form = document.getElementById('attributeForm');
    if (form) {
      form.addEventListener('submit', this.submitAttributeForm);
    }
  }

  async fetchOldProducts() {
    try {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "block";
      }
      if (this.errorMessage) {
        this.errorMessage.textContent = "";
      }

      const response = await fetch(`${this.apiBaseUrl}/oldest-products`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        (data.products || []).forEach(product => {
          this.products[product._id] = product;
        });
        this.populateProductsTable(data.products || []);
      } else {
        throw new Error(data.message || "Failed to fetch old products");
      }
    } catch (error) {
      console.error("Error fetching old products:", error);
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

    this.productsTableBody.innerHTML = "";

    if (!products || products.length === 0) {
      const noProducts = document.createElement("div");
      noProducts.textContent = "No products found";
      noProducts.classList.add("no-products", "col-12", "text-center", "py-8");
      this.productsTableBody.appendChild(noProducts);
      return;
    }

    const rowContainer = document.createElement("div");
    rowContainer.className = "row g-4";

    products.forEach((product) => {
      const productCard = this.createProductCard(product);
      rowContainer.appendChild(productCard);
    });

    this.productsTableBody.appendChild(rowContainer);
  }

  createProductCard(product) {
    const imageUrl = product.image || "assets/images/thumbs/default.png";
    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED");
    const price = aedPricing?.unit_price || "N/A";
    const discount = aedPricing?.discount || price;
    const tax_amount = aedPricing.tax_amount || '';
    

    const productWrapper = document.createElement("div");
    productWrapper.className = "col-xxl-2 col-lg-3 col-sm-4 col-62";

    productWrapper.innerHTML = `
      <div class="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
         <a href="product-details.html?id=${product._id}" class="product-card__thumb flex-center">
          <img src="${imageUrl}" alt="${product.name || "Product"}" />
        </a>
        <div class="product-card__content mt-16">
          <h6 class="title text-lg fw-semibold mt-12 mb-8">
            <a href="product-details.html?id=${product._id}" class="link text-line-2">${product.name}</a>
          </h6>
          <div class="flex-align gap-4">
            <span class="text-main-600 text-md d-flex">
              <i class="ph-fill ph-storefront"></i>
            </span>
            <span class="text-gray-500 text-xs">By Games Corner</span>
          </div>
          <div class="flex-between gap-8 mt-24 flex-wrap">
            <div class="product-card__price">
              <span class="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">AED ${price + tax_amount}</span>
              <span class="text-heading text-md fw-semibold">AED ${discount + tax_amount}</span>
            </div>
            <button 
              class="product-card__cart btn btn-main py-11 px-24 rounded-pill flex-align gap-8"
              data-product-id="${product._id}"
              onclick="window.oldProductsManager.handleAddToCart('${product._id}')"
            >
              Add <i class="ph ph-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    return productWrapper;
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
        (product.attributes || []).map(async (attr) => {
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

  // showAttributeModal(productId, attributes, productName) {
  //   const product = this.products[productId];
  //   if (!product) return;

  //   const modalProductName = document.getElementById('modalProductName');
  //   const modalProductImage = document.getElementById('modalProductImage');
  //   const modalCurrentPrice = document.getElementById('modalCurrentPrice');
  //   const modalOriginalPrice = document.getElementById('modalOriginalPrice');
  //   const modalDiscount = document.getElementById('modalDiscount');
  //   const container = document.getElementById('attributesContainer');

  //   modalProductName.textContent = productName;
  //   modalProductImage.src = product.image || "assets/images/thumbs/default.png";
  //   modalProductImage.alt = productName;

  //   const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
  //   const currentPrice = aedPricing?.discount || aedPricing?.unit_price || 0;
  //   const originalPrice = aedPricing?.unit_price || 0;
  //   const discountPercentage = aedPricing?.discount ?
  //     Math.round(((originalPrice - aedPricing.discount) / originalPrice) * 100) : 0;

  //   modalCurrentPrice.textContent = currentPrice.toFixed(2);
  //   modalOriginalPrice.textContent = discountPercentage > 0 ? originalPrice.toFixed(2) : '';
  //   modalDiscount.textContent = discountPercentage > 0 ? `(${discountPercentage}% off)` : '';

  //   container.innerHTML = "";
  //   container.dataset.productId = productId;

  //   (product.attributes || []).forEach(productAttr => {
  //     const attribute = attributes.find(attr => attr._id === productAttr.attribute._id);
  //     if (!attribute) return;

  //     const wrapper = document.createElement("div");
  //     wrapper.className = "mb-3";

  //     wrapper.innerHTML = `
  //       <div class="d-flex justify-content-between align-items-center mb-2">
  //         <span class="fw-medium">${attribute.name}</span>
  //         <span class="text-danger" id="${attribute.name}-error"></span>
  //       </div>
  //       <select class="form-select" name="${attribute.name}" required>
  //         <option value="" disabled selected>Select ${attribute.name}</option>
  //         ${attribute.value && Array.isArray(attribute.value) ?
  //         attribute.value
  //           .filter(val => productAttr.attribute.attribute_values.includes(val._id))
  //           .map(val => `<option value="${val.value}">${val.value}</option>`)
  //           .join('') : ''
  //       }
  //       </select>
  //     `;

  //     container.appendChild(wrapper);
  //   });

  //   if (product.color && !attributes.some(attr => attr.name.toLowerCase() === "color")) {
  //     const wrapper = document.createElement("div");
  //     wrapper.className = "mb-3";
  //     wrapper.innerHTML = `
  //       <div class="d-flex justify-content-between align-items-center mb-2">
  //         <span class="fw-medium">Color</span>
  //         <span class="text-danger" id="color-error"></span>
  //       </div>
  //       <select class="form-select" name="color" required>
  //         <option value="" disabled selected>Select Color</option>
  //         ${product.color.map(color => `
  //           <option value="${color.name}" data-color="${color.color_code}">${color.name}</option>
  //         `).join("")}
  //       </select>
  //     `;
  //     container.appendChild(wrapper);
  //   }

  //   const modal = new bootstrap.Modal(document.getElementById('attributeModal'));
  //   modal.show();
  // }

  showAttributeModal(productId, attributes, productName) {
    const product = this.products[productId];
    if (!product) return;

    const modalProductName = document.getElementById('modalProductName');
    const modalProductImage = document.getElementById('modalProductImage');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalDiscount = document.getElementById('modalDiscount');
    const container = document.getElementById('attributesContainer');

    modalProductName.textContent = productName;
    modalProductImage.src = product.image || "assets/images/thumbs/default.png";
    modalProductImage.alt = productName;

    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
    const currentPrice = aedPricing?.discount || aedPricing?.unit_price || 0;
    const originalPrice = aedPricing?.unit_price || 0;
    const discountPercentage = aedPricing?.discount ?
      Math.round(((originalPrice - aedPricing.discount) / originalPrice) * 100) : 0;

    modalCurrentPrice.textContent = currentPrice.toFixed(2);
    modalOriginalPrice.textContent = discountPercentage > 0 ? originalPrice.toFixed(2) : '';
    modalDiscount.textContent = discountPercentage > 0 ? `(${discountPercentage}% off)` : '';

    container.innerHTML = "";
    container.dataset.productId = productId;

    (product.attributes || []).forEach(productAttr => {
        const attribute = attributes.find(attr => attr._id === productAttr.attribute._id);
        if (!attribute) return;

        // Filter available values
        const availableValues = attribute.value && Array.isArray(attribute.value) ?
            attribute.value.filter(val => productAttr.attribute.attribute_values.includes(val._id)) : [];

        // Only create attribute selector if there are values
        if (availableValues.length > 0) {
            const wrapper = document.createElement("div");
            wrapper.className = "mb-3";

            const header = document.createElement("div");
            header.className = "d-flex justify-content-between align-items-center mb-2";
            header.innerHTML = `
                <span class="fw-medium">${attribute.name}</span>
                <span class="text-danger" id="${attribute.name}-error"></span>
            `;

            const select = document.createElement("select");
            select.className = "form-select";
            select.name = attribute.name;
            select.required = true;

            // Add options and select first value by default
            availableValues.forEach((val, index) => {
                const option = document.createElement("option");
                option.value = val.value;
                option.textContent = val.value;
                option.selected = index === 0; // Select first option by default
                select.appendChild(option);
            });

            wrapper.appendChild(header);
            wrapper.appendChild(select);
            container.appendChild(wrapper);
        }
    });

    // Handle color attribute
    if (product.color && Array.isArray(product.color) && product.color.length > 0) {
        const wrapper = document.createElement("div");
        wrapper.className = "mb-3";

        const header = document.createElement("div");
        header.className = "d-flex justify-content-between align-items-center mb-2";
        header.innerHTML = `
            <span class="fw-medium">Color</span>
            <span class="text-danger" id="color-error"></span>
        `;

        const select = document.createElement("select");
        select.className = "form-select";
        select.name = "color";
        select.required = true;

        // Add color options and select first color by default
        product.color.forEach((color, index) => {
            const option = document.createElement("option");
            option.value = color.name;
            option.textContent = color.name;
            option.dataset.color = color.color_code;
            option.selected = index === 0; // Select first color by default
            select.appendChild(option);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(select);
        container.appendChild(wrapper);
    }

    const modal = new bootstrap.Modal(document.getElementById('attributeModal'));
    modal.show();
}

  async submitAttributeForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productId = document.getElementById('attributesContainer').dataset.productId;
    const product_quantity = parseInt(formData.get('product_quantity')) || 1;

    try {
      const product = this.products[productId];
      if (!product) {
        throw new Error("Product not found");
      }

      document.querySelectorAll('[id$="-error"]').forEach(elem => {
        elem.textContent = '';
      });

      const attributes = {};
      const missingAttributes = [];

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

      const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
      if (!aedPricing) {
        throw new Error("Product pricing information not available");
      }

      const payload = {
        product: productId,
        product_quantity,
        attributes,
        product_currency_code: aedPricing.currency_code || 'AED',
        product_price: Number(aedPricing?.unit_price) || 0,
        product_discount: Number(aedPricing?.discount) || 0,
        shipping_price: Number(aedPricing?.shipping_price) || 0,
        shipping_time: aedPricing?.shipping_time || '',
        tax_amount: Number(aedPricing?.tax_amount) || 0
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
    this.fetchOldProducts();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.oldProductsManager = new OldProductsManager();
  window.oldProductsManager.init();
});