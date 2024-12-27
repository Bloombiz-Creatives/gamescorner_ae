// class ShippingAddressManager {
//   constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
//     this.apiBaseUrl = apiBaseUrl;
//     this.webtoken = localStorage.getItem("webtoken");
//     this.addresses = [];
//     this.selectedAddressId = null;
//     this.products = JSON.parse(localStorage.getItem("cartItems") || "[]");

//     // DOM Elements
//     this.container = document.getElementById("shippingAddressesContainer");
//     this.addNewAddressBtn = document.getElementById("addNewAddressBtn");
//     this.addressFormSection = document.getElementById("addressFormSection");
//     this.addAddressForm = document.getElementById("addAddressForm");
//     this.cancelBtn = document.getElementById("cancelBtn");
//     this.popup = document.getElementById("popup-dialogue");
//     this.editForm = document.getElementById("enquiry-form");
//     this.closePopupBtn = document.getElementById("close-popup");
//     this.placeOrderBtn = document.getElementById("placeOrderBtn");

//     // Bind methods
//     this.toggleAddressForm = this.toggleAddressForm.bind(this);
//     this.addShippingAddress = this.addShippingAddress.bind(this);
//     this.updateShippingAddress = this.updateShippingAddress.bind(this);
//     this.deleteShippingAddress = this.deleteShippingAddress.bind(this);
//     this.fetchShippingAddresses = this.fetchShippingAddresses.bind(this);
//     this.populateShippingAddressesContainer = this.populateShippingAddressesContainer.bind(this);
//     this.prepareEditAddress = this.prepareEditAddress.bind(this);
//     this.closeEditModal = this.closeEditModal.bind(this);
//     this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
//     this.handleAddressSelection = this.handleAddressSelection.bind(this);

//     // Initialize
//     this.addEventListeners();
//     this.fetchShippingAddresses();
//   }

//   addEventListeners() {
//     if (this.addNewAddressBtn) {
//       this.addNewAddressBtn.addEventListener("click", this.toggleAddressForm);
//     }

//     if (this.cancelBtn) {
//       this.cancelBtn.addEventListener("click", () => {
//         this.toggleAddressForm();
//         this.addAddressForm.reset();
//       });
//     }

//     if (this.addAddressForm) {
//       this.addAddressForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const formData = new FormData(this.addAddressForm);
//         const addressData = Object.fromEntries(formData.entries());
//         addressData.isDefault = formData.get("isDefault") === "on";
//         await this.addShippingAddress(addressData);
//       });
//     }

//     if (this.closePopupBtn) {
//       this.closePopupBtn.addEventListener("click", this.closeEditModal);
//     }

//     if (this.editForm) {
//       this.editForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const addressId = this.editForm.querySelector('input[name="addressId"]').value;
//         if (!addressId) {
//           console.error("No address ID found in the form");
//           return;
//         }
//         const formData = new FormData(this.editForm);
//         const updatedAddress = Object.fromEntries(formData.entries());
//         await this.updateShippingAddress(addressId, updatedAddress);
//       });
//     }
//   }

//   handlePlaceOrder() {
//     const orderNowButton = document.querySelector(".order-now");
//     if (orderNowButton) {
//       orderNowButton.addEventListener("click", async (e) => {
//         e.preventDefault();
        
//         const selectedAddressId = document.querySelector('.delivery-address__radio:checked')?.closest('.delivery-address')?.dataset.addressId;
//         if (!selectedAddressId) {
//           this.showAlert('error', 'Please select a shipping address');
//           return;
//         }

//         const orderData = JSON.parse(localStorage.getItem('orderData'));
//         if (!orderData) {
//           this.showAlert('error', 'No product data found');
//           return;
//         }

//         const webtoken = localStorage.getItem('webtoken');
//         if (!webtoken) {
//           window.location.href = 'account.html';
//           return;
//         }

//         const payload = {
//           product_id: orderData.product_id,
//           quantity: orderData.quantity,
//           currency_code: orderData.currency_code,
//           attributes: orderData.attributes,
//           shipping_address_id: selectedAddressId
//         };

