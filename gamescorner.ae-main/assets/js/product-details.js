// document.addEventListener("DOMContentLoaded", function () {
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = urlParams.get("id");

//   if (!productId) {
//     console.error("No product ID found in URL");
//     window.location.href = "shop.html";
//     return;
//   }

//   // Fetch product details
//   async function fetchProductDetails() {
//     try {
//       const response = await fetch(
//         `http://localhost:5002/api/product/${productId}`
//       );

//       // Check if response is okay
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         const product = data.product;
//         updateProductDetails(product);
//         setupImageGallery(product);
//         setupWhatsAppSharing(product);
//         handleAddToCart(product);
//         setupProductInteractions(product);

//         if (product.parent_category?.[0]) {
//           fetchRelatedProducts(product.parent_category[0]._id);
//         } else {
//           console.warn("No parent category available for related products");
//         }
//       } else {
//         console.error("Failed to fetch product details");
//       }
//     } catch (error) {
//       console.error("Error fetching product details:", error);
//     }
//   }

//   function updateProductDetails(product) {
//     // Update product name
//     document.querySelector(".product-details__content h5").textContent =
//       product.name;

//     const productNameElement = document.getElementById("product-name");
//     if (productNameElement) {
//       productNameElement.textContent = product.name;
//     }

//     const descriptionElement = document.getElementById("productdescription");
//     if (descriptionElement) {
//       descriptionElement.textContent =
//         stripHtmlTags(product.description) || "No description available.";
//     }

//     // Update description
//     document.querySelector(".product-details__content p").textContent =
//       product.description
//         ? stripHtmlTags(product.description)
//         : "No description available.";

//     // Update pricing (using first country pricing for AED)
//     const aedPricing =
//       product.country_pricing.find((p) => p.currency_code === "AED") ||
//       product.country_pricing[0];
//     const currentPrice = aedPricing ? aedPricing.discount : product.price;
//     const originalPrice = aedPricing
//       ? aedPricing.unit_price
//       : currentPrice * 1.5;

//     const priceContainer = document.querySelector(
//       ".mt-32.flex-align.flex-wrap.gap-32"
//     );
//     priceContainer.querySelector(
//       "h4"
//     ).textContent = `AED ${currentPrice.toFixed(2)}`;
//     priceContainer.querySelector(
//       ".text-md.text-gray-500"
//     ).textContent = `AED ${originalPrice.toFixed(2)}`;

//     // Update stock progress
//     const stockProgress = document.querySelector(".progress-bar");
//     const availableStock = product.quantity || 45;
//     const totalStock = 100;
//     const stockPercentage = (availableStock / totalStock) * 100;

//     stockProgress.style.width = `${stockPercentage}%`;
//     document.querySelector(
//       ".text-sm.text-gray-700"
//     ).textContent = `Available only: ${availableStock}`;

//     // Update product specifications
//     updateProductSpecifications(product);
//   }

//   function stripHtmlTags(html) {
//     const temp = document.createElement("div");
//     temp.innerHTML = html;
//     return temp.textContent || temp.innerText || "";
//   }

//   function setupImageGallery(product) {
//     const mainImageContainer = document.querySelector(
//       ".product-details__thumb-slider"
//     );
//     const thumbnailContainer = document.querySelector(
//       ".product-details__images-slider"
//     );

//     // Clear existing content
//     mainImageContainer.innerHTML = "";
//     thumbnailContainer.innerHTML = "";

//     // Get all valid images (filter out empty strings)
//     const images = [
//       product.image,
//       product.gallery1,
//       product.gallery2,
//       product.gallery3,
//       product.gallery4,
//       product.gallery5,
//     ].filter((img) => img && img.trim() !== "");

//     // If no images available, set a default image
//     if (images.length === 0) {
//       images.push("/assets/images/default-product.png");
//     }

//     // Set up main image
//     const mainImageDiv = document.createElement("div");
//     mainImageDiv.innerHTML = `
//             <div class="product-details__thumb flex-center h-100">
//                 <img src="${images[0]}"
//                      alt="Main product image"
//                      onerror="this.src='/assets/images/default-product.png'"
//                      class="main-product-image"
//                      style="max-width: 100%; height: auto; object-fit: contain;">
//             </div>
//         `;
//     mainImageContainer.appendChild(mainImageDiv);

//     // Create thumbnail container
//     const thumbnailWrapperDiv = document.createElement("div");
//     thumbnailWrapperDiv.className = "mt-24";
//     thumbnailContainer.appendChild(thumbnailWrapperDiv);

//     // Create thumbnail slider
//     const sliderDiv = document.createElement("div");
//     sliderDiv.className = "thumbnail-slider";
//     thumbnailWrapperDiv.appendChild(sliderDiv);

//     // Add thumbnails
//     images.forEach((img, index) => {
//       const thumbnailDiv = document.createElement("div");
//       thumbnailDiv.className = "thumbnail-item cursor-pointer";
//       thumbnailDiv.innerHTML = `
//                 <div>
//                 <div class="max-w-120 max-h-120 h-100 flex-center border border-gray-100 rounded-16 p-8 m-2">
//                     <img src="${img}"
//                          alt="Product thumbnail ${index + 1}"
//                          data-image="${img}"
//                          onerror="this.src='/assets/images/default-product.png'"
//                          style="max-width: 100%; height: auto; object-fit: contain;">
//                 </div>
//                 </div>
//             `;
//       sliderDiv.appendChild(thumbnailDiv);

//       // Add click handler for each thumbnail
//       thumbnailDiv.addEventListener("click", function () {
//         // Update main image
//         const mainImage = document.querySelector(".main-product-image");
//         mainImage.src = img;

//         // Update active state
//         document.querySelectorAll(".thumbnail-item").forEach((thumb) => {
//           thumb.classList.remove("active");
//         });
//         thumbnailDiv.classList.add("active");
//       });
//     });

