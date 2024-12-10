class CartManager {
    constructor() {
        // Main cart elements
        this.cartTableBody = document.querySelector('.table tbody');
        this.cartSidebar = document.querySelector('.cart-sidebar');

        // Form elements
        this.couponInput = document.querySelector('.common-input');
        this.applyCouponButton = document.querySelector('.btn.btn-main');
        this.updateCartButton = document.querySelector('.text-lg.text-gray-500');

        // API configuration
        this.baseApiUrl = 'http://localhost:5002/api';
        this.initialize();
    }

    async initialize() {
        try {
            await this.fetchCartData();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize cart:', error);
            this.renderErrorState(error);
        }
    }

    setupEventListeners() {
        // Remove existing event listeners first
        document.querySelectorAll('.quantity_cart_minus, .quantity_cart_plus, .quantity_cart, .remove-tr-btn')
            .forEach(element => {
                element.replaceWith(element.cloneNode(true));
            });

        // Coupon application
        if (this.applyCouponButton && this.couponInput) {
            this.applyCouponButton.addEventListener('click', () => {
                const couponCode = this.couponInput.value.trim();
                if (couponCode) {
                    this.applyCoupon(couponCode);
                } else {
                    this.showNotification("Please enter a coupon code.", "error");
                }
            });
        }

        // Update cart button
        if (this.updateCartButton) {
            this.updateCartButton.addEventListener('click', () => {
                this.updateAllQuantities();
            });
        }

        // Quantity controls
        document.querySelectorAll('.quantity_cart_minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.d-flex').querySelector('.quantity_cart');
                if (input) {
                    const currentValue = parseInt(input.value) || 1;
                    input.value = Math.max(1, currentValue - 1);
                    this.updateProductSubtotal(input);
                }
            });
        });

        document.querySelectorAll('.quantity_cart_plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.d-flex').querySelector('.quantity_cart');
                if (input) {
                    const currentValue = parseInt(input.value) || 1;
                    input.value = currentValue + 1;
                    this.updateProductSubtotal(input);
                }
            });
        });

        // Direct input change event
        document.querySelectorAll('.quantity_cart').forEach(input => {
            input.addEventListener('change', (e) => {
                const value = parseInt(e.target.value) || 1;
                e.target.value = Math.max(1, value);
                this.updateProductSubtotal(input);
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-tr-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const productId = this.getProductIdFromRow(row);
                if (productId) {
                    this.removeItem(productId);
                }
            });
        });
    }

    async applyCoupon(couponCode) {
        try {
            const token = localStorage.getItem('webtoken');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch(`${this.baseApiUrl}/apply-coupon`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponCode,
                    currency_code: 'AED'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to apply coupon');
            }

            if (data.success) {
                await this.fetchCartData();
                this.showNotification('Coupon applied successfully!', 'success');
                if (this.couponInput) {
                    this.couponInput.value = '';
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // updateProductSubtotal(quantityInput) {
        // const row = quantityInput.closest('tr');
        // const priceElement = row.querySelector('td:nth-child(3) .h6');
        // const price = parseFloat(priceElement.textContent.replace('AED: ', '')) || 0;
        // const quantity = parseInt(quantityInput.value) || 1;

        // const subtotalElement = row.querySelector('td:nth-child(5) .h6');
        // subtotalElement.textContent = `AED ${(price * quantity).toFixed(2)}`;
        // this.updateCartTotals();
    // }

    async updateProductSubtotal(quantityInput) {
        const row = quantityInput.closest('tr');
        const productId = this.getProductIdFromRow(row);
        const quantity = parseInt(quantityInput.value) || 1;
    
        if (productId) {
            try {
                const token = localStorage.getItem('webtoken');
                if (!token) throw new Error('User is not authenticated.');
    
                const response = await fetch(`${this.baseApiUrl}/update-cart-quantity`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId, quantity }),
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update quantity');
                }
    
                // Update subtotal in the UI
                const priceElement = row.querySelector('td:nth-child(3) .h6');
                const price = parseFloat(priceElement.textContent.replace('AED: ', '')) || 0;
                const subtotalElement = row.querySelector('td:nth-child(5) .h6');
                subtotalElement.textContent = `AED ${(price * quantity).toFixed(2)}`;
                
                this.updateCartTotals(); 
    
            } catch (error) {
                console.error('Error updating product quantity:', error);
                this.showNotification(error.message, 'error');
            }
        }
    }
    

    async updateCartTotals() {
        try {
            await this.fetchCartData(); 
        } catch (error) {
            console.error('Error updating cart totals:', error);
            this.showNotification('Failed to update cart totals', 'error');
        }
    }

    getProductIdFromRow(row) {
        const productLink = row.querySelector('.table-product__content .title a');
        return productLink?.getAttribute('data-product-id');
    }

    async removeItem(productId) {
        try {
            const token = localStorage.getItem('webtoken');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch(`${this.baseApiUrl}/remove-from-cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            await this.fetchCartData();
            this.showNotification('Item removed from cart', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async fetchCartData() {
        try {
            const token = localStorage.getItem('webtoken');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch(`${this.baseApiUrl}/web_cart?currency_code=AED`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.renderCart(data);
            } else {
                this.renderEmptyCart();
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
            this.renderErrorState(error);
        }
    }

    renderCart(cartData) {
        if (!cartData?.cart?.products) {
            return this.renderEmptyCart();
        }

        // Render products in cart table
        if (this.cartTableBody) {
            this.cartTableBody.innerHTML = cartData.cart.products
                .map(item => this.generateProductRow(item))
                .join('');
        }

        // Render cart summary in sidebar
        if (this.cartSidebar) {
            this.cartSidebar.innerHTML = `
                <div class="cart-totals p-24 bg-color-three rounded-8 mb-24">
                    <div class="mb-32 flex-between gap-8">
                        <span class="text-gray-900 font-heading-two">Subtotal</span>
                        <span class="text-gray-900 fw-semibold">AED ${cartData.totalProductPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="mb-32 flex-between gap-8">
                        <span class="text-gray-900 font-heading-two">Product Discount</span>
                        <span class="text-success fw-semibold">- AED ${cartData.totalProductDiscount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="mb-32 flex-between gap-8">
                        <span class="text-gray-900 font-heading-two">Shipping</span>
                        <span class="text-gray-900 fw-semibold">AED ${cartData.totalShippingPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="mb-0 flex-between gap-8">
                        <span class="text-gray-900 font-heading-two">Tax</span>
                        <span class="text-gray-900 fw-semibold">AED ${cartData.totalTax?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
                <div class="p-24 bg-color-three rounded-8">
                    <div class="flex-between gap-8">
                        <span class="text-gray-900 text-xl fw-semibold">Total</span>
                        <span class="text-gray-900 text-xl fw-semibold">AED ${(
                            // (cartData.totalProductPrice || 0) - 
                            (cartData.totalProductDiscount || 0) + 
                            (cartData.totalShippingPrice || 0) 
                        ).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }

        this.setupEventListeners();
    }

    generateProductRow(item) {
        const product = item.product;
        if (!product) return '';

        function truncateText(text, wordLimit) {
            const words = text.split(' ');
            return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
        }

        return `
            <tr>
                <td>
                    <button type="button" class="remove-tr-btn flex-align gap-12 hover-text-danger-600">
                        <i class="ph ph-x-circle text-2xl d-flex"></i>Remove
                    </button>
                </td>
                <td>
                    <div class="table-product d-flex align-items-center gap-24">
                        <a href="product-details.html?${product._id}" class="table-product__thumb border border-gray-100 rounded-8 flex-center">
                            <img src="${product.image || ''}" alt="${product.name}">
                        </a>
                        <div class="table-product__content text-start">
                            <h6 class="title text-lg fw-semibold mb-8">
                                <a href="product-details.html?${product._id}" 
                                   data-product-id="${item._id}"
                                   class="link text-line-2">${truncateText(product.name || '', 5)}</a>
                            </h6>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="text-lg h6 mb-0 fw-semibold">AED: ${item.product_discount}</span>
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
                    </div>
                </td>
                <td>
                    <span class="text-lg h6 mb-0 fw-semibold">AED ${(item.product_discount * item.product_quantity)}</span>
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
                        <p class="mb-0">Error loading cart: ${error.message}</p>
                    </td>
                </tr>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Implement your notification logic here
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    async updateAllQuantities() {
        try {
            const quantityInputs = document.querySelectorAll('.quantity_cart');
            const updates = Array.from(quantityInputs).map(input => {
                const row = input.closest('tr');
                const productId = this.getProductIdFromRow(row);
                return {
                    productId,
                    quantity: parseInt(input.value) || 1
                };
            });

            const token = localStorage.getItem('webtoken');
            if (!token) throw new Error('User is not authenticated.');

            const response = await fetch(`${this.baseApiUrl}/update-cart`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ updates })
            });

            if (!response.ok) {
                throw new Error('Failed to update cart quantities');
            }

            await this.fetchCartData();
            this.showNotification('Cart updated successfully', 'success');
        } catch (error) {
            console.error('Error updating quantities:', error);
            this.showNotification(error.message, 'error');
        }
    }
}

// Initialize cart manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new CartManager();
});