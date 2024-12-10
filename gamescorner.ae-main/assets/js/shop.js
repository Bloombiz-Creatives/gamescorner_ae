class ProductListing {
    constructor() {
        this.baseUrl = 'https://api.gamescorner.ae/api/productweb';
        this.currentPage = 1;
        this.productsPerPage = 20;
        this.allProducts = [];
        this.totalProducts = 0;
        this.selectedFilters = {
            parentCategory: '',
            subCategory: '',
            brand: ''
        };
        this.initEventListeners();
        this.fetchInitialData();
        this.parseUrlParameters();
    }

    parseUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        // const categoryId = urlParams.get('category');
        const categoryId = urlParams.get('id') || urlParams.get('category');
        const brandId = urlParams.get('brand');

        if (categoryId) {
            this.pendingCategorySelection = categoryId;
        }
        if (brandId) {
            this.pendingBrandSelection = brandId;
        }
    }

    async fetchInitialData() {
        await Promise.all([
            this.fetchCategories(),
            this.fetchBrands(),
            this.fetchProducts()
        ]);
    }

    initEventListeners() {
        // Sort filter listener
        const sortFilter = document.getElementById('sortFilter');

        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.fetchProducts();
            });
        }

        // Clear filter button listener
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => this.clearFilters());
        }

        // Radio button change listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                switch (e.target.name) {
                    case 'parentcategory':
                        this.selectedFilters.parentCategory = e.target.value;
                        break;
                    case 'subcategory':
                        this.selectedFilters.subCategory = e.target.value;
                        break;
                    case 'brand':
                        this.selectedFilters.brand = e.target.value;
                        break;
                }
                this.currentPage = 1;
                this.fetchProducts();
            }
        });
    }

    async fetchCategories() {
        try {
            const response = await fetch('https://api.gamescorner.ae/api/category');
            const data = await response.json();

            if (data.success && data.categories) {
                this.renderParentCategories(data.categories);
                this.renderSubCategories(data.categories);

                if (this.pendingCategorySelection) {
                    this.selectCategoryFromId(data.categories, this.pendingCategorySelection);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.showError('categoryList');
            this.showError('parentcat_list');
        }
    }

    selectCategoryFromId(categories, categoryId) {
        const parentCategory = categories.find(cat => cat._id === categoryId);
        if (parentCategory) {
            const parentRadio = document.getElementById(`parentcategory-${categoryId}`);
            if (parentRadio) {
                parentRadio.checked = true;
                this.selectedFilters.parentCategory = categoryId;
                this.fetchProducts();
                return;
            }
        }
    
        for (const category of categories) {
            if (category.name && Array.isArray(category.name)) {
                const subCategory = category.name.find(sub => sub._id === categoryId);
                if (subCategory) {
                    const parentRadio = document.getElementById(`parentcategory-${category._id}`);
                    if (parentRadio) {
                        parentRadio.checked = true;
                        this.selectedFilters.parentCategory = category._id;
                    }
    
                    const subRadio = document.getElementById(`subcategory-${categoryId}`);
                    if (subRadio) {
                        subRadio.checked = true;
                        this.selectedFilters.subCategory = categoryId;
                    }
    
                    this.fetchProducts();
                    return;
                }
            }
        }
    }

    async fetchBrands() {
        try {
            const response = await fetch('https://api.gamescorner.ae/api/brand');
            const data = await response.json();

            if (data.success && data.brands) {
                this.renderBrands(data.brands);

                if (this.pendingBrandSelection) {
                    this.selectBrandFromId(data.brands, this.pendingBrandSelection);
                }
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            this.showError('brandList');
        }
    }

    selectBrandFromId(brands, brandId) {
        const brand = brands.find(b => b._id === brandId);
        if (brand) {
            const brandRadio = document.getElementById(`brand-${brandId}`);
            if (brandRadio) {
                brandRadio.checked = true;
                this.selectedFilters.brand = brandId;
                this.fetchProducts();
            }
        }
    }

    renderBrands(brands) {
        const brandList = document.getElementById('brandList');
        if (!brandList) return;

        brandList.innerHTML = brands.map(brand => `
            <li class="mb-24">
                <div class="form-check common-check common-radio">
                    <input type="radio" name="brand" 
                           id="brand-${brand._id}" 
                           value="${brand._id}" 
                           class="form-check-input">
                    <label class="form-check-label" for="brand-${brand._id}">
                        ${brand.name || 'Unnamed Brand'}
                    </label>
                </div>
            </li>
        `).join('');

        if (this.pendingBrandSelection) {
            const brandRadio = document.getElementById(`brand-${this.pendingBrandSelection}`);
            if (brandRadio) {
                brandRadio.checked = true;
                this.selectedFilters.brand = this.pendingBrandSelection;
                this.fetchProducts();
            }
        }
    }

    renderParentCategories(categories) {
        const parentList = document.getElementById('parentcat_list');
        if (!parentList) return;

        const parentCategories = categories.filter(category =>
            category.parent_category ||
            category.isParent ||
            (category.type && category.type.toLowerCase() === 'parent')
        );

        parentList.innerHTML = parentCategories.map(category => `
            <li class="mb-24">
                <div class="form-check common-check common-radio">
                    <input type="radio" name="parentcategory" 
                           id="parentcategory-${category._id}" 
                           value="${category._id}" 
                           class="form-check-input">
                    <label class="form-check-label" for="parentcategory-${category._id}">
                        ${category.parent_category || category.name || 'Unnamed Category'}
                    </label>
                </div>
            </li>
        `).join('');
    }

    renderSubCategories(categories) {
        const subList = document.getElementById('categoryList');
        if (!subList) return;

        const subCategories = categories.flatMap(category =>
            category.name && Array.isArray(category.name) ? category.name : []
        );

        subList.innerHTML = subCategories.map(subCat => `
            <li class="mb-24">
                <div class="form-check common-check common-radio">
                    <input type="radio" name="subcategory" 
                           id="subcategory-${subCat._id}" 
                           value="${subCat._id}" 
                           class="form-check-input">
                    <label class="form-check-label" for="subcategory-${subCat._id}">
                        ${subCat.value || 'Unnamed Sub-Category'}
                    </label>
                </div>
            </li>
        `).join('');
    }

    renderBrands(brands) {
        const brandList = document.getElementById('brandList');
        if (!brandList) return;

        brandList.innerHTML = brands.map(brand => `
            <li class="mb-24">
                <div class="form-check common-check common-radio">
                    <input type="radio" name="brand" 
                           id="brand-${brand._id}" 
                           value="${brand._id}" 
                           class="form-check-input">
                    <label class="form-check-label" for="brand-${brand._id}">
                        ${brand.name || 'Unnamed Brand'}
                    </label>
                </div>
            </li>
        `).join('');
    }

    async fetchProducts() {
        try {
            const sortFilter = document.getElementById('sortFilter');
            let url = new URL(this.baseUrl);
            let params = new URLSearchParams();

            if (this.selectedFilters.parentCategory) {
                params.append('parent_category', this.selectedFilters.parentCategory);
            }
            if (this.selectedFilters.subCategory) {
                params.append('sub_category', this.selectedFilters.subCategory);
            }
            if (this.selectedFilters.brand) {
                params.append('brand', this.selectedFilters.brand);
            }

            if (sortFilter) {
                const sortValue = sortFilter.value.toLowerCase();
                if (sortValue === 'price-low') {
                    params.append('sort', 'price_asc');
                } else if (sortValue === 'price-high') {
                    params.append('sort', 'price_desc');
                } else if (sortValue === 'featured') {
                    params.append('featured', 'true');
                } else if (sortValue === "today's deal") {
                    params.append('todaysDeal', 'true');
                }
            }

            params.append('page', this.currentPage.toString());
            params.append('limit', this.productsPerPage.toString());

            url.search = params.toString();
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.allProducts = data.products;
                this.totalProducts = this.allProducts.count || this.allProducts.length;
                this.renderProducts(this.getPaginatedProducts());
                this.renderPagination();
                this.renderResultsCount();
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            this.showError('productGrid');
        }
    }

    clearFilters() {
        this.selectedFilters = {
            parentCategory: '',
            subCategory: '',
            brand: '',
        };
        document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
        const sortFilter = document.getElementById('sorting');
        if (sortFilter) sortFilter.value = '1';

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

        this.currentPage = 1;
        this.fetchProducts();
    }

    sortProducts(products, sortMethod) {
        switch (sortMethod) {
            case 'price-low':
                return [...products].sort((a, b) => this.extractPrice(a) - this.extractPrice(b));
            case 'price-high':
                return [...products].sort((a, b) => this.extractPrice(b) - this.extractPrice(a));
            case 'featured':
                return [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            default:
                return products;
        }
    }

    extractPrice(product) {
        if (product.country_pricing?.[0]?.price) {
            return parseFloat(product.country_pricing[0].price) || 0;
        }
        const priceMatch = product.description?.match(/\$(\d+(\.\d{1,2})?)/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    }

    renderProducts(products) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<div class="col-span-3 text-center py-8">No products found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const imageUrl = product.image || '/placeholder.jpg';
        const aedPricing = product.country_pricing.find(pricing => pricing.currency_code === 'AED');
        const price = aedPricing?.unit_price || 'N/A';
        const discount = aedPricing?.discount || 'N/A';
        const currencyCode = aedPricing ? aedPricing.currency_code : 'N/A';


        return `
            <div class="product-card h-100 p-4 border border-gray-200 rounded-lg hover:border-blue-600 transition-all">
                 <a href="product-details.html?id=${product._id}" class="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative">
                <img src="${imageUrl}" alt="${product.name}" class="w-auto ">
                ${product.todaysDeal ?
                '<span class="product-card__badge bg-primary-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">Today\'s Deal</span>' :
                ''}
                 </a>
                 <div class="product-card__content mt-16">
                <h6 class="title text-lg fw-semibold mt-12 mb-8">
                    <a href="product-details.html" class="link text-line-2">${product.name}</a>
                </h6>
                <div class="product-card__price my-20">
                      <span class="text-gray-400 text-md fw-semibold text-decoration-line-through">AED ${price}</span>
                      <span class="text-heading text-md fw-semibold ">AED ${discount}<span
                      class="text-gray-500 fw-normal"></span> </span>
                 </div>
                  <a href="" class="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium" tabindex="0" data-product-id="${product._id}" data-product-price="${price}" data-product-discount="${discount}" data-product-currencycode="${currencyCode}" data-product-quantity="1"  onClick="handleAddToCart(event)">
                        Add To Cart <i class="ph ph-shopping-cart"></i>
                    </a>
                </div>
            </div>
                
        `;
    }

    renderResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (!resultsCount) return;

        const start = (this.currentPage - 1) * this.productsPerPage + 1;
        const end = Math.min(this.currentPage * this.productsPerPage, this.totalProducts);

        resultsCount.textContent = `Showing ${start}-${end} of ${this.totalProducts} results`;
    }

    getPaginatedProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        return this.allProducts.slice(startIndex, endIndex);
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.totalProducts / this.productsPerPage);
        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}">
                 <button class="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100" onclick="productListing.changePage(${this.currentPage - 1})">
                 <i class="ph-bold ph-arrow-left"></i>
                </button>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${this.currentPage === i ? 'active' : ''}">
                    <button class="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100" onclick="productListing.changePage(${i})">${i}</button>
                </li>
            `;
        }

        // Next button
        paginationHTML += `
             <li class="page-item ${this.currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}">
                <button class="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100" onclick="productListing.changePage(${this.currentPage + 1})">
                    <i class="ph-bold ph-arrow-right"></i>
                </button>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderProducts(this.getPaginatedProducts());
        this.renderPagination();
        this.renderResultsCount();
    }

    showError(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-red-500 p-4">
                    Unable to load data. Please try again later.
                </div>
            `;
        }
    }
}

// Initialize the product listing
let productListing;
document.addEventListener('DOMContentLoaded', () => {
    productListing = new ProductListing();
});

function handleAddToCart(event) {
    event.preventDefault();

    const webtoken = localStorage.getItem('webtoken');
    if (!webtoken) {
        alert('Please login first');
        window.location.href = "account.html";
        return;
    }

    const button = event.target.closest('a');
    if (!button) {
        console.error('Unable to find the button element.');
        return;
    }

    const productId = button.getAttribute('data-product-id');
    const productPrice = button.getAttribute('data-product-price');
    const productDiscount = button.getAttribute('data-product-discount');
    const productCurrencyCode = button.getAttribute('data-product-currencycode');
    const productQuantity = button.getAttribute('data-product-quantity') || 1;

    const productData = {
        productId,
        product_currecy_code: productCurrencyCode,
        product_quantity: parseInt(productQuantity, 10),
        product_price: parseFloat(productPrice),
        product_discount: parseFloat(productDiscount)
    };

    fetch('https://api.gamescorner.ae/api/web_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webtoken}` // Ensure this matches your backend expectation
        },
        body: JSON.stringify(productData),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(text || 'Network response was not ok');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Product added to cart:', data);
            alert('Product added to cart!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error occurred while adding the product to the cart: ' + error.message);
        });
}