//     // Initialize Slick slider
//     try {
//       $(".thumbnail-slider").slick({
//         slidesToShow: 4,
//         slidesToScroll: 1,
//         arrows: true,
//         infinite: false,
//         prevArrow:
//           '<button type="button" class="slick-prev w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"><i class="ph ph-arrow-left"></i></button>',
//         nextArrow:
//           '<button type="button" class="slick-next w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"><i class="ph ph-arrow-right"></i></button>',
//         responsive: [
//           {
//             breakpoint: 992,
//             settings: {
//               slidesToShow: 3,
//             },
//           },
//           {
//             breakpoint: 768,
//             settings: {
//               slidesToShow: 2,
//             },
//           },
//         ],
//       });

//       document.querySelector(".thumbnail-item")?.classList.add("active");
//     } catch (error) {
//       console.warn("Slick slider initialization failed:", error);
//     }
//   }

//   const facebookButton = document.getElementById("facebook");
//   const currentURL = encodeURIComponent(window.location.href);
//   facebookButton.href = `https://www.facebook.com/sharer/sharer.php?u=${currentURL}`;

//   const whatsappButton = document.getElementById("whatsapp");
//   whatsappButton.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(
//     "Check this out: " + window.location.href
//   )}`;

//   function setupWhatsAppSharing(product) {
//     const whatsappButton = document.getElementById("whatsapp-order");

//     whatsappButton.addEventListener("click", (e) => {
//       e.preventDefault();
//       const quantity = document.querySelector(".quantity__input").value;
//       const aedPricing =
//         product.country_pricing.find((p) => p.currency_code === "AED") ||
//         product.country_pricing[0];

//       let message = `I'm interested in ${product.name}\n`;
//       message += `Price: AED ${
//         aedPricing ? aedPricing.discount : product.price
//       }\n`;
//       message += `Quantity: ${quantity}\n`;
//       message += `Description: ${stripHtmlTags(product.description)}\n`;
//       message += `image: ${stripHtmlTags(product.image)}\n`;
//       message += `tax: AED ${
//         aedPricing ? aedPricing.tax_amount : product.tax_amount
//       }\n`;
//       message += `Shipping Price: AED ${
//         aedPricing ? aedPricing.shipping_time : product.shipping_price
//       }\n`;
//       message += `Shipping Time: ${
//         aedPricing ? aedPricing.shipping_price : product.shipping_time
//       }\n`;

//       const encodedMessage = encodeURIComponent(message)
//         .replace(/%0A/g, "%0A")
//         .replace(/%20/g, "+");

//       const phoneNumber = "918086835242";

//       function generateWhatsAppUrls(phoneNumber, message) {
//         return [
//           `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`,
//           `whatsapp://send?phone=${phoneNumber}&text=${message}`,
//           `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`,
//         ];
//       }

//       // Advanced device detection and URL handling
//       function openWhatsApp(urls) {
//         const userAgent = navigator.userAgent.toLowerCase();
//         const isMobile =
//           /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
//             userAgent
//           );

//         // Prioritize URLs based on device
//         const urlsToTry = isMobile
//           ? [urls[0], urls[1], urls[2]] // Mobile priority
//           : [urls[2], urls[0]]; // Desktop priority

//         function attemptOpen(index = 0) {
//           if (index >= urlsToTry.length) {
//             navigator.clipboard
//               .writeText(message)
//               .then(() => {
//                 alert("Could not open WhatsApp. Message copied to clipboard.");
//               })
//               .catch(() => {
//                 alert(
//                   "Unable to open WhatsApp. Please copy the message manually."
//                 );
//               });
//             return;
//           }

//           const url = urlsToTry[index];

//           const link = document.createElement("a");
//           link.href = url;
//           link.style.display = "none";
//           document.body.appendChild(link);

//           try {
//             link.click();

//             setTimeout(() => {
//               document.body.removeChild(link);
//             }, 100);
//           } catch (error) {
//             console.error(`Failed to open URL: ${url}`, error);
//             attemptOpen(index + 1);
//           }
//         }
//         attemptOpen();
//       }

//       const whatsappUrls = generateWhatsAppUrls(phoneNumber, encodedMessage);
//       openWhatsApp(whatsappUrls);
//     });
//   }

//   function updateProductSpecifications(product) {
//     const aedPricing =
//       product.country_pricing?.find((p) => p.currency_code === "AED") ||
//       product.country_pricing?.[0];
//     const specsList = document.querySelector(".product-dContent__box ul");
//     const colorSection = document.querySelector(
//       ".flex-between.align-items-start.flex-wrap.gap-16"
//     );

//     const specifications = [
//       { label: "Product Type", value: product.product_type || "N/A" },
//       { label: "Brand", value: product.brand?.[0]?.name || "N/A" },
//       {
//         label: "Category",
//         value: product.parent_category?.[0]?.parent_category || "N/A",
//       },
//       { label: "Unit", value: product.unit || "N/A" },
//       { label: "Weight", value: product.weight || "N/A" },
//       { label: "Attribute", value: product.attribute?.[0]?.name || "N/A" },
//       { label: "Color", value: product.color?.[0]?.name || "N/A" },
//       {
//         label: "Shipping Time",
//         value: `${aedPricing?.shipping_time || product.shipping_time || "N/A"}`,
//       },
//       {
//         label: "Shipping Price",
//         value: `AED ${
//           aedPricing?.shipping_price || product.shipping_price || "N/A"
//         }`,
//       },
//       {
//         label: "Tax",
//         value: `${
//           aedPricing?.tax_percentage
//             ? `${aedPricing.tax_percentage}%`
//             : product.tax_percentage
//             ? `${product.tax_percentage}%`
//             : "N/A"
//         }`,
//       },
//     ];

//     specsList.innerHTML = specifications
//       .map(
//         (spec) => `
//             <li class="text-gray-400 mb-14 flex-align gap-14">
//                 <span class="w-20 h-20 bg-main-50 text-main-600 text-xs flex-center rounded-circle">
//                     <i class="ph ph-check"></i>
//                 </span>
//                 <span class="text-heading fw-medium">
//                     ${spec.label}:
//                     <span class="text-gray-500">${spec.value}</span>
//                 </span>
//             </li>
//         `
//       )
//       .join("");

