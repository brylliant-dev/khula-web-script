  var Webflow = Webflow || [];
  Webflow.push(function () {
    // Swiper Library for Card Slider
    function initializeSwiper() {
      // Main Swiper for Products
      var swiperProd = new Swiper('.product-swiper', {
  loop: true,
  centeredSlides: true,
  slidesPerView: 'auto', // Allows flexibility for overlapping slides
  spaceBetween: 0, // Removes additional gaps
  navigation: {
    nextEl: '.swiper-button.nav-next',
    prevEl: '.swiper-button.nav-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  on: {
    init: function () {
      updateSlideClasses(this);
    },
    slideChangeTransitionStart: function () {
      updateSlideClasses(this);
    },
  },
  breakpoints: {
    // Settings for tablet
    768: {
      slidesPerView: 2, // Show fewer slides for better readability
      spaceBetween: 20, // Smaller spacing for tablet devices
    },
    // Settings for mobile
    480: {
      slidesPerView: 1, // Only one slide for smaller screens
      spaceBetween: 10, // Minimal spacing on mobile devices
    },
  },
});

let resizeTimeout;

window.addEventListener('resize', function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    swiperProd.update();
  }, 200); // Delay in milliseconds to prevent excessive updating
});


      function updateSlideClasses(swiper) {
        // Remove old classes
        swiper.slides.forEach((slide) => {
          slide.classList.remove('is-left', 'is-right');
        });

        // Get active, previous, and next slides
        const activeSlide = swiper.slides[swiper.activeIndex];
        const prevSlide =
              activeSlide.previousElementSibling || swiper.slides[swiper.slides.length - 1];
        const nextSlide =
              activeSlide.nextElementSibling || swiper.slides[0];

        // Apply new classes for transition effects
        prevSlide.classList.add('is-left');
        nextSlide.classList.add('is-right');
      }



      // Swiper for Slider Components
      $(".slider-main-component").each(function () {
        const swiper = new Swiper($(this).find(".swiper")[0], {
          direction: "horizontal",
          loop: true,
          slidesPerView: "auto",
          followFinger: true,
          pagination: {
            el: $(this).find(".swiper-bullet-wrapper")[0],
            bulletActiveClass: "is-active",
            bulletClass: "swiper-slider-bullet",
            bulletElement: "button",
            clickable: true,
          },
        });
      });
    }

    // Initialize Swiper for Award Testament only on smaller screens
    function initializeAwardSwiper() {
      if (window.innerWidth <= 768) {
        const swiperAward = new Swiper(".award-testament.swiper", {
          direction: "horizontal",
          loop: true,
          slidesPerView: "auto",
          followFinger: true,
          pagination: {
            el: ".swiper-bullet-wrapper-award",
            bulletActiveClass: "is-active",
            bulletClass: "swiper-slider-bullet-award",
            bulletElement: "button",
            clickable: true,
          },
        });
      }
    }

    // Call the Swiper Initialization Functions
    window.onload = function () {
      initializeSwiper();
      initializeAwardSwiper();
    };

    // Add click event handler for text-link-nav
    $(".text-link-nav").click(function () {
      if (window.innerWidth < 972) {
        $(".menu-trigger").click();
      }
    });
  });

  // GSAP and SplitType Animation Setup
  $(document).ready(function () {
    setTimeout(function () {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.defaults({
        markers: false,
      });

      let typeSplit;
      function runSplit() {
        typeSplit = new SplitType(".text-reveal", {
          types: "lines, words",
        });
        $(".line").append("<div class='line-mask'></div>");
        createAnimation();
      }

      let windowWidth = $(window).innerWidth();
      window.addEventListener("resize", function () {
        if (windowWidth !== $(window).innerWidth()) {
          windowWidth = $(window).innerWidth();
          typeSplit.revert();
          runSplit();
        }
      });

      function createAnimation() {
        $(".line").each(function () {
          let tl = gsap.timeline({
            scrollTrigger: {
              trigger: $(this),
              start: "top center",
              end: "bottom center",
              scrub: 1,
            },
          });
          tl.to($(this).find(".line-mask"), {
            width: "0%",
            duration: 1,
          });
        });
      }

      var textClip = document.querySelector(".accurate-text-clip");
      var maxScrollText =
        document.querySelector(".section-accurate").offsetHeight -
        window.innerHeight;
      var currentClipPercentageText = 30;
      var previousScrollText = 0;

      var observerText = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              window.addEventListener("scroll", handleScrollText);
            } else {
              window.removeEventListener("scroll", handleScrollText);
            }
          });
        },
        { threshold: 0.5 }
      );

      observerText.observe(document.querySelector(".section-accurate"));

      function handleScrollText() {
        var scrollText = window.scrollY;
        var scrollDirectionText =
          scrollText > previousScrollText ? "down" : "up";

        if (scrollDirectionText === "down" && currentClipPercentageText < 100) {
          currentClipPercentageText = Math.min(
            100,
            currentClipPercentageText + 1
          );
        } else if (
          scrollDirectionText === "up" &&
          currentClipPercentageText > 30
        ) {
          currentClipPercentageText = Math.max(
            30,
            currentClipPercentageText - 1
          );
        }

        textClip.style.clipPath =
          "circle(" + currentClipPercentageText + "% at center)";
        previousScrollText = scrollText;
      }

      var mapClip = document.querySelector(".dotted-map-wrapper-clip");
      var maxScrollMap =
        document.querySelector(".section-weather-data").offsetHeight -
        window.innerHeight;
      var currentClipPercentageMap = 15;
      var previousScrollMap = 0;

      var observerMap = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              window.addEventListener("scroll", handleScrollMap);
            } else {
              window.removeEventListener("scroll", handleScrollMap);
            }
          });
        },
        { threshold: 0.5 }
      );

      observerMap.observe(document.querySelector(".section-weather-data"));

      function handleScrollMap() {
        var scrollMap = window.scrollY;
        var scrollDirectionMap =
          scrollMap > previousScrollMap ? "down" : "up";

        if (scrollDirectionMap === "down" && currentClipPercentageMap < 100) {
          currentClipPercentageMap = Math.min(
            100,
            currentClipPercentageMap + 1
          );
        } else if (
          scrollDirectionMap === "up" &&
          currentClipPercentageMap > 15
        ) {
          currentClipPercentageMap = Math.max(
            15,
            currentClipPercentageMap - 1
          );
        }

        mapClip.style.clipPath =
          "circle(" + currentClipPercentageMap + "% at center)";
        previousScrollMap = scrollMap;
      }

      runSplit();
    }, 2000);
  });
</script>

<script>
/*
  document.addEventListener('DOMContentLoaded', function () {
    const lightboxLink = document.querySelector('.lightbox-link');

    if (lightboxLink) {
      lightboxLink.addEventListener('click', function () {
        const iframe = document.querySelector('iframe.embedly-embed');
        console.log('vimeo here')
        if (iframe) {
          let src = iframe.src;
          
          // Check if the autoplay parameter already exists
          if (!src.includes('autoplay=1')) {
            // Append autoplay=1 to the URL for Vimeo video
            src += (src.includes('?') ? '&' : '?') + 'autoplay=1&muted=1';
            iframe.src = src;
          }
        }
      });
    }
  });
  */
