
  
// class OldProductsManager {
//   constructor(apiBaseUrl = "http://localhost:5002/api") {
//       this.apiBaseUrl = apiBaseUrl;
//       this.productsTableBody = document.getElementById("oldProductsTableBody");
//       this.loadingIndicator = document.getElementById("loadingIndicator");
//       this.errorMessage = document.getElementById("errorMessage");
      
//       this.fetchOldProducts = this.fetchOldProducts.bind(this);
//       this.populateProductsTable = this.populateProductsTable.bind(this);
//       this.init();
//   }

//   async fetchOldProducts() {
//       try {
//           if (this.loadingIndicator) {
//               this.loadingIndicator.style.display = "block";
//           }

//           if (this.errorMessage) {
//               this.errorMessage.textContent = "";
//           }

//           const url = `${this.apiBaseUrl}/oldest-products`;
//           const response = await fetch(url);

//           if (!response.ok) {
//               throw new Error(`HTTP error! Status: ${response.status}`);
//           }

//           const data = await response.json();

//           if (data.success) {
//               if (!data.products || data.products.length === 0) {
//                   console.warn("Products array is empty");
//                   this.populateProductsTable([]);
//               } else {
//                   this.populateProductsTable(data.products);
//               }
//           } else {
//               throw new Error(data.message || "Failed to fetch old products");
//           }
//       } catch (error) {
//           console.error("Error fetching old products:", error);
//           if (this.errorMessage) {
//               this.errorMessage.textContent = `Error: ${error.message}`;
//           }
//       } finally {
//           if (this.loadingIndicator) {
//               this.loadingIndicator.style.display = "none";
//           }
//       }
//   }

//   createProductCard(product) {
//       const imageUrl = product.image || 'assets/images/thumbs/default.png';
//       const aedPricing = product.country_pricing?.find(pricing => pricing.currency_code === 'AED');
//       const price = aedPricing?.unit_price || 'N/A';
//       const discount = aedPricing?.discount || price;
//       const currencyCode = aedPricing?.currency_code || 'AED';
//       const tax_amount = aedPricing?.tax_amount || 0;
//       const shippingprice = aedPricing?.shipping_price || 0;
//       const shippingtime = aedPricing?.shipping_time || 'N/A';

//       const productWrapper = document.createElement("div");
//       productWrapper.className = "col-xxl-2 col-lg-3 col-sm-4 col-62";
      
//       productWrapper.innerHTML = `
//             <div class="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
//                   <img src="${imageUrl}" alt="${product.name}" class="w-auto">
                
//               </a>
//               <div class="product-card__content mt-16">
//                   <h6 class="title text-lg fw-semibold mt-12 mb-8">
//                       <a href="product-details.html?id=${product._id}" class="link text-line-2">${product.name}</a>
//                   </h6>
//                     <div class="flex-align gap-4">
//                   <span class="text-main-600 text-md d-flex">
//                     <i class="ph-fill ph-storefront"></i>
//                   </span>
//                   <span class="text-gray-500 text-xs">By Games Corner</span>
//                 </div>  
//                  <div class="flex-between gap-8 mt-24 flex-wrap">
//                   <div class="product-card__price ">
//                       <span class="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">AED ${price}</span>
//                       <span class="text-heading text-md fw-semibold">AED ${discount}<span class="text-gray-500 fw-normal"></span></span>
//                   </div>
//                  <button 
//                  class="product-card__cart btn btn-main py-11 px-24 rounded-pill flex-align gap-8"
//                  >Add <i class="ph ph-shopping-cart"></i></button>
//                  </div>
//               </div>
//           </div>
//       `;
      
//       return productWrapper;
//   }

//   populateProductsTable(products) {
//       if (!this.productsTableBody) {
//           console.warn("Products table body not found");
//           return;
//       }

//       this.productsTableBody.innerHTML = '';

//       if (!products || products.length === 0) {
//           const noProducts = document.createElement("div");
//           noProducts.textContent = "No products found";
//           noProducts.classList.add("no-products", "col-12", "text-center", "py-8");
//           this.productsTableBody.appendChild(noProducts);
//           return;
//       }

//       const rowContainer = document.createElement('div');
//       rowContainer.className = 'row g-4';