//         try {
//           const response = await fetch(`${this.apiBaseUrl}/orders`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${webtoken}`
//             },
//             body: JSON.stringify(payload)
//           });

//           const data = await response.json();
//           if (!response.ok) {
//             throw new Error(data.message || 'Failed to place order');
//           }

//           this.showAlert('success', 'Order placed successfully!');
//           localStorage.removeItem('orderData');
//           window.location.href = 'orders.html';
//         } catch (error) {
//           this.showAlert('error', error.message);
//         }
//       });
//     }
//   }

//   showAlert(type, message) {
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
//     alertDiv.style.zIndex = '9999';
//     alertDiv.innerHTML = `
//       <div class="d-flex align-items-center">
//         <i class="ph ph-${type === 'success' ? 'check' : 'x'}-circle me-2"></i>
//         <span>${message}</span>
//       </div>
//     `;
//     document.body.appendChild(alertDiv);
//     setTimeout(() => alertDiv.remove(), 3000);
//   }

//   handleAddressSelection(addressId) {
//     this.selectedAddressId = addressId;
//     const radios = this.container.querySelectorAll(".delivery-address__radio");
//     radios.forEach(radio => {
//       const addressCard = radio.closest(".delivery-address");
//       if (addressCard.dataset.addressId === addressId) {
//         radio.checked = true;
//       } else {
//         radio.checked = false;
//       }
//     });
//   }

//   toggleAddressForm() {
//     const isHidden = this.addressFormSection.classList.contains("hidden");
//     if (isHidden) {
//       this.addNewAddressBtn.classList.add("bg-gray-50");
//     } else {
//       this.addNewAddressBtn.classList.remove("bg-gray-50");
//     }
//     this.addressFormSection.classList.toggle("hidden");
//   }

//   createAddressCard(address) {
//     return `
//       <div class="delivery-address border p-4 mb-4 rounded-lg" data-address-id="${address._id}">
//         <div class="delivery-address__content flex justify-between">
//           <div class="delivery-address__option flex items-center">
//             <input 
//               type="radio" 
//               name="delivery-address" 
//               class="delivery-address__radio mr-3" 
//               ${address.isDefault ? "checked" : ""}
//             >
//             <div class="delivery-address__details">
//               <div class="delivery-address__name font-bold">
//                 ${address.name} , ${address.phoneNo}
//               </div>
//               <div class="delivery-address__address text-gray-600">
//                 ${address.address}, ${address.city}, ${address.state}, ${address.country} - ${address.pinCode}
//               </div>
//             </div>
//             <div class="delivery-address__actions flex space-x-4">
//               <button 
//                 class="edit-btn text-blue-600 hover:text-blue-800"
//                 data-address-id="${address._id}"
//               >
//                 Edit
//               </button>
//               <button 
//                 class="delete-btn text-red-600 hover:text-red-800"
//                 data-address-id="${address._id}"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   }

//   populateShippingAddressesContainer(addresses) {
//     this.addresses = addresses;
//     if (!this.container) return;

//     this.container.innerHTML = addresses.length === 0
//       ? '<p class="text-gray-500">No addresses found</p>'
//       : addresses.map((address) => this.createAddressCard(address)).join("");

//     this.attachCardEventListeners();
//   }

//   attachCardEventListeners() {
//     this.container.querySelectorAll(".edit-btn").forEach((btn) => {
//       btn.addEventListener("click", (e) => {
//         const addressId = e.target.dataset.addressId;
//         this.prepareEditAddress(addressId);
//       });
//     });

//     this.container.querySelectorAll(".delete-btn").forEach((btn) => {
//       btn.addEventListener("click", (e) => {
//         const addressId = e.target.dataset.addressId;
//         this.deleteShippingAddress(addressId);
//       });
//     });

//     this.container.querySelectorAll(".delivery-address__radio").forEach((radioButton) => {
//       radioButton.addEventListener("click", (e) => {
//         const addressId = e.target.closest(".delivery-address").dataset.addressId;
//         this.handleAddressSelection(addressId);
//       });
//     });
//   }

