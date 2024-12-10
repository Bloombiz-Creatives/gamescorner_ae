// // flashsale.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Function to fetch coupon data
//     async function fetchFlashSales() {
//         try {
//             const response = await fetch('http://localhost:5002/api/couponweb');
//             const data = await response.json();

//             console.log(data,'gygygyff');
            
            
//             if (data.success && data.coupons.length > 0) {
//                 renderFlashSales(data.coupons);
//             } else {
//                 console.log('No flash sales available');
//             }
//         } catch (error) {
//             console.error('Error fetching flash sales:', error);
//         }
//     }

//     // Function to render flash sales
//     function renderFlashSales(coupons) {
//         const flashSalesSlider = document.querySelector('.flash-sales__slider');
        
//         if (!flashSalesSlider) {
//             console.error('Flash sales slider element not found');
//             return;
//         }

//         flashSalesSlider.innerHTML = '';

//         // Iterate through coupons and create slider items
//         coupons.forEach((coupon, index) => {
//             const slideElement = document.createElement('div');
//             slideElement.classList.add('flash-sales-slide');
//             const discountPercentage = coupon.discountValue;
            
//             // Use server time or provide fallback
//             const expiryDate = new Date(coupon.expiry || Date.now() + 24 * 60 * 60 * 1000);

//             slideElement.innerHTML = `
//                 <div class="flash-sales-item rounded-16 overflow-hidden z-1 position-relative flex-align flex-0 justify-content-between gap-8">
//                     <img src="assets/images/bg/flash.jpg" alt=""
//                         class="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover z-n1 flash-sales-item__bg">
//                     <div class="flash-sales-item__thumb d-sm-block d-none">
//                         <img src="assets/images/thumbs/flash${index + 1}.png" alt="">
//                     </div>
//                     <div class="flash-sales-item__content ms-sm-auto">
//                         <h6 class="text-32 mb-20 flash">Up to ${discountPercentage}% off !</h6>
//                         <h6 class="text-32 mb-20 flash"> ${coupon.code}</h6>
//                         <div class="countdown" id="countdown${index + 1}">
//                             <ul class="countdown-list flex-align flex-wrap">
//                                 <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
//                                     <span class="days">00</span>Days
//                                 </li>
//                                 <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
//                                     <span class="hours">00</span>Hours
//                                 </li>
//                                 <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
//                                     <span class="minutes">00</span>Min
//                                 </li>
//                                 <li class="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium">
//                                     <span class="seconds">00</span>Sec
//                                 </li>
//                             </ul>
//                         </div>
//                         <a href="shop.html"
//                             class="btn btn-main d-inline-flex align-items-center rounded-pill gap-8 mt-24">
//                             Shop Now
//                             <span class="icon text-xl d-flex"><i class="ph ph-arrow-right"></i></span>
//                         </a>
//                     </div>
//                 </div>
//             `;

//             flashSalesSlider.appendChild(slideElement);

//             // Initialize countdown for each coupon
//             initCountdown(`countdown${index + 1}`, expiryDate);
//         });

//         // Advanced slider initialization
//         function initializeSlider() {
//             // First, try Slick slider if available
//             if (window.jQuery && $.fn.slick) {
//                 try {
//                     $('.flash-sales__slider').slick({
//                         slidesToShow: 2,
//                         slidesToScroll: 1,
//                         autoplay: true,
//                         autoplaySpeed: 2000,
//                         speed: 1500,
//                         dots: false,
//                         pauseOnHover: true,
//                         arrows: true,
//                         draggable: true,
//                         rtl: $('html').attr('dir') === 'rtl' ? true : false,
//                         speed: 900,
//                         infinite: true,
//                         nextArrow: '#flash-next',
//                         prevArrow: '#flash-prev',
//                         responsive: [
//                           {
//                             breakpoint: 991,
//                             settings: {
//                               slidesToShow: 1,
//                               arrows: false,
//                             }
//                           }
//                         ]
//                       });  
//                 } catch (error) {
//                     console.error('Slick slider initialization failed:', error);
//                     fallbackSliderNavigation();
//                 }
//             } else {
//                 // Fallback to custom slider if Slick is not available
//                 console.warn('Slick slider not found. Using custom slider.');
//                 fallbackSliderNavigation();
//             }
//         }

