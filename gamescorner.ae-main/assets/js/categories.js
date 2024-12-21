// class CategoryManager {
//   constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
//     this.apiBaseUrl = apiBaseUrl;

//     // Bind the method to preserve context
//     this.extractCategoryName = this.extractCategoryName.bind(this);

//     // Safe element selection with fallbacks
//     this.categoriesList =
//       document.getElementById("categoriesList") ||
//       this.createFallbackElement("categoriesList");
//     this.loadingIndicator =
//       document.getElementById("loadingIndicator") ||
//       this.createFallbackElement("loadingIndicator");
//     this.errorMessage =
//       document.getElementById("errorMessage") ||
//       this.createFallbackElement("errorMessage");

//     // Category filter input
//     this.categoryFilter = document.getElementById("categoryFilter");

//     // Breadcrumb navigation
//     this.breadcrumbContainer =
//       document.getElementById("breadcrumbContainer") ||
//       this.createFallbackElement("breadcrumbContainer");

//     // Navigation stack to track category hierarchy
//     this.categoryStack = [];

//     this.gamingCategories = {
//       Monitors: [],
//       Consoles: ["PS5", "Xbox", "Switch", "Portable Consoles", "PS4"],
//       Games: ["PS5 Games", "PS4 Games", "Switch Games", "Xbox Games"],
//       Accessories: [
//         "Gaming Chairs",
//         "Gaming Table",
//         "Keyboard",
//         "Mouse",
//         "Joystick & Controllers",
//         "Mouse Pads",
//       ],
//       "PC Parts": [
//         "Processor",
//         "Motherboard",
//         "RAM",
//         "Graphic Card",
//         "Power Supply",
//       ],
//       "Pre owned": [
//         "Pre owned consoles",
//         "Pre owned games",
//         "Laptops",
//         "i pad",
//       ],
//     };
//     ``;
//     // Add event listener for filtering if the input exists
//     if (this.categoryFilter) {
//       this.categoryFilter.addEventListener("input", (e) =>
//         this.fetchAndRenderCategories(e.target.value)
//       );
//     } else {
//       console.warn(
//         "Category filter input not found. Filtering will be disabled."
//       );
//     }
//   }

//   // Create a fallback element if not found
//   createFallbackElement(id) {
//     const element = document.createElement("div");
//     element.id = id;
//     document.body.appendChild(element);
//     return element;
//   }

//   // Render breadcrumb navigation
//   updateBreadcrumbs() {
//     // Clear existing breadcrumbs
//     this.breadcrumbContainer.innerHTML = "";

//     // Add home/root link
//     const homeLink = document.createElement("span");
//     homeLink.innerHTML = "Home";
//     homeLink.classList.add("breadcrumb-item", "cursor-pointer");
//     homeLink.addEventListener("click", () => this.resetToRootCategories());
//     this.breadcrumbContainer.appendChild(homeLink);

//     // Render breadcrumb trail
//     this.categoryStack.forEach((category, index) => {
//       const separator = document.createElement("span");
//       separator.textContent = " > ";
//       this.breadcrumbContainer.appendChild(separator);

//       const categoryLink = document.createElement("span");
//       categoryLink.textContent = category;
//       categoryLink.classList.add("breadcrumb-item", "cursor-pointer");

//       // Allow navigating to previous levels
//       categoryLink.addEventListener("click", () => {
//         // Remove items after this index
//         this.categoryStack = this.categoryStack.slice(0, index + 1);
//         this.fetchAndRenderCategories(category);
//       });

//       this.breadcrumbContainer.appendChild(categoryLink);
//     });
//   }

//   // Reset to root categories
//   resetToRootCategories() {
//     this.categoryStack = [];
//     this.fetchAndRenderCategories();
//     this.updateBreadcrumbs();
//   }

//   // Fetch categories from the backend
//   async fetchCategories(parentCategory = "", searchTerm = "") {
//     try {

//       // Construct URL with optional parent category and search filter
//       let url = `${this.apiBaseUrl}/category`;
//       const params = new URLSearchParams();

