// new--------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const product = urlParams.get("id");

  if (!product) {
    console.error("No product ID found in URL");
    window.location.href = "shop.html";
    return;
  }

  // Fetch product details
  async function fetchProductDetails() {
    try {
      const response = await fetch(
        ` https://api.gamescorner.ae/api/product/${product}`
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
        await setupProductAttributes(product);
        setupQuantityHandlers();
        initializeOrderNowButton(product);

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

 function initializeOrderNowButton(product) {
    const orderNowButton = document.querySelector(".order-now"); 
    if (orderNowButton) {
      orderNowButton.addEventListener('click', (e) => handleOrderNow(e, product));
    }
  }


  function handleOrderNow(e, product) {
    e.preventDefault();
    const quantity = parseInt(document.querySelector('.quantity__input')?.value || '1');
    if (isNaN(quantity) || quantity < 1) {
      showAlert('error', 'Please enter a valid quantity');
      return;
    }

    const { valid, selectedAttributes } = validateAndUpdateAttributes();
    if (!valid) {
      showAlert('error', 'Please select all required attributes');
      return;
    }

    if (product.color?.length > 0 && !window.selectedColor) {
      showAlert('error', 'Please select a color');
      return;
    }

    const aedPricing = product.country_pricing?.find(p => p.currency_code === "AED") || product.country_pricing?.[0];
    if (!aedPricing) {
      showAlert('error', 'Price information not available');
      return;
    }


    const orderData = {
      product_id: product._id,
      shippingPrice: aedPricing.shipping_price,
      shippingTime:aedPricing.shipping_time,
      taxAmount: aedPricing.tax_amount,
      discountPrice: aedPricing.discount,
      quantity: quantity,
      currency_code: "AED",
      attributes: {
        ...selectedAttributes,
        color: window.selectedColor || ""
      }
    };

    try {
      localStorage.setItem('orderData', JSON.stringify(orderData));
      window.location.href = 'order-checkout.html';
    } catch (error) {
      console.error('Error storing order data:', error);
      showAlert('error', 'Failed to process order. Please try again.');
    }
  }


  async function setupProductAttributes(product) {
    if (!product.attributes || !Array.isArray(product.attributes)) {
      console.warn("No attributes found for product");
      return;
    }

    const attributesContainer = document.querySelector('.attribute-stng');
    if (!attributesContainer) {
      console.error("Attributes container not found");
      return;
    }

    attributesContainer.innerHTML = '';

    for (const productAttr of product.attributes) {
      try {
        const response = await fetch(`https://api.gamescorner.ae/api/attributes/${productAttr.attribute._id}`);
        if (!response.ok) throw new Error(`Failed to fetch attribute ${productAttr.attribute._id}`);

        const data = await response.json();
        const attributeDetails = data.attribute;

        const wrapper = document.createElement('div');
        wrapper.className = 'relative w-full md:w-1/2 lg:w-1/3 mb-4';

        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700 mb-2';
        label.htmlFor = `attribute_${attributeDetails._id}`;
        label.textContent = attributeDetails.name;

        const select = document.createElement('select');
        select.className = 'absolute left-0 mt-2 px-12 py-8 text-sm rounded-8 text-gray-900 border border-gray-200 focus:ring-main-600 focus:border-main-600 w-full';
        select.id = `attribute_${attributeDetails._id}`;
        select.name = attributeDetails.name;

        const productAttributeValues = productAttr.attribute.attribute_values || [];

        if (attributeDetails.value && Array.isArray(attributeDetails.value)) {
          attributeDetails.value
            .filter(val => productAttributeValues.includes(val._id))
            .forEach(val => {
              const option = document.createElement('option');
              option.value = val.value;
              option.textContent = val.value;
              select.appendChild(option);
            });
        }

        select.addEventListener('change', validateAndUpdateAttributes);

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        attributesContainer.appendChild(wrapper);

      } catch (error) {
        console.error(`Error setting up attribute ${productAttr.attribute._id}:`, error);
      }
    }

    if (product.color && product.color.length > 0) {
      setupColorSelection(product.color);
    }
  }


  function setupColorSelection(colors) {
    const colorSection = document.querySelector('.color-list');
    if (!colorSection) return;

    colorSection.innerHTML = '';

    if (colors.length === 1) {
      window.selectedColor = colors[0].name;
    }

    colors.forEach(color => {
      const colorButton = document.createElement('button');
      colorButton.type = 'button';
      colorButton.className = 'color-list__button w-20 h-20 border border-2 border-gray-50 rounded-circle';
      colorButton.style.backgroundColor = color.color_code;
      colorButton.title = color.name;

      colorButton.addEventListener('click', () => {
        document.querySelectorAll('.color-list__button').forEach(btn => {
          btn.classList.remove('border-main-200');
          btn.classList.add('border-gray-50');
        });

        colorButton.classList.remove('border-gray-50');
        colorButton.classList.add('border-main-200');
        window.selectedColor = color.name;
      });

      if (colors.length === 1) {
        colorButton.classList.remove('border-gray-50');
        colorButton.classList.add('border-main-200');
      }

      colorSection.appendChild(colorButton);
    });
  }

  function validateAndUpdateAttributes() {
    const selectedAttributes = {};
    const allSelects = document.querySelectorAll('.attribute-stng select');
    let valid = true;

    allSelects.forEach(select => {
      if (!select.value) {
        valid = false;
        return;
      }
      const attributeName = select.name;
      selectedAttributes[attributeName] = select.value;
    });

    return {
      valid: valid,
      selectedAttributes
    };
  }


  //set up quantity
  // function setupQuantityHandlers() {
  //   const quantityInput = document.querySelector(".quantity__input");
  //   const minusBtn = document.querySelector(".quantity__minus");
  //   const plusBtn = document.querySelector(".quantity__plus");

  //   if (quantityInput && minusBtn && plusBtn) {
  //     quantityInput.value = 1;

  //     minusBtn.addEventListener("click", () => {
  //       const currentValue = parseInt(quantityInput.value) || 1;
  //       if (currentValue > 1) {
  //         quantityInput.value = currentValue - 1;
  //       }
  //     });

  //     plusBtn.addEventListener("click", () => {
  //       const currentValue = parseInt(quantityInput.value) || 1;
  //       quantityInput.value = currentValue + 1;
  //     });

  //     quantityInput.addEventListener("change", () => {
  //       let value = parseInt(quantityInput.value) || 1;
  //       if (value < 1) value = 1;
  //       quantityInput.value = value;
  //     });
  //   }
  // }

  function setupQuantityHandlers() {
    const quantityInput = document.querySelector(".quantity__input");
    const minusBtn = document.querySelector(".quantity__minus");
    const plusBtn = document.querySelector(".quantity__plus");
  
    if (!quantityInput || !minusBtn || !plusBtn) return;
  
    // Remove any existing event listeners
    const newMinusBtn = minusBtn.cloneNode(true);
    const newPlusBtn = plusBtn.cloneNode(true);
    minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
    plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);
  
    // Set initial value
    quantityInput.value = 1;
  
    // Add new event listeners
    newMinusBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  
    newPlusBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  
    // Handle direct input changes
    quantityInput.addEventListener("change", () => {
      let value = parseInt(quantityInput.value) || 1;
      if (value < 1) value = 1;
      quantityInput.value = value;
    });
  }

  function updateProductDetails(product) {

    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      const aedPricing = product.country_pricing.find(p => p.currency_code === "AED") || product.country_pricing[0];

      addToCartBtn.dataset.product = product._id;
      addToCartBtn.dataset.productCurrencycode = aedPricing?.currency_code || 'AED';
      addToCartBtn.dataset.productQuantity = '1';
      addToCartBtn.dataset.productPrice = aedPricing?.unit_price || '';
      addToCartBtn.dataset.productDiscount = aedPricing?.discount || '';
      addToCartBtn.dataset.shippingPrice = aedPricing?.shipping_price || '';
      addToCartBtn.dataset.taxAmount = aedPricing?.tax_amount || '';
      addToCartBtn.dataset.shippingTime = aedPricing?.shipping_time || '';

      // Remove existing event listeners
      const newBtn = addToCartBtn.cloneNode(true);
      addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);

      // Add new event listener
      newBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Get selected color
        const selectedColor = window.selectedColor;
        if (product.color?.length > 0 && !selectedColor) {
          showAlert('error', 'Please select a color');
          return;
        }

        // Validate attributes
        const { valid, selectedAttributes } = validateAndUpdateAttributes();
        if (!valid) {
          showAlert('error', 'Please select all required attributes');
          return;
        }

        // Get quantity
        const quantity = parseInt(document.querySelector('.quantity__input')?.value || '1');


        const cartData = {
          product: product._id,
          product_currency_code: aedPricing?.currency_code || 'AED',
          product_quantity: quantity,
          product_price: aedPricing?.unit_price,
          product_discount: aedPricing?.discount,
          shipping_price: aedPricing?.shipping_price,
          tax_amount: aedPricing?.tax_amount,
          shipping_time: aedPricing?.shipping_time,
          attributes: {
            ...selectedAttributes,
            ...(selectedColor && {
              color: selectedColor || ''
            })
          }
        };

        try {
          const webtoken = localStorage.getItem('webtoken');
          if (!webtoken) {
            window.location.href = 'account.html';
            return;
          }

          const response = await fetch('https://api.gamescorner.ae/api/web_cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${webtoken}`
            },
            body: JSON.stringify(cartData)
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message);

          showAlert('success', 'Product added to cart successfully!');
          updateCartCount();
        } catch (error) {
          showAlert('error', error.message);
        }
      });
    }
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

    document.querySelector(".product-details__content p").textContent =
      product.description
        ? stripHtmlTags(product.description)
        : "No description available.";

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
      message += `Price: AED ${aedPricing ? aedPricing.discount : product.price
        }\n`;
      message += `Quantity: ${quantity}\n`;
      message += `Description: ${stripHtmlTags(product.description)}\n`;
      message += `image: ${stripHtmlTags(product.image)}\n`;
      message += `tax: AED ${aedPricing ? aedPricing.tax_amount : product.tax_amount
        }\n`;
      message += `Shipping Price: AED ${aedPricing ? aedPricing.shipping_time : product.shipping_price
        }\n`;
      message += `Shipping Time: ${aedPricing ? aedPricing.shipping_price : product.shipping_time
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

      return attrs
        .map((attr) => {
          // Get the attribute object from the nested structure
          const attrObj = attr.attribute || attr;
          const attrName = attrObj.name || "";

          // Get values from the value array
          let attrValues = [];
          if (attrObj.value && Array.isArray(attrObj.value)) {
            attrValues = attrObj.value.map((v) => v.value || v).filter(Boolean);
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
    const colorSection = document.querySelector(
      ".flex-between.align-items-start.flex-wrap.gap-16"
    );

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
        value:
          product.color?.length > 0
            ? product.color.map((c) => c.name).join(", ")
            : "N/A",
      },
      {
        label: "Shipping Time",
        value: `${aedPricing?.shipping_time || product.shipping_time || "N/A"}`,
      },
      {
        label: "Shipping Price",
        value: `AED ${aedPricing?.shipping_price || product.shipping_price || "N/A"
          }`,
      },
      {
        label: "Tax",
        value: `${aedPricing?.tax_percentage
          ? `${aedPricing.tax_percentage}%`
          : product.tax_percentage
            ? `${product.tax_percentage}%`
            : "N/A"
          }`,
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
                  <span class="text-gray-500">${spec.value}</span>.
                </span>
              </li>
            `
        )
        .join("");
    }

    if (colorSection && product.color?.length > 0) {
      const colorLabelSpan = colorSection.querySelector("span.fw-medium");
      const colorContainer = colorSection.querySelector(".color-list");

      if (colorLabelSpan) {
        colorLabelSpan.textContent = product.color.map(c => c.name).join(", ");
      }

      if (colorContainer) {
        colorContainer.innerHTML = "";
        product.color.forEach((color) => {
          const colorButton = document.createElement("button");
          colorButton.type = "button";
          colorButton.className = "color-list__button w-20 h-20 border border-2 border-gray-50 rounded-circle";
          colorButton.style.backgroundColor = color.color_code || "#000000";
          colorButton.dataset.colorId = color._id;
          colorButton.dataset.colorName = color.name;
          colorButton.title = color.name;

          colorButton.addEventListener("click", () => {
            colorContainer.querySelectorAll("button").forEach(btn => {
              btn.classList.remove("border-main-600");
            });

            colorButton.classList.add("border-main-600");
            window.selectedColor = {
              id: color._id,
              name: color.name
            };
          });

          colorContainer.appendChild(colorButton);
        });

        colorSection.style.display = "flex";
      }
    } else if (colorSection) {
      colorSection.style.display = "none";
    }

  }
  async function fetchRelatedProducts(parentCategory) {
    try {
      const response = await fetch(
        `https://api.gamescorner.ae/api/productweb?parent_category=${encodeURIComponent(
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
      // const currencyCode = aedPricing ? aedPricing.currency_code : "AED";
      // const shippingPrice = aedPricing ? aedPricing.shipping_price : " ";
      // const taxAmount = aedPricing ? aedPricing.tax_amount : " ";
      // const shippingTime = aedPricing ? aedPricing.shipping_time : " ";
      productCard.innerHTML = `
                  <a href="product-details.html?id=${product._id
        }" class="product-card__thumb flex-center">
                      <img src="${product.image || "/assets/images/default-product.png"
        }" alt="${product.name}">
                  </a>
                  <div class="product-card__content p-sm-2">
                      <h6 class="title text-lg fw-semibold mt-12 mb-8">
                          <a href="product-details.html?id=${product._id
        }" class="link text-line-2">${product.name}</a>
                      </h6>
                      <div class="flex-align gap-4">
                          <span class="text-main-600 text-md d-flex"><i class="ph-fill ph-storefront"></i></span>
                          <span class="text-gray-500 text-xs">By Games Corner</span>
                      </div>
                      <div class="product-card__content mt-12">
                          <div class="product-card__price mb-8">
                            ${currentPrice
          ? `<span class="text-gray-400 text-md fw-semibold text-decoration-line-through">AED ${currentPrice.toFixed(
            2
          )}</span>`
          : ""
        }
                   </div>
                     <span class="text-heading text-md fw-semibold">AED ${originalPrice.toFixed(
          2
        )} 
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

  fetchProductDetails();
});


