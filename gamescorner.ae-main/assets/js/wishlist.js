class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.wishlistCountElement = document.querySelector('.wishlist .notification-badge');
        this.initEventListeners();
    }

    // Fetch wishlist from backend
    async fetchWishlist() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/wish', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wishlist');
            }

            const data = await response.json();
            this.wishlist = data.data || [];
            this.updateWishlistCount();
            this.renderWishlistPage();
        } catch (error) {
            this.showNotification('Failed to fetch wishlist', 'error');
            console.error('Wishlist fetch error:', error);
        }
    }

    // Update wishlist count in UI
    updateWishlistCount() {
        const wishlistIcons = document.querySelectorAll('.wishlist .notification-badge');
        wishlistIcons.forEach(icon => {
            icon.textContent = this.wishlist.length;
        });
    }

    // Add item to wishlist
    async addToWishlist(productId) {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            this.showNotification('Please log in to add to wishlist', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/wish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message === 'Product already in wishlist') {
                    this.showNotification('Product already in wishlist', 'warning');
                    return;
                }
                throw new Error('Failed to add to wishlist');
            }

            const data = await response.json();
            this.wishlist = data.data || [];
            this.updateWishlistCount();
            
            // Update wishlist icon to indicate added state
            const wishlistIcon = document.querySelector(`.add-to-wishlist[data-product-id="${productId}"]`);
            if (wishlistIcon) {
                wishlistIcon.classList.add('in-wishlist');
            }

            // Show success notification
            this.showNotification('Product added to wishlist', 'success');
        } catch (error) {
            this.showNotification('Failed to add to wishlist', 'error');
            console.error('Add to wishlist error:', error);
        }
    }

    // Remove item from wishlist
    async removeFromWishlist(productId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/wish/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove from wishlist');
            }

            const data = await response.json();
            this.wishlist = data.data || [];
            this.updateWishlistCount();

            // Update wishlist icon to indicate removed state
            const wishlistIcon = document.querySelector(`.add-to-wishlist[data-product-id="${productId}"]`);
            if (wishlistIcon) {
                wishlistIcon.classList.remove('in-wishlist');
            }

            this.showNotification('Product removed from wishlist', 'success');
            this.renderWishlistPage();
        } catch (error) {
            this.showNotification('Failed to remove from wishlist', 'error');
            console.error('Remove from wishlist error:', error);
        }
    }

    // Show enhanced notification (same as before)
    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.wishlist-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = 'wishlist-notification';
        
        // Set color based on type
        const colorMap = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${colorMap[type] || '#4CAF50'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1100;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            transform: translateX(100%);
            opacity: 0;
        `;

        // Add icon based on type
        const iconMap = {
            success: '✓',
            error: '✗',
            warning: '!'
        };

        notification.innerHTML = `
            <span style="font-size: 20px; font-weight: bold;">${iconMap[type]}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Remove notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Render wishlist page (same as before)
    renderWishlistPage() {
        const wishlistContainer = document.querySelector('.cart-table tbody');
        if (!wishlistContainer) return;

        // Clear existing wishlist items
        wishlistContainer.innerHTML = '';

        // Populate wishlist
        this.wishlist.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <button class="remove-from-wishlist" data-product-id="${product._id}">Clear</button>
                </td>
                <td>
                    <div class="table-product d-flex align-items-center gap-24">
                        <a href="#" class="table-product__thumb border border-gray-100 rounded-8 flex-center">
                            <img src="${product.images && product.images[0] ? product.images[0] : ''}" alt="${product.name}" class="product-image">
                        </a>
                        <div class="table-product__content text-start">
                            <h6 class="title text-lg fw-semibold mb-8 product-title">${product.name}</h6>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="text-lg h6 mb-0 fw-semibold product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</span>
                </td>
            `;
            wishlistContainer.appendChild(row);
        });
    }

    // Initialize event listeners with additional check for wishlist icon state
    initEventListeners() {
        document.addEventListener('click', (event) => {
            const wishlistBtn = event.target.closest('.add-to-wishlist');
            if (wishlistBtn) {
                event.preventDefault();
                const productId = wishlistBtn.closest('.product-card').dataset.productId;
                
                // Check if product is already in wishlist
                const isInWishlist = this.wishlist.some(item => item._id === productId);
                
                if (isInWishlist) {
                    this.removeFromWishlist(productId);
                } else {
                    this.addToWishlist(productId);
                }
            }

            // Remove from wishlist page
            const removeWishlistBtn = event.target.closest('.remove-from-wishlist');
            if (removeWishlistBtn) {
                const productId = removeWishlistBtn.dataset.productId;
                this.removeFromWishlist(productId);
            }
        });
    }

    // Initialize wishlist
    init() {
        // Fetch wishlist if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            this.fetchWishlist();
        }

        // If on wishlist page, render wishlist
        if (window.location.pathname.includes('wishlist.html')) {
            this.renderWishlistPage();
        }
    }
}

// Initialize wishlist manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    const wishlistManager = new WishlistManager();
    wishlistManager.init();
});

export default WishlistManager;

// Add some CSS to style the wishlist icon
const style = document.createElement('style');
style.textContent = `
    .add-to-wishlist.in-wishlist i {
        color: red;  /* Change color when product is in wishlist */
    }
`;
document.head.appendChild(style);