//       if (parentCategory) {
//         params.append("parent_category", parentCategory);
//       }

//       if (searchTerm) {
//         params.append("search", searchTerm);
//       }

//       // Append parameters if they exist
//       if (params.toString()) {
//         url += `?${params.toString()}`;
//       }

//       this.loadingIndicator.style.display = "block";
//       this.categoriesList.innerHTML = "";
//       this.errorMessage.textContent = "";

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();

//       return data.categories || [];
//     } catch (error) {
//       console.error("Fetch error:", error);
//       this.handleError(error);
//       return [];
//     } finally {
//       this.loadingIndicator.style.display = "none";
//     }
//   }

//   // Render categories in the list
//   async fetchAndRenderCategories() {
//     try {
//       const categories = await this.fetchCategories(); 

//       if (!categories || categories.length === 0) {
//         this.categoriesList.innerHTML = `
//                 <li class="text-center text-gray-500 py-4">
//                     No categories found.
//                 </li>`;
//         return;
//       }

//       this.categoriesList.innerHTML = "";       

//       categories.forEach((category) => {
//         const { parent_category, name, icon, _id: parentId  } = category;

//         const mainMenuItem = document.createElement("li");
//         mainMenuItem.classList.add("has-submenus-submenu");
//         const menuLink = document.createElement("a");
//         menuLink.href = name && name.length > 0 
//         ? "javascript:void(0)" 
//         : `shop.html?category=${parentId}`;

//         menuLink.className =
//           "text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0";
//         menuLink.innerHTML = `
//                 <span class="text-xl d-flex">
//                     <img src="${icon}" alt="${parent_category} Icon" class="w-20 h-20">
//                 </span>
//                 <span>${parent_category}</span>
//                 ${
//                   name && name.length > 0
//                     ? `<span class="icon text-md d-flex ms-auto">
//                               <i class="ph ph-caret-right"></i>
//                           </span>`
//                     : ""
//                 }
//             `;

//         mainMenuItem.appendChild(menuLink);

//         // If there are subcategories, create a submenu
//         if (name && name.length > 0) {
//           const submenuContainer = document.createElement("div");
//           submenuContainer.className = "submenus-submenu py-16";

//           const submenuTitle = document.createElement("h6");
//           submenuTitle.className = "text-lg px-16 submenus-submenu__title";
//           submenuTitle.textContent = parent_category;

//           const submenuList = document.createElement("ul");
//           submenuList.className =
//             "submenus-submenu__list max-h-300 overflow-y-auto scroll-sm";

//           name.forEach((subcategory) => {
            
//             const subMenuItem = document.createElement("li");
//             const subMenuLink = document.createElement("a");
//             subMenuLink.href = `shop.html?category=${subcategory._id}`;
//             subMenuLink.textContent = subcategory.value;

//             subMenuItem.appendChild(subMenuLink);
//             submenuList.appendChild(subMenuItem);
//           });

//           submenuContainer.appendChild(submenuTitle);
//           submenuContainer.appendChild(submenuList);

//           mainMenuItem.appendChild(submenuContainer);
//         }

//         this.categoriesList.appendChild(mainMenuItem);
//       });
//     } catch (error) {
//       console.error("Error rendering categories:", error);
//       this.handleError(error);
//     }
//   }

//   // Helper method to extract category name safely
//   extractCategoryName(name) {
//     if (typeof name === "string") {
//       return name;
//     }
//     if (Array.isArray(name)) {
//       return name.map((n) => this.extractCategoryName(n)).join(", ");
//     }
//     if (typeof name === "object" && name !== null) {
//       return Object.values(name)
//         .map((n) => this.extractCategoryName(n))
//         .join(", ");
//     }
//     return "Unnamed Category";
//   }

//   removeCategoryId(name) {
//     return name.replace(/\s*[\[\(]\d+[\]\)]$/, "").trim();
//   }

//   handleError(error) {
//     console.error("Error:", error);
//     this.errorMessage.textContent = `Error: ${error.message}`;
//     this.errorMessage.style.display = "block";
//   }

