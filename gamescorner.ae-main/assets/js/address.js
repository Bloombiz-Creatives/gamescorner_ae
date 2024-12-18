class ShippingAddressManager {
  constructor(apiBaseUrl = "http://localhost:5002/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.webtoken = localStorage.getItem("webtoken");
    this.addresses = []; // Store addresses

    // DOM Elements
    this.container = document.getElementById("shippingAddressesContainer");
    this.editModal = document.getElementById("editAddressModal");
    this.editForm = document.getElementById("editAddressForm");
    this.closeModalBtn = document.getElementById("closeEditModal");

    // Bind methods
    this.populateShippingAddressesContainer =
      this.populateShippingAddressesContainer.bind(this);
    this.prepareEditAddress = this.prepareEditAddress.bind(this);
    this.updateShippingAddress = this.updateShippingAddress.bind(this);
    this.deleteShippingAddress = this.deleteShippingAddress.bind(this);
    this.prepareEditAddress = this.prepareEditAddress.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    // Add event listeners
    this.addEventListeners();
  }

  addEventListeners() {
    // Close modal button
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => {
        this.closeEditModal();
      });
    }

    // Edit form submission
    if (this.editForm) {
      this.editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const addressId = this.editForm.getAttribute("data-address-id");
        const formData = new FormData(this.editForm);
        const updatedAddress = Object.fromEntries(formData.entries());
        this.updateShippingAddress(addressId, updatedAddress);
      });
    }
  }

  populateShippingAddressesContainer(addresses) {
    this.addresses = addresses; // Store addresses

    if (!this.container) return;

    // Clear previous content
    this.container.innerHTML = "";

    if (addresses.length === 0) {
      this.container.innerHTML =
        '<p class="text-gray-500">No addresses found</p>';
      return;
    }

    addresses.forEach((address) => {
      const addressCard = document.createElement("div");
      addressCard.className = "delivery-address border p-4 mb-4";
      addressCard.innerHTML = `
        <div class="delivery-address__content flex justify-between items-center">
          <div class="delivery-address__option flex items-center">
            <input 
              type="radio" 
              name="delivery-address" 
              class="delivery-address__radio mr-3" 
              ${address.isDefault ? "checked" : ""}
            >
            <div class="delivery-address__details">
              <div class="delivery-address__name font-bold">
                ${address.name} (${address.phoneNo})
              </div>
              <div class="delivery-address__address text-gray-600">
                ${address.address}, ${address.city}, ${address.state} - ${
        address.pinCode
      }
              </div>
            </div>
          </div>
          <div class="delivery-address__actions flex gap-2">
            <button 
              class="edit-btn bg-blue-500 text-white px-3 py-1 rounded"
              data-address-id="${address._id}"
            >
              Edit
            </button>
            <button 
              class="delete-btn bg-red-500 text-white px-3 py-1 rounded"
              data-address-id="${address._id}"
            >
              Delete
            </button>
          </div>
        </div>
      `;
      this.container.appendChild(addressCard);
    });

    // Add event listeners for edit buttons
    this.container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.getAttribute("data-address-id");
        if (!addressId) {
          console.error("No address ID found on the button");
          return;
        }
        this.prepareEditAddress(addressId);
      });
    });

    // Add event listeners for delete buttons
    this.container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const addressId = e.target.getAttribute("data-address-id");
        this.deleteShippingAddress(addressId);
      });
    });
  }
  prepareEditAddress(addressId) {
    const editForm = document.getElementById("editForm"); // Ensure editForm exists
    if (!editForm) {
      console.error("Edit form not found!");
      return;
    }

    const address = this.getAddressById(address._id);
    if (!address) {
      console.error("Address not found!");
      return;
    }

    const addressIdInput = editForm.querySelector('input[name="addressId"]');
    if (!addressIdInput) {
      console.error("Input field for addressId not found!");
      return;
    }

    // Set the form fields with the address data
    addressIdInput.value = address._id; // Set addressId value
    editForm.querySelector('input[name="name"]').value = address.name;
    editForm.querySelector('input[name="phoneNo"]').value = address.phoneNo;
    editForm.querySelector('textarea[name="address"]').value = address.address;
    // Set other form fields as needed
  }

  closeEditModal() {
    if (this.editModal) {
      this.editModal.classList.add("hidden");
    }
  }

  async updateShippingAddress(addressId, addressData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (data.success) {
        // Close the modal
        this.closeEditModal();

        // Refresh the addresses
        this.fetchShippingAddresses();
      } else {
        throw new Error(data.message || "Failed to update shipping address");
      }
    } catch (error) {
      console.error("Error updating shipping address:", error);
      alert(`Error: ${error.message}`);
    }
  }

  async deleteShippingAddress(addressId) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

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
        // Refresh the addresses
        this.fetchShippingAddresses();
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
      let url = `${this.apiBaseUrl}/shipping`;
      if (query) {
        url += `?search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        this.addresses = data.data.addresses || [];
        this.populateShippingAddressesContainer(this.addresses);
      } else {
        throw new Error(data.message || "Failed to fetch shipping addresses");
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      alert(`Error: ${error.message}`);
    }
  }

  populateShippingAddressesContainer(addresses) {
    const container = document.getElementById("shippingAddressesContainer");

    if (!container) return;

    // Clear previous content
    container.innerHTML = "";

    if (addresses.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No addresses found</p>';
      return;
    }

    addresses.forEach((address) => {
      const addressCard = document.createElement("div");
      addressCard.className = "delivery-address";
      addressCard.innerHTML = `
        <div class="delivery-address__content" style="display: flex; justify-content: space-between; align-items: center;">
         <div class="delivery-address__option">
    <input type="radio" name="delivery-address" class="delivery-address__radio" data-id="${
      address._id
    }" ${address.isDefault ? "checked" : ""}>
   <div class="delivery-address__details">
    <div class="delivery-address__name">${address.name} ${address.phoneNo}</div>
    <div class="delivery-address__address">${address.address}, ${
        address.city
      }, ${address.state} - ${address.pinCode}</div>
   </div>
  </div> 
          <div class="delivery-address__actions" style="display: flex; gap: 10px; bottom:20px;">
            <button class="delivery-address__action delivery-address__action--edit" data-id="${
              address._id
            }">
              Edit
            </button>
            <button class="delivery-address__action delivery-address__action--delete" data-address-id="${
              address._id
            }">
              Delete
            </button>
          </div>
        </div>
      `;
      container.appendChild(addressCard);
    });

    container
      .querySelectorAll(".delivery-address__action--edit")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          // Ensure we target the correct button element
          const button = e.target.closest(".delivery-address__action--edit");
          if (button) {
            const addressId = button.getAttribute("data-id");
            if (addressId) {
              this.prepareEditAddress(addressId);
            } else {
              console.error(
                "data-id attribute is missing on the clicked button"
              );
            }
          } else {
            console.error("Edit button not found");
          }
        });
      });

    // Add event listeners for delete buttons
    container
      .querySelectorAll(".delivery-address__action--delete")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const addressId = e.target.getAttribute("data-id");
          this.deleteShippingAddress(addressId);
        });
      });
  }

  // Method to prepare and show edit modal
  prepareEditAddress(addressId) {
    // Find the address in the current list of addresses
    const address = this.addresses.find((addr) => addr._id === addressId);

    if (!address) {
      console.error("Address not found");
      return;
    }

    // Get the edit modal and form
    const editModal = document.getElementById("editAddressModal");
    const editForm = document.getElementById("editAddressForm");

    // Populate form fields
    editForm.setAttribute("data-id", addressId);
    editForm.querySelector('input[name="addressId"]').value = address._id;
    editForm.querySelector("#name").value = address.name;

    // Add additional form fields
    editForm.querySelector("#phoneNo").value = address.phoneNo;
    editForm.querySelector("#address").value = address.address;
    editForm.querySelector("#city").value = address.city;
    editForm.querySelector("#state").value = address.state;
    editForm.querySelector("#pinCode").value = address.pinCode;

    // Show the modal
    if (editModal) {
      editModal.classList.remove("hidden");
    }
  }

  // Method to close the edit modal
  closeEditModal() {
    const editModal = document.getElementById("editAddressModal");
    if (editModal) {
      editModal.classList.add("hidden");
    }
  }

  // In the constructor or addEventListeners method
  addEventListeners() {
    // ... existing event listeners ...

    // Close edit modal button
    const closeEditModalBtn = document.getElementById("closeEditModal");
    if (closeEditModalBtn) {
      closeEditModalBtn.addEventListener("click", () => {
        this.closeEditModal();
      });
    }

    // Edit address form submission
    const editAddressForm = document.getElementById("editAddressForm");
    if (editAddressForm) {
      editAddressForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const addressId = editAddressForm.getAttribute("data-id");
        const formData = new FormData(editAddressForm);
        const updatedAddress = Object.fromEntries(formData.entries());
        this.updateShippingAddress(addressId, updatedAddress);
      });
    }
  }

  // Method to update shipping address
  async updateShippingAddress(addressId, addressData) {
    try {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "block";
      if (this.errorMessage) this.errorMessage.textContent = "";

      // Make API call to update address
      const response = await fetch(`${this.apiBaseUrl}/shipping/${addressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.webtoken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.closeEditModal();
        this.fetchShippingAddresses();
      } else {
        throw new Error(data.message || "Failed to update shipping address");
      }
    } catch (error) {
      console.error("Error updating shipping address:", error);

      if (this.errorMessage) {
        this.errorMessage.textContent = `Error: ${error.message}`;
      }
    } finally {
      if (this.loadingIndicator) this.loadingIndicator.style.display = "none";
    }
  }

  // Delete Shipping Address
  async deleteShippingAddress(addressId) {
    if (!confirm("Are you sure you want to delete this shipping address?")) {
      return;
    }

    try {
      // Show loading indicator
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "block";
      }

      // Clear previous error message
      if (this.errorMessage) {
        this.errorMessage.textContent = "";
      }

      const url = `${this.apiBaseUrl}/shipping/${addressId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.webtoken}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorBody}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Refresh the address list
        this.fetchShippingAddresses();

        // Optionally show a success message
        if (this.errorMessage) {
          this.errorMessage.textContent = "Address deleted successfully";
          this.errorMessage.style.color = "green";
        }
      } else {
        throw new Error(data.message || "Failed to delete shipping address");
      }
    } catch (error) {
      console.error("Error deleting shipping address:", error);

      if (this.errorMessage) {
        this.errorMessage.textContent = `Failed to delete address: ${error.message}`;
        this.errorMessage.style.color = "red";
      }
    } finally {
      // Always hide loading indicator
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = "none";
      }
    }
  }
}

// Initialize the shipping address manager
const shippingAddressManager = new ShippingAddressManager();
// Select all radio buttons for delivery addresses
document.querySelectorAll(".delivery-address__radio").forEach((radioButton) => {
  radioButton.addEventListener("click", (e) => {
    const addressId = e.target.getAttribute("_.id");
    console.log("Selected address ID:", addressId);

    yourFunction(addressId);
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Now the DOM is ready, you can safely access and modify the form
  const editForm = document.getElementById("editForm");
  const addressIdInput = editForm.querySelector('input[name="addressId"]');

  if (addressIdInput) {
    addressIdInput.value = "your_address_id"; // Replace with actual ID or address
  }
});

// Fetch addresses on page load
document.addEventListener("DOMContentLoaded", () => {
  const manager = new ShippingAddressManager();
  manager.fetchShippingAddresses();
});