//   prepareEditAddress(addressId) {
//     const address = this.addresses.find((addr) => addr._id === addressId);
//     if (!address) {
//       console.error("Address not found");
//       return;
//     }

//     const form = this.editForm;
//     form.querySelector('input[name="addressId"]').value = addressId;
//     form.querySelector('input[name="name"]').value = address.name || "";
//     form.querySelector('input[name="phoneNo"]').value = address.phoneNo || "";
//     form.querySelector('textarea[name="address"]').value = address.address || "";
//     form.querySelector('input[name="city"]').value = address.city || "";
//     form.querySelector('input[name="state"]').value = address.state || "";
//     form.querySelector('input[name="pinCode"]').value = address.pinCode || "";

//     this.popup.style.display = "flex";
//   }

//   closeEditModal() {
//     if (this.popup) {
//       this.popup.style.display = "none";
//     }
//     if (this.editForm) {
//       this.editForm.reset();
//     }
//   }

//   async addShippingAddress(addressData) {
//     try {
//       const response = await fetch(`${this.apiBaseUrl}/shipping`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${this.webtoken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(addressData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         this.toggleAddressForm();
//         this.addAddressForm.reset();
//         await this.fetchShippingAddresses();
//         this.showAlert('success', 'Address added successfully!');
//       } else {
//         throw new Error(data.message || "Failed to add shipping address");
//       }
//     } catch (error) {
//       console.error("Error adding shipping address:", error);
//       this.showAlert('error', error.message);
//     }
//   }

//   async updateShippingAddress(addressId, updatedAddress) {
//     try {
//       const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${this.webtoken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(updatedAddress),
//       });

//       const data = await response.json();

//       if (data.success) {
//         this.closeEditModal();
//         await this.fetchShippingAddresses();
//         this.showAlert('success', 'Address updated successfully!');
//       } else {
//         throw new Error(data.message || "Failed to update the address");
//       }
//     } catch (error) {
//       console.error("Error updating the address:", error);
//       this.showAlert('error', error.message);
//     }
//   }

//   async deleteShippingAddress(addressId) {
//     if (!confirm("Are you sure you want to delete this address?")) return;

//     try {
//       const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${this.webtoken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (data.success) {
//         await this.fetchShippingAddresses();
//         this.showAlert('success', 'Address deleted successfully!');
//       } else {
//         throw new Error(data.message || "Failed to delete shipping address");
//       }
//     } catch (error) {
//       console.error("Error deleting shipping address:", error);
//       this.showAlert('error', error.message);
//     }
//   }

//   async fetchShippingAddresses(query = "") {
//     try {
//       const url = new URL(`${this.apiBaseUrl}/shipping`);
//       if (query) url.searchParams.set("search", query);

//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${this.webtoken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (data.success) {
//         this.populateShippingAddressesContainer(data.data.addresses || []);
//       } else {
//         throw new Error(data.message || "Failed to fetch shipping addresses");
//       }
//     } catch (error) {
//       console.error("Error fetching shipping addresses:", error);
//       this.showAlert('error', error.message);
//     }
//   }
// }

// // Initialize the manager when the DOM is loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const manager = new ShippingAddressManager();
// });


class ShippingAddressManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.webtoken = localStorage.getItem("webtoken");
    this.addresses = [];
    this.selectedAddressId = null;
    this.products = JSON.parse(localStorage.getItem("cartItems") || "[]");

    // DOM Elements
    this.container = document.getElementById("shippingAddressesContainer");
    this.addNewAddressBtn = document.getElementById("addNewAddressBtn");
    this.addressFormSection = document.getElementById("addressFormSection");
    this.addAddressForm = document.getElementById("addAddressForm");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.popup = document.getElementById("popup-dialogue");
    this.editForm = document.getElementById("enquiry-form");
    this.closePopupBtn = document.getElementById("close-popup");
    this.placeOrderBtn = document.getElementById("placeOrderBtn");
    this.successModal = document.getElementById("success-modal");
    this.notificationSound = document.getElementById("notification-sound");
    this.closeModalBtn = document.getElementById("close-modal-btn");
    this.closeCustomAlert = this.closeCustomAlert.bind(this);


    this.shippingPriceElement = document.querySelector(".shipping-price");
    this.taxAmountElement = document.querySelector(".tax-amount");
    this.grandTotalElement = document.querySelector(".grand-total");
    this.currencyCodeElement = document.querySelector(".currency_code");


    // Bind methods
    this.toggleAddressForm = this.toggleAddressForm.bind(this);
    this.addShippingAddress = this.addShippingAddress.bind(this);
    this.updateShippingAddress = this.updateShippingAddress.bind(this);
    this.deleteShippingAddress = this.deleteShippingAddress.bind(this);
    this.fetchShippingAddresses = this.fetchShippingAddresses.bind(this);
    this.populateShippingAddressesContainer = this.populateShippingAddressesContainer.bind(this);
    this.prepareEditAddress = this.prepareEditAddress.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
    this.handleAddressSelection = this.handleAddressSelection.bind(this);
    this.fetchCartData = this.fetchCartData.bind(this);
    this.showCustomAlert = this.showCustomAlert.bind(this);
    this.closeCustomAlert = this.closeCustomAlert.bind(this);
    this.placeCartOrder = this.placeCartOrder.bind(this);
    this.showAlert = this.showAlert.bind(this);


    // Initialize
    this.addEventListeners();
    this.fetchShippingAddresses();
    this.fetchCartData();
    this.initializeOrderButton();
  }

  initializeOrderButton() {
    const orderButton = document.createElement('a');
    orderButton.href = '#';
    orderButton.className = 'btn btn-main mt-40 py-18 w-100 rounded-8 mt-56';
    orderButton.textContent = 'Place Order';
    orderButton.addEventListener('click', this.placeCartOrder);
    
    // Find the container and append the button
    const container = document.querySelector('.checkout-sidebar');
    if (container) {
      container.appendChild(orderButton);
    }
  }

  async placeCartOrder(e) {
    e.preventDefault();
    
    try {
      // Play notification sound
      if (this.notificationSound) {
        this.notificationSound.play();
      }

      // Alert user
      alert("Your order is being processed. Please wait...");

      // Get the selected address ID
      const selectedAddressId = document.querySelector('.delivery-address__radio:checked')?.closest('.delivery-address')?.dataset.addressId;
      if (!selectedAddressId) {
        this.showAlert('error', 'Please select a shipping address');
        return;
      }

      // Check authentication
      if (!this.webtoken) {
        this.showAlert('error', 'You are not logged in. Redirecting to login...');
        window.location.href = 'account.html';
        return;
      }

      // Prepare payload
      const payload = {
        savedAddressId: selectedAddressId,
        shippingAddress: null, // Use null if a saved address is selected
        currency_code: 'AED'
      };

      // Call the API
      const response = await fetch(`${this.apiBaseUrl}/order/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.webtoken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Show success modal
      this.showCustomAlert();

      // Clear cart and redirect
      localStorage.removeItem('cartItems');
      // setTimeout(() => {
      //   window.location.href = 'shop.html';
      // }, 5000);

    } catch (error) {
      this.showAlert('error', error.message);
    }
  }

  showCustomAlert() {
    if (this.successModal) {
      this.successModal.classList.remove('hidden');
      if (this.notificationSound) {
        this.notificationSound.play();
      }
    }
  }

  closeCustomAlert() {
    if (this.successModal) {
      this.successModal.classList.add('hidden');
    }
  }


  async fetchCartData() {
    if (!this.webtoken) {
      console.error("No authentication token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/web_cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.updateCartSummary(data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      this.showAlert('error', 'Failed to fetch cart details');
    }
  }

  // Add method to update cart summary in the UI
  updateCartSummary(data) {
    if (this.shippingPriceElement) {
      this.shippingPriceElement.textContent = `AED ${data.totalShippingPrice.toFixed(2)}`;
    }
    if (this.taxAmountElement) {
      this.taxAmountElement.textContent = `AED ${data.totalTax.toFixed(2)}`;
    }
    if (this.grandTotalElement) {
      this.grandTotalElement.textContent = `AED ${data.Total.toFixed(2)}`;
    }
    if (this.currencyCodeElement) {
      this.currencyCodeElement.textContent = `AED ${data.currency_code}`;
    }
  }


  addEventListeners() {
    if (this.addNewAddressBtn) {
      this.addNewAddressBtn.addEventListener("click", this.toggleAddressForm);
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => {
        this.toggleAddressForm();
        this.addAddressForm.reset();
      });
    }

    if (this.addAddressForm) {
      this.addAddressForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(this.addAddressForm);
        const addressData = Object.fromEntries(formData.entries());
        addressData.isDefault = formData.get("isDefault") === "on";
        await this.addShippingAddress(addressData);
      });
    }

    if (this.closePopupBtn) {
      this.closePopupBtn.addEventListener("click", this.closeEditModal);
    }

    if (this.editForm) {
      this.editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const addressId = this.editForm.querySelector('input[name="addressId"]').value;
        if (!addressId) {
          console.error("No address ID found in the form");
          return;
        }
        const formData = new FormData(this.editForm);
        const updatedAddress = Object.fromEntries(formData.entries());
        await this.updateShippingAddress(addressId, updatedAddress);
      });
    }

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", this.closeCustomAlert);
    }

  }

  handlePlaceOrder() {
    const orderNowButton = document.querySelector(".order-now");
    if (orderNowButton) {
      orderNowButton.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const selectedAddressId = document.querySelector('.delivery-address__radio:checked')?.closest('.delivery-address')?.dataset.addressId;
        if (!selectedAddressId) {
          this.showAlert('error', 'Please select a shipping address');
          return;
        }

        

        // Refresh cart data before placing order
        await this.fetchCartData();

        const orderData = JSON.parse(localStorage.getItem('orderData'));
        if (!orderData) {
          this.showAlert('error', 'No product data found');
          return;
        }

        if (!this.webtoken) {
          window.location.href = 'account.html';
          return;
        }

        const payload = {
          product_id: orderData.product_id,
          quantity: orderData.quantity,
          currency_code: orderData.currency_code,
          attributes: orderData.attributes,
          shipping_address_id: selectedAddressId
        };

        try {
          const response = await fetch(`${this.apiBaseUrl}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.webtoken}`
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Failed to place order');
          }

          this.showAlert('success', 'Order placed successfully!');
          localStorage.removeItem('orderData');
          window.location.href = 'orders.html';
        } catch (error) {
          this.showAlert('error', error.message);
        }
      });
    }
  }


  showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="ph ph-${type === 'success' ? 'check' : 'x'}-circle me-2"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  }

  handleAddressSelection(addressId) {
    this.selectedAddressId = addressId;
    const radios = this.container.querySelectorAll(".delivery-address__radio");
    radios.forEach(radio => {
      const addressCard = radio.closest(".delivery-address");
      if (addressCard.dataset.addressId === addressId) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    });
  }

  toggleAddressForm() {
    const isHidden = this.addressFormSection.classList.contains("hidden");
    if (isHidden) {
      this.addNewAddressBtn.classList.add("bg-gray-50");
    } else {
      this.addNewAddressBtn.classList.remove("bg-gray-50");
    }
    this.addressFormSection.classList.toggle("hidden");
  }

  createAddressCard(address) {
    return `
      <div class="delivery-address border p-4 mb-4 rounded-lg" data-address-id="${address._id}">
        <div class="delivery-address__content flex justify-between">
          <div class="delivery-address__option flex items-center">
            <input 
              type="radio" 
              name="delivery-address" 
              class="delivery-address__radio mr-3" 
              ${address.isDefault ? "checked" : ""}
            >
            <div class="delivery-address__details">
              <div class="delivery-address__name font-bold">
                ${address.name} , ${address.phoneNo}
              </div>
              <div class="delivery-address__address text-gray-600">
                ${address.address}, ${address.city}, ${address.state}, ${address.country} - ${address.pinCode}
              </div>
            </div>
            <div class="delivery-address__actions flex space-x-4">
              <button 
                class="edit-btn text-blue-600 hover:text-blue-800"
                data-address-id="${address._id}"
              >
                Edit
              </button>
              <button 
                class="delete-btn text-red-600 hover:text-red-800"
                data-address-id="${address._id}"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  populateShippingAddressesContainer(addresses) {
    this.addresses = addresses;
    if (!this.container) return;

    this.container.innerHTML = addresses.length === 0
      ? '<p class="text-gray-500">No addresses found</p>'
      : addresses.map((address) => this.createAddressCard(address)).join("");

    this.attachCardEventListeners();
  }

  attachCardEventListeners() {
    this.container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.addressId;
        this.prepareEditAddress(addressId);
      });
    });

    this.container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.addressId;
        this.deleteShippingAddress(addressId);
      });
    });

    this.container.querySelectorAll(".delivery-address__radio").forEach((radioButton) => {
      radioButton.addEventListener("click", (e) => {
        const addressId = e.target.closest(".delivery-address").dataset.addressId;
        this.handleAddressSelection(addressId);
      });
    });
  }

  prepareEditAddress(addressId) {
    const address = this.addresses.find((addr) => addr._id === addressId);
    if (!address) {
      console.error("Address not found");
      return;
    }

    const form = this.editForm;
    form.querySelector('input[name="addressId"]').value = addressId;
    form.querySelector('input[name="name"]').value = address.name || "";
    form.querySelector('input[name="phoneNo"]').value = address.phoneNo || "";
    form.querySelector('textarea[name="address"]').value = address.address || "";
    form.querySelector('input[name="city"]').value = address.city || "";
    form.querySelector('input[name="state"]').value = address.state || "";
    form.querySelector('input[name="pinCode"]').value = address.pinCode || "";

    this.popup.style.display = "flex";
  }

  closeEditModal() {
    if (this.popup) {
      this.popup.style.display = "none";
    }
    if (this.editForm) {
      this.editForm.reset();
    }
  }

  async addShippingAddress(addressData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shipping`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (data.success) {
        this.toggleAddressForm();
        this.addAddressForm.reset();
        await this.fetchShippingAddresses();
        this.showAlert('success', 'Address added successfully!');
      } else {
        throw new Error(data.message || "Failed to add shipping address");
      }
    } catch (error) {
      console.error("Error adding shipping address:", error);
      this.showAlert('error', error.message);
    }
  }

  async updateShippingAddress(addressId, updatedAddress) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAddress),
      });

      const data = await response.json();

      if (data.success) {
        this.closeEditModal();
        await this.fetchShippingAddresses();
        this.showAlert('success', 'Address updated successfully!');
      } else {
        throw new Error(data.message || "Failed to update the address");
      }
    } catch (error) {
      console.error("Error updating the address:", error);
      this.showAlert('error', error.message);
    }
  }

  async deleteShippingAddress(addressId) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await this.fetchShippingAddresses();
        this.showAlert('success', 'Address deleted successfully!');
      } else {
        throw new Error(data.message || "Failed to delete shipping address");
      }
    } catch (error) {
      console.error("Error deleting shipping address:", error);
      this.showAlert('error', error.message);
    }
  }

  async fetchShippingAddresses(query = "") {
    try {
      const url = new URL(`${this.apiBaseUrl}/shipping`);
      if (query) url.searchParams.set("search", query);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.populateShippingAddressesContainer(data.data.addresses || []);
      } else {
        throw new Error(data.message || "Failed to fetch shipping addresses");
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      this.showAlert('error', error.message);
    }
  }
}

// Initialize the manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const manager = new ShippingAddressManager();
});

