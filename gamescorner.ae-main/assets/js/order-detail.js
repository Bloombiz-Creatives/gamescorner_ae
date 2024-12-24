class OrderDetailsManager {
  constructor(apiBaseUrl = "http://localhost:5002/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.webtoken = localStorage.getItem("webtoken");
    this.orderData = null;
    this.initializeModal();
    this.fetchOrderDetails();
  }

  initializeModal() {
    // Create modal HTML
    const modalHTML = `
            <div id="orderDetailModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
                <div class="modal-content" style="position: relative; background: white; width: 90%; max-width: 500px; margin: 50px auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <button class="modal-close" style="position: absolute; right: 10px; top: 10px; background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
                    <div id="modalContent"></div>
                </div>
            </div>`;

    // Add modal to document
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Initialize modal controls
    this.modal = {
      open: (content) => {
        document.getElementById("orderDetailModal").style.display = "block";
        document.getElementById("modalContent").innerHTML = content;
        document.body.style.overflow = "hidden";
      },
      close: () => {
        document.getElementById("orderDetailModal").style.display = "none";
        document.body.style.overflow = "auto";
      },
    };

    // Add modal event listeners
    document
      .querySelector(".modal-close")
      .addEventListener("click", this.modal.close);
    document
      .getElementById("orderDetailModal")
      .addEventListener("click", (e) => {
        if (e.target.id === "orderDetailModal") this.modal.close();
      });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.modal.close();
    });
  }

  async fetchOrderDetails() {
    try {
      if (!this.webtoken) {
        throw new Error("Please login to view your orders.");
      }

      const response = await fetch(`${this.apiBaseUrl}/orders/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      this.orderData = data.data.orders;
      this.renderOrders();
    } catch (error) {
      console.error("Error fetching order details:", error);
      this.showError(error.message);
    }
  }

  renderOrders() {
    const orderContainer = document.querySelector(".order-detail");
    if (!orderContainer) return;

    if (!this.orderData || this.orderData.length === 0) {
      orderContainer.innerHTML =
        '<p class="text-center py-4">No orders found</p>';
      return;
    }

    const ordersHTML = this.orderData
      .map((order) => this.createOrderCard(order))
      .join("");
    orderContainer.innerHTML = ordersHTML;

    // Add click listeners to order cards
    this.attachOrderCardListeners();
  }

  createOrderCard(order) {
    return `
                <div class="order-items-preview"  >
                    ${order.orderItems
                      .map(
                        (item) => `
                        <div class="order-item mb-3">
                            <a href="product-details.html?id=${
                              item.product._id
                            }">
                                <img src="${
                                  item.product.image ||
                                  "assets/images/thumbs/product-details-two-thumb2.png"
                                }" 
                                     alt="${item.product.name}" 
                                     class="mb-2">
                            </a>
                            <div class="order-item-content">
                                <a href="product-details.html?id=${
                                  item.product._id
                                }" class="font-medium">${item.product.name}</a>
                                <p>${this.formatCurrency(
                                  item.price,
                                  item.currency_code
                                )}</p>
                                <p>Quantity: ${item.quantity}</p>
                            </div>
                            <div class="order-details-btn">
                            <button class="order-card order-btn-btn"  data-order-id="${
                              order._id
                            }">
                            <span class="ph ph-eye"></span>    
                            </button>
                             </div> 
                        </div>
                    `
                      )
                      .join("")}
                </div>
        `;
  }

  attachOrderCardListeners() {
    const orderCards = document.querySelectorAll(".order-card");
    orderCards.forEach((card) => {
      card.addEventListener("click", () => {
        const orderId = card.dataset.orderId;
        const order = this.orderData.find((o) => o._id === orderId);
        if (order) {
          this.showOrderDetails(order);
        }
      });
    });
  }

  async handleCancelOrder(orderId) {
    try {
      if (!this.webtoken) {
        throw new Error("Please login to cancel your order.");
      }

      const response = await fetch(
        `${this.apiBaseUrl}/order/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.webtoken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel order");
      }

      const result = await response.json();

      // Close the modal
      this.modal.close();

      // Refresh the order data
      await this.fetchOrderDetails();

      // Show success message
      this.showSuccessMessage("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      this.showError(error.message);
    }
  }

  showSuccessMessage(message) {
    const successAlert = document.createElement("div");
    successAlert.className =
      "alert alert-success position-fixed top-0 end-0 m-3";
    successAlert.style.zIndex = "9999";
    successAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="ph ph-check-circle me-2"></i>
                <span>${message}</span>
            </div>
        `;
    document.body.appendChild(successAlert);

    setTimeout(() => {
      successAlert.remove();
    }, 3000);
  }

  showOrderDetails(order) {
    const showCancelButton =
      order.paymentInfo.status === "Pending" &&
      order.orderStatus === "Processing";

    const cancelButtonHTML = showCancelButton
      ? `
            <div class="mt-4">
                <button 
                    id="cancelOrderBtn" 
                    class=" order-btn-cancel"
                    data-order-id="${order._id}">
                    Cancel Order
                </button>
            </div>
        `
      : "";
    const detailsHTML = `
            <div class="order-details">
                <h2 class="text-xl font-bold mb-4">Order #${order.orderID}</h2>
                
                <div class="shipping-address mb-4">
                    <h3 class="font-bold mb-2">Shipping Address</h3>
                    <p>${order.shippingAddress.name}, Phone: ${
      order.shippingAddress.phoneNo
    }</p>
                    <p>${order.shippingAddress.address}</p>
                    <p>${order.shippingAddress.city}, ${
      order.shippingAddress.state
    }, ${order.shippingAddress.country} - ${order.shippingAddress.pinCode}</p>
                </div>

              
                <div class="order-summary">
                    <h3 class="font-bold mb-2">Order Summary</h3>
                    <div class="flex justify-between mb-1">
                        <span>Subtotal:</span>
                        <span>${this.formatCurrency(order.itemsPrice)}</span>
                    </div>
                    <div class="flex justify-between mb-1">
                        <span>Shipping:</span>
                        <span>${
                          order.shippingPrice === 0
                            ? "Free"
                            : this.formatCurrency(order.shippingPrice)
                        }</span>
                    </div>
                    <div class="flex justify-between mb-1">
                        <span>Tax:</span>
                        <span>${this.formatCurrency(order.taxPrice)}</span>
                    </div>
                    <div class="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>${this.formatCurrency(order.totalPrice)}</span>
                    </div>
                </div>

                <div class="payment-info mt-4 pt-4 border-t">
                    <p><strong>Payment Method:</strong> ${
                      order.paymentInfo.type
                    }</p>
                    <p><strong>Payment Status:</strong> ${
                      order.paymentInfo.status
                    }</p>
                    <p><strong>Order Status:</strong> ${order.orderStatus}</p>
                    ${cancelButtonHTML}
                </div>
            </div>
        `;

    this.modal.open(detailsHTML);

    if (showCancelButton) {
      const cancelBtn = document.getElementById("cancelOrderBtn");
      cancelBtn.addEventListener("click", () =>
        this.handleCancelOrder(order._id)
      );
    }
  }

  formatCurrency(amount, currencyCode = "AED") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  }

  getStatusClass(status) {
    const statusClasses = {
      Processing: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-blue-100 text-blue-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  }

  showError(message) {
    const container = document.querySelector(".order-detail");
    if (container) {
      container.innerHTML = `
                <div class="alert alert-danger text-center p-4">
                    ${message}
                </div>
            `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const orderManager = new OrderDetailsManager();
});