function collectProductData(product) {
  const quantity = parseInt(document.querySelector('.quantity__input')?.value || '1');
  if (isNaN(quantity) || quantity < 1) {
    showAlert('error', 'Please enter a valid quantity');
    return null;
  }

  const { valid, selectedAttributes } = validateAndUpdateAttributes();
  if (!valid) {
    showAlert('error', 'Please select all required attributes');
    return null;
  }

  const aedPricing = product.country_pricing?.find(p => p.currency_code === 'AED') || product.country_pricing?.[0];
  if (!aedPricing) {
    showAlert('error', 'Price information not available');
    return null;
  }

  return {
    product: product._id,
    product_currency_code: "AED",
    product_quantity: quantity,
    product_price: aedPricing.unit_price,
    product_discount: aedPricing.discount,
    shipping_price: aedPricing.shipping_price.toString(),
    tax_amount: aedPricing.tax_amount,
    shipping_time: aedPricing.shipping_time,
    attributes: {
      RAM: selectedAttributes.RAM || "",
      size: selectedAttributes.Size || "",
      color: window.selectedColor || ""
    }
  };
}

function handleAddToCart(product) {
  const webtoken = localStorage.getItem('webtoken');
  if (!webtoken) {
    showAlert('error', 'Please login first');
    window.location.href = 'account.html';
    return;
  }

  // Get quantity
  const quantity = parseInt(document.querySelector('.quantity__input')?.value || '1');
  if (isNaN(quantity) || quantity < 1) {
    showAlert('error', 'Please enter a valid quantity');
    return;
  }

  // Validate attributes
  const { valid, selectedAttributes } = validateAndUpdateAttributes();
  if (!valid) {
    showAlert('error', 'Please select all required attributes');
    return;
  }

  // Check color selection if applicable
  if (document.querySelector('.color-list') && !window.selectedColor) {
    showAlert('error', 'Please select a color');
    return;
  }

  const aedPricing = product.country_pricing?.find(p => p.currency_code === 'AED') || product.country_pricing?.[0];
  if (!aedPricing) {
    showAlert('error', 'Price information not available');
    return;
  }

  const cartData = {
    product: product._id,
    product_currency_code: "AED",
    product_quantity: quantity,
    product_price: aedPricing.unit_price,
    product_discount: aedPricing.discount,
    shipping_price: aedPricing.shipping_price.toString(),
    tax_amount: aedPricing.tax_amount,
    shipping_time: aedPricing.shipping_time,
    attributes: {
      ...selectedAttributes,
      color: window.selectedColor || ""
    }
  };

  // Save to localStorage for order now functionality
  const orderData = {
    product_id: product._id,
    quantity: quantity,
    currency_code: "AED",
    attributes: {
      ...selectedAttributes,
      color: window.selectedColor || ""
    }
  };

  localStorage.setItem('orderData', JSON.stringify(orderData));
  fetch('https://api.gamescorner.ae/api/web_cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${webtoken}`
    },
    body: JSON.stringify(cartData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errorData => {
        throw new Error(errorData.message || 'Failed to add item to cart');
      });
    }
    return response.json();
  })
  .then(data => {
    showAlert('success', 'Product added to cart successfully!');
    updateCartCount();
  })
  .catch(error => {
    showAlert('error', error.message);
    console.error('Error adding to cart:', error);
  });
}