//       products.forEach(product => {
//           const productCard = this.createProductCard(product);
//           rowContainer.appendChild(productCard);
//       });

//       this.productsTableBody.appendChild(rowContainer);
//   }

//   init() {
//       this.fetchOldProducts();
//   }
// }

// // Initialize when DOM is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const oldProductsManager = new OldProductsManager();
//   oldProductsManager.init();
// });

class OldProductsManager {
    constructor(apiBaseUrl = "http://localhost:5002/api") {
      this.apiBaseUrl = apiBaseUrl;
      this.productsTableBody = document.getElementById("oldProductsTableBody");
      this.loadingIndicator = document.getElementById("loadingIndicator");
      this.errorMessage = document.getElementById("errorMessage");
  
      this.fetchOldProducts = this.fetchOldProducts.bind(this);
      this.populateProductsTable = this.populateProductsTable.bind(this);
      this.init();
    }
  
    async fetchOldProducts() {
      try {
        if (this.loadingIndicator) {
          this.loadingIndicator.style.display = "block";
        }
  
        if (this.errorMessage) {
          this.errorMessage.textContent = "";
        }
  
        const url = `${this.apiBaseUrl}/oldest-products`;
        const response = await fetch(url);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.success) {
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
  
    createProductCard(product) {
      const imageUrl = product.image || "assets/images/thumbs/default.png";
      const aedPricing = product.country_pricing?.find(
        (pricing) => pricing.currency_code === "AED"
      );
      const price = aedPricing?.unit_price || "N/A";
      const discount = aedPricing?.discount || price;
      const currencyCode = aedPricing?.currency_code || "AED";
      const taxAmount = aedPricing?.tax_amount || 0;
      const shippingPrice = aedPricing?.shipping_price || 0;
      const shippingTime = aedPricing?.shipping_time || "N/A";
  
      const productWrapper = document.createElement("div");
      productWrapper.className = "col-xxl-2 col-lg-3 col-sm-4 col-62";
  
      productWrapper.innerHTML = `
        <div class="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
          <img src="${imageUrl}" alt="${product.name}" class="w-auto">
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
                <span class="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">AED ${price}</span>
                <span class="text-heading text-md fw-semibold">AED ${discount}</span>
              </div>
              <button 
                class="product-card__cart btn btn-main py-11 px-24 rounded-pill flex-align gap-8"
                data-product-id="${product._id}"
                data-product-price="${price}"
                data-product-discount="${discount}"
                data-product-shipping="${shippingPrice}" 
                data-product-tax="${taxAmount}"
                data-product-shippingtime="${shippingTime}"
                data-product-currencycode="${currencyCode}"
                data-product-quantity="1"
                onclick="handleAddToCart(event)"
              >
                Add <i class="ph ph-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      `;
  
      return productWrapper;
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
  
    init() {
      this.fetchOldProducts();
    }
  }
  
  // Initialize when DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    const oldProductsManager = new OldProductsManager();
    oldProductsManager.init();
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
  
    const productData = {
      productId: button.getAttribute("data-product-id"),
      product_currency_code: button.getAttribute("data-product-currencycode"),
      product_quantity: parseInt(button.getAttribute("data-product-quantity"), 10) || 1,
      product_price: parseFloat(button.getAttribute("data-product-price")),
      product_discount: parseFloat(button.getAttribute("data-product-discount")),
      shipping_price: parseFloat(button.getAttribute("data-product-shipping")) || 0,
      shipping_time: button.getAttribute("data-product-shippingtime") || "",
      tax_amount: parseFloat(button.getAttribute("data-product-tax")) || 0,
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
      .then(() => {
        const successAlert = document.createElement("div");
        successAlert.className = "alert alert-success position-fixed top-0 end-0 m-3";
        successAlert.style.zIndex = "9999";
        successAlert.innerHTML = `
          <div class="d-flex align-items-center">
            <i class="ph ph-check-circle me-2"></i>
            <span>Product added to cart successfully!</span>
          </div>
        `;
  
        document.querySelectorAll(".alert.alert-success").forEach((alert) => alert.remove());
        document.body.appendChild(successAlert);
  
        setTimeout(() => successAlert.remove(), 3000);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error occurred while adding the product to the cart: " + error.message);
      });
  }
  