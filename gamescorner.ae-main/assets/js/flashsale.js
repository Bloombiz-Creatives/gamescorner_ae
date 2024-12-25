
document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch coupon data
  async function fetchFlashSales() {
    try {
      const response = await fetch("https://api.gamescorner.ae/api/couponweb");
      const data = await response.json();

      if (data.success && data.coupons.length > 0) {
        // Filter out expired coupons
        const now = new Date().getTime();
        const validCoupons = data.coupons.filter(coupon => {
          const expiryTime = new Date(coupon.expiry).getTime();
          return expiryTime > now;
        });

        if (validCoupons.length > 0) {
          renderFlashSales(validCoupons);
        } else {
          console.log("No active flash sales available");
          const flashSalesSlider = document.querySelector(".flash-sales__slider");
          if (flashSalesSlider) {
            flashSalesSlider.innerHTML = "<div class='text-center p-4'>No active flash sales at the moment.</div>";
          }
        }
      } else {
        console.log("No flash sales available");
      }
    } catch (error) {
      console.error("Error fetching flash sales:", error);
    }
  }

  // Function to render flash sales
  function renderFlashSales(coupons) {
    const flashSalesSlider = document.querySelector(".flash-sales__slider");

    if (!flashSalesSlider) {
      console.error("Flash sales slider element not found");
      return;
    }

    // Destroy existing slider if it exists
    if (jQuery().slick && $('.flash-sales__slider').slick) {
      $('.flash-sales__slider').slick('unslick');
    }

    flashSalesSlider.innerHTML = "";

    // Iterate through valid coupons and create slider items
    coupons.forEach((coupon, index) => {
      const slideElement = document.createElement("div");
      slideElement.classList.add("flash-sales-slide");
      const discountPercentage = coupon.discountValue;
      const expiryDate = new Date(coupon.expiry);

      slideElement.innerHTML = `
        <div class="flash-sales-item rounded-16 overflow-hidden z-1 position-relative flex-align flex-0 justify-content-between gap-8">
          <img src="assets/images/bg/flash.jpg" alt=""
            class="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover z-n1 flash-sales-item__bg">
          <div class="flash-sales-item__thumb d-sm-block d-none">
            <img src="assets/images/thumbs/flash${index + 1}.png" alt="">
          </div>
          <div class="flash-sales-item__content ms-sm-auto">
            <h6 class="text-32 mb-20 flash">Up to ${discountPercentage}% off !</h6>
            <h6 class="text-32 mb-20 flash">${coupon.code}</h6>
            <div class="countdown" id="countdown${index + 1}">
              <ul class="countdown-list flex-align flex-wrap">
                <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
                  <span class="days">00</span>Days
                </li>
                <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
                  <span class="hours">00</span>Hours
                </li>
                <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
                  <span class="minutes">00</span>Min
                </li>
                <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
                  <span class="seconds">00</span>Sec
                </li>
              </ul>
            </div>
            <a href="shop.html"
              class="btn btn-main d-inline-flex align-items-center rounded-pill gap-8 mt-24">
              Shop Now
              <span class="icon text-xl d-flex"><i class="ph ph-arrow-right"></i></span>
            </a>
          </div>
        </div>
      `;

      flashSalesSlider.appendChild(slideElement);
      initCountdown(`countdown${index + 1}`, expiryDate);
    });

    // Initialize slider with a delay to ensure DOM is ready
    setTimeout(() => {
      if (typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined') {
        $('.flash-sales__slider').slick({
          slidesToShow: Math.min(2, coupons.length),
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 2000,
          speed: 1500,
          dots: false,
          pauseOnHover: true,
          arrows: true,
          draggable: true,
          rtl: $('html').attr('dir') === 'rtl',
          infinite: coupons.length > 2,
          nextArrow: '#flash-next',
          prevArrow: '#flash-prev',
          responsive: [{
            breakpoint: 991,
            settings: {
              slidesToShow: 1,
              arrows: false,
            }
          }]
        });
      } else {
        console.error('Slick slider not loaded');
        fallbackSliderNavigation();
      }
    }, 500);
  }

  // Countdown function with cleanup
  function initCountdown(containerId, expiryDate) {
    const countdownEl = document.getElementById(containerId);
    if (!countdownEl) return;

    const daysEl = countdownEl.querySelector(".days");
    const hoursEl = countdownEl.querySelector(".hours");
    const minutesEl = countdownEl.querySelector(".minutes");
    const secondsEl = countdownEl.querySelector(".seconds");

    let countdownInterval;

    function updateCountdown() {
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(2, "0");
        hoursEl.textContent = hours.toString().padStart(2, "0");
        minutesEl.textContent = minutes.toString().padStart(2, "0");
        secondsEl.textContent = seconds.toString().padStart(2, "0");
      } else {
        clearInterval(countdownInterval);
        // Refresh the flash sales when a coupon expires
        fetchFlashSales();
      }
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Cleanup function
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }

  function fallbackSliderNavigation() {
    const slider = document.querySelector('.flash-sales__slider');
    const slides = Array.from(slider.children);
    
    slider.style.display = 'flex';
    slider.style.overflow = 'hidden';
    slider.style.width = '100%';
    
    slides.forEach(slide => {
      slide.style.flex = slides.length > 1 ? '0 0 50%' : '0 0 100%';
      slide.style.maxWidth = slides.length > 1 ? '50%' : '100%';
      slide.style.padding = '0 10px';
      slide.style.boxSizing = 'border-box';
    });
    
    function adjustSlides() {
      const isSmallScreen = window.innerWidth <= 991;
      slides.forEach(slide => {
        slide.style.flex = isSmallScreen ? '0 0 100%' : (slides.length > 1 ? '0 0 50%' : '0 0 100%');
        slide.style.maxWidth = isSmallScreen ? '100%' : (slides.length > 1 ? '50%' : '100%');
      });
    }
    
    adjustSlides();
    window.addEventListener('resize', adjustSlides);
  }

  // Initial fetch
  fetchFlashSales();
});