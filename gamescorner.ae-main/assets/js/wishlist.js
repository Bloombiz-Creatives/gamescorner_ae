document.addEventListener('DOMContentLoaded', () => {
    const wishlistContainer = document.querySelector('tbody');
    const clearCartButton = document.querySelector('.clear-section button');
    const wishlistCountElement = document.getElementById('wishlistCount'); 


    // Fetch and render wishlist items
    async function fetchWishlist() {
        try {
            const response = await fetch('http://localhost:5002/api/wish', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('webtoken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wishlist');
            }

            const data = await response.json();
            console.log(data.wishlistCount,'ths');
            updateWishlistCount(data.wishlistCount || 0); 
            
            renderWishlistItems(data.wishlist?.products || []); 
            updateWishlistIcons(data.wishlist?.products || []);  
            // updateWishlistCount(data.wishlist?.products || 0);  
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            showErrorMessage('Unable to load wishlist. Please try again.');
        }
    }

    // Render wishlist items to the table
    function renderWishlistItems(products) {
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
            const product = item.product || {};
            console.log(product,'tttgyg');
            
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
                                <a href="product-details.html?id=${product._id}" class="link text-line-2" style="display: block; width:600px;">
                                ${product.name || 'Unnamed Product'}</a>
                            </h6>
                        </div>
                    </div>
                </td>
                <td>${product.country_pricing[0].currency_code} ${typeof product.country_pricing[0].discount === 'number' ? product.country_pricing[0].discount.toFixed(2) : '0.00'}</td>
            `;
            wishlistContainer.appendChild(productElement);
        });

        attachRemoveItemListeners(); 
    }

    // Update wishlist icons based on the products in the wishlist
    function updateWishlistIcons(products) {
        const allIcons = document.querySelectorAll('.add-to-wishlist .ph-heart');
        allIcons.forEach(icon => {
            const productId = icon.getAttribute('data-product-id');
            const isProductInWishlist = products.some(product => product.product._id === productId);

            if (isProductInWishlist) {
                icon.classList.add('text-red-500'); 
            } else {
                icon.classList.remove('text-red-500');
            }
        });
    }

    function updateWishlistCount(count) {
        if (wishlistCountElement) { 
            wishlistCountElement.textContent = count ;
            localStorage.setItem('wishlistCount', count);
        }
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
        if (clearCartButton) { // Ensure the clear cart button exists
            clearCartButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('http://localhost:5002/api/wish/clear', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('webtoken')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to clear wishlist');
                    }

                    fetchWishlist(); // Refetch and re-render wishlist after clearing
                } catch (error) {
                    console.error('Error clearing wishlist:', error);
                    showErrorMessage('Unable to clear wishlist. Please try again.');
                }
            });
        }
    }

    // Display error messages
    function showErrorMessage(message) {
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('alert', 'alert-danger', 'mt-3');
        errorContainer.textContent = message;
        document.querySelector('.container').prepend(errorContainer);

        setTimeout(() => errorContainer.remove(), 3000);
    }

    // Initialize wishlist functionality
    function init() {
        fetchWishlist();
        attachClearWishlistListener();
    }

    init();
});


document.addEventListener("DOMContentLoaded", () => {
    const CarttCountElement = document.getElementById("CartCount");
    const storedCount = localStorage.getItem("cartCount") || "0";
    if (CarttCountElement) {
        CarttCountElement.textContent = storedCount;
    }
  });
  