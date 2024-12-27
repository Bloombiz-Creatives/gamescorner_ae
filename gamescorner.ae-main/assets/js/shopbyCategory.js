document.addEventListener('DOMContentLoaded', () => {
    const shopButtons = document.querySelectorAll('.shop-now');
    
    // Cache for category data to avoid multiple API calls
    let categoryCache = null;
    
    // Function to fetch and cache categories
    async function fetchCategories() {
        if (categoryCache) {
            return categoryCache;
        }

        try {
            const response = await fetch('https://api.gamescorner.ae/api/category');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            categoryCache = data.categories;
            return categoryCache;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Function to find category by name
    function findCategory(categories, searchName) {
        // Normalize the search name
        const normalizedSearch = searchName.toLowerCase().trim();

        // First try to find as parent category
        let category = categories.find(cat => 
            cat.parent_category.toLowerCase().trim() === normalizedSearch
        );

        // If not found as parent, search in subcategories
        if (!category) {
            category = categories.find(cat => 
                cat.name.some(subCat => 
                    subCat.value.toLowerCase().trim() === normalizedSearch
                )
            );
        }

        return category;
    }

    // Function to find subcategory by name
    function findSubcategory(category, subcategoryName) {
        if (!category || !category.name) return null;
        
        return category.name.find(subCat => 
            subCat.value.toLowerCase().trim() === subcategoryName.toLowerCase().trim()
        );
    }

    // Function to handle navigation
    function navigateToShop(categoryId, subcategoryId = null) {
        const baseUrl = '/shop.html';
        const params = new URLSearchParams();
        
        if (categoryId) {
            params.append('category', categoryId);
        }
        
        if (subcategoryId) {
            params.append('subcategory', subcategoryId);
        }

        const url = params.toString() 
            ? `${baseUrl}?${params.toString()}`
            : baseUrl;

        window.location.href = url;
    }

    // Handle loading state
    function setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Setup click handlers for shop buttons
    shopButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            setLoadingState(button, true);

            try {
                // Get category name from data attribute or title
                const categoryElement = button.closest('.promotional-banner-item')
                    .querySelector('.promotional-banner-item__title');
                const categoryName = categoryElement.textContent.trim();
                const dataCategory = button.dataset.category;

                // Fetch categories
                const categories = await fetchCategories();

                // Try to find the category
                let category;
                if (dataCategory) {
                    // First try using data-category attribute
                    category = findCategory(categories, dataCategory);
                }
                if (!category) {
                    // Fall back to title text if data-category didn't match
                    category = findCategory(categories, categoryName);
                }

                if (category) {
                    // Special handling for specific categories
                    if (categoryName.toLowerCase().includes('gaming chair')) {
                        const subcategory = findSubcategory(category, 'gaming chairs');
                        if (subcategory) {
                            navigateToShop(category._id, subcategory._id);
                            return;
                        }
                    }

                    // For monitors category
                    if (categoryName.toLowerCase().includes('monitor')) {
                        const subcategory = findSubcategory(category, 'monitors');
                        if (subcategory) {
                            navigateToShop(category._id, subcategory._id);
                            return;
                        }
                    }

                    // Default navigation with just category ID
                    navigateToShop(category._id);
                } else {
                    console.warn(`Category not found for: ${categoryName}`);
                    navigateToShop(); // Navigate to shop without parameters
                }
            } catch (error) {
                console.error('Error processing category navigation:', error);
                // Show user-friendly error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message text-danger mt-2';
                errorMessage.textContent = 'Unable to load category. Please try again later.';
                button.parentNode.appendChild(errorMessage);
                
                // Remove error message after 3 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 3000);
            } finally {
                setLoadingState(button, false);
            }
        });
    });
});