function handleOrderNow(product) {
  const productData = collectProductData(product);
  if (!productData) return;

  localStorage.setItem('orderData', JSON.stringify({
    product_id: productData.product,
    quantity: productData.product_quantity,
    currency_code: productData.product_currency_code,
    attributes: productData.attributes
  }));

  window.location.href = 'order-checkout.html';
}

function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="ph ph-${type === 'success' ? 'check' : 'x'}-circle me-2"></i>
        <span>${message}</span>
      </div>
    `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

async function fetchAttribute(attributeId) {
  try {
    const response = await fetch(`https://api.gamescorner.ae/api/attributes/${attributeId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch attribute ${attributeId}`);
    }

    const data = await response.json();
    return data.attribute;
  } catch (error) {
    console.error(`Error fetching attribute ${attributeId}:`, error);
    return null;
  }
}

// Function to fetch multiple attributes in parallel
async function fetchProductAttributes(product) {
  if (!product.attributes || !Array.isArray(product.attributes)) {
    console.warn("No attributes found for product");
    return [];
  }

  const attributePromises = product.attributes.map(async (productAttr) => {
    const attributeId = productAttr.attribute._id;
    const attributeData = await fetchAttribute(attributeId);

    if (attributeData) {
      return {
        attributeData,
        productAttribute: productAttr
      };
    }
    return null;
  });

  const attributes = await Promise.all(attributePromises);
  return attributes.filter(attr => attr !== null);
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

  let product;

  // Handle both event and direct product object scenarios
  if (productOrEvent && productOrEvent.preventDefault) {
    productOrEvent.preventDefault();
    const button = productOrEvent.target.closest("button, a");
    if (!button) {
      console.error("Unable to find the button element.");
      return;
    }
    product = button.getAttribute("data-product-id");
  } else {
    const product = productOrEvent;
    if (!product) {
      console.error("No product data available");
      return;
    }
    product = product._id;
  }

  // Update wishlist button state
  const wishlistButton = document.querySelector(
    ` #wishlist-btn[data-product-id="${product}"]`
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
    body: JSON.stringify({ product }),
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
  if (!product || !product._id) {
    console.error("Invalid product data provided.");
    return;
  }

  // Setup wishlist button
  const wishlistButton = document.getElementById("wishlist-btn");
  if (wishlistButton) {
    wishlistButton.setAttribute("data-product-id", product._id);
    wishlistButton.addEventListener("click", handleAddToWishlist);
  }

  // Setup order now button
  const orderNowButton = document.querySelector(".buy-now-btn");
  if (orderNowButton) {
    orderNowButton.addEventListener("click", () => handleOrderNow(product));
  }

  const addToCartBtn = document.querySelector(".add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", handleAddToCart); 
  }
}