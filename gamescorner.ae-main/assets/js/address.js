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

    // Bind methods
    this.toggleAddressForm = this.toggleAddressForm.bind(this);
    this.addShippingAddress = this.addShippingAddress.bind(this);
    this.updateShippingAddress = this.updateShippingAddress.bind(this);
    this.deleteShippingAddress = this.deleteShippingAddress.bind(this);
    this.fetchShippingAddresses = this.fetchShippingAddresses.bind(this);
    this.populateShippingAddressesContainer =
      this.populateShippingAddressesContainer.bind(this);
    this.prepareEditAddress = this.prepareEditAddress.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
    this.handleAddressSelection = this.handleAddressSelection.bind(this);

    // Initialize
    this.addEventListeners();
    this.initializeOrderSummary();
    this.fetchShippingAddresses();
  }


  initializeOrderSummary() {
    const orderSummaryContainer = document.getElementById("orderSummaryContainer");
    if (!orderSummaryContainer || !this.products.length) return;

    const summary = this.products.map(product => `
      <div class="product-item flex justify-between mb-2">
        <span>${product.name}</span>
        <span>$${product.price}</span>
      </div>
    `).join("");

    const total = this.products.reduce((sum, product) => sum + parseFloat(product.price), 0);


    orderSummaryContainer.innerHTML = `
    ${summary}
    <div class="total font-bold mt-4 border-t pt-2">
      <div class="flex justify-between">
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}


handlePlaceOrder() {
  if (!this.selectedAddressId) {
    alert("Please select a shipping address");
    return;
  }

  if (!this.products.length) {
    alert("No products in cart");
    return;
  }

  const orderData = {
    addressId: this.selectedAddressId,
    products: this.products.map(product => ({
      productId: product.id,
      quantity: product.quantity || 1
    }))
  };

  this.submitOrder(orderData);
}
  addEventListeners() {
    // Add new address form toggle
    if (this.addNewAddressBtn) {
      this.addNewAddressBtn.addEventListener("click", this.toggleAddressForm);
    }

    // Cancel button for add form
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => {
        this.toggleAddressForm();
        this.addAddressForm.reset();
      });
    }

    // Add new address form submission
    if (this.addAddressForm) {
      this.addAddressForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(this.addAddressForm);
        const addressData = Object.fromEntries(formData.entries());
        addressData.isDefault = formData.get("isDefault") === "on";
        await this.addShippingAddress(addressData);
      });
    }

    // Edit form popup close button
    if (this.closePopupBtn) {
      this.closePopupBtn.addEventListener("click", this.closeEditModal);
    }

    // Edit form submission
    if (this.editForm) {
      this.editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const addressId = this.editForm.querySelector(
          'input[name="addressId"]'
        ).value;
        if (!addressId) {
          console.error("No address ID found in the form");
          return;
        }
        const formData = new FormData(this.editForm);
        const updatedAddress = Object.fromEntries(formData.entries());
        await this.updateShippingAddress(addressId, updatedAddress);
      });
    }
    // if (this.placeOrderBtn) {
    //   this.placeOrderBtn.addEventListener("click", this.handlePlaceOrder);
    // }
  }

  handleAddressSelection(addressId) {
    this.selectedAddressId = addressId;
    // Update UI to show selected address
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
      <div class="delivery-address border p-4 mb-4 rounded-lg" data-address-id="${
        address._id
      }">
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
                ${address.address}, ${address.city}, ${address.state}, ${
      address.country
    } - ${address.pinCode}
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

    this.container.innerHTML =
      addresses.length === 0
        ? '<p class="text-gray-500">No addresses found</p>'
        : addresses.map((address) => this.createAddressCard(address)).join("");

    this.attachCardEventListeners();
  }

  attachCardEventListeners() {
    // Add event listeners for edit buttons
    this.container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.addressId;
        this.prepareEditAddress(addressId);
      });
    });

    // Add event listeners for delete buttons
    this.container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.dataset.addressId;
        this.deleteShippingAddress(addressId);
      });
    });

    // Add listeners for delivery address radio buttons
    this.container
      .querySelectorAll(".delivery-address__radio")
      .forEach((radioButton) => {
        radioButton.addEventListener("click", (e) => {
          const addressId =
            e.target.closest(".delivery-address").dataset.addressId;
          console.log("Selected address ID:", addressId);
        });
      });
  }

  prepareEditAddress(addressId) {
    const address = this.addresses.find((addr) => addr._id === addressId);
    if (!address) {
      console.error("Address not found");
      return;
    }

    // Set form values
    const form = this.editForm;
    form.querySelector('input[name="addressId"]').value = addressId;
    form.querySelector('input[name="name"]').value = address.name || "";
    form.querySelector('input[name="phoneNo"]').value = address.phoneNo || "";
    form.querySelector('textarea[name="address"]').value =
      address.address || "";
    form.querySelector('input[name="city"]').value = address.city || "";
    form.querySelector('input[name="state"]').value = address.state || "";
    form.querySelector('input[name="pinCode"]').value = address.pinCode || "";

    // Show popup
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
        alert("Address added successfully!");
      } else {
        throw new Error(data.message || "Failed to add shipping address");
      }
    } catch (error) {
      console.error("Error adding shipping address:", error);
      alert(`Error: ${error.message}`);
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
        alert("Address updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update the address");
      }
    } catch (error) {
      console.error("Error updating the address:", error);
      alert(`Error: ${error.message}`);
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
        alert("Address deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete shipping address");
      }
    } catch (error) {
      console.error("Error deleting shipping address:", error);
      alert(`Error: ${error.message}`);
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
      alert(`Error: ${error.message}`);
    }
  }
}

// Initialize the manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const manager = new ShippingAddressManager();
});
