class CartManager {
  constructor() {
    // Main cart elements
    this.cartTableBody = document.querySelector(".table tbody");
    this.cartSidebar = document.querySelector(".cart-sidebar");

    // Form elements
    this.couponInput = document.querySelector("couponCodeInput");
    this.applyCouponButton = document.querySelector(".btn.btn-main");
    this.updateCartButton = document.querySelector(".text-lg.text-gray-500");

    this.baseApiUrl = "https://api.gamescorner.ae/api";
    this.initialize();
  }

  async initialize() {
    try {
      await this.fetchCartData();
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      this.renderErrorState(error);
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

  updateProductCount(count) {
    const desktopCount = document.getElementById("CartproductCountDesktop");
    const mobileCount = document.getElementById("CartproductCountMobile");
    if (desktopCount) {
      desktopCount.textContent = count;
    }
    if (mobileCount) {
      mobileCount.textContent = count;
    }
    localStorage.setItem("cartCount", count);
  }

  setupEventListeners() {
    document
      .querySelectorAll(
        ".quantity_cart_minus, .quantity_cart_plus, .quantity_cart, .remove-tr-btn"
      )
      .forEach((element) => {
        element.replaceWith(element.cloneNode(true));
      });

    // Quantity Minus Button
    document.querySelectorAll(".quantity_cart_minus").forEach((button) => {
      button.addEventListener("click", (e) => {
        const quantityInput = e.target.nextElementSibling;

        if (
          quantityInput &&
          quantityInput.classList.contains("quantity_cart")
        ) {
          let currentValue = parseInt(quantityInput.value) || 1;

          // Allow decrementing to 1, but not below 1
          if (currentValue > 1) {
            currentValue--;
            quantityInput.value = currentValue;

            // Call method to update quantity
            if (typeof this.updateProductQuantity === "function") {
              this.updateProductQuantity(quantityInput);
            }
          }
        }
      });
    });

    // Quantity Plus Button
    document.querySelectorAll(".quantity_cart_plus").forEach((button) => {
      button.addEventListener("click", (e) => {
        const quantityInput = e.target.previousElementSibling;

        if (
          quantityInput &&
          quantityInput.classList.contains("quantity_cart")
        ) {
          let currentValue = parseInt(quantityInput.value) || 1;

          currentValue++;
          quantityInput.value = currentValue;
          this.updateProductQuantity(quantityInput);
        }
      });
    });

    // Remove Item Buttons
    document.querySelectorAll(".remove-tr-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.currentTarget.getAttribute("data-product-id");
        this.removeItem(productId);
      });
    });
    document
      .querySelector(".btn-main")
      .addEventListener("click", this.applyCoupon.bind(this));

    // Apply Coupon
    if (this.applyCouponButton) {
      this.applyCouponButton.addEventListener(
        "click",
        this.applyCoupon.bind(this)
      );
    }