//     if (colorSection) {
//       if (product.color && product.color.length > 0) {
//         const colorLabelSpan = colorSection.querySelector("span.fw-medium");
//         if (colorLabelSpan) {
//           colorLabelSpan.textContent = product.color[0].name || "N/A";
//         }

//         const colorContainer = colorSection.querySelector(".color-list");
//         if (colorContainer) {
//           colorContainer.innerHTML = "";

//           product.color.forEach((color) => {
//             const colorButton = document.createElement("button");
//             colorButton.type = "button";
//             colorButton.className =
//               "color-list__button w-20 h-20 border border-2 border-gray-50 rounded-circle";
//             colorButton.style.backgroundColor = color.color_code || "#000000";
//             colorButton.title = color.name;
//             colorContainer.appendChild(colorButton);
//           });
//         }
//         colorSection.style.display = "flex";
//       } else {
//         colorSection.style.display = "none";
//       }
//     }
//   }

//   async function fetchRelatedProducts(parentCategory) {
//     try {
//       const response = await fetch(
//         `http://localhost:5002/api/productweb?parent_category=${encodeURIComponent(
//           parentCategory
//         )}`
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success && data.products && data.products.length > 0) {
//         const currentProductId = new URLSearchParams(
//           window.location.search
//         ).get("id");
//         const relatedProducts = data.products.filter(
//           (product) => product._id !== currentProductId
//         );

//         displayRelatedProducts(relatedProducts);
//       } else {
//         console.warn("No related products found");
//       }
//     } catch (error) {
//       console.error("Error fetching related products:", error);
//     }
//   }

//   function displayRelatedProducts(products) {
//     const relatedProductsContainer = document.querySelector(
//       ".new-arrival__slider"
//     );
//     if (!relatedProductsContainer) {
//       console.error("No container found for related products");
//       return;
//     }

//     // First destroy existing slick instance if it exists
//     if ($(relatedProductsContainer).hasClass("slick-initialized")) {
//       $(relatedProductsContainer).slick("unslick");
//     }

//     // Clear any existing content
//     relatedProductsContainer.innerHTML = "";

//     // Limit to max 5 related products
//     const limitedProducts = products.slice(0, 5);

//     // Create product cards directly in the container (remove the extra wrapper div)
//     limitedProducts.forEach((product) => {
//       const productCard = document.createElement("div");
//       productCard.className =
//         "product-card h-100 p-8 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2";

//       // Ensure pricing is handled correctly
//       const aedPricing =
//         product.country_pricing?.find((p) => p.currency_code === "AED") ||
//         product.country_pricing?.[0];
//       const currentPrice = aedPricing ? aedPricing.discount : product.price;
//       const originalPrice = aedPricing
//         ? aedPricing.unit_price
//         : currentPrice * 1.5;
//       const currencyCode = aedPricing ? aedPricing.currency_code : "AED";

//       productCard.innerHTML = `
//                 <a href="product-details.html?id=${
//                   product._id
//                 }" class="product-card__thumb flex-center">
//                     <img src="${
//                       product.image || "/assets/images/default-product.png"
//                     }" alt="${product.name}">
//                 </a>
//                 <div class="product-card__content p-sm-2">
//                     <h6 class="title text-lg fw-semibold mt-12 mb-8">
//                         <a href="product-details.html?id=${
//                           product._id
//                         }" class="link text-line-2">${product.name}</a>
//                     </h6>
//                     <div class="flex-align gap-4">
//                         <span class="text-main-600 text-md d-flex"><i class="ph-fill ph-storefront"></i></span>
//                         <span class="text-gray-500 text-xs">By Games Corner</span>
//                     </div>
//                     <div class="product-card__content mt-12">
//                         <div class="product-card__price mb-8">
//                             <span class="text-heading text-md fw-semibold">AED ${currentPrice.toFixed(
//                               2
//                             )} <span class="text-gray-500 fw-normal">/Qty</span></span>
//                             ${
//                               originalPrice
//                                 ? `<span class="text-gray-400 text-md fw-semibold text-decoration-line-through">AED ${originalPrice.toFixed(
//                                     2
//                                   )}</span>`
//                                 : ""
//                             }
//                         </div>

//                         <button onclick="window.location.href='product-details.html?id=${
//                           product._id
//                         }'"
//                             class="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 mt-24 w-100 justify-content-center" data-product-id="${
//                               product._id
//                             }" data-product-price="${currentPrice}" data-product-discount="${originalPrice}" data-product-currencycode="${currencyCode}" data-product-quantity="1" onClick="handleAddToCart(event)">
//                             Add To Cart <i class="ph ph-shopping-cart"></i>
//                         </button>
//                     </div>
//                 </div>
//             `;

//       relatedProductsContainer.appendChild(productCard);
//     });

//     // Initialize Slick Slider with a slight delay to ensure DOM is ready
//     setTimeout(() => {
//       try {
//         $(relatedProductsContainer).slick({
//           slidesToShow: 1,
//           slidesToScroll: 1,
//           autoplay: false,
//           autoplaySpeed: 2000,
//           speed: 1500,
//           dots: false,
//           pauseOnHover: true,
//           arrows: true,
//           draggable: true,
//           rtl: $("html").attr("dir") === "rtl" ? true : false,
//           arrows: true,
//           infinite: false,
//           speed: 900,
//           infinite: true,
//           prevArrow: $(".new-arrival-prev"),
//           nextArrow: $(".new-arrival-next"),
//           responsive: [
//             {
//               breakpoint: 1599,
//               settings: {
//                 slidesToShow: 6,
//                 arrows: false,
//               },
//             },
//             {
//               breakpoint: 1399,
//               settings: {
//                 slidesToShow: 4,
//                 arrows: false,
//               },
//             },
//             {
//               breakpoint: 992,
//               settings: {
//                 slidesToShow: 3,
//                 arrows: false,
//               },
//             },
//             {
//               breakpoint: 575,
//               settings: {
//                 slidesToShow: 2,
//                 arrows: false,
//               },
//             },
//             {
//               breakpoint: 424,
//               settings: {
//                 slidesToShow: 1,
//                 arrows: false,
//               },
//             },
//           ],
//         });
//       } catch (error) {
//         console.error("Slick slider initialization failed:", error);
//       }
//     }, 100);
//   }

//   // Initialize the page
//   fetchProductDetails();
// });

// function handleAddToCart(productOrEvent) {
//   const webtoken = localStorage.getItem("webtoken");
//   if (!webtoken) {
//     alert("Please login first");
//     window.location.href = "account.html";
//     return;
//   }

//   let productData;

//   if (productOrEvent && productOrEvent.preventDefault) {
//     productOrEvent.preventDefault();
//     const button = productOrEvent.target.closest("button, a");
//     if (!button) {
//       console.error("Unable to find the button element.");
//       return;
//     }

//     productData = {
//       productId: button.getAttribute("data-product-id"),
//       product_currecy_code: button.getAttribute("data-product-currencycode"),
//       product_quantity: parseInt(
//         button.getAttribute("data-product-quantity") || 1,
//         10
//       ),
//       product_price: parseFloat(button.getAttribute("data-product-price")),
//       product_discount: parseFloat(
//         button.getAttribute("data-product-discount")
//       ),
//     };
//   } else {
//     // It's a product object
//     const product = productOrEvent;
//     if (!product) {
//       console.error("No product data available");
//       return;
//     }

//     // Get quantity from input if available
//     const quantityInput = document.querySelector(".quantity__input");
//     const quantity = parseInt(quantityInput?.value) || 1;

//     // Find AED pricing or default to first pricing option
//     const aedPricing =
//       product.country_pricing?.find((p) => p.currency_code === "AED") ||
//       product.country_pricing?.[0];

//     if (!aedPricing) {
//       console.error("No pricing information available");
//       alert("Unable to add product to cart: Missing pricing information");
//       return;
//     }

//     productData = {
//       productId: product._id,
//       product_currecy_code: aedPricing.currency_code,
//       product_quantity: quantity,
//       product_price: aedPricing.discount || product.price,
//       product_discount: aedPricing.unit_price || product.price * 1.5,
//       shipping_price: aedPricing.shipping_price,
//       tax_amount: aedPricing.tax_amount,
//       shipping_time: aedPricing.shipping_time,
//     };
//   }

//   // Update button state if it exists
//   const addToCartButton = document.querySelector(".add-to-cart-btn");
//   if (addToCartButton) {
//     addToCartButton.disabled = true;
//     addToCartButton.textContent = "Adding...";
//   }

//   // Make the API call
//   fetch("https://api.gamescorner.ae/api/web_cart", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${webtoken}`,
//     },
//     body: JSON.stringify(productData),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         return response.text().then((text) => {
//           throw new Error(text || "Network response was not ok");
//         });
//       }
//       return response.json();
//     })
//     .then((data) => {
//       console.log("HlellllllllS");
//       // alert("Product added to cart successfully!");
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       alert("Error adding product to cart: " + error.message);
//     })
//     .finally(() => {
//       // Reset button state
//       if (addToCartButton) {
//         addToCartButton.disabled = false;
//         addToCartButton.textContent = "Add to Cart";
//       }
//     });
// }

// //WISH LIST ADDING
// function handleAddToWishlist(productOrEvent) {
//   const webtoken = localStorage.getItem("webtoken");
//   if (!webtoken) {
//     alert("Please login first");
//     window.location.href = "account.html";
//     return;
//   }

//   let productId;

//   // Handle both event and direct product object scenarios
//   if (productOrEvent && productOrEvent.preventDefault) {
//     productOrEvent.preventDefault();
//     const button = productOrEvent.target.closest("button, a");
//     if (!button) {
//       console.error("Unable to find the button element.");
//       return;
//     }
//     productId = button.getAttribute("data-product-id");
//   } else {
//     // It's a product object
//     const product = productOrEvent;
//     if (!product) {
//       console.error("No product data available");
//       return;
//     }
//     productId = product._id;
//   }

//   // Update wishlist button state
//   const wishlistButton = document.querySelector(
//     `#wishlist-btn[data-product-id="${productId}"]`
//   );
//   if (wishlistButton) {
//     wishlistButton.disabled = true;
//     wishlistButton.innerHTML = '<i class="ph ph-heart"></i>';
//   }

//   // Make the API call to add to wishlist
//   fetch("https://api.gamescorner.ae/api/wish", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${webtoken}`,
//     },
//     body: JSON.stringify({ productId }),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         return response.json().then((errorData) => {
//           throw new Error(errorData.message || "Failed to add to wishlist");
//         });
//       }
//       return response.json();
//     })
//     .then((data) => {
//       console.log("Product added to wishlist:", data);

//       // Update button to show it's been added
//       if (wishlistButton) {
//         wishlistButton.classList.add("text-red-500");
//         wishlistButton.innerHTML = '<i class="ph ph-heart-fill"></i>';

//         // Optional: Prevent multiple additions
//         wishlistButton.disabled = true;
//       }

//       // Show success alert
//       alert(data.message || "Product added to wishlist successfully!");
//     })
//     .catch((error) => {
//       console.error("Error adding product to wishlist:", error);

//       // Reset button state on error
//       if (wishlistButton) {
//         wishlistButton.disabled = false;
//         wishlistButton.innerHTML = '<i class="ph ph-heart"></i>';
//         wishlistButton.classList.remove("text-red-500");
//       }

//       // Show error alert
//       alert("Error adding product to wishlist: " + error.message);
//     });
// }

// function setupProductInteractions(product) {
//   // Ensure `product` has a valid `_id` property
//   if (!product || !product._id) {
//     console.error("Invalid product data provided.");
//     return;
//   }

//   // Get the wishlist button using the correct ID or selector
//   const wishlistButton = document.getElementById("wishlist-btn");

//   if (wishlistButton) {
//     // Set the `data-product-id` attribute to the product's ID
//     wishlistButton.setAttribute("data-product-id", product._id);
//     console.log("Wishlist button configured:", wishlistButton);

//     // Add the event listener for the wishlist interaction
//     wishlistButton.addEventListener("click", handleAddToWishlist);
//   } else {
//     console.error("Wishlist button not found in the DOM.");
//   }
// }

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    console.error("No product ID found in URL");
    window.location.href = "shop.html";
    return;
  }

  // Fetch product details
  async function fetchProductDetails() {
    try {
      const response = await fetch(
        ` http://localhost:5002/api/product/${productId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const product = data.product;
        updateProductDetails(product);
        setupImageGallery(product);
        setupWhatsAppSharing(product);
        setupProductInteractions(product);

        const addToCartBtn = document.querySelector(".add-to-cart-btn");
        if (addToCartBtn) {
          addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
          const newAddToCartBtn = document.querySelector(".add-to-cart-btn");
          newAddToCartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleAddToCart(product);
          });
        }

        setupQuantityHandlers();

        if (product.parent_category?.[0]) {
          fetchRelatedProducts(product.parent_category[0]._id);
        } else {
          console.warn("No parent category available for related products");
        }
      } else {
        console.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }

  //set up quantity
  function setupQuantityHandlers() {
    const quantityInput = document.querySelector(".quantity__input");
    const minusBtn = document.querySelector(".quantity__minus");
    const plusBtn = document.querySelector(".quantity__plus");

    if (quantityInput && minusBtn && plusBtn) {
      quantityInput.value = 1;

      minusBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });

      plusBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value) || 1;
        quantityInput.value = currentValue + 1;
      });

      quantityInput.addEventListener("change", () => {
        let value = parseInt(quantityInput.value) || 1;
        if (value < 1) value = 1;
        quantityInput.value = value;
      });
    }
  }

  function updateProductDetails(product) {
    // Update product name
    document.querySelector(".product-details__content h5").textContent =
      product.name;

    const productNameElement = document.getElementById("product-name");
    if (productNameElement) {
      productNameElement.textContent = product.name;
    }

    const descriptionElement = document.getElementById("productdescription");
    if (descriptionElement) {
      descriptionElement.textContent =
        stripHtmlTags(product.description) || "No description available.";
    }

    // Update description
    document.querySelector(".product-details__content p").textContent =
      product.description
        ? stripHtmlTags(product.description)
        : "No description available.";

    // Update pricing (using first country pricing for AED)
    const aedPricing =
      product.country_pricing.find((p) => p.currency_code === "AED") ||
      product.country_pricing[0];
    const currentPrice = aedPricing ? aedPricing.discount : product.price;
    const originalPrice = aedPricing
      ? aedPricing.unit_price
      : currentPrice * 1.5;

    const priceContainer = document.querySelector(
      ".mt-32.flex-align.flex-wrap.gap-32"
    );
    priceContainer.querySelector(
      "h4"
    ).textContent = `AED ${currentPrice.toFixed(2)}`;
    priceContainer.querySelector(
      ".text-md.text-gray-500"
    ).textContent = `AED ${originalPrice.toFixed(2)}`;

    // Update stock progress
    const stockProgress = document.querySelector(".progress-bar");
    const availableStock = product.quantity || 45;
    const totalStock = 100;
    const stockPercentage = (availableStock / totalStock) * 100;

    stockProgress.style.width = `${stockPercentage}%`;
    document.querySelector(
      ".text-sm.text-gray-700"
    ).textContent = `Available only: ${availableStock}`;

    // Update product specifications
    updateProductSpecifications(product);
  }

  function stripHtmlTags(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  function setupImageGallery(product) {
    const mainImageContainer = document.querySelector(
      ".product-details__thumb-slider"
    );
    const thumbnailContainer = document.querySelector(
      ".product-details__images-slider"
    );

    // Clear existing content
    mainImageContainer.innerHTML = "";
    thumbnailContainer.innerHTML = "";

    // Get all valid images (filter out empty strings)
    const images = [
      product.image,
      product.gallery1,
      product.gallery2,
      product.gallery3,
      product.gallery4,
      product.gallery5,
    ].filter((img) => img && img.trim() !== "");

    // If no images available, set a default image
    if (images.length === 0) {
      images.push("/assets/images/default-product.png");
    }

    // Set up main image
    const mainImageDiv = document.createElement("div");
    mainImageDiv.innerHTML = `
            <div class="product-details__thumb flex-center h-100">
                <img src="${images[0]}" 
                     alt="Main product image" 
                     onerror="this.src='/assets/images/default-product.png'"
                     class="main-product-image"
                     style="max-width: 100%; height: auto; object-fit: contain;">
            </div>
        `;
    mainImageContainer.appendChild(mainImageDiv);

    // Create thumbnail container
    const thumbnailWrapperDiv = document.createElement("div");
    thumbnailWrapperDiv.className = "mt-24";
    thumbnailContainer.appendChild(thumbnailWrapperDiv);

    // Create thumbnail slider
    const sliderDiv = document.createElement("div");
    sliderDiv.className = "thumbnail-slider";
    thumbnailWrapperDiv.appendChild(sliderDiv);

    // Add thumbnails
    images.forEach((img, index) => {
      const thumbnailDiv = document.createElement("div");
      thumbnailDiv.className = "thumbnail-item cursor-pointer";
      thumbnailDiv.innerHTML = `
                <div>
                <div class="max-w-120 max-h-120 h-100 flex-center border border-gray-100 rounded-16 p-8 m-2">
                    <img src="${img}" 
                         alt="Product thumbnail ${index + 1}"
                         data-image="${img}"
                         onerror="this.src='/assets/images/default-product.png'"
                         style="max-width: 100%; height: auto; object-fit: contain;">
                </div>
                </div>
            `;
      sliderDiv.appendChild(thumbnailDiv);

      // Add click handler for each thumbnail
      thumbnailDiv.addEventListener("click", function () {
        // Update main image
        const mainImage = document.querySelector(".main-product-image");
        mainImage.src = img;

        // Update active state
        document.querySelectorAll(".thumbnail-item").forEach((thumb) => {
          thumb.classList.remove("active");
        });
        thumbnailDiv.classList.add("active");
      });
    });

    // Initialize Slick slider
    try {
      $(".thumbnail-slider").slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        infinite: false,
        prevArrow:
          '<button type="button" class="slick-prev w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"><i class="ph ph-arrow-left"></i></button>',
        nextArrow:
          '<button type="button" class="slick-next w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"><i class="ph ph-arrow-right"></i></button>',
        responsive: [
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
            },
          },
        ],
      });

      document.querySelector(".thumbnail-item")?.classList.add("active");
    } catch (error) {
      console.warn("Slick slider initialization failed:", error);
    }
  }

  const facebookButton = document.getElementById("facebook");
  const currentURL = encodeURIComponent(window.location.href);
  facebookButton.href = ` https://www.facebook.com/sharer/sharer.php?u=${currentURL}`;

  const whatsappButton = document.getElementById("whatsapp");
  whatsappButton.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    "Check this out: " + window.location.href
  )}`;

  function setupWhatsAppSharing(product) {
    const whatsappButton = document.getElementById("whatsapp-order");

    whatsappButton.addEventListener("click", (e) => {
      e.preventDefault();
      const quantity = document.querySelector(".quantity__input").value;
      const aedPricing =
        product.country_pricing.find((p) => p.currency_code === "AED") ||
        product.country_pricing[0];

      let message = ` I'm interested in ${product.name}\n`;
      message += `Price: AED ${
        aedPricing ? aedPricing.discount : product.price
      }\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Description: ${stripHtmlTags(product.description)}\n`;
      message += `image: ${stripHtmlTags(product.image)}\n`;
      message += `tax: AED ${
        aedPricing ? aedPricing.tax_amount : product.tax_amount
      }\n`;
      message += `Shipping Price: AED ${
        aedPricing ? aedPricing.shipping_time : product.shipping_price
      }\n`;
      message += `Shipping Time: ${
        aedPricing ? aedPricing.shipping_price : product.shipping_time
      }\n`;

      const encodedMessage = encodeURIComponent(message)
        .replace(/%0A/g, "%0A")
        .replace(/%20/g, "+");

      const phoneNumber = "918086835242";

      function generateWhatsAppUrls(phoneNumber, message) {
        return [
          ` https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`,
          ` whatsapp://send?phone=${phoneNumber}&text=${message}`,
          `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`,
        ];
      }

      // Advanced device detection and URL handling
      function openWhatsApp(urls) {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile =
          /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
            userAgent
          );

        // Prioritize URLs based on device
        const urlsToTry = isMobile
          ? [urls[0], urls[1], urls[2]] // Mobile priority
          : [urls[2], urls[0]]; // Desktop priority

        function attemptOpen(index = 0) {
          if (index >= urlsToTry.length) {
            navigator.clipboard
              .writeText(message)
              .then(() => {
                alert("Could not open WhatsApp. Message copied to clipboard.");
              })
              .catch(() => {
                alert(
                  "Unable to open WhatsApp. Please copy the message manually."
                );
              });
            return;
          }

          const url = urlsToTry[index];

          const link = document.createElement("a");
          link.href = url;
          link.style.display = "none";
          document.body.appendChild(link);

          try {
            link.click();

            setTimeout(() => {
              document.body.removeChild(link);
            }, 100);
          } catch (error) {
            console.error(`Failed to open URL: ${url}, error`);
            attemptOpen(index + 1);
          }
        }
        attemptOpen();
      }

      const whatsappUrls = generateWhatsAppUrls(phoneNumber, encodedMessage);
      openWhatsApp(whatsappUrls);
    });
  }

  function updateProductSpecifications(product) {
    
    const getAttributeValue = (attrs) => {
      if (!attrs || !Array.isArray(attrs) || attrs.length === 0) {
        return "N/A";
      }
  
      return attrs.map(attr => {
        // Get the attribute object from the nested structure
        const attrObj = attr.attribute || attr;
        const attrName = attrObj.name || "";
        
        // Get values from the value array
        let attrValues = [];
        if (attrObj.value && Array.isArray(attrObj.value)) {
          attrValues = attrObj.value.map(v => v.value || v).filter(Boolean);
        }
  
        return attrName && attrValues.length > 0
          ? `${attrName}: ${attrValues.join(", ")}`
          : null;
      })
      .filter(Boolean)
      .join(" | ");
    };
  
    const aedPricing = 
      product.country_pricing?.find((p) => p.currency_code === "AED") ||
      product.country_pricing?.[0];
  
    const specsList = document.querySelector(".product-dContent__box ul");
    const colorSection = document.querySelector(".flex-between.align-items-start.flex-wrap.gap-16");
  
    const specifications = [
      { label: "Product Type", value: product.product_type || "N/A" },
      { label: "Brand", value: product.brand?.[0]?.name || "N/A" },
      {
        label: "Category",
        value: product.parent_category?.[0]?.parent_category || "N/A",
      },
      { label: "Unit", value: product.unit || "N/A" },
      { label: "Weight", value: product.weight || "N/A" },
      {
        label: "Attributes",
        value: getAttributeValue(product.attributes) || "N/A",
      },
      {
        label: "Color",
        value: product.color?.length > 0
          ? product.color.map((c) => c.name).join(", ")
          : "N/A",
      },
      {
        label: "Shipping Time",
        value: `${aedPricing?.shipping_time || product.shipping_time || "N/A"}`,
      },
      {
        label: "Shipping Price",
        value: `AED ${aedPricing?.shipping_price || product.shipping_price || "N/A"}`,
      },
      {
        label: "Tax",
        value: `${aedPricing?.tax_percentage 
          ? `${aedPricing.tax_percentage}%` 
          : product.tax_percentage 
          ? `${product.tax_percentage}%` 
          : "N/A"}`,
      },
    ];
  
    if (specsList) {
      specsList.innerHTML = specifications
        .map(
          (spec) => `
            <li class="text-gray-400 mb-14 flex-align gap-14">
              <span class="w-20 h-20 bg-main-50 text-main-600 text-xs flex-center rounded-circle">
                <i class="ph ph-check"></i>
              </span>
              <span class="text-heading fw-medium">
                ${spec.label}:
                <span class="text-gray-500">${spec.value}</span>
              </span>
            </li>
          `
        )
        .join("");
    }
  
    if (colorSection && product.color?.length > 0) {
      const colorLabelSpan = colorSection.querySelector("span.fw-medium");
      if (colorLabelSpan) {
        colorLabelSpan.textContent = product.color
          .map((color) => color.name || "N/A")
          .join(", ");
      }
  
      const colorContainer = colorSection.querySelector(".color-list");
      if (colorContainer) {
        colorContainer.innerHTML = "";
        product.color.forEach((color) => {
          const colorButton = document.createElement("button");
          colorButton.type = "button";
          colorButton.className = "color-list__button w-20 h-20 border border-2 border-gray-50 rounded-circle";
          colorButton.style.backgroundColor = color.color_code || "#000000";
          colorButton.title = color.name || "N/A";
          colorContainer.appendChild(colorButton);
        });
      }
      colorSection.style.display = "flex";
    } else if (colorSection) {
      colorSection.style.display = "none";
    }
  }
  async function fetchRelatedProducts(parentCategory) {
    try {
      const response = await fetch(
        `http://localhost:5002/api/productweb?parent_category=${encodeURIComponent(
          parentCategory
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.products && data.products.length > 0) {
        const currentProductId = new URLSearchParams(
          window.location.search
        ).get("id");
        const relatedProducts = data.products.filter(
          (product) => product._id !== currentProductId
        );

        displayRelatedProducts(relatedProducts);
      } else {
        console.warn("No related products found");
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  }

  function displayRelatedProducts(products) {
    const relatedProductsContainer = document.querySelector(
      ".new-arrival__slider"
    );
    if (!relatedProductsContainer) {
      console.error("No container found for related products");
      return;
    }

    // First destroy existing slick instance if it exists
    if ($(relatedProductsContainer).hasClass("slick-initialized")) {
      $(relatedProductsContainer).slick("unslick");
    }

    // Clear any existing content
    relatedProductsContainer.innerHTML = "";

    // Limit to max 5 related products
    const limitedProducts = products.slice(0, 5);

    // Create product cards directly in the container (remove the extra wrapper div)
    limitedProducts.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className =
        "product-card h-100 p-8 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2";

      // Ensure pricing is handled correctly
      const aedPricing =
        product.country_pricing?.find((p) => p.currency_code === "AED") ||
        product.country_pricing?.[0];
      const currentPrice = aedPricing ? aedPricing.unit_price : " ";
      const originalPrice = aedPricing
        ? aedPricing.discount
        : currentPrice * 1.5;
      const currencyCode = aedPricing ? aedPricing.currency_code : "AED";
      const shippingPrice = aedPricing ? aedPricing.shipping_price : " ";
      const taxAmount = aedPricing ? aedPricing.tax_amount : " ";
      const shippingTime = aedPricing ? aedPricing.shipping_time : " ";
      productCard.innerHTML = `
                <a href="product-details.html?id=${
                  product._id
                }" class="product-card__thumb flex-center">
                    <img src="${
                      product.image || "/assets/images/default-product.png"
                    }" alt="${product.name}">
                </a>
                <div class="product-card__content p-sm-2">
                    <h6 class="title text-lg fw-semibold mt-12 mb-8">
                        <a href="product-details.html?id=${
                          product._id
                        }" class="link text-line-2">${product.name}</a>
                    </h6>
                    <div class="flex-align gap-4">
                        <span class="text-main-600 text-md d-flex"><i class="ph-fill ph-storefront"></i></span>
                        <span class="text-gray-500 text-xs">By Games Corner</span>
                    </div>
                    <div class="product-card__content mt-12">
                        <div class="product-card__price mb-8">
                            <span class="text-heading text-md fw-semibold">AED ${currentPrice.toFixed(
                              2
                            )} <span class="text-gray-500 fw-normal">/Qty</span></span>
                            ${
                              originalPrice
                                ? `<span class="text-gray-400 text-md fw-semibold text-decoration-line-through">AED ${originalPrice.toFixed(
                                    2
                                  )}</span>`
                                : ""
                            }
                        </div>
                       
                     <button
                            class="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 mt-24 w-100 justify-content-center" data-product-id="${
                              product._id
                            }" data-product-price="${currentPrice}" data-product-discount="${originalPrice}" data-product-currencycode="${currencyCode}" data-product-quantity="1" data-product-shippingprice="${shippingPrice}" data-product-taxamount="${taxAmount} data-product-shippingtime="${shippingTime}"  onClick="handleAddToCart(event)">
                            Add To Cart <i class="ph ph-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;

      relatedProductsContainer.appendChild(productCard);
    });

    // Initialize Slick Slider with a slight delay to ensure DOM is ready
    setTimeout(() => {
      try {
        $(relatedProductsContainer).slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,
          autoplaySpeed: 2000,
          speed: 1500,
          dots: false,
          pauseOnHover: true,
          arrows: true,
          draggable: true,
          rtl: $("html").attr("dir") === "rtl" ? true : false,
          arrows: true,
          infinite: false,
          speed: 900,
          infinite: true,
          prevArrow: $(".new-arrival-prev"),
          nextArrow: $(".new-arrival-next"),
          responsive: [
            {
              breakpoint: 1599,
              settings: {
                slidesToShow: 6,
                arrows: false,
              },
            },
            {
              breakpoint: 1399,
              settings: {
                slidesToShow: 4,
                arrows: false,
              },
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 3,
                arrows: false,
              },
            },
            {
              breakpoint: 575,
              settings: {
                slidesToShow: 2,
                arrows: false,
              },
            },
            {
              breakpoint: 424,
              settings: {
                slidesToShow: 1,
                arrows: false,
              },
            },
          ],
        });
      } catch (error) {
        console.error("Slick slider initialization failed:", error);
      }
    }, 100);
  }

  // Initialize the page
  fetchProductDetails();
});