//         // Custom slider navigation for when Slick is not available
//         function fallbackSliderNavigation() {
//             const slider = flashSalesSlider;
//             const slides = Array.from(slider.children);
//             const prevBtn = document.getElementById('flash-prev');
//             const nextBtn = document.getElementById('flash-next');
            
//             // Reset slider styles
//             slider.style.display = 'flex';
//             slider.style.overflow = 'hidden';
//             slider.style.width = '100%';

//             // Style slides
//             slides.forEach((slide, index) => {
//                 slide.style.flex = '0 0 50%';  // Show two slides at a time
//                 slide.style.maxWidth = '50%';
//                 slide.style.padding = '0 10px';
//                 slide.style.boxSizing = 'border-box';
//             });

//             // Optional: Add responsive behavior
//             if (window.innerWidth <= 991) {
//                 slides.forEach(slide => {
//                     slide.style.flex = '0 0 100%';
//                     slide.style.maxWidth = '100%';
//                 });
//             }

//             window.addEventListener('resize', () => {
//                 if (window.innerWidth <= 991) {
//                     slides.forEach(slide => {
//                         slide.style.flex = '0 0 100%';
//                         slide.style.maxWidth = '100%';
//                     });
//                 } else {
//                     slides.forEach(slide => {
//                         slide.style.flex = '0 0 50%';
//                         slide.style.maxWidth = '50%';
//                     });
//                 }
//             });
//         }

//         // Ensure slider initialization after a short delay
//         setTimeout(initializeSlider, 200);
//     }

//     // Countdown function with corrected interval handling
//     function initCountdown(containerId, expiryDate) {
//         const countdownEl = document.getElementById(containerId);
//         if (!countdownEl) return;

//         const daysEl = countdownEl.querySelector('.days');
//         const hoursEl = countdownEl.querySelector('.hours');
//         const minutesEl = countdownEl.querySelector('.minutes');
//         const secondsEl = countdownEl.querySelector('.seconds');

//         // Declare countdownInterval outside the update function
//         let countdownInterval;

//         function updateCountdown() {
//             const now = new Date();
//             const difference = expiryDate.getTime() - now.getTime();

//             if (difference > 0) {
//                 const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//                 const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//                 const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
//                 const seconds = Math.floor((difference % (1000 * 60)) / 1000);

//                 daysEl.textContent = days.toString().padStart(2, '0');
//                 hoursEl.textContent = hours.toString().padStart(2, '0');
//                 minutesEl.textContent = minutes.toString().padStart(2, '0');
//                 secondsEl.textContent = seconds.toString().padStart(2, '0');
//             } else {
//                 clearInterval(countdownInterval);
//                 daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = '00';
//             }
//         }

//         updateCountdown();
//         countdownInterval = setInterval(updateCountdown, 1000);
//     }

//     fetchFlashSales();
// });