    // Update Cart Button
    if (this.updateCartButton) {
      this.updateCartButton.addEventListener(
        "click",
        this.updateCartTotals.bind(this)
      );
    }
  }

  // Apply coupon to the cart

  async applyCoupon() {
    try {
      if (this.isCouponApplied) {
        this.showNotification("Coupon has already been applied", "error");
        return;
      }

      const couponCodeInput = document.querySelector("#couponCodeInput");
      const couponCode = couponCodeInput?.value.trim();
      const applyCouponButton = document.querySelector(".btn-main");

      if (!couponCode) {
        this.showNotification("Please enter a coupon code", "error");
        return;
      }

      const webtoken = localStorage.getItem("webtoken");
      if (!webtoken) {
        this.showNotification("Please login to apply coupon", "error");
        return;
      }

      const currencyCodeElement = document.querySelector(
        "[data-currency-code]"
      );
      const currency_code = currencyCodeElement?.dataset?.currencyCode || "AED";

      const response = await fetch(`${this.baseApiUrl}/cart_coupon_apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${webtoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          currency_code,
          orderId: this.orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to apply coupon");
      }

      const data = await response.json();

      if (data.message === "This coupon has already been applied") {
        this.showNotification("This coupon has already been applied", "error");
        return;
      }

      this.isCouponApplied = true;

      localStorage.setItem("appliedCoupon", couponCode);

      // Update the UI to reflect the applied coupon
      this.updateUIAfterCoupon(data);
      this.showNotification("Coupon applied successfully!", "success");

      if (applyCouponButton) {
        applyCouponButton.textContent = "Applied";
        applyCouponButton.disabled = true;
        applyCouponButton.classList.add("btn-success");
      }

      // Clear the coupon input field after application
      if (couponCodeInput) couponCodeInput.value = "";
    } catch (error) {
      console.error("Error applying coupon:", error);
      this.showNotification(
        "An error occurred while applying the coupon",
        "error"
      );
    }
  }

  updateUIAfterCoupon(data) {
    console.log("Update UI after coupon:", data);
    const summary = data;
    console.log(("summery", summary));

    // Ensure summary is present
    if (!summary) {
      console.error("Summary data is missing!");
      return;
    }
    const finalPriceButton = document.querySelector(".apply-coupon-btn");
    if (finalPriceButton) {
      finalPriceButton.textContent = `AED ${summary.data.summary.finalPrice}`;
      finalPriceButton.style.display = "block";
    }

    // Append to cart summary container
    const cartSummaryContainer = document.querySelector(
      ".cart-summary-container"
    );
    if (cartSummaryContainer) {
      cartSummaryContainer.innerHTML = ""; // Clear previous coupon info
      cartSummaryContainer.appendChild(couponInfoDiv);
    }

    console.log("Coupon applied successfully!");

    document.querySelector(".btn-main").addEventListener("click", () => {
      applyCoupon();
    });

    // Store coupon data in localStorage for persistence
    localStorage.setItem(
      "appliedCoupon",
      JSON.stringify(summary.appliedCoupon)
    );
  }
  // Updated method to update product quantity and subtotal
  async updateProductQuantity(quantityInput) {
    try {
      const row = quantityInput.closest("tr");
      const priceElement = row.querySelector("td:nth-child(3) .h6");
      const subtotalElement = row.querySelector("td:nth-child(5) .h6");

      if (priceElement && subtotalElement) {
        const price =
          parseFloat(priceElement.textContent.replace("AED: ", "")) || 0;
        const quantity = parseInt(quantityInput.value);

        // Calculate and update subtotal
        const subtotal = (price * quantity).toFixed(2);
        subtotalElement.textContent = `AED ${subtotal}`;

        // Update backend cart quantity
        await this.updateProductSubtotal();

        // Recalculate cart total
        this.updateCartTotal();
      }
    } catch (error) {
      console.error("Error updating product quantity:", error);
      this.showNotification("Failed to update quantity", "error");
    }
  }

  // Update total cart price
  async updateCartTotal() {
    const discountRate = window.discountRate || 0;
    const taxRate = window.taxRate || 0;
    let productTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let shippingTotal = 0;

    document.querySelectorAll("tr.cart-item").forEach((item) => {
      const quantity =
        parseFloat(item.querySelector(".quantity").textContent) || 0;

      const unitPrice = parseFloat(
        item.querySelector(".unit-price span").textContent.replace("$", "")
      );

      const subtotal = quantity * unitPrice;

      // Accumulate totals
      productTotal += subtotal;
      discountTotal += subtotal * discountRate;
      taxTotal += subtotal * taxRate;
      shippingTotal += subtotal * shippingTotal;
    });

    // Calculate the final total
    const total = productTotal - discountTotal + taxTotal;

    // Update cart total element
    const cartTotalElement = document.querySelector(".cart-total-price");
    if (cartTotalElement) {
      cartTotalElement.textContent = `AED ${total.toFixed(2)}`;
    }
    const productTotalElement = document.querySelector(".product-total");

    const discountTotalElement = document.querySelector(".discount-total");
    const taxTotalElement = document.querySelector(".tax-total");

    if (productTotalElement) {
      productTotalElement.textContent = `AED ${productTotal.toFixed(2)}`;
    }

    if (discountTotalElement) {
      discountTotalElement.textContent = `AED ${discountTotal.toFixed(2)}`;
    }

    if (taxTotalElement) {
      taxTotalElement.textContent = `AED ${taxTotal.toFixed(2)}`;
    }
  }

  async updateProductSubtotal() {
    try {
      const quantityInputs = document.querySelectorAll(".quantity_cart");
      const updates = Array.from(quantityInputs)
        .map((input) => {
          const row = input.closest("tr");
          const productId = this.getProductIdFromRow(row);
          const quantity = parseInt(input.value, 10) || 0;
          if (!productId) {
            console.warn(
              `Skipping update for input ${
                input.id || "unknown"
              }: Product ID is missing.`
            );
            return null;
          }

          if (quantity < 1) {
            console.warn(
              `Invalid quantity for product ${productId}: ${quantity}. Quantity must be greater than 0.`
            );
            return null; // Skip this entry
          }

          return {
            productId,
            quantity,
          };
        })
        .filter((update) => update !== null);

      // If no valid updates, exit early
      if (updates.length === 0) {
        console.warn("No valid product updates found.");
        this.showNotification("No valid product updates", "warning");
        return null;
      }

      // Ensure user is authenticated
      const token = localStorage.getItem("webtoken");
      if (!token) {
        console.error("User authentication token is missing.");
        throw new Error("User is not authenticated");
      }

      // Send the API request
      const response = await fetch(`${this.baseApiUrl}/update-cart-quantity`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      // Check the response
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          response.statusText ||
          "Failed to update cart quantity";
        console.error("Server responded with an error:", errorData);
        throw new Error(errorMessage);
      }

      // Handle success
      const data = await response.json();
      this.updateSubtotals(data);
      this.showNotification("Cart updated successfully", "success");
      return data;
    } catch (error) {
      // Handle errors gracefully
      console.error("Error updating cart quantities:", error.message);
      this.showNotification(error.message, "error");
      throw error;
    }
  }
  updateSubtotals(data) {
    let totalProductPrice = 0;
    let totalProductDiscount = 0;
    let totalShippingPrice = 0;
    let totalTax = 0;
    let grandTotal = 0;

    // Iterate over the products array
    totalProductPrice = data.totalProductPrice || 0;
    totalProductDiscount = data.totalProductDiscount || 0;
    totalShippingPrice = data.totalShippingPrice || 0;
    totalTax = data.totalTax || 0;

    // Calculate grand total
    grandTotal = totalProductDiscount + totalShippingPrice + totalTax;

    // Update the cart sidebar
    if (this.cartSidebar) {
      const subtotalElement = this.cartSidebar.querySelector(
        ".cart-sidebar .text-gray-900.fw-semibold"
      );
      if (subtotalElement) {
        subtotalElement.textContent = `AED ${totalProductPrice.toFixed(2)}`;
      }

      const discountElement = this.cartSidebar.querySelector(
        ".cart-sidebar .text-success.fw-semibold"
      );
      if (discountElement) {
        discountElement.textContent = `AED ${totalProductDiscount.toFixed(2)}`;
      }

      const shippingElement = this.cartSidebar.querySelector(
        ".cart-sidebar .shipping-price"
      );
      if (shippingElement) {
        shippingElement.textContent = `AED ${totalShippingPrice.toFixed(2)}`;
      }

      const taxElement = this.cartSidebar.querySelector(
        ".cart-sidebar .tax-amount"
      );
      if (taxElement) {
        taxElement.textContent = `AED ${totalTax.toFixed(2)}`;
      }

      const grandTotalElement = this.cartSidebar.querySelector(
        ".cart-sidebar .grand-total"
      );
      if (grandTotalElement) {
        grandTotalElement.textContent = `AED ${grandTotal.toFixed(2)}`;
      }
    }
  }
  async updateCartTotals() {
    try {
      await this.fetchCartData();
    } catch (error) {
      console.error("Error updating cart totals:", error);
      this.showNotification("Failed to update cart totals", "error");
    }
  }

  getProductIdFromRow(row) {
    const productLink = row.querySelector(".table-product__content .title a");
    return productLink?.getAttribute("data-product-id");
  }

  async removeItem(productId) {
    try {
      const token = localStorage.getItem("webtoken");
      if (!token) throw new Error("User is not authenticated.");

      const response = await fetch(
        `${this.baseApiUrl}/web_cart?currency_code=AED`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item from cart");
      }

      // Optimistically remove the row from the UI
      const rowToRemove = document
        .querySelector(`[data-product-id="${productId}"]`)
        ?.closest("tr");
      if (rowToRemove) {
        rowToRemove.remove();
      }

      // Update cart totals and check if cart is empty
      await this.fetchCartData();
      this.setupEventListeners();
      this.updateCartTotal();
      this.showNotification("Item removed from cart", "success");
    } catch (error) {
      console.error("Error removing item:", error);
      this.showNotification(error.message, "error");
    }
  }

  async fetchCartData() {
    try {
      const token = localStorage.getItem("webtoken");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await fetch(`${this.baseApiUrl}/web_cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cart data fetched successfully:", data);

      // Render the cart and update UI
      if (data) {
        this.renderCart(data);
        this.updateSubtotals(data);
        this.updateProductCount(data.productCount);
      } else {
        console.warn("Cart data is empty or undefined.");
        this.renderErrorState(new Error("No cart data found."));
      }

      return data;
    } catch (error) {
      console.error("Error fetching cart data:", error);
      this.showNotification(
        error.message || "Failed to fetch cart data.",
        "error"
      );
      this.renderErrorState(error);
      throw error;
    }
  }

  renderCart(cartData) {
    const cart = cartData.cart || cartData || {};
    const products = cart.products || [];

    const totalProductPrice =
      cart.totalProductPrice !== undefined
        ? cart.totalProductPrice
        : products.reduce(
            (total, item) => total + item.product_price * item.product_quantity,
            0
          );

    const totalProductDiscount =
      cart.totalProductDiscount !== undefined
        ? cart.totalProductDiscount
        : products.reduce(
            (total, item) =>
              total + (item.product_discount || 0) * item.product_quantity,
            0
          );

    // Calculate tax safely
    const totalTax =
      cart.totalTax !== undefined
        ? cart.totalTax
        : products.reduce((total, item) => {
            const taxRate = item.product?.tax || 0;
            return total + item.product_price * item.product_quantity * taxRate;
          }, 0);

    // Fallback or logic for shipping price
    const totalShippingPrice =
      cart.totalShippingPrice !== undefined
        ? cart.totalShippingPrice
        : products.reduce((total, item) => {
            const shippingRate = item.product?.shipping || 0;
            return total + shippingRate * item.product_quantity;
          }, 0);

    // Calculate grand total
    const grandTotal =
      totalProductPrice - totalProductDiscount + totalShippingPrice + totalTax;

    // Update the cart table with product rows
    if (this.cartTableBody) {
      this.cartTableBody.innerHTML = products
        .map((item) => this.generateProductRow(item))
        .join("");
    }

    // Update the cart summary in the sidebar
    if (this.cartSidebar) {
      this.cartSidebar.innerHTML = `
      
      
        <div class="cart-sidebar p-24 bg-color-three rounded-8 mb-24">
          <div class="mb-32 flex-between gap-8">
            <span class="text-gray-900 font-heading-two">Subtotal</span>
            <span class="text-gray-900 fw-semibold">AED ${totalProductPrice.toFixed(
              2
            )}</span>
          </div>
          <div class="mb-32 flex-between gap-8">
            <span class="text-gray-900 font-heading-two">Product Discount</span>
            <span class="text-success fw-semibold discount">AED${totalProductDiscount.toFixed(
              2
            )}</span>
          </div>
          <div class="mb-32 flex-between gap-8">
            <span class="text-gray-900 font-heading-two">Shipping</span>
            <span class="text-gray-900 fw-semibold shipping-price">AED ${totalShippingPrice.toFixed(
              2
            )}</span>
          </div>
          <div class="mb-32 flex-between gap-8">
            <span class="text-gray-900 font-heading-two">Tax</span>
            <span class="text-gray-900 fw-semibold tax-amount">AED ${totalTax.toFixed(
              2
            )}</span>
          </div>
          <div class="p-24 bg-color-three rounded-8">
            <div class="flex-between gap-8">
              <span class="text-gray-900 text-xl fw-semibold">Total</span>
              <span class="text-gray-900 text-xl fw-semibold grand-total">AED ${grandTotal.toFixed(
                2
              )}</span>
            </div>
          </div>
          </div>
     <div>
     </div>
          <div>
      <div class="apply-coupon-btn btn btn-main mt-16 py-18 w-100 rounded-8">
      </div>
          <a  href="checkout.html" class="btn btn-main mt-40 py-18 w-100 rounded-8">Proceed to checkout</a>
        </div>
      `;
    }
    document
      .querySelector(".btn-main")
      .addEventListener("click", function (event) {
        // Ensure this code is placed inside an appropriate DOMContentLoaded or equivalent event listener
        const totalShippingPrice = 333; // Replace with actual calculation
        const totalTax = 3333; // Replace with actual calculation
        const grandTotal = 4444; // Replace with actual calculation

        // Ensure that these values are defined before saving to localStorage
        if (
          typeof totalShippingPrice !== "undefined" &&
          typeof totalTax !== "undefined" &&
          typeof grandTotal !== "undefined"
        ) {
          localStorage.setItem("shippingPrice", totalShippingPrice);
          localStorage.setItem("taxAmount", totalTax);
          localStorage.setItem("grandTotalAmount", grandTotal);
        } else {
          console.error("One or more values are undefined.");
        }

        // Allow navigation to the checkout page
      }); // Ensure event listeners are set up
    this.setupEventListeners();
  }

  generateProductRow(item) {
    const product = item.product;
    if (!product) return "";

    function truncateText(text, wordLimit = 5) {
      const words = text.split(" ");
      return words.length > wordLimit
        ? words.slice(0, wordLimit).join(" ") + "..."
        : text;
    }

    return `
      <tr>
        <td>
          <button type="button" class="remove-tr-btn flex-align gap-12 hover-text-danger-600" data-product-id="${
            product._id || ""
          }">
            <i class="ph ph-x-circle text-2xl d-flex"></i>
            Remove
          </button>
        </td>
        <td>
          <div class="table-product d-flex align-items-center gap-24">
            <a href="product-details.html?id=${
              product._id
            }" class="table-product__thumb border border-gray-100 rounded-8 flex-center">
              <img src="${product.image || ""}" alt="${product.name}">
            </a>
            <div class="table-product__content text-start">
              <h6 class="title text-lg fw-semibold mb-8">
                <a href="product-details.html?id=${product._id}" 
                   data-product-id="${item._id}"
                   class="link text-line-2">${truncateText(
                     product.name || ""
                   )}</a>
              </h6>
            </div>
          </div>
        </td>
        <td>
          <span class="text-lg h6 mb-0 fw-semibold">AED: ${
            (item.product_discount + item.tax_amount)
          }</span>
        </td>
        <td>
          <div class="d-flex rounded-4 overflow-hidden">
            <button type="button" class="quantity_cart_minus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white">
              <i class="ph ph-minus"></i>
            </button>
            <input type="number" class="quantity_cart flex-grow-1 border border-gray-100 border-start-0 border-end-0 text-center w-32 px-4" 
                   value="${item.product_quantity || 1}" min="1">
            <button type="button" class="quantity_cart_plus border border-end border-gray-100 flex-shrink-0 h-48 w-48 text-neutral-600 flex-center hover-bg-main-600 hover-text-white">
              <i class="ph ph-plus"></i>
            </button>
          </div
                </td>
                <td>
                    <span class="text-lg h6 mb-0 fw-semibold">AED ${
                     ( item.product_discount + item.tax_amount) * item.product_quantity
                    }</span>
                </td>
            </tr>
        `;
  }

  renderEmptyCart() {
    if (this.cartTableBody) {
      this.cartTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="mb-0">Your cart is empty</p>
                    </td>
                </tr>
            `;
    }

    if (this.cartSidebar) {
      this.cartSidebar.innerHTML = `
                <div class="cart-totals p-24 bg-color-three rounded-8">
                    <div class="text-center">
                        <p class="mb-0">No items in cart</p>
                    </div>
                </div>
            `;
    }
  }

  renderErrorState(error) {
    if (this.cartTableBody) {
      this.cartTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-danger">
                        <p class="mb-0">Your Cart is Empty</p>
                    </td>
                </tr>
            `;
    }
  }

  showNotification(message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  async updateAllQuantities() {
    try {
      const quantityInputs = document.querySelectorAll(".quantity_cart");
      const updates = Array.from(quantityInputs).map((input) => {
        const row = input.closest("tr");
        const productId = this.getProductIdFromRow(row);
        return {
          productId,
          quantity: parseInt(input.value) || 1,
        };
      });

      const token = localStorage.getItem("webtoken");
      if (!token) throw new Error("User is not authenticated.");

      const response = await fetch(`${this.baseApiUrl}/update-cart`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart quantities");
      }

      await this.fetchCartData();
      this.showNotification("Cart updated successfully", "success");
    } catch (error) {
      console.error("Error updating quantities:", error);
      this.showNotification(error.message, "error");
    }
  }
}

// Initialize cart manager when document is ready
document.addEventListener("DOMContentLoaded", () => {
  new CartManager();
  const storedCount = localStorage.getItem("cartCount") || "0";
  document.querySelectorAll("#CartproductCountDesktop, #CartproductCountMobile")
    .forEach(element => element.textContent = storedCount);
});

document.addEventListener("DOMContentLoaded", () => {
  const wishlistCountBadge = document.getElementById("wishlistCountBadge");
  const wishlistCountMenu = document.getElementById("wishlistCountMenu");
  const storedCount = localStorage.getItem("wishlistCount") || "0";

  // Update both counters
  if (wishlistCountBadge) {
    wishlistCountBadge.textContent = storedCount;
  }
  if (wishlistCountMenu) {
    wishlistCountMenu.textContent = storedCount;
  }
});