function handleAddToCart(productOrEvent) {
  const webtoken = localStorage.getItem("webtoken");
  if (!webtoken) {
    alert("Please login first");
    window.location.href = "account.html";
    return;
  }

  let productData;

  if (productOrEvent && productOrEvent.preventDefault) {
    productOrEvent.preventDefault();
    const button = productOrEvent.target.closest("button, a");
    if (!button) {
      console.error("Unable to find the button element.");
      return;
    }

    // Get quantity from input if it exists
    const quantityInput = document.querySelector(".quantity__input");
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

    if (isNaN(quantity) || quantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }

    productData = {
      productId: button.getAttribute("data-product-id"),
      product_currecy_code: button.getAttribute("data-product-currencycode"),
      product_quantity: quantity,
      product_price: parseFloat(button.getAttribute("data-product-price")),
      product_discount: parseFloat(
        button.getAttribute("data-product-discount")
      ),
      shipping_price: parseFloat(
        button.getAttribute("data-product-shippingprice")
      ),
      tax_amount: parseFloat(button.getAttribute("data-product-taxamount")),
      shipping_time: parseFloat(
        button.getAttribute("data-product-shippingtime")
      ),
    };
  } else {
    // Handle direct product object
    const product = productOrEvent;
    if (!product) {
      console.error("No product data available");
      return;
    }

    const quantityInput = document.querySelector(".quantity__input");
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

    if (isNaN(quantity) || quantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }

    const aedPricing =
      product.country_pricing?.find((p) => p.currency_code === "AED") ||
      product.country_pricing?.[0];

    if (!aedPricing) {
      alert("Unable to add product to cart: Missing pricing information");
      return;
    }

    productData = {
      productId: product._id,
      product_currecy_code: aedPricing.currency_code,
      product_quantity: quantity,
      product_price: aedPricing.unit_price || product.price,
      product_discount: aedPricing.discount || product.price * 1.5,
      shipping_price: aedPricing.shipping_price,
      tax_amount: aedPricing.tax_amount,
      shipping_time: aedPricing.shipping_time,
    };
  }

  // Update button state
  const addToCartButton = document.querySelector(".add-to-cart-btn");
  if (addToCartButton) {
    addToCartButton.disabled = true;
    addToCartButton.innerHTML =
      '<i class="ph ph-spinner ph-spin"></i> Adding...';
  }

  // Make the API call
  fetch("https://api.gamescorner.ae/api/web_cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${webtoken}`,
    },
    body: JSON.stringify(productData),
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

      return data;
    })
    .then((data) => {
      const successAlert = document.createElement("div");
      successAlert.className =
        "alert alert-success position-fixed top-0 end-0 m-3";
      successAlert.style.zIndex = "9999";
      successAlert.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="ph ph-check-circle me-2"></i>
          <span>Product added to cart successfully!</span>
        </div>
      `;
      document.body.appendChild(successAlert);

      setTimeout(() => {
        successAlert.remove();
      }, 3000);

      updateCartCount();
    })
    .catch((error) => {
      const errorAlert = document.createElement("div");
      errorAlert.className =
        "alert alert-danger position-fixed top-0 end-0 m-3";
      errorAlert.style.zIndex = "9999";
      errorAlert.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="ph ph-x-circle me-2"></i>
          <span>${error.message}</span>
        </div>
      `;
      document.body.appendChild(errorAlert);

      setTimeout(() => {
        errorAlert.remove();
      }, 3000);
    })
    .finally(() => {
      if (addToCartButton) {
        addToCartButton.disabled = false;
        addToCartButton.innerHTML =
          'Add To Cart <i class="ph ph-shopping-cart"></i>';
      }
    });
}

function updateCartCount() {
  const webtoken = localStorage.getItem("webtoken");
  if (!webtoken) return;

  fetch("https://api.gamescorner.ae/api/web_cart", {
    headers: {
      Authorization: ` Bearer ${webtoken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const cartCountElement = document.querySelector(".cart-count");
      if (cartCountElement && data.cart) {
        cartCountElement.textContent = data.cart.length;
      }
    })
    .catch((error) => console.error("Error updating cart count:", error));
}
//WISH LIST ADDING
function handleAddToWishlist(productOrEvent) {
  const webtoken = localStorage.getItem("webtoken");
  if (!webtoken) {
    alert("Please login first");
    window.location.href = "account.html";
    return;
  }

  let productId;

  // Handle both event and direct product object scenarios
  if (productOrEvent && productOrEvent.preventDefault) {
    productOrEvent.preventDefault();
    const button = productOrEvent.target.closest("button, a");
    if (!button) {
      console.error("Unable to find the button element.");
      return;
    }
    productId = button.getAttribute("data-product-id");
  } else {
    const product = productOrEvent;
    if (!product) {
      console.error("No product data available");
      return;
    }
    productId = product._id;
  }

  // Update wishlist button state
  const wishlistButton = document.querySelector(
    ` #wishlist-btn[data-product-id="${productId}"]`
  );
  if (wishlistButton) {
    wishlistButton.disabled = true;
    wishlistButton.innerHTML = '<i class="ph ph-heart"></i>';
  }

  // Make the API call to add to wishlist
  fetch("https://api.gamescorner.ae/api/wish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${webtoken}`,
    },
    body: JSON.stringify({ productId }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.message || "Failed to add to wishlist");
        });
      }
      return response.json();
    })
    .then((data) => {
      if (wishlistButton) {
        wishlistButton.classList.add("text-red-500");
        wishlistButton.innerHTML = '<i class="ph ph-heart-fill"></i>';
        wishlistButton.disabled = true;
      }

      // Show success alert
      alert(data.message || "Product added to wishlist successfully!");
    })
    .catch((error) => {
      if (wishlistButton) {
        wishlistButton.disabled = false;
        wishlistButton.innerHTML = '<i class="ph ph-heart"></i>';
        wishlistButton.classList.remove("text-red-500");
      }
      alert(error.message);
    });
}

function setupProductInteractions(product) {
  // Ensure product has a valid _id property
  if (!product || !product._id) {
    console.error("Invalid product data provided.");
    return;
  }

  const wishlistButton = document.getElementById("wishlist-btn");

  if (wishlistButton) {
    wishlistButton.setAttribute("data-product-id", product._id);
    wishlistButton.addEventListener("click", handleAddToWishlist);
  } else {
    console.error("Wishlist button not found in the DOM.");
  }
}