// flashsale.js
// flashsale.js
document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch coupon data
    async function fetchFlashSales() {
        try {
            const response = await fetch('http://localhost:5002/api/couponweb');
            const data = await response.json();
            
            if (data.success && data.coupons.length > 0) {
                renderFlashSales(data.coupons);
            } else {
                console.log('No flash sales available');
            }
        } catch (error) {
            console.error('Error fetching flash sales:', error);
        }
    }

    // Function to render flash sales
    function renderFlashSales(coupons) {
        const flashSalesSlider = document.querySelector('.flash-sales__slider');
        
        if (!flashSalesSlider) {
            console.error('Flash sales slider element not found');
            return;
        }

        flashSalesSlider.innerHTML = '';

        // Iterate through coupons and create slider items
        coupons.forEach((coupon, index) => {
            const slideElement = document.createElement('div');
            slideElement.classList.add('flash-sales-slide');
            const discountPercentage = coupon.discountValue;
            
            // Use server time or provide fallback
            const expiryDate = new Date(coupon.expiry || Date.now() + 24 * 60 * 60 * 1000);

            slideElement.innerHTML = `
                <div class="flash-sales-item rounded-16 overflow-hidden z-1 position-relative flex-align flex-0 justify-content-between gap-8">
                    <img src="assets/images/bg/flash.jpg" alt=""
                        class="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover z-n1 flash-sales-item__bg">
                    <div class="flash-sales-item__thumb d-sm-block d-none">
                        <img src="assets/images/thumbs/flash${index + 1}.png" alt="">
                    </div>
                    <div class="flash-sales-item__content ms-sm-auto">
                        <h6 class="text-32 mb-20 flash">Up to ${discountPercentage}% off !</h6>
                        <h6 class="text-32 mb-20 flash"> ${coupon.code}</h6>
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

            // Initialize countdown for each coupon
            initCountdown(`countdown${index + 1}`, expiryDate);
        });

        // Advanced slider initialization
        function initializeSlider() {
            // Ensure jQuery and Slick are loaded
            if (typeof jQuery === 'undefined' || typeof jQuery.fn.slick === 'undefined') {
                console.warn('jQuery or Slick slider not found. Using fallback navigation.');
                fallbackSliderNavigation();
                return;
            }

            // Wait for a short time to ensure DOM is fully ready
            requestAnimationFrame(() => {
                try {
                    // Use absolute selector to ensure correct element
                    $('.flash-sales__slider').slick({
                        slidesToShow: Math.min(2, $('.flash-sales__slider .flash-sales-slide').length),
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        speed: 1500,
                        dots: false,
                        pauseOnHover: true,
                        arrows: true,
                        draggable: true,
                        rtl: $('html').attr('dir') === 'rtl',
                        infinite: true,
                        nextArrow: '#flash-next',
                        prevArrow: '#flash-prev',
                        responsive: [
                            {
                                breakpoint: 991,
                                settings: {
                                    slidesToShow: 1,
                                    arrows: false,
                                }
                            }
                        ]
                    });
                } catch (error) {
                    console.error('Detailed Slick slider initialization error:', error);
                    fallbackSliderNavigation();
                }
            });
        }

        // Custom slider navigation for when Slick is not available
        function fallbackSliderNavigation() {
            const slider = flashSalesSlider;
            const slides = Array.from(slider.children);
            
            // Reset slider styles
            slider.style.display = 'flex';
            slider.style.overflow = 'hidden';
            slider.style.width = '100%';

            // Style slides
            slides.forEach((slide) => {
                slide.style.flex = slides.length > 1 ? '0 0 50%' : '0 0 100%';
                slide.style.maxWidth = slides.length > 1 ? '50%' : '100%';
                slide.style.padding = '0 10px';
                slide.style.boxSizing = 'border-box';
            });

            // Responsive behavior
            function adjustSlides() {
                const isSmallScreen = window.innerWidth <= 991;
                slides.forEach(slide => {
                    slide.style.flex = isSmallScreen ? '0 0 100%' : (slides.length > 1 ? '0 0 50%' : '0 0 100%');
                    slide.style.maxWidth = isSmallScreen ? '100%' : (slides.length > 1 ? '50%' : '100%');
                });
            }

            // Initial adjustment and add resize listener
            adjustSlides();
            window.addEventListener('resize', adjustSlides);
        }

        // Ensure slider initialization after a short delay
        setTimeout(initializeSlider, 300);
    }

    // Countdown function with corrected interval handling
    function initCountdown(containerId, expiryDate) {
        const countdownEl = document.getElementById(containerId);
        if (!countdownEl) return;

        const daysEl = countdownEl.querySelector('.days');
        const hoursEl = countdownEl.querySelector('.hours');
        const minutesEl = countdownEl.querySelector('.minutes');
        const secondsEl = countdownEl.querySelector('.seconds');

        // Declare countdownInterval outside the update function
        let countdownInterval;

        function updateCountdown() {
            const now = new Date();
            const difference = expiryDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                daysEl.textContent = days.toString().padStart(2, '0');
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
            } else {
                clearInterval(countdownInterval);
                daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = '00';
            }
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    fetchFlashSales();
});