
// Wishlist Management Script
document.addEventListener('DOMContentLoaded', () => {
  const wishlistContainer = document.querySelector('tbody');
  const clearCartButton = document.querySelector('.clear-section button');
  
  // Fetch and render wishlist items
  async function fetchWishlist() {
      try {
          const response = await fetch('http://localhost:5002/api/wish', {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('webtoken')}`, // Assuming token-based auth
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              throw new Error('Failed to fetch wishlist');
          }

          const data = await response.json();
          renderWishlistItems(data.wishlist?.products || []);
      } catch (error) {
          console.error('Error fetching wishlist:', error);
          showErrorMessage('Unable to load wishlist. Please try again.');
      }
  }

  // Render wishlist items to the table
  function renderWishlistItems(products) {
      // Clear existing items
      wishlistContainer.innerHTML = '';

      if (!Array.isArray(products) || products.length === 0) {
          wishlistContainer.innerHTML = `
              <tr>
                  <td colspan="3" class="text-center">Your wishlist is empty</td>
              </tr>
          `;
          return;
      }

      products.forEach(item => {
          // Safely handle potential undefined or null product
          const product = item.product || {};
          
          const productElement = document.createElement('tr');
          productElement.innerHTML = `
              <td>
                  <button type="button" class="remove-tr-btn flex-align gap-12 hover-text-danger-600" data-product-id="${product._id || ''}">
                      <i class="ph ph-x-circle text-2xl d-flex"></i>
                      Remove
                  </button>
              </td>
              <td>
                  <div class="table-product d-flex align-items-center gap-24">
                      <a href="product-details.html?id=${product._id}" class="table-product__thumb border border-gray-100 rounded-8 flex-center">
                          <img src="${product.image || 'assets/images/placeholder.png'}" alt="${product.name || 'Product'}">
                      </a>
                      <div class="table-product__content text-start">
                          <h6 class="title text-lg fw-semibold mb-8">
                              <a href="product-details.html?id=${product._id}" class="link text-line-2" 
                                style="display: block; width:600px;">
                              ${product.name || 'Unnamed Product'}</a>
                              <a href="product-details.html?id=${product._id}" class="mt-6" style="width:800px">${product.description || ''}</a>
                          </h6>
                      </div>
                  </div>
              </td>
              <td>$${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
          `;
          wishlistContainer.appendChild(productElement);
      });

      // Attach remove item event listeners
      attachRemoveItemListeners();
  }

  // Remove individual item from wishlist
  function attachRemoveItemListeners() {
      const removeButtons = document.querySelectorAll('.remove-tr-btn');
      removeButtons.forEach(button => {
          button.addEventListener('click', async (e) => {
              const productId = e.currentTarget.dataset.productId;
              
              try {
                  const response = await fetch('http://localhost:5002/api/wish/remove', {
                      method: 'POST',
                      headers: {
                          'Authorization': `Bearer ${localStorage.getItem('webtoken')}`,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ productId })
                  });

                  if (!response.ok) {
                      throw new Error('Failed to remove product');
                  }

                  // Refetch and re-render wishlist
                  fetchWishlist();
              } catch (error) {
                  console.error('Error removing product:', error);
                  showErrorMessage('Unable to remove product. Please try again.');
              }
          });
      });
  }

  // Clear entire wishlist
  function attachClearWishlistListener() {
      clearCartButton.addEventListener('click', async () => {
          try {
              const response = await fetch('http://localhost:5002/api/wish/clear', {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('webtoken')}`, // Fixed token key
                      'Content-Type': 'application/json'
                  }
              });

              if (!response.ok) {
                  throw new Error('Failed to clear wishlist');
              }

              // Refetch and re-render wishlist (which will now be empty)
              fetchWishlist();
          } catch (error) {
              console.error('Error clearing wishlist:', error);
              showErrorMessage('Unable to clear wishlist. Please try again.');
          }
      });
  }

  // Display error messages
  function showErrorMessage(message) {
      const errorContainer = document.createElement('div');
      errorContainer.classList.add('alert', 'alert-danger', 'mt-3');
      errorContainer.textContent = message;
      document.querySelector('.container').prepend(errorContainer);
      
      // Remove error after 3 seconds
      setTimeout(() => errorContainer.remove(), 3000);
  }

  // Initialize wishlist functionality
  function init() {
      fetchWishlist();
      attachClearWishlistListener();
  }

  // Start the wishlist management
  init();
});