//   init() {
//     this.fetchAndRenderCategories();
//     const backButton = document.getElementById("backButton");
//     if (backButton) {
//       backButton.addEventListener("click", () => {
//         if (this.categoryStack.length > 1) {
//           this.categoryStack.pop();
//           const previousCategory =
//             this.categoryStack[this.categoryStack.length - 1];
//           this.fetchAndRenderCategories(previousCategory);
//         } else {
//           this.resetToRootCategories();
//         }
//       });
//     }
//   }
// }

// // Initialize when DOM is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const categoryManager = new CategoryManager();
//   categoryManager.init();
// });


// Category Manager Class
// class CategoryManager {
//   constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
//     this.apiBaseUrl = apiBaseUrl;
//     this.categoriesList = document.getElementById("categoriesList");
//     this.errorMessage = document.getElementById("errorMessage");
    
//     // Initialize categories
//     this.init();
//   }

//   async fetchCategories() {
//     try {
//       const response = await fetch(`${this.apiBaseUrl}/category`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       return data.categories || [];
//     } catch (error) {
//       console.error("Fetch error:", error);
//       this.handleError(error);
//       return [];
//     }
//   }

//   async init() {
//     try {
//       const categories = await this.fetchCategories();
//       if (categories.length > 0) {
//         this.renderCategories(categories);
//         this.initializeDropdownBehavior();
//       }
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   renderCategories(categories) {
//     this.categoriesList.innerHTML = categories.map(category => `
//       <li class="has-submenus-submenu">
//         <a href="${category.name && category.name.length > 0 ? 'javascript:void(0)' : `shop.html?category=${category._id}`}" 
//            class="text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0">
//           <span class="text-xl d-flex">
//             <img src="${category.icon}" alt="${category.parent_category} Icon" class="w-20 h-20">
//           </span>
//           <span>${category.parent_category}</span>
//           ${category.name && category.name.length > 0 ? `
//             <span class="icon text-md d-flex ms-auto">
//               <i class="ph ph-caret-right"></i>
//             </span>` : ''}
//         </a>
//         ${category.name && category.name.length > 0 ? `
//           <div class="submenus-submenu py-16">
//             <h6 class="text-lg px-16 submenus-submenu__title">${category.parent_category}</h6>
//             <ul class="submenus-submenu__list max-h-300 overflow-y-auto scroll-sm">
//               ${category.name.map(subcategory => `
//                 <li>
//                   <a href="shop.html?category=${subcategory._id}">${subcategory.value}</a>
//                 </li>
//               `).join('')}
//             </ul>
//           </div>` : ''}
//       </li>
//     `).join('');
//   }

//   handleError(error) {
//     console.error("Error:", error);
//     if (this.errorMessage) {
//       this.errorMessage.textContent = `Error: ${error.message}`;
//       this.errorMessage.style.display = "block";
//     }
//   }

//   initializeDropdownBehavior() {
//     // Mobile menu toggle
//     const categoryButton = document.querySelector('.category__button');
//     const responsiveDropdown = document.querySelector('.responsive-dropdown');
//     const sideOverlay = document.querySelector('.side-overlay');
//     const closeButton = document.querySelector('.close-responsive-dropdown');

//     if (categoryButton) {
//       categoryButton.addEventListener('click', () => {
//         responsiveDropdown?.classList.add('active');
//         sideOverlay?.classList.add('show');
//         document.body.classList.add('scroll-hide-sm');
//       });
//     }

//     if (closeButton) {
//       closeButton.addEventListener('click', () => {
//         responsiveDropdown?.classList.remove('active');
//         sideOverlay?.classList.remove('show');
//         document.body.classList.remove('scroll-hide-sm');
//       });
//     }

//     if (sideOverlay) {
//       sideOverlay.addEventListener('click', () => {
//         responsiveDropdown?.classList.remove('active');
//         sideOverlay?.classList.remove('show');
//         document.body.classList.remove('scroll-hide-sm');
//       });
//     }

//     // Handle submenu interactions
//     const handleSubmenuInteraction = () => {
//       const submenuItems = document.querySelectorAll('.has-submenus-submenu');
      
//       submenuItems.forEach(item => {
//         // For desktop/large screens
//         if (window.innerWidth >= 992) {
//           item.addEventListener('mouseenter', () => {
//             const submenu = item.querySelector('.submenus-submenu');
//             if (submenu) {
//               // Close all other submenus first
//               submenuItems.forEach(otherItem => {
//                 if (otherItem !== item) {
//                   const otherSubmenu = otherItem.querySelector('.submenus-submenu');
//                   if (otherSubmenu) {
//                     otherSubmenu.style.display = 'none';
//                     otherItem.classList.remove('active');
//                   }
//                 }
//               });
              
//               submenu.style.display = 'block';
//               item.classList.add('active');
//             }
//           });

//           item.addEventListener('mouseleave', () => {
//             const submenu = item.querySelector('.submenus-submenu');
//             if (submenu) {
//               submenu.style.display = 'none';
//               item.classList.remove('active');
//             }
//           });
//         }
        
//         // For mobile/tablet screens
//         item.addEventListener('click', (e) => {
//           if (window.innerWidth < 992) {
//             const submenu = item.querySelector('.submenus-submenu');
//             if (submenu) {
//               e.preventDefault();
//               e.stopPropagation();
              
//               // If already active, close it
//               if (item.classList.contains('active')) {
//                 submenu.style.display = 'none';
//                 item.classList.remove('active');
//               } else {
//                 // Close other open submenus
//                 submenuItems.forEach(otherItem => {
//                   if (otherItem !== item) {
//                     const otherSubmenu = otherItem.querySelector('.submenus-submenu');
//                     if (otherSubmenu) {
//                       otherSubmenu.style.display = 'none';
//                       otherItem.classList.remove('active');
//                     }
//                   }
//                 });
                
//                 submenu.style.display = 'block';
//                 item.classList.add('active');
//               }
//             }
//           }
//         });
//       });
//     };

//     // Initialize submenu behavior
//     handleSubmenuInteraction();

//     // Update behavior on window resize
//     window.addEventListener('resize', () => {
//       const submenuItems = document.querySelectorAll('.has-submenus-submenu');
//       submenuItems.forEach(item => {
//         const submenu = item.querySelector('.submenus-submenu');
//         if (submenu) {
//           submenu.style.display = 'none';
//           item.classList.remove('active');
//         }
//       });
//       handleSubmenuInteraction();
//     });
//   }
// }

// // Initialize when DOM is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const categoryManager = new CategoryManager();
// });



class CategoryManager {
  constructor(apiBaseUrl = "https://api.gamescorner.ae/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.categoriesList = document.getElementById("categoriesList");
    this.errorMessage = document.getElementById("errorMessage");
    this.init();
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/category`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("Fetch error:", error);
      this.handleError(error);
      return [];
    }
  }

  async init() {
    try {
      const categories = await this.fetchCategories();
      if (categories.length > 0) {
        this.renderCategories(categories);
        this.initializeDropdownBehavior();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  renderCategories(categories) {
    if (!this.categoriesList) return;
    
    this.categoriesList.innerHTML = "";
    
    categories.forEach(category => {
      const mainMenuItem = document.createElement("li");
      mainMenuItem.classList.add("has-submenus-submenu");
      
      // Create main menu link
      const menuLink = document.createElement("a");
      menuLink.href = category.name && category.name.length > 0 ? 'javascript:void(0)' : `shop.html?category=${category._id}`;
      menuLink.className = "text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0";
      menuLink.innerHTML = `
        <span class="text-xl d-flex">
          <img src="${category.icon}" alt="${category.parent_category} Icon" class="w-20 h-20">
        </span>
        <span>${category.parent_category}</span>
        ${category.name && category.name.length > 0 ? `
          <span class="icon text-md d-flex ms-auto">
            <i class="ph ph-caret-right"></i>
          </span>
        ` : ''}
      `;

      mainMenuItem.appendChild(menuLink);

      // Create submenu if there are subcategories
      if (category.name && category.name.length > 0) {
        const submenuContainer = document.createElement("div");
        submenuContainer.className = "submenus-submenu py-16";
        submenuContainer.style.display = "none";

        const submenuTitle = document.createElement("h6");
        submenuTitle.className = "text-lg px-16 submenus-submenu__title";
        submenuTitle.textContent = category.parent_category;

        const submenuList = document.createElement("ul");
        submenuList.className = "submenus-submenu__list max-h-300 overflow-y-auto scroll-sm";

        category.name.forEach(subcategory => {
          const subMenuItem = document.createElement("li");
          const subMenuLink = document.createElement("a");
          subMenuLink.href = `shop.html?category=${subcategory._id}`;
          subMenuLink.textContent = subcategory.value;
          subMenuLink.className = "subcategory-link";
          
          subMenuItem.appendChild(subMenuLink);
          submenuList.appendChild(subMenuItem);
        });

        submenuContainer.appendChild(submenuTitle);
        submenuContainer.appendChild(submenuList);
        mainMenuItem.appendChild(submenuContainer);
      }

      this.categoriesList.appendChild(mainMenuItem);
    });
  }

  initializeDropdownBehavior() {
    // Mobile menu toggle handlers
    const categoryButton = document.querySelector('.category__button');
    const responsiveDropdown = document.querySelector('.responsive-dropdown');
    const sideOverlay = document.querySelector('.side-overlay');
    const closeButton = document.querySelector('.close-responsive-dropdown');

    const toggleMobileMenu = (show) => {
      if (responsiveDropdown) responsiveDropdown.classList[show ? 'add' : 'remove']('active');
      if (sideOverlay) sideOverlay.classList[show ? 'add' : 'remove']('show');
      document.body.classList[show ? 'add' : 'remove']('scroll-hide-sm');
    };

    categoryButton?.addEventListener('click', () => toggleMobileMenu(true));
    closeButton?.addEventListener('click', () => toggleMobileMenu(false));
    sideOverlay?.addEventListener('click', () => toggleMobileMenu(false));

    // Submenu behavior
    const submenuItems = document.querySelectorAll('.has-submenus-submenu');
    
    submenuItems.forEach(item => {
      const menuLink = item.querySelector('a');
      const submenu = item.querySelector('.submenus-submenu');
      
      if (window.innerWidth >= 992) {
        // Desktop behavior
        item.addEventListener('mouseenter', () => {
          if (submenu) {
            submenu.style.display = 'block';
          }
        });

        item.addEventListener('mouseleave', () => {
          if (submenu) {
            submenu.style.display = 'none';
          }
        });
      } else {
        // Mobile behavior
        if (menuLink && submenu) {
          menuLink.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
              e.preventDefault();
              
              // Close other submenus
              submenuItems.forEach(otherItem => {
                if (otherItem !== item) {
                  const otherSubmenu = otherItem.querySelector('.submenus-submenu');
                  if (otherSubmenu && otherSubmenu.style.display === 'block') {
                    otherSubmenu.style.display = 'none';
                    otherItem.classList.remove('active');
                  }
                }
              });

              // Toggle current submenu
              const isVisible = submenu.style.display === 'block';
              submenu.style.display = isVisible ? 'none' : 'block';
              item.classList.toggle('active');
            }
          });
        }
      }

      // Handle subcategory links
      const subcategoryLinks = item.querySelectorAll('.subcategory-link');
      subcategoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent submenu toggle
        });
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      const isDesktop = window.innerWidth >= 992;
      submenuItems.forEach(item => {
        const submenu = item.querySelector('.submenus-submenu');
        if (submenu) {
          submenu.style.display = 'none';
          item.classList.remove('active');
        }
      });
    });
  }

  handleError(error) {
    console.error("Error:", error);
    if (this.errorMessage) {
      this.errorMessage.textContent = `Error: ${error.message}`;
      this.errorMessage.style.display = "block";
    }
  }
}

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const categoryManager = new CategoryManager();
});