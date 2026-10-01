let lenis;

let isMobile = window.innerWidth < 550;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

let isSafari =
  /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

function handleOrientationChange() {
  setTimeout(function () {
    window.location.reload();
  }, 250);
}
window.addEventListener("orientationchange", handleOrientationChange);

function initResizeRefresh() {
  // ————— Update on window resize
  let windowWidth = $(window).innerWidth();
  const handleResize = debounce(function () {
    if (windowWidth !== window.innerWidth) {
      windowWidth = window.innerWidth;
      ScrollTrigger.refresh();
    }
  }, 200);
  window.addEventListener("resize", handleResize);

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

function initPageTransition() {
  let pageLoadTimeline = gsap.timeline({
    onStart: () => {
      gsap.set("[data-transition=wrap]", { background: "transparent" });
    },
    onComplete: () => {
      gsap.set("[data-transition=wrap]", { display: "none" });
    },
  });

  // Play the timeline only after the grid is ready
  pageLoadTimeline.to("[data-transition=wrap]", {
    delay: 0.5,
    y: "-100vh",
    overwrite: true,
    duration: 1,
    ease: CustomEase.create("custom", "M0,0 C0.3,0.193 0.04,1 1,1 "),
  });

  const loaderWrap = $("[data-loader=wrap]");
  const loaderEl = loaderWrap.find($("[data-loader=el]"));

  if (loaderWrap) {
    pageLoadTimeline.to(
      loaderEl,
      {
        borderWidth: 0,
        duration: 0.5,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(loaderWrap, {
            display: "none",
          });
        },
      },
      0
    );
  }

  // Pre-process all valid links
  const validLinks = Array.from(document.querySelectorAll("a")).filter(
    (link) => {
      const href = link.getAttribute("href") || "";
      const hostname = new URL(link.href, window.location.origin).hostname;

      return (
        hostname === window.location.hostname && // Same domain
        !href.startsWith("#") && // Not an anchor link
        link.getAttribute("target") !== "_blank" && // Not opening in a new tab
        !link.hasAttribute("data-transition-prevent") // No 'data-transition-prevent' attribute
      );
    }
  );

  // Add event listeners to pre-processed valid links
  validLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const destination = link.href;

      // Show loading grid with animation
      gsap.set("[data-transition=wrap]", { display: "block" });
      gsap.fromTo(
        "[data-transition=wrap]",
        { y: "150vh", xPercent: 0, rotation: 0, overwrite: true },
        {
          y: "0vh",
          xPercent: 0,
          rotation: 0,
          duration: 1,
          ease: "expo.out",
          onComplete: () => {
            window.location.href = destination;
          },
        }
      );
    });
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

function initGSAPPlugins() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);
  gsap.registerPlugin(CustomEase);
  gsap.registerPlugin(DrawSVGPlugin);
}

function initPageLoad() {
  gsap.set(".page_main", {
    maxHeight: "100vh",
  });
  gsap.delayedCall(1, function () {
    gsap.set(".page_main", {
      maxHeight: "none",
    });
    ScrollTrigger.refresh(); // Recalculate scroll triggers
  });
}

function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)",
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document
          .querySelectorAll('[data-parallax="trigger"]')
          .forEach((trigger) => {
            // Check if this trigger has to be disabled on smaller breakpoints
            const disable = trigger.getAttribute("data-parallax-disable");
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) {
              return;
            }

            // Optional: you can target an element inside a trigger if necessary
            const target =
              trigger.querySelector('[data-parallax="target"]') || trigger;

            // Get the direction value to decide between xPercent or yPercent tween
            const direction =
              trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";

            // Get the scrub value, our default is 'true' because that feels nice with Lenis
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

            // Get the start position in %
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;

            // Get the end position in %
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;

            // Get the start value of the ScrollTrigger
            const scrollStartRaw =
              trigger.getAttribute("data-parallax-scroll-start") ||
              "top bottom";
            const scrollStart = `clamp(${scrollStartRaw})`;

            // Get the end value of the ScrollTrigger
            const scrollEndRaw =
              trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            const scrollEnd = `clamp(${scrollEndRaw})`;

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              }
            );
          });
      });

      return () => ctx.revert();
    }
  );
}

function initHomeIntroAnimation() {
  // Check if we're actually on the home page
  const currentPage = $("[data-page]").attr("data-page");
  if (currentPage !== "home") return; // Exit if not home

  let loaderDelay = 0.5;

  // Your epic home intro animation here

  $("[data-hero=section]").each(function () {
    lenis.stop();

    let introTl = gsap.timeline({
      onComplete: () => {
        lenis.start();
        sessionStorage.setItem("loaderComplete", "true");
      },
    });

    const section = $(this);
    const logoFront = $("[data-home=nav-front]");
    // const logoScripts = $("[data-nav=logo-scripts]");
    const logoScripts = null;
    const creatPath = $("#nav-creat");
    const tBarPath = $("#nav-t-bar");
    const ivePath = $("#nav-ive");
    const iDotPath = $("#nav-i-dot");
    const navItemWraps = $("[data-animation-load=nav-item-wrap]");
    const navMenuButton = $("[data-animation-load=nav-menu-button]");

    const handwritingDelay = logoScripts ? 5 : 0;

    // if (loaderPlayed) {
    //   loaderDelay = 0.25;
    //   if (logoScripts) {
    //     gsap.set(logoScripts, {
    //       display: "flex",
    //     });
    //   }

    //   gsap.set(logoFront, {
    //     clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    //   });
    //   return;
    // }

    const subtitleOne = section.find(
      "[data-animation-load=home-hero-subtitle-one]"
    );
    const subtitleTwo = section.find(
      "[data-animation-load=home-hero-subtitle-two]"
    );
    const subtext = section.find("[data-animation-load=home-hero-subtext]");
    const heading = section.find("[data-animation-load=home-hero-heading]");
    const navMenuItems = $("[data-animation-load=home-nav-words]");

    document.fonts.ready.then(function () {
      // introTl.fromTo(
      //   logoFront,
      //   {
      //     clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      //   },
      //   {
      //     clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      //     duration: loaderDelay + 2,
      //     ease: CustomEase.create(
      //       "custom",
      //       "M0,0 C0,0 0.136,0.023 0.168,0.036 0.203,0.05 0.172,0.068 0.205,0.083 0.236,0.096 0.24,0.123 0.273,0.137 0.302,0.15 0.322,0.144 0.354,0.157 0.384,0.172 0.366,0.199 0.4,0.214 0.432,0.227 0.62,0.265 0.653,0.28 0.671,0.288 0.706,1 0.763,1 0.835,1 0.909,1 1,1 "
      //     ),
      //   },
      //   0
      // );

      if (logoScripts) {
        introTl.set(
          logoScripts,
          {
            display: "flex",
            delay: loaderDelay - 0.5,
          },
          0
        );

        introTl.from(
          creatPath,
          {
            opacity: 0,
            duration: 0.5,
            delay: loaderDelay - 0.5,
          },
          0
        );

        introTl.from(
          creatPath,
          {
            drawSVG: 0,
            duration: 2.25,
            ease: "power2.inOut",
            delay: loaderDelay - 0.5,
          },
          0
        );

        introTl.from(
          tBarPath,
          {
            opacity: 0,
            duration: 0.5,
            delay: loaderDelay + 1.25,
          },
          0
        );

        introTl.from(
          tBarPath,
          {
            drawSVG: 0,
            duration: 1.5,
            ease: "power2.out",
            delay: loaderDelay + 1.25,
          },
          0
        );

        introTl.from(
          iDotPath,
          {
            opacity: 0,
            duration: 0.5,
            delay: loaderDelay + 1.25,
          },
          0
        );

        introTl.from(
          iDotPath,
          {
            drawSVG: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: loaderDelay + 1.25,
          },
          0
        );

        introTl.from(
          ivePath,
          {
            opacity: 0,
            duration: 0.5,
            delay: loaderDelay + 0.41,
          },
          0
        );

        introTl.from(
          ivePath,
          {
            drawSVG: 0,
            duration: 2,
            ease: "power2.out",
            delay: loaderDelay + 0.41,
          },
          0
        );
      }

      introTl.from(
        navItemWraps,
        {
          opacity: 0,
          yPercent: 110,
          duration: 1.5,
          ease: "expo.out",
          delay: loaderDelay + 1 + handwritingDelay,
          stagger: { each: 0.125 },
        },
        0
      );

      if (isMobileLandscape) {
        introTl.from(
          navMenuButton,
          {
            opacity: 0,
            yPercent: 110,
            duration: 1.5,
            ease: "expo.out",
            delay: loaderDelay + 1 + handwritingDelay,
          },
          0
        );
      }
    });

    document.fonts.ready.then(function () {
      SplitText.create(subtitleOne.children(), {
        type: "lines, words",
        autoSplit: true,
        mask: "lines",
        onSplit(instance) {
          return introTl.from(
            instance.words,
            {
              delay: loaderDelay + 1 + handwritingDelay,
              yPercent: 110,
              duration: 1.5,
              stagger: {
                each: 0.05,
              },
              ease: "expo.out",
            },
            0
          );
        },
      });
      SplitText.create(subtitleTwo.children(), {
        type: "lines, words",
        autoSplit: true,
        mask: "lines",
        onSplit(instance) {
          return introTl.from(
            instance.words,
            {
              delay: loaderDelay + 1.125 + handwritingDelay,
              yPercent: 110,
              duration: 1.5,
              stagger: {
                each: 0.05,
              },
              ease: "expo.out",
            },
            0
          );
        },
      });
      SplitText.create(heading.children(), {
        type: "lines, words",
        autoSplit: true,
        mask: "lines",
        onSplit(instance) {
          return introTl.from(
            instance.words,
            {
              delay: loaderDelay + 1.25 + handwritingDelay,
              yPercent: 110,
              duration: 1.5,
              stagger: {
                each: 0.05,
              },
              ease: "expo.out",
            },
            0
          );
        },
      });
      SplitText.create(subtext.children(), {
        type: "lines, words",
        autoSplit: true,
        mask: "lines",
        onSplit(instance) {
          return introTl.from(
            instance.lines,
            {
              delay: loaderDelay + 2 + handwritingDelay,
              yPercent: 110,
              duration: 1.75,
              stagger: {
                each: 0.075,
              },
              ease: "expo.out",
            },
            0
          );
        },
      });
    });

    $("[data-animation-load=home-hero-button]").each(function () {
      introTl.from(
        $(this),
        {
          opacity: 0,
          yPercent: 175,
          rotation: 7.5,
          duration: 1.75,
          delay: loaderDelay + 1.75 + handwritingDelay,
          ease: "expo.out",
        },
        0
      );
    });
  });
}

function initButtons() {
  const offsetIncrement = 0.0125; // Transition offset increment in seconds
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ""; // Clear the original content

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      // Handle spaces explicitly
      if (char === " ") {
        span.style.whiteSpace = "pre"; // Preserve space width
      }

      button.appendChild(span);
    });
  });
}

function initNav() {
  function initNavigation() {
    if (!initNavigation._hasResizeListener) {
      initNavigation._hasResizeListener = true;
      window.addEventListener("resize", function () {
        debounce(initNavigation, 200);
      });
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile && initNavigation._lastMode !== "mobile") {
      initMobileMenu();
      initNavigation._lastMode = "mobile";
    } else if (!isMobile && initNavigation._lastMode !== "desktop") {
      initDesktopDropdowns();
      initNavigation._lastMode = "desktop";
    }
  }

  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function initMobileMenu() {
    const btn = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-menu-status]");
    if (!btn || !nav) return;

    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "mobile-navigation");
    nav.setAttribute("id", "mobile-navigation");
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Main navigation");

    if (!btn._mobileClick) {
      btn._mobileClick = true;
      btn.addEventListener("click", () => {
        const open = nav.dataset.menuStatus === "open";
        nav.dataset.menuStatus = open ? "closed" : "open";
        btn.setAttribute("aria-expanded", !open);

        // Close all dropdowns when closing the menu
        if (open) {
          Array.from(
            document.querySelectorAll("[data-dropdown-toggle]")
          ).forEach((toggle) => {
            toggle.dataset.dropdownToggle = "closed";
            toggle.setAttribute("aria-expanded", "false");
          });
        }
      });
    }

    Array.from(document.querySelectorAll("[data-dropdown-toggle]")).forEach(
      (toggle, i) => {
        const dd = toggle.nextElementSibling;
        if (!dd || !dd.classList.contains("nav-dropdown")) return;
        if (toggle._mobileDropdownInit) return;
        toggle._mobileDropdownInit = true;

        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-haspopup", "true");
        toggle.setAttribute("aria-controls", `dropdown-${i}`);

        dd.setAttribute("id", `dropdown-${i}`);
        dd.setAttribute("role", "menu");
        dd.querySelectorAll(".nav-dropdown__link").forEach((link) =>
          link.setAttribute("role", "menuitem")
        );

        toggle.addEventListener("click", () => {
          const open = toggle.dataset.dropdownToggle === "open";
          Array.from(
            document.querySelectorAll("[data-dropdown-toggle]")
          ).forEach((other) => {
            if (other !== toggle) {
              other.dataset.dropdownToggle = "closed";
              other.setAttribute("aria-expanded", "false");
              if (other === document.activeElement) other.blur();
            }
          });
          toggle.dataset.dropdownToggle = open ? "closed" : "open";
          toggle.setAttribute("aria-expanded", !open);
          if (open && toggle === document.activeElement) toggle.blur();
        });
      }
    );
  }

  function initDesktopDropdowns() {
    const toggles = Array.from(
      document.querySelectorAll("[data-dropdown-toggle]")
    );
    const links = Array.from(
      document.querySelectorAll(".nav-link:not([data-dropdown-toggle])")
    );

    toggles.forEach((toggle, i) => {
      const dd = toggle.nextElementSibling;
      if (!dd || !dd.classList.contains("nav-dropdown") || toggle._desktopInit)
        return;
      toggle._desktopInit = true;

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-haspopup", "true");
      toggle.setAttribute("aria-controls", `desktop-dropdown-${i}`);

      dd.setAttribute("id", `desktop-dropdown-${i}`);
      dd.setAttribute("role", "menu");
      dd.setAttribute("aria-hidden", "true");
      dd.querySelectorAll(".nav-dropdown__link").forEach((link) =>
        link.setAttribute("role", "menuitem")
      );

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        toggles.forEach((other) => {
          if (other !== toggle) {
            other.dataset.dropdownToggle = "closed";
            other.setAttribute("aria-expanded", "false");
            const otherDropdown = other.nextElementSibling;
            if (otherDropdown)
              otherDropdown.setAttribute("aria-hidden", "true");
          }
        });
        const open = toggle.dataset.dropdownToggle !== "open";
        toggle.dataset.dropdownToggle = "open";
        toggle.setAttribute("aria-expanded", "true");
        dd.setAttribute("aria-hidden", "false");
        if (open) {
          const first = dd.querySelector(".nav-dropdown__link");
          if (first) first.focus();
        }
      });

      toggle.addEventListener("mouseenter", () => {
        const anyOpen = toggles.some(
          (x) => x.dataset.dropdownToggle === "open"
        );
        toggles.forEach((other) => {
          if (other !== toggle) {
            other.dataset.dropdownToggle = "closed";
            other.setAttribute("aria-expanded", "false");
            const otherDropdown = other.nextElementSibling;
            if (otherDropdown)
              otherDropdown.setAttribute("aria-hidden", "true");
          }
        });
        if (anyOpen) {
          setTimeout(() => {
            toggle.dataset.dropdownToggle = "open";
            toggle.setAttribute("aria-expanded", "true");
            dd.setAttribute("aria-hidden", "false");
          }, 20);
        } else {
          toggle.dataset.dropdownToggle = "open";
          toggle.setAttribute("aria-expanded", "true");
          dd.setAttribute("aria-hidden", "false");
        }
      });

      dd.addEventListener("mouseleave", () => {
        toggle.dataset.dropdownToggle = "closed";
        toggle.setAttribute("aria-expanded", "false");
        dd.setAttribute("aria-hidden", "true");
      });

      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle.click();
        } else if (e.key === "Escape") {
          toggle.dataset.dropdownToggle = "closed";
          toggle.setAttribute("aria-expanded", "false");
          dd.setAttribute("aria-hidden", "true");
          toggle.focus();
        }
      });

      dd.addEventListener("keydown", (e) => {
        const items = Array.from(dd.querySelectorAll(".nav-dropdown__link"));
        const idx = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          items[(idx + 1) % items.length].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          items[(idx - 1 + items.length) % items.length].focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          toggle.dataset.dropdownToggle = "closed";
          toggle.setAttribute("aria-expanded", "false");
          dd.setAttribute("aria-hidden", "true");
          toggle.focus();
        } else if (e.key === "Tab" && !dd.contains(e.relatedTarget)) {
          toggle.dataset.dropdownToggle = "closed";
          toggle.setAttribute("aria-expanded", "false");
          dd.setAttribute("aria-hidden", "true");
        }
      });
    });

    links.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        toggles.forEach((toggle) => {
          toggle.dataset.dropdownToggle = "closed";
          toggle.setAttribute("aria-expanded", "false");
          const dd = toggle.nextElementSibling;
          if (dd) dd.setAttribute("aria-hidden", "true");
        });
      });
    });

    document.addEventListener("click", (e) => {
      const inside = toggles.some((toggle) => {
        const dd = toggle.nextElementSibling;
        return toggle.contains(e.target) || (dd && dd.contains(e.target));
      });
      if (!inside) {
        toggles.forEach((toggle) => {
          toggle.dataset.dropdownToggle = "closed";
          toggle.setAttribute("aria-expanded", "false");
          const dd = toggle.nextElementSibling;
          if (dd) dd.setAttribute("aria-hidden", "true");
        });
      }
    });
  }

  function initNavMove() {
    const wrap = $("[data-nav=global]");
    if (wrap) {
      navMove = gsap
        .from(wrap, {
          yPercent: -100,
          paused: true,
          duration: 0.4,
        })
        .progress(1);

      navMoveTrigger = ScrollTrigger.create({
        start: "top top",
        end: "max",
        // markers: true,
        onUpdate: (self) => {
          if (navMove) {
            if (self.direction === -1) {
              navMove.play();
            } else {
              navMove.reverse();
            }
          }
        },
      });
    }
  }

  initNavMove();
  initNavigation();
}

function initFooter() {
  document.querySelectorAll("[data-footer-parallax]").forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "clamp(top bottom)",
        end: "clamp(top top)",
        scrub: true,
      },
    });

    const inner = el.querySelector("[data-footer-parallax-inner]");
    const bottom = el.querySelector("[data-footer=bottom]");
    const dark = el.querySelector("[data-footer-parallax-dark]");

    if (inner) {
      tl.from(inner, {
        yPercent: -25,
        ease: "linear",
      });
    }

    if (bottom) {
      tl.from(
        bottom,
        {
          yPercent: 10,
          ease: "linear",
        },
        "<"
      );
    }

    if (dark) {
      tl.from(
        dark,
        {
          opacity: 0.5,
          ease: "linear",
        },
        "<"
      );
    }
  });
}

function initScrollAnimations() {
  gsap.matchMedia().add("(min-width: 768px)", () => {
    $("[data-animation-scroll=chars]").each(function () {
      const element = $(this);

      SplitText.create(element, {
        type: "lines, chars",
        mask: "chars",
        ignore: "strong",
        autoSplit: true,
        linesClass: "line",
        wordsClass: "word",
        charsClass: "char",
        onSplit: function (instance) {
          const targets = instance.chars;

          return gsap.from(targets, {
            yPercent: -110,
            duration: 1.5,
            stagger: { each: 0.05, from: "center" },
            ease: "expo.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              // once: true,
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });

    $("[data-animation-scroll=words]").each(function () {
      const element = $(this);

      SplitText.create(element.children(), {
        type: "lines, words",
        mask: "lines",
        ignore: "strong",
        autoSplit: true,
        linesClass: "line",
        wordsClass: "word",
        onSplit: function (instance) {
          const targets = instance.words;

          return gsap.from(targets, {
            yPercent: 110,
            duration: 1.5,
            stagger: { each: 0.033 },
            ease: "expo.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              // once: true,
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });

    $("[data-animation-scroll=handwritten-words]").each(function () {
      const element = $(this);

      SplitText.create(element.children(), {
        type: "words",
        // mask: "words",
        ignore: isSafari ? "strong" : null,
        autoSplit: true,
        linesClass: "line",
        wordsClass: "word",
        onSplit: function (instance) {
          const targets = instance.words;

          return gsap.from(targets, {
            yPercent: 110,
            duration: 1.5,
            stagger: { each: 0.033 },
            ease: "expo.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              // once: true,
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });

    $("[data-animation-scroll=lines]").each(function () {
      const element = $(this); // Save reference to the DOM element

      // Split the text
      SplitText.create(element.children(), {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "line",
        onSplit: function (instance) {
          const targets = instance.lines;

          return gsap.from(targets, {
            yPercent: 110,
            duration: 1.5,
            stagger: {
              each: 0.1,
            },
            ease: "expo.out",
            scrollTrigger: {
              trigger: element, // Use the saved element reference
              start: "top 90%",
              // once: true,
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });
  });

  $("[data-animation-scroll=fade]").each(function () {
    gsap.from($(this), {
      opacity: 0,
      yPercent: 50,
      duration: 1.66,
      ease: "expo.out",
      scrollTrigger: {
        trigger: $(this), // Use the saved element reference
        start: "top 90%",
        // once: true,
        toggleActions: "play none none reverse",
      },
    });
  });

  $("[data-animation-scroll=button-main]").each(function () {
    gsap.from($(this).find("[data-button=main-element]"), {
      yPercent: 175,
      rotation: 7.5,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: {
        trigger: $(this), // Use the saved element reference
        start: "top 90%",
        // once: true,
        toggleActions: "play none none reverse",
      },
    });
  });

  $("[data-animation-scroll=divider-line").each(function () {
    gsap.from($(this), {
      scaleX: 0,
      duration: 1,
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: $(this), // Use the saved element reference
        start: "top 90%",
        // once: true,
        toggleActions: "play none none reverse",
      },
    });
  });
}

function initDefaultLoadAnimations() {
  gsap.set("[data-animation-load]", {
    opacity: 1,
  });

  $("[data-animation-load=chars]").each(function () {
    // Split the text
    SplitText.create($(this), {
      type: "lines, chars",
      mask: "lines", // wrap each line in an overflow:hidden div
      autoSplit: true,
      ignore: "strong",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance.chars; // Register animation targets

        return gsap.from(targets, {
          // delay: 1.5,
          delay: 0.75,
          yPercent: 110,
          duration: 1.5,
          stagger: {
            each: 0.05,
            from: "center",
          },
          ease: "expo.out",
        });
      },
    });
  });

  $("[data-animation-load=words]").each(function () {
    // Split the text
    SplitText.create($(this).children(), {
      type: "lines, words",
      mask: "lines", // wrap each line in an overflow:hidden div
      autoSplit: true,
      ignore: "strong",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance.words; // Register animation targets

        return gsap.from(targets, {
          delay: 0.75,
          yPercent: 110,
          duration: 2,
          stagger: {
            each: 0.05,
          },
          ease: "expo.out",
        });
      },
    });
  });

  $("[data-animation-load=handwritten-words]").each(function () {
    // Split the text
    SplitText.create($(this).children(), {
      type: "lines, words",
      // mask: "lines", // wrap each line in an overflow:hidden div
      autoSplit: true,
      ignore: isSafari ? "strong" : null,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance.words; // Register animation targets

        return gsap.from(targets, {
          opacity: 0,
          delay: 0.75,
          yPercent: 66,
          duration: 2,
          stagger: {
            each: 0.05,
          },
          ease: "expo.out",
          // onComplete: () => {
          //   instance.revert();
          // },
        });
      },
    });
  });

  $("[data-animation-load=lines]").each(function () {
    // Split the text
    SplitText.create($(this).children(), {
      type: "lines, words",
      mask: "lines", // wrap each line in an overflow:hidden div
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance.lines; // Register animation targets

        return gsap.from(targets, {
          delay: 1.5,
          yPercent: 110,
          duration: 1.66,
          stagger: {
            each: 0.033,
          },
          ease: "expo.out",
        });
      },
    });
  });

  $("[data-animation-load=button-main]").each(function () {
    gsap.from($(this), {
      opacity: 0,
      yPercent: 175,
      rotation: 7.5,
      duration: 1,
      delay: 1.25,
      ease: "expo.out",
    });
  });

  $("[data-animation-load=fade]").each(function () {
    gsap.from($(this), {
      opacity: 0,
      delay: 0.75,
      yPercent: 75,
      duration: 1.66,
      ease: "expo.out",
    });
  });

  $("[data-animation-load=horizontal-line]").each(function () {
    gsap.from($(this), {
      delay: 1.5,
      scaleX: 0, // Grow to 90% height
      duration: 1.5,
      ease: "power2.inOut",
    });
  });
}

function initFOUC() {
  gsap.fromTo(
    ".page_main",
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 1.5,
      ease: "expo.inOut",
      onStart: () => {
        gsap.set(".page_main", {
          maxHeight: "100vh",
        });
      },
      onComplete: () => {
        $(document).trigger("FOUCReady");
        gsap.set(".page_main", {
          maxHeight: "none",
        });
        ScrollTrigger.refresh();
      },
    }
  );
  // gsap.fromTo(
  //   ".page_main",
  //   {
  //     opacity: 0,
  //     yPercent: 1,
  //   },
  //   {
  //     opacity: 1,
  //     yPercent: 0,
  //     duration: 1.5,
  //     ease: "expo.inOut",
  //     onComplete: () => {
  //       $(document).trigger("FOUCReady");
  //     },
  //   }
  // );
}

function initLenis() {
  lenis = new Lenis({
    wheelMultiplier: 0.8,
  });

  // lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });

  // gsap.ticker.lagSmoothing(0);
}

document.fonts.ready.then(function () {
  initGSAPPlugins();
  initResizeRefresh();
  initPageTransition();
  initPageLoad();
  initDefaultLoadAnimations();
  initLenis();
  initGlobalParallax();
  initButtons();
  initNav();
  gsap.delayedCall(0.25, initScrollAnimations());
  initHomeIntroAnimation();
  initFooter();
});

function initMobileServiceSwiper() {
  if (isMobileLandscape) {
    $("[data-swiper=mobile-services]").each(function () {
      const swiper = new Swiper($(this)[0], {
        speed: 400,
        spaceBetween: 16,
        slidesPerView: 1.25,
      });
    });
  }
}

function homeScrollAnimations() {
  $("[data-animation-scroll=home-banner]").each(function () {
    gsap.from($(this), {
      yPercent: 100, // Grow to 90% height
      ease: "expo.out", // Linear growth for scrub
      duration: 1,
      scrollTrigger: {
        trigger: $(this),
        start: "clamp(top bottom)", // Start when top of line hits 90% of viewport
        toggleActions: "play none none reverse",
      },
    });
  });
}

function initLogosWrapMove() {
  // Configuration
  const CONFIG = {
    maxTranslateX: 100, // Maximum pixels to translate left/right
    maxRotation: 5, // Maximum degrees to rotate
    ease: "power3.out", // Easing function
    duration: 0.6, // Animation duration in seconds
  };

  const $logosWrap = $("[data-clients-logos-outer]");

  if (!$logosWrap.length) return;

  // Create quickTo instances for optimal performance
  const quickX = gsap.quickTo($logosWrap[0], "x", {
    duration: CONFIG.duration,
    ease: CONFIG.ease,
  });

  const quickRotate = gsap.quickTo($logosWrap[0], "rotation", {
    duration: CONFIG.duration,
    ease: CONFIG.ease,
  });

  // Track mouse movement
  $(window).on("mousemove", function (e) {
    // Get window width and mouse position
    const windowWidth = $(window).width();
    const mouseX = e.clientX;

    // Calculate position relative to center (-1 to 1)
    const relativeX = (mouseX / windowWidth) * 2 - 1;

    // Calculate translate and rotation values
    const translateX = relativeX * CONFIG.maxTranslateX;
    const rotation = relativeX * CONFIG.maxRotation;

    // Apply animations using quickTo
    quickX(translateX);
    quickRotate(rotation);
  });

  // Optional: Reset on mouse leave
  // $(window).on("mouseleave", function () {
  //   quickX(0);
  //   quickRotate(0);
  // });
}

function initClientsAnimation() {
  const $logosWrap = $("[data-clients-logos-wrap]");
  const firstLogo = $("[data-clients-logo]")[0];
  const firstName = $("[data-clients-name]")[0];
  const firstStatement = $("[data-clients-statement]")[0];

  gsap.set($logosWrap, {
    scale: 0,
    rotate: "45deg",
    yPercent: -50,
  });

  $logosWrap.each(function () {
    ScrollTrigger.create({
      trigger: $(this),
      start: "bottom 80%",
      onEnter: () => {
        gsap.to($(this), {
          rotate: "0deg",
          scale: 1,
          duration: 1,
          ease: "expo.out",
        });
        gsap.to(firstLogo, {
          rotate: "0deg",
          scale: 1,
          duration: 1,
          ease: "expo.out",
          delay: 0.22,
        });
        gsap.fromTo(
          firstStatement,
          { opacity: 0, scale: 0.75, xPercent: -25 },
          {
            opacity: 1,
            scale: 1,
            xPercent: 0,
            duration: 1,
            ease: "expo.out",
            delay: 0.44,
          }
        );
      },
      onLeaveBack: () => {
        gsap.to($(this), {
          rotate: "45deg",
          scale: 0,
          duration: 1,
          ease: "expo.out",
          delay: 0.22,
        });
        gsap.to(firstLogo, {
          rotate: "45deg",
          scale: 0,
          duration: 1,
          ease: "expo.out",
        });
        gsap.to(firstStatement, {
          opacity: 0,
          scale: 0.75,
          xPercent: 25,
          duration: 0.66,
          ease: "expo.out",
        });
        gsap.to(firstName, {
          opacity: 0,
          duration: 1,
          ease: "expo.out",
        });
      },
    });
  });

  const $clientNames = $("[data-clients-name]");
  const namesList = [];

  $clientNames.each(function () {
    namesList.push($(this).attr("data-clients-name"));
  });

  $clientNames.each(function (index) {
    const name = $(this).attr("data-clients-name");
    const isFirst = index === 0;

    ScrollTrigger.create({
      trigger: this,
      start: "top center",
      onEnter: () => showClient(name, isFirst),
      onLeaveBack: () => {
        if (index > 0) showClient(namesList[index - 1]);
      },
    });
  });

  function showClient(name, skipLogoStatement = false) {
    gsap.to("[data-clients-name]", {
      opacity: 0,
      duration: 0.5,
      ease: "expo.out",
    });

    gsap.to(`[data-clients-name="${name}"]`, {
      opacity: 1,
      duration: 0.5,
      ease: "expo.out",
    });

    if (skipLogoStatement) return;

    // Hide all EXCEPT the active one
    gsap.to(
      `[data-clients-statement]:not([data-clients-statement="${name}"])`,
      {
        opacity: 0,
        scale: 0.75,
        xPercent: 25,
        duration: 0.66,
        ease: "expo.out",
      }
    );

    gsap.to(`[data-clients-logo]:not([data-clients-logo="${name}"])`, {
      scale: 0,
      yPercent: -50,
      rotate: "-45deg",
      duration: 0.66,
      ease: "expo.out",
    });

    // Show active one
    gsap.fromTo(
      `[data-clients-statement="${name}"]`,
      { opacity: 0, scale: 0.75, xPercent: -25 },
      {
        opacity: 1,
        scale: 1,
        xPercent: 0,
        duration: 0.66,
        ease: "expo.out",
      }
    );

    gsap.fromTo(
      `[data-clients-logo="${name}"]`,
      { scale: 0, rotate: "45deg", yPercent: 50 },
      {
        scale: 1,
        rotate: "0deg",
        yPercent: 0,
        duration: 0.66,
        ease: "expo.out",
      }
    );
  }

  const clientsHeading = $("[data-clients=heading-wrap]");
  const referralsWrap = clientsHeading.find("[data-clients=referrals-wrap]");
  const rLinePath = $("#referrals-r-line");
  const rLoopPath = $("#referrals-r-loop");
  const eFPath = $("#referrals-ef");
  const fPath = $("#referrals-f");
  const eRRPath = $("#referrals-err");
  const aPath = $("#referrals-a");
  const lSPath = $("#referrals-ls");

  let referralsTl = gsap.timeline({
    scrollTrigger: {
      trigger: clientsHeading,
      start: "bottom bottom",
      end: "bottom center",
      toggleActions: "play none none reverse",
    },
  });

  referralsTl.from(clientsHeading, {
    xPercent: 17.5,
    duration: 1.5,
    ease: "power2.inOut",
  });

  referralsTl.from(
    rLinePath,
    {
      drawSVG: 0,
      duration: 0.5,
      ease: "power2.inOut",
    },
    "<.5"
  );

  referralsTl.from(
    rLoopPath,
    {
      drawSVG: 0,
      duration: 0.75,
      ease: "power2.inOut",
    },
    "<.125"
  );

  referralsTl.from(
    eFPath,
    {
      drawSVG: 0,
      duration: 0.75,
      ease: "power2.inOut",
    },
    "<.25"
  );

  referralsTl.from(
    fPath,
    {
      drawSVG: 0,
      duration: 0.5,
      ease: "power2.inOut",
    },
    "<.25"
  );

  referralsTl.from(
    eRRPath,
    {
      drawSVG: 0,
      duration: 1.25,
      ease: "power2.inOut",
    },
    "<.25"
  );

  referralsTl.from(
    aPath,
    {
      drawSVG: 0,
      duration: 0.5,
      ease: "power2.inOut",
    },
    "<.75"
  );

  referralsTl.from(
    lSPath,
    {
      drawSVG: 0,
      duration: 0.75,
      ease: "power2.inOut",
    },
    "<.25"
  );
}

function initStoryAnimation() {
  $("[data-about=story-section]").each(function () {
    const wrap = $(this);
    const textWrap = wrap.find("[data-about=story-text-wrap]");
    const headingFront = wrap.find("[data-heading=story-front]");
    const headingBehind = wrap.find("[data-heading=story-behind]");
    // Unused Split for exact DOM match
    // const headingFrontSplit = SplitText.create(headingFront.children(), {
    //   type: "lines, words",
    //   mask: "lines",
    //   autoSplit: true,
    //   linesClass: "line",
    //   wordsClass: "word",
    // });
    // const headingBehindSplit = SplitText.create(headingBehind.children(), {
    //   type: "lines, words",
    //   mask: "lines",
    //   autoSplit: true,
    //   linesClass: "line",
    //   wordsClass: "word",
    // });

    let textFillTl = gsap.timeline({
      scrollTrigger: {
        trigger: textWrap,
        start: "top 77.5%",
        end: "bottom center",
        scrub: true,
      },
    });

    textFillTl.fromTo(
      headingFront,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        ease: CustomEase.create("custom", "M0,0 C0.3,0 0.806,0.897 1,1 "),
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      }
    );

    // let textRevealTl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: textWrap,
    //     start: "top 90%",
    //     end: "bottom bottom",
    //     scrub: true,
    //   },
    // });

    // textRevealTl.from(headingBehindSplit.words, {
    //   yPercent: 110,
    //   rotation: 1.25,
    //   stagger: {
    //     each: 0.05,
    //   },
    // });

    const imagesWrap = wrap.find("[data-about=story-images]");
    gsap.fromTo(
      imagesWrap,
      {
        yPercent: 20,
      },
      {
        yPercent: -10,
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    let proxy = { skew: 0 },
      skewSetter = gsap.quickSetter(".about-story_image", "skewY", "deg"), // fast
      clamp = gsap.utils.clamp(-30, 30); // don't let the skew go beyond 20 degrees.

    ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / -250);
        // only do something if the skew is MORE severe. Remember, we're always tweening back to 0, so if the user slows their scrolling quickly, it's more natural to just let the tween handle that smoothly rather than jumping to the smaller skew.
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.8,
            ease: "power3",
            overwrite: true,
            onUpdate: () => skewSetter(proxy.skew),
          });
        }
      },
    });

    // make the right edge "stick" to the scroll bar. force3D: true improves performance
    gsap.set(".about-story_image", {
      transformOrigin: "right center",
      force3D: true,
    });
  });
}

function initExplainerAnimation() {
  $("[data-about=explainer-section]").each(function () {
    const wrap = $(this);
    const card = wrap.find("[data-about=explainer-card]");
    const cardHeading = wrap.find("[data-heading=explainer]");
    const cardHeadingSplit = SplitText.create(cardHeading, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      linesClass: "line",
    });

    let cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        end: "top -12.5%",
        scrub: 0.5,
      },
    });

    if (!isMobileLandscape) {
      cardTl.from(
        card,
        {
          rotation: -15,
          yPercent: -100,
          ease: "power1.inOut",
        },
        "<"
      );
    }

    cardTl.from(
      cardHeadingSplit.lines,
      {
        yPercent: -180,
        stagger: {
          each: 0.05,
        },
      },
      "<"
    );

    document.querySelectorAll(".about-explainer_word_wrap").forEach((word) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: word,
          start: "bottom bottom",
          end: "bottom center",
          scrub: true,
        },
      });

      tl.fromTo(word.children, { yPercent: -120 }, { yPercent: 0 });

      // tl.to(word.children, {
      //   yPercent: 100,
      //   delay: 0.25,
      // });
    });
  });
}

function initServicesAnimation() {
  document
    .querySelectorAll(".services_home_heading_word_wrap")
    .forEach((word) => {
      const rotatorOne = word.querySelector(".is-original");
      const rotatorTwo = word.querySelector(".is-rotator-one");
      const rotatorThree = word.querySelector(".is-rotator-two");
      const rotatorFour = word.querySelector(".is-rotator-three");
      const rotators = [rotatorOne, rotatorTwo, rotatorThree, rotatorFour];

      // Create infinite rotation timeline (paused initially)
      const rotationTl = gsap.timeline({
        repeat: -1,
        paused: true,
        defaults: { duration: 0.5, ease: "power2.inOut" },
      });

      // Build the rotation cycle
      rotationTl
        .to(rotators, { yPercent: "+=100" }, "+=1") // two visible
        .to(rotators, { yPercent: "+=100" }, "+=1") // three visible
        .to(rotators, { yPercent: "+=100" }, "+=1") // four visible (looks like one)
        // Instant reset — seamless since four looks like one
        .set(rotatorOne, { yPercent: 0 })
        .set(rotatorTwo, { yPercent: -100 })
        .set(rotatorThree, { yPercent: -200 })
        .set(rotatorFour, { yPercent: -300 });

      // rotationTl.play();

      ScrollTrigger.create({
        trigger: word,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
        onEnter: () => {
          rotationTl.play();
        },
        onLeaveBack: () => {
          rotationTl.pause().progress(0);
          gsap.set(rotatorOne, { yPercent: 0 });
          gsap.set(rotatorTwo, { yPercent: -100 });
          gsap.set(rotatorThree, { yPercent: -200 });
          gsap.set(rotatorFour, { yPercent: -300 });
        },
      });

      // Original scroll-triggered animation (retained)
      // gsap.to(word.children, {
      //   yPercent: "+=100",
      //   scrollTrigger: {
      //     trigger: word,
      //     start: "bottom 90%",
      //     end: "center center",
      //     scrub: 0.5,
      //     onEnter: () => {
      //       rotationTl.play();
      //     },
      //     onLeaveBack: () => {
      //       rotationTl.pause().progress(0);
      //       gsap.set(rotatorOne, { yPercent: 0 });
      //       gsap.set(rotatorTwo, { yPercent: -100 });
      //       gsap.set(rotatorThree, { yPercent: -200 });
      //       // gsap.set(rotatorFour, { yPercent: -300 });
      //     },
      //   },
      // });
    });

  if (!isMobileLandscape) {
    $("[data-services-home=sticky-1]").each(function () {
      const section = $(this);
      gsap.to(section, {
        filter: "blur(16px)",
        opacity: 0.5,
        scrollTrigger: {
          trigger: section,
          start: "bottom 66%",
          end: "bottom -100%",
          scrub: true,
        },
      });
    });

    $("[data-service-card]").each(function () {
      gsap.from($(this), {
        yPercent: 15,
        scale: 1.25,
        rotation: gsap.utils.random(-25, 25, 5),
        ease: "back.out",
        scrollTrigger: {
          trigger: $(this),
          start: "top bottom",
          end: "center center",
          scrub: 0.5,
        },
      });
    });
  }
}

function initBanners() {
  $("[data-home-banner=sticky]").each(function () {
    const wrap = document.querySelector("[data-home-banner=sticky]");
    const wrapHeight = wrap.getBoundingClientRect().height;

    // Apply sticky positioning with calculated top value
    wrap.style.position = "sticky";
    wrap.style.top = `calc(100dvh - ${wrapHeight}px - 1.5rem)`;

    // Split All text elements

    const textOne = $(this).find("[data-animation-scroll=home-banner-text-1]");
    const textOneSplit = SplitText.create(textOne.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });
    const textTwo = $(this).find("[data-animation-scroll=home-banner-text-2]");
    const textTwoSplit = SplitText.create(textTwo.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });
    const textThree = $(this).find(
      "[data-animation-scroll=home-banner-text-3]"
    );
    const textThreeSplit = SplitText.create(textThree.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });

    // Split All number elements

    const numberOne = $(this).find(
      "[data-animation-scroll=home-banner-number-1]"
    );
    const numberOneSplit = SplitText.create(numberOne.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });
    const numberTwo = $(this).find(
      "[data-animation-scroll=home-banner-number-2]"
    );
    const numberTwoSplit = SplitText.create(numberTwo.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });
    const numberThree = $(this).find(
      "[data-animation-scroll=home-banner-number-3]"
    );
    const numberThreeSplit = SplitText.create(numberThree.children(), {
      type: "words, lines",
      mask: "lines",
      // autoSplit: true,
    });

    gsap.set(
      [
        textOneSplit.words,
        textTwoSplit.words,
        textThreeSplit.words,
        numberOneSplit.words,
        numberTwoSplit.words,
        numberThreeSplit.words,
      ],
      {
        yPercent: 110,
      }
    );

    const aboutChapter = $("[data-about=section]");

    let aboutTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutChapter,
        start: "top 87.5%",
        toggleActions: "play none none reverse",
      },
    });

    aboutTl
      .to(textOneSplit.words, {
        yPercent: 0,
        ease: "expo.out",
        duration: 1.5,
        stagger: {
          each: 0.033,
        },
      })
      .to(
        numberOneSplit.words,
        {
          yPercent: 0,
          ease: "expo.out",
          duration: 1.5,
        },
        "<.25"
      );

    const clientsChapter = $("[data-clients=section]");

    let clientsTl = gsap.timeline({
      scrollTrigger: {
        trigger: clientsChapter,
        start: "top 87.5%",
        toggleActions: "play none none reverse",
      },
    });

    clientsTl
      .to(textOneSplit.words, {
        yPercent: -110,
        ease: "expo.out",
        duration: 1.5,
        stagger: {
          each: 0.033,
        },
      })
      .to(
        textTwoSplit.words,
        {
          yPercent: 0,
          ease: "expo.out",
          duration: 1.5,
          stagger: {
            each: 0.033,
          },
        },
        "<"
      )
      .to(
        numberOneSplit.words,
        {
          yPercent: -110,
          ease: "expo.out",
          duration: 1.5,
        },
        "<.25"
      )
      .to(
        numberTwoSplit.words,
        {
          yPercent: 0,
          ease: "expo.out",
          duration: 1.5,
        },
        "<"
      );

    const servicesChapter = $("[data-services-home=section]");

    let servicesTl = gsap.timeline({
      scrollTrigger: {
        trigger: servicesChapter,
        start: "top 87.5%",
        toggleActions: "play none none reverse",
      },
    });

    servicesTl
      .to(textTwoSplit.words, {
        yPercent: -110,
        ease: "expo.out",
        duration: 1.5,
        stagger: {
          each: 0.033,
        },
      })
      .to(
        textThreeSplit.words,
        {
          yPercent: 0,
          ease: "expo.out",
          duration: 1.5,
          stagger: {
            each: 0.033,
          },
        },
        "<"
      )
      .to(
        numberTwoSplit.words,
        {
          yPercent: -110,
          ease: "expo.out",
          duration: 1.5,
        },
        "<.25"
      )
      .to(
        numberThreeSplit.words,
        {
          yPercent: 0,
          ease: "expo.out",
          duration: 1.5,
        },
        "<"
      );
  });
}

function initHomeNav() {
  $("[data-nav=home]").each(function () {
    const wrap = $(this);
    const heroSection = $("[data-hero=section]");
    const logo = wrap.find("[data-nav=logo]");
    const navCenter = wrap.find("[data-nav=center]");
    let navMove;
    let navMoveTrigger;

    let shrinkTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "clamp(top top)",
        end: "center top",
        scrub: true,
        onLeave: () => {
          navCenter.removeClass("u-pointer-on");
          navMove = gsap
            .from(wrap, {
              yPercent: -125,
              paused: true,
              duration: 0.4,
            })
            .progress(1);

          navMoveTrigger = ScrollTrigger.create({
            start: "top top",
            end: "max",
            // markers: true,
            onUpdate: (self) => {
              if (navMove) {
                if (self.direction === -1) {
                  navMove.play();
                } else {
                  navMove.reverse();
                }
              }
            },
          });
        },
        onEnterBack: () => {
          navCenter.addClass("u-pointer-on");
          navMove = null;
          navMoveTrigger = null;
        },
      },
    });

    shrinkTl.to(logo, {
      scale: 0.25,
      ease: "power1.inOut",
    });
  });
}

function initCursorTrail() {
  const root = document.querySelector(".hero_home_media_layout");

  if (!root) return;

  // Store reference for cleanup
  this.cursorTrailRoot = root;

  const images = [];
  root.querySelectorAll("img").forEach((image) => {
    images.push(image.getAttribute("src"));
  });

  if (images.length === 0) {
    console.warn("No images found for cursor trail");
    return;
  }

  let incr = 0,
    oldIncrX = 0,
    oldIncrY = 0,
    resetDist = window.innerWidth / 8,
    indexImg = 0;

  // Initialize position on first mousemove
  let initialized = false;

  // Create single handler function
  this.cursorTrailHandler = (e) => {
    const valX = e.clientX;
    const valY = e.clientY;

    // Initialize on first movement
    if (!initialized) {
      oldIncrX = valX;
      oldIncrY = valY;
      initialized = true;
      return;
    }

    incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);

    if (incr > resetDist) {
      incr = 0;
      createMedia(
        valX,
        valY - root.getBoundingClientRect().top,
        valX - oldIncrX,
        valY - oldIncrY
      );
    }

    oldIncrX = valX;
    oldIncrY = valY;
  };

  // Add single listener
  root.addEventListener("mousemove", this.cursorTrailHandler);

  function createMedia(x, y, deltaX, deltaY) {
    const image = document.createElement("img");
    image.setAttribute("src", images[indexImg]);

    console.log("Creating image at:", Date.now(), "Index:", indexImg);
    root.appendChild(image);

    const tl = gsap.timeline({
      onComplete: () => {
        if (root.contains(image)) {
          root.removeChild(image);
        }
        tl.kill();
      },
    });

    tl.fromTo(
      image,
      {
        xPercent: -50 + (Math.random() - 0.5) * 80,
        yPercent: -50 + (Math.random() - 0.5) * 10,
        scaleX: 1.3,
        scaleY: 1.3,
      },
      {
        scaleX: 1,
        scaleY: 1,
        ease: "elastic.out(2, 0.6)",
        duration: 0.6,
      }
    );

    tl.fromTo(
      image,
      {
        x,
        y,
        rotation: (Math.random() - 0.5) * 20,
      },
      {
        x: "+=" + deltaX * 4,
        y: "+=" + deltaY * 4,
        rotation: (Math.random() - 0.5) * 20,
        ease: "power4.out",
        duration: 1.5,
      },
      "<"
    );

    tl.to(image, {
      duration: 0.3,
      scale: 0.5,
      delay: 0.1,
      ease: "back.in(1.5)",
    });

    indexImg = (indexImg + 1) % images.length;
  }
}

$("[data-page=home]").each(function () {
  document.fonts.ready.then(function () {
    homeScrollAnimations();
    initCursorTrail();
    initHomeNav();
    // initBanners();
    initStoryAnimation();
    initExplainerAnimation();
    initServicesAnimation();
    initClientsAnimation();
    initLogosWrapMove();
    initMobileServiceSwiper();
  });
});

function initBannerPosition() {
  $("[data-work-banner=sticky]").each(function () {
    const wrap = document.querySelector("[data-work-banner=sticky]");
    const wrapHeight = wrap.getBoundingClientRect().height;

    // Apply sticky positioning with calculated top value
    wrap.style.position = "sticky";
    wrap.style.top = `calc(100dvh - ${wrapHeight}px - 1.5rem)`;
  });
}

function initFilterBasic() {
  // Find all filter groups on the page
  const groups = document.querySelectorAll("[data-filter-group]");

  groups.forEach((group) => {
    // alert("group");
    const buttons = group.querySelectorAll("[data-filter-target]");
    const items = group.querySelectorAll("[data-filter-name]");
    const transitionDelay = 300; // Delay for transition effect (in milliseconds)

    // Function to update the status and accessibility attributes of items
    const updateStatus = (element, shouldBeActive) => {
      // If the item should be active, set it to "active", otherwise "not-active"
      element.setAttribute(
        "data-filter-status",
        shouldBeActive ? "active" : "not-active"
      );
      element.setAttribute("aria-hidden", shouldBeActive ? "false" : "true");
    };

    // Function to handle filtering logic when a button is clicked
    const handleFilter = (target) => {
      // Loop through all items and ensure every item transitions out first
      items.forEach((item) => {
        const shouldBeActive =
          target === "all" || item.getAttribute("data-filter-name") === target;
        const currentStatus = item.getAttribute("data-filter-status");

        // Only transition items currently visible (status: active)
        if (currentStatus === "active") {
          item.setAttribute("data-filter-status", "transition-out");
          // After the transition delay, set the final status
          setTimeout(() => updateStatus(item, shouldBeActive), transitionDelay);
        } else {
          // For items not currently visible, simply update their status after the delay
          setTimeout(() => updateStatus(item, shouldBeActive), transitionDelay);
        }
      });

      // Update the active status for all buttons
      buttons.forEach((button) => {
        const isActive = button.getAttribute("data-filter-target") === target;
        button.setAttribute(
          "data-filter-status",
          isActive ? "active" : "not-active"
        );
        button.setAttribute("aria-pressed", isActive ? "true" : "false"); // Accessibility: indicate active state
      });
    };

    // Attach click event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.getAttribute("data-filter-target");

        $("html, body").animate(
          {
            scrollTop: $(".work_main_section").offset().top,
          },
          1500
        );

        // If the button is already active, do nothing
        if (button.getAttribute("data-filter-status") === "active") return;

        // Trigger the filter logic with the selected target
        handleFilter(target);
      });
    });
  });
}

function initProjectsScroll() {
  const root = document.querySelector(".work_main_inner");
  const container = root.querySelector(".work_main_cms_list");
  const items = gsap.utils.toArray(".work_main_cms_list_item", root);
  const totalItems = items.length;

  // QuickTo for mouse-based perspective rotation
  const rotY = gsap.quickTo(container, "rotationY", {
    duration: 0.5,
    ease: "power1",
  });
  const rotX = gsap.quickTo(container, "rotationX", {
    duration: 0.5,
    ease: "power1",
  });

  // Set initial state for each item - fixed random positions
  items.forEach((item, i) => {
    const isFirst = i === 0;

    gsap.set(item, {
      xPercent: -50,
      yPercent: -50,
      x: (Math.random() * 0.6 + 0.2) * window.innerWidth,
      y: (Math.random() * 0.6 + 0.2) * window.innerHeight,
      z: isFirst ? 0 : -2000,
      opacity: isFirst ? 1 : 0,
      filter: isFirst ? "blur(0px)" : "blur(20px)",
      pointerEvents: isFirst ? "auto" : "none",
    });
  });

  // Create ScrollTrigger timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: () => {
        items.forEach((item) => {
          const opacity = gsap.getProperty(item, "opacity");
          const link = item.querySelector("a");
          const isVisible = opacity > 0.1;

          gsap.set(item, { pointerEvents: isVisible ? "auto" : "none" });
          if (link)
            gsap.set(link, { pointerEvents: isVisible ? "auto" : "none" });
        });
      },
    },
  });

  // Animation timing - tweak these to taste
  const zDuration = 1.75;
  const fadeInDuration = 1;
  const fadeOutDuration = 0.6;
  const staggerOffset = 0.75;
  const fadeOutStartPercent = 0.675;

  items.forEach((item, i) => {
    const isFirst = i === 0;
    const isLast = i === totalItems - 1;
    const startTime = i * staggerOffset;

    if (isFirst) {
      tl.fromTo(
        item,
        { z: -2000 },
        {
          z: 700,
          duration: zDuration,
          ease: "none",
        },
        startTime
      );
    } else {
      tl.fromTo(
        item,
        { z: -3000 },
        {
          z: 700,
          duration: zDuration,
          ease: "none",
        },
        startTime
      );

      tl.fromTo(
        item,
        { opacity: 0, filter: "blur(20px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: fadeInDuration,
          ease: "power2.out",
        },
        startTime
      );
    }

    if (!isLast) {
      tl.to(
        item,
        {
          opacity: 0,
          filter: "blur(20px)",
          duration: fadeOutDuration,
          ease: "power2.in",
        },
        startTime + zDuration * fadeOutStartPercent
      );
    }
  });
  // Mouse perspective effect
  const handleMouseMove = (e) => {
    const valY = (e.clientX / window.innerWidth - 0.5) * 10;
    const valX = (e.clientY / window.innerHeight - 0.5) * 10;
    rotY(valY);
    rotX(-valX);
  };

  root.addEventListener("mousemove", handleMouseMove);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    root.removeEventListener("mousemove", handleMouseMove);
  };
}

function initWorkReveal() {
  const section = $("[data-section=work-main]");
  gsap.from(section, {
    opacity: 0,
    duration: 1,
    ease: "expo.out",
    delay: 1.5,
    // scrollTrigger: {
    //   trigger: section,
    //   start: "top center",
    //   end: "top top",
    //   scrub: true,
    // },
  });
}

$("[data-page=work]").each(function () {
  document.fonts.ready.then(function () {
    if (!isMobileLandscape) {
      initProjectsScroll();
      initWorkReveal();
    }
    initBannerPosition();
    initWorkModals();

    // initFilterBasic();
  });
});

function initWorkModals() {
  const modals = $("[data-filter-modal]");
  const buttons = $("[data-filter-status]");

  $("[data-filter-wrap]").each(function () {
    const wrap = $(this);
    const button = wrap.find("[data-filter-status]");
    const currentModal = wrap.find("[data-filter-modal]");
    const currentBg = currentModal.find("[data-modal-bg]");

    button.on("click", function () {
      if (button.data("filter-target") === "all") {
        modals.addClass("is-hidden");
        buttons.removeClass("is-active");
        button.addClass("is-active");
      } else {
        modals.addClass("is-hidden");
        buttons.removeClass("is-active");
        currentModal.removeClass("is-hidden");
        button.addClass("is-active");
      }
    });

    currentBg.on("click", function () {
      currentModal.addClass("is-hidden");
      buttons.removeClass("is-active");
      $(buttons[0]).addClass("is-active");
    });
  });
}
function initNextCard() {
  $("[data-project-next=section]").each(function () {
    const wrap = $(this);
    const card = wrap.find("[data-project-next=card]");

    let cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        end: "top top",
        scrub: true,
      },
    });

    cardTl.from(
      card,
      {
        rotation: -15,
        yPercent: -100,
      },
      "<"
    );
  });
}

// function initProjectsScroll() {
//   const root = document.querySelector(".work_main_inner");
//   const container = root.querySelector(".work_main_cms_list");
//   const items = gsap.utils.toArray(".work_main_cms_list_item", root);
//   const totalItems = items.length;

//   // QuickTo for mouse-based perspective rotation
//   const rotY = gsap.quickTo(container, "rotationY", {
//     duration: 0.5,
//     ease: "power1",
//   });
//   const rotX = gsap.quickTo(container, "rotationX", {
//     duration: 0.5,
//     ease: "power1",
//   });

//   // Set initial state for each item - fixed random positions
//   items.forEach((item, i) => {
//     const isFirst = i === 0;

//     gsap.set(item, {
//       xPercent: -50,
//       yPercent: -50,
//       x: (Math.random() * 0.6 + 0.2) * window.innerWidth,
//       y: (Math.random() * 0.6 + 0.2) * window.innerHeight,
//       z: isFirst ? 0 : -2000,
//       opacity: isFirst ? 1 : 0,
//       filter: isFirst ? "blur(0px)" : "blur(20px)",
//       pointerEvents: isFirst ? "auto" : "none", // Added
//     });
//   });

//   // Create ScrollTrigger timeline
//   const tl = gsap.timeline({
//     scrollTrigger: {
//       trigger: root,
//       start: "top top",
//       end: "bottom bottom",
//       scrub: 1,
//     },
//   });

//   // Animation timing - tweak these to taste
//   const zDuration = 1.6;
//   const fadeInDuration = 1;
//   const fadeOutDuration = 0.66;
//   const staggerOffset = 0.75;
//   const fadeOutStartPercent = 0.6;

//   items.forEach((item, i) => {
//     const isFirst = i === 0;
//     const isLast = i === totalItems - 1;
//     const startTime = i * staggerOffset;

//     if (isFirst) {
//       tl.fromTo(
//         item,
//         { z: -2000 },
//         {
//           z: 100,
//           duration: zDuration,
//           ease: "none",
//           onStart: () => {
//             gsap.set(item, {
//               pointerEvents: "auto",
//             });
//           },
//         },
//         startTime
//       );
//     } else {
//       tl.fromTo(
//         item,
//         { z: -3000 },
//         {
//           z: 100,
//           duration: zDuration,
//           ease: "none",
//         },
//         startTime
//       );

//       tl.fromTo(
//         item,
//         { opacity: 0, filter: "blur(20px)" }, // Added
//         {
//           opacity: 1,
//           filter: "blur(0px)",
//           // pointerEvents: "auto", // Added
//           duration: fadeInDuration,
//           ease: "power2.out",
//           onStart: () => {
//             gsap.set(item, {
//               pointerEvents: "auto",
//             });
//           },
//         },
//         startTime
//       );
//     }

//     if (!isLast) {
//       tl.to(
//         item,
//         {
//           opacity: 0,
//           filter: "blur(20px)",
//           // pointerEvents: "none", // Added
//           duration: fadeOutDuration,
//           ease: "power2.in",
//           onComplete: () => {
//             gsap.set(item, {
//               pointerEvents: "none",
//             });
//           },
//         },
//         startTime + zDuration * fadeOutStartPercent
//       );
//     }
//   });

//   // Mouse perspective effect
//   const handleMouseMove = (e) => {
//     const valY = (e.clientX / window.innerWidth - 0.5) * 10;
//     const valX = (e.clientY / window.innerHeight - 0.5) * 10;
//     rotY(valY);
//     rotX(-valX);
//   };

//   root.addEventListener("mousemove", handleMouseMove);

//   return () => {
//     tl.scrollTrigger?.kill();
//     tl.kill();
//     root.removeEventListener("mousemove", handleMouseMove);
//   };
// }

function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

function initDarkNav() {
  $("[data-nav=global]").each(function () {
    const nav = $(this);
    const trigger = $("[data-project-main=section]");

    ScrollTrigger.create({
      trigger: trigger,
      start: "top top",
      end: "top top",
      onEnter: () => {
        nav.addClass("u-theme-light");
      },
      onLeaveBack: () => {
        nav.removeClass("u-theme-light");
      },
    });
  });
}

$("[data-page=project]").each(function () {
  document.fonts.ready.then(function () {
    initAccordionCSS();
    initProjectsScroll();
    initNextCard();
    initDarkNav();
  });
});

function initSVGReveal() {
  // Selectors
  const wrap = document.querySelector("[data-about-hero=section]");
  if (!wrap) return;

  const svg = document.querySelector(".js-svg");
  const mask = document.querySelector("#mask");
  const wrapper = document.querySelector(".js-wrapper");

  // Store reference to wrap element
  this.wrap = wrap;

  const mouse = {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    diff: 0,
  };
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Store particles array on this
  this.particles = [];
  let particleCnt = 0;

  // Mouse move - store reference
  this.onMouseMove = (e) => {
    mouse.vx += mouse.x - e.pageX;
    mouse.vy += mouse.y - e.pageY;
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  };
  wrap.addEventListener("mousemove", this.onMouseMove);

  // Resize - store reference
  this.onResize = () => {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    svg.style.width = viewport.width + "px";
    svg.style.height = viewport.height + "px";
  };
  window.addEventListener("resize", this.onResize);
  this.onResize();

  // Store reference to particles for use in Particle class
  const particles = this.particles;

  // Particle class
  class Particle {
    constructor(x, y, size) {
      this.size = size;
      this.x = x;
      this.y = y;
      this.seed = Math.random() * 1000;
      this.freq = (0.5 + Math.random() * 1) * 0.01;
      this.amplitude = (1 - Math.random() * 2) * 0.5;
      this.color = "#fff";

      this.el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.el.setAttribute("cx", this.x);
      this.el.setAttribute("cy", this.y);
      this.el.setAttribute("r", this.size);
      this.el.setAttribute("fill", this.color);

      // Store timeline reference for cleanup
      this.tl = gsap.timeline();
      this.tl.to(this, {
        size: this.size * 2,
        ease: "power1.inOut",
        duration: 4,
      });
      this.tl.to(
        this,
        {
          size: 0,
          ease: "power4.in",
          duration: 4,
        },
        3
      );
      this.tl.call(this.kill.bind(this));
    }

    kill() {
      const index = particles.indexOf(this);
      if (index > -1) {
        particles.splice(index, 1);
      }
      this.tl?.kill();
      this.el?.remove();
    }

    render(time) {
      this.el.setAttribute("cy", this.y);
      this.el.setAttribute("cx", this.x);
      this.el.setAttribute("r", this.size);
    }
  }

  // Emitter
  const emitParticle = () => {
    if (mouse.diff > 0.01) {
      const particle = new Particle(
        mouse.smoothX,
        mouse.smoothY,
        mouse.diff * 0.3
      );
      particleCnt += 5;
      particles.push(particle);
      wrapper.prepend(particle.el);
    }
  };

  // Render loop
  const render = (time) => {
    mouse.smoothX += (mouse.x - mouse.smoothX) * 0.1;
    mouse.smoothY += (mouse.y - mouse.smoothY) * 0.1;
    mouse.diff = Math.hypot(mouse.x - mouse.smoothX, mouse.y - mouse.smoothY);

    emitParticle();

    particles.forEach((particle) => {
      particle.render(time);
    });

    // Store RAF ID on each frame
    this.rafId = requestAnimationFrame(render);
  };

  // Start the animation - store initial RAF ID
  this.rafId = requestAnimationFrame(render);
}

function initStatementAnimation() {
  $("[data-about=statement-text-wrap]").each(function () {
    const textWrap = $(this);
    const headingFront = textWrap.find("[data-heading=statement-front]");
    const headingBehind = textWrap.find("[data-heading=statement-behind]");
    const headingFrontSplit = SplitText.create(headingFront.children(), {
      type: "lines, words",
      mask: "lines",
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
    });
    const headingBehindSplit = SplitText.create(headingBehind.children(), {
      type: "lines, words",
      mask: "lines",
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
    });

    let textFillTl = gsap.timeline({
      scrollTrigger: {
        trigger: textWrap,
        start: "top 77.5%",
        end: "bottom center",
        scrub: true,
      },
    });

    textFillTl.fromTo(
      headingFront,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        ease: CustomEase.create("custom", "M0,0 C0.3,0 0.806,0.897 1,1 "),
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      }
    );

    let textRevealTl = gsap.timeline({
      scrollTrigger: {
        trigger: textWrap,
        start: "top 90%",
        end: "bottom bottom",
        scrub: true,
      },
    });

    textRevealTl.from(headingBehindSplit.words, {
      yPercent: 110,
      rotation: 1.25,
      stagger: {
        each: 0.05,
      },
    });
  });
}

$("[data-page=about]").each(function () {
  document.fonts.ready.then(function () {
    initStatementAnimation();
    initSVGReveal();
  });
});

$("[data-page=work-filter]").each(function () {
  document.fonts.ready.then(function () {
    if (!isMobileLandscape) {
      initProjectsScroll();
      initWorkReveal();
    }
    initBannerPosition();
  });
});

const SouthControl = {
  work: {
    init() {
      // this.initProjectsScroll();
      // this.initBannerPosition();
      // this.initFilterBasic();
    },
    cleanup() {},

    initBannerPosition() {
      $("[data-work-banner=sticky]").each(function () {
        const wrap = document.querySelector("[data-work-banner=sticky]");
        const wrapHeight = wrap.getBoundingClientRect().height;

        // Apply sticky positioning with calculated top value
        wrap.style.position = "sticky";
        wrap.style.top = `calc(100dvh - ${wrapHeight}px - 1.5rem)`;
      });
    },

    initFilterBasic() {
      // Find all filter groups on the page
      const groups = document.querySelectorAll("[data-filter-group]");

      groups.forEach((group) => {
        // alert("group");
        const buttons = group.querySelectorAll("[data-filter-target]");
        const items = group.querySelectorAll("[data-filter-name]");
        const transitionDelay = 300; // Delay for transition effect (in milliseconds)

        // Function to update the status and accessibility attributes of items
        const updateStatus = (element, shouldBeActive) => {
          // If the item should be active, set it to "active", otherwise "not-active"
          element.setAttribute(
            "data-filter-status",
            shouldBeActive ? "active" : "not-active"
          );
          element.setAttribute(
            "aria-hidden",
            shouldBeActive ? "false" : "true"
          );
        };

        // Function to handle filtering logic when a button is clicked
        const handleFilter = (target) => {
          // Loop through all items and ensure every item transitions out first
          items.forEach((item) => {
            const shouldBeActive =
              target === "all" ||
              item.getAttribute("data-filter-name") === target;
            const currentStatus = item.getAttribute("data-filter-status");

            // Only transition items currently visible (status: active)
            if (currentStatus === "active") {
              item.setAttribute("data-filter-status", "transition-out");
              // After the transition delay, set the final status
              setTimeout(
                () => updateStatus(item, shouldBeActive),
                transitionDelay
              );
            } else {
              // For items not currently visible, simply update their status after the delay
              setTimeout(
                () => updateStatus(item, shouldBeActive),
                transitionDelay
              );
            }
          });

          // Update the active status for all buttons
          buttons.forEach((button) => {
            const isActive =
              button.getAttribute("data-filter-target") === target;
            button.setAttribute(
              "data-filter-status",
              isActive ? "active" : "not-active"
            );
            button.setAttribute("aria-pressed", isActive ? "true" : "false"); // Accessibility: indicate active state
          });
        };

        // Attach click event listeners to each button
        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            const target = button.getAttribute("data-filter-target");

            $("html, body").animate(
              {
                scrollTop: $(".work_main_section").offset().top,
              },
              1500
            );

            // If the button is already active, do nothing
            if (button.getAttribute("data-filter-status") === "active") return;

            // Trigger the filter logic with the selected target
            handleFilter(target);
          });
        });
      });
    },

    initProjectsScroll() {
      const root = document.querySelector(".work_main_inner");
      const container = root.querySelector(".work_main_cms_list");
      const items = gsap.utils.toArray(".work_main_cms_list_item", root);
      const totalItems = items.length;

      // QuickTo for mouse-based perspective rotation
      const rotY = gsap.quickTo(container, "rotationY", {
        duration: 0.5,
        ease: "power1",
      });
      const rotX = gsap.quickTo(container, "rotationX", {
        duration: 0.5,
        ease: "power1",
      });

      // Set initial state for each item - fixed random positions
      items.forEach((item, i) => {
        const isFirst = i === 0;

        gsap.set(item, {
          xPercent: -50,
          yPercent: -50,
          x: (Math.random() * 0.6 + 0.2) * window.innerWidth,
          y: (Math.random() * 0.6 + 0.2) * window.innerHeight,
          z: isFirst ? 0 : -2000,
          opacity: isFirst ? 1 : 0,
          filter: isFirst ? "blur(0px)" : "blur(20px)",
          pointerEvents: isFirst ? "auto" : "none",
        });
      });

      // Create ScrollTrigger timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: () => {
            items.forEach((item) => {
              const opacity = gsap.getProperty(item, "opacity");
              gsap.set(item, {
                pointerEvents: opacity > 0 ? "auto" : "none",
              });
            });
          },
        },
      });

      // Animation timing - tweak these to taste
      const zDuration = 1.75;
      const fadeInDuration = 1;
      const fadeOutDuration = 0.6;
      const staggerOffset = 0.5;
      const fadeOutStartPercent = 0.675;

      items.forEach((item, i) => {
        const isFirst = i === 0;
        const isLast = i === totalItems - 1;
        const startTime = i * staggerOffset;

        if (isFirst) {
          tl.fromTo(
            item,
            { z: -2000 },
            {
              z: 700,
              duration: zDuration,
              ease: "none",
            },
            startTime
          );
        } else {
          tl.fromTo(
            item,
            { z: -3000 },
            {
              z: 700,
              duration: zDuration,
              ease: "none",
            },
            startTime
          );

          tl.fromTo(
            item,
            { opacity: 0, filter: "blur(20px)" },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: fadeInDuration,
              ease: "power2.out",
            },
            startTime
          );
        }

        if (!isLast) {
          tl.to(
            item,
            {
              opacity: 0,
              filter: "blur(20px)",
              duration: fadeOutDuration,
              ease: "power2.in",
            },
            startTime + zDuration * fadeOutStartPercent
          );
        }
      });
      // Mouse perspective effect
      const handleMouseMove = (e) => {
        const valY = (e.clientX / window.innerWidth - 0.5) * 10;
        const valX = (e.clientY / window.innerHeight - 0.5) * 10;
        rotY(valY);
        rotX(-valX);
      };

      root.addEventListener("mousemove", handleMouseMove);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        root.removeEventListener("mousemove", handleMouseMove);
      };
    },
  },

  project: {
    init() {
      // this.initAccordionCSS();
      // this.initProjectsScroll();
      // this.initNextCard();
      // this.initDarkNav();
    },
    cleanup() {},

    initNextCard() {
      $("[data-project-next=section]").each(function () {
        const wrap = $(this);
        const card = wrap.find("[data-project-next=card]");

        let cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });

        cardTl.from(
          card,
          {
            rotation: -15,
            yPercent: -100,
          },
          "<"
        );
      });
    },

    initProjectsScroll() {
      const root = document.querySelector(".work_main_inner");
      const container = root.querySelector(".work_main_cms_list");
      const items = gsap.utils.toArray(".work_main_cms_list_item", root);
      const totalItems = items.length;

      // QuickTo for mouse-based perspective rotation
      const rotY = gsap.quickTo(container, "rotationY", {
        duration: 0.5,
        ease: "power1",
      });
      const rotX = gsap.quickTo(container, "rotationX", {
        duration: 0.5,
        ease: "power1",
      });

      // Set initial state for each item - fixed random positions
      items.forEach((item, i) => {
        const isFirst = i === 0;

        gsap.set(item, {
          xPercent: -50,
          yPercent: -50,
          x: (Math.random() * 0.6 + 0.2) * window.innerWidth,
          y: (Math.random() * 0.6 + 0.2) * window.innerHeight,
          z: isFirst ? 0 : -2000,
          opacity: isFirst ? 1 : 0,
          filter: isFirst ? "blur(0px)" : "blur(20px)",
          pointerEvents: isFirst ? "auto" : "none", // Added
        });
      });

      // Create ScrollTrigger timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // Animation timing - tweak these to taste
      const zDuration = 1.6;
      const fadeInDuration = 1;
      const fadeOutDuration = 0.66;
      const staggerOffset = 0.75;
      const fadeOutStartPercent = 0.6;

      items.forEach((item, i) => {
        const isFirst = i === 0;
        const isLast = i === totalItems - 1;
        const startTime = i * staggerOffset;

        if (isFirst) {
          tl.fromTo(
            item,
            { z: -2000 },
            {
              z: 100,
              duration: zDuration,
              ease: "none",
              onStart: () => {
                gsap.set(item, {
                  pointerEvents: "auto",
                });
              },
            },
            startTime
          );
        } else {
          tl.fromTo(
            item,
            { z: -3000 },
            {
              z: 100,
              duration: zDuration,
              ease: "none",
            },
            startTime
          );

          tl.fromTo(
            item,
            { opacity: 0, filter: "blur(20px)" }, // Added
            {
              opacity: 1,
              filter: "blur(0px)",
              // pointerEvents: "auto", // Added
              duration: fadeInDuration,
              ease: "power2.out",
              onStart: () => {
                gsap.set(item, {
                  pointerEvents: "auto",
                });
              },
            },
            startTime
          );
        }

        if (!isLast) {
          tl.to(
            item,
            {
              opacity: 0,
              filter: "blur(20px)",
              // pointerEvents: "none", // Added
              duration: fadeOutDuration,
              ease: "power2.in",
              onComplete: () => {
                gsap.set(item, {
                  pointerEvents: "none",
                });
              },
            },
            startTime + zDuration * fadeOutStartPercent
          );
        }
      });

      // Mouse perspective effect
      const handleMouseMove = (e) => {
        const valY = (e.clientX / window.innerWidth - 0.5) * 10;
        const valX = (e.clientY / window.innerHeight - 0.5) * 10;
        rotY(valY);
        rotX(-valX);
      };

      root.addEventListener("mousemove", handleMouseMove);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        root.removeEventListener("mousemove", handleMouseMove);
      };
    },

    initAccordionCSS() {
      document
        .querySelectorAll("[data-accordion-css-init]")
        .forEach((accordion) => {
          const closeSiblings =
            accordion.getAttribute("data-accordion-close-siblings") === "true";

          accordion.addEventListener("click", (event) => {
            const toggle = event.target.closest("[data-accordion-toggle]");
            if (!toggle) return; // Exit if the clicked element is not a toggle

            const singleAccordion = toggle.closest("[data-accordion-status]");
            if (!singleAccordion) return; // Exit if no accordion container is found

            const isActive =
              singleAccordion.getAttribute("data-accordion-status") ===
              "active";
            singleAccordion.setAttribute(
              "data-accordion-status",
              isActive ? "not-active" : "active"
            );

            // When [data-accordion-close-siblings="true"]
            if (closeSiblings && !isActive) {
              accordion
                .querySelectorAll('[data-accordion-status="active"]')
                .forEach((sibling) => {
                  if (sibling !== singleAccordion)
                    sibling.setAttribute("data-accordion-status", "not-active");
                });
            }
          });
        });
    },

    initDarkNav() {
      $("[data-nav=global]").each(function () {
        const nav = $(this);
        const trigger = $("[data-project-main=section]");

        ScrollTrigger.create({
          trigger: trigger,
          start: "top top",
          end: "top top",
          onEnter: () => {
            nav.addClass("u-theme-light");
          },
          onLeaveBack: () => {
            nav.removeClass("u-theme-light");
          },
        });
      });
    },
  },

  about: {
    init() {
      // this.initStatementAnimation();
      // this.initSVGReveal();
    },
    cleanup() {
      // Cancel RAF loop
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      // Remove event listeners
      if (this.wrap && this.onMouseMove) {
        this.wrap.removeEventListener("mousemove", this.onMouseMove);
      }
      if (this.onResize) {
        window.removeEventListener("resize", this.onResize);
      }

      // Kill all particles and their GSAP timelines
      if (this.particles) {
        while (this.particles.length > 0) {
          const particle = this.particles.pop();
          particle.tl?.kill();
          particle.el?.remove();
        }
      }
    },

    initSVGReveal() {
      // Selectors
      const wrap = document.querySelector("[data-about-hero=section]");
      if (!wrap) return;

      const svg = document.querySelector(".js-svg");
      const mask = document.querySelector("#mask");
      const wrapper = document.querySelector(".js-wrapper");

      // Store reference to wrap element
      this.wrap = wrap;

      const mouse = {
        x: 0,
        y: 0,
        smoothX: 0,
        smoothY: 0,
        diff: 0,
      };
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Store particles array on this
      this.particles = [];
      let particleCnt = 0;

      // Mouse move - store reference
      this.onMouseMove = (e) => {
        mouse.vx += mouse.x - e.pageX;
        mouse.vy += mouse.y - e.pageY;
        mouse.x = e.pageX;
        mouse.y = e.pageY;
      };
      wrap.addEventListener("mousemove", this.onMouseMove);

      // Resize - store reference
      this.onResize = () => {
        viewport.width = window.innerWidth;
        viewport.height = window.innerHeight;
        svg.style.width = viewport.width + "px";
        svg.style.height = viewport.height + "px";
      };
      window.addEventListener("resize", this.onResize);
      this.onResize();

      // Store reference to particles for use in Particle class
      const particles = this.particles;

      // Particle class
      class Particle {
        constructor(x, y, size) {
          this.size = size;
          this.x = x;
          this.y = y;
          this.seed = Math.random() * 1000;
          this.freq = (0.5 + Math.random() * 1) * 0.01;
          this.amplitude = (1 - Math.random() * 2) * 0.5;
          this.color = "#fff";

          this.el = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          this.el.setAttribute("cx", this.x);
          this.el.setAttribute("cy", this.y);
          this.el.setAttribute("r", this.size);
          this.el.setAttribute("fill", this.color);

          // Store timeline reference for cleanup
          this.tl = gsap.timeline();
          this.tl.to(this, {
            size: this.size * 2,
            ease: "power1.inOut",
            duration: 2,
          });
          this.tl.to(
            this,
            {
              size: 0,
              ease: "power4.in",
              duration: 4,
            },
            3
          );
          this.tl.call(this.kill.bind(this));
        }

        kill() {
          const index = particles.indexOf(this);
          if (index > -1) {
            particles.splice(index, 1);
          }
          this.tl?.kill();
          this.el?.remove();
        }

        render(time) {
          this.el.setAttribute("cy", this.y);
          this.el.setAttribute("cx", this.x);
          this.el.setAttribute("r", this.size);
        }
      }

      // Emitter
      const emitParticle = () => {
        if (mouse.diff > 0.01) {
          const particle = new Particle(
            mouse.smoothX,
            mouse.smoothY,
            mouse.diff * 0.2
          );
          particleCnt += 5;
          particles.push(particle);
          wrapper.prepend(particle.el);
        }
      };

      // Render loop
      const render = (time) => {
        mouse.smoothX += (mouse.x - mouse.smoothX) * 0.1;
        mouse.smoothY += (mouse.y - mouse.smoothY) * 0.1;
        mouse.diff = Math.hypot(
          mouse.x - mouse.smoothX,
          mouse.y - mouse.smoothY
        );

        emitParticle();

        particles.forEach((particle) => {
          particle.render(time);
        });

        // Store RAF ID on each frame
        this.rafId = requestAnimationFrame(render);
      };

      // Start the animation - store initial RAF ID
      this.rafId = requestAnimationFrame(render);
    },

    initStatementAnimation() {
      $("[data-about=statement-text-wrap]").each(function () {
        const textWrap = $(this);
        const headingFront = textWrap.find("[data-heading=statement-front]");
        const headingBehind = textWrap.find("[data-heading=statement-behind]");
        const headingFrontSplit = SplitText.create(headingFront.children(), {
          type: "lines, words",
          mask: "lines",
          autoSplit: true,
          linesClass: "line",
          wordsClass: "word",
        });
        const headingBehindSplit = SplitText.create(headingBehind.children(), {
          type: "lines, words",
          mask: "lines",
          autoSplit: true,
          linesClass: "line",
          wordsClass: "word",
        });

        let textFillTl = gsap.timeline({
          scrollTrigger: {
            trigger: textWrap,
            start: "top 77.5%",
            end: "bottom center",
            scrub: true,
          },
        });

        textFillTl.fromTo(
          headingFront,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          },
          {
            ease: CustomEase.create("custom", "M0,0 C0.3,0 0.806,0.897 1,1 "),
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }
        );

        let textRevealTl = gsap.timeline({
          scrollTrigger: {
            trigger: textWrap,
            start: "top 90%",
            end: "bottom bottom",
            scrub: true,
          },
        });

        textRevealTl.from(headingBehindSplit.words, {
          yPercent: 110,
          rotation: 1.25,
          stagger: {
            each: 0.05,
          },
        });
      });
    },
  },

  services: {
    init() {
      this.newServiceSlides();
    },
    cleanup() {},

    serviceSlides() {
      const slides = document.querySelectorAll(".slide");

      slides.forEach((slide) => {
        const contentWrapper = slide.querySelector(".content-wrapper");
        const content = slide.querySelector(".content");

        gsap.to(content, {
          rotationZ: (Math.random() - 0.5) * 10, // RotationZ between -5 and 5 degrees
          scale: 0.7, // Slight reduction of the content
          rotationX: 40,
          ease: "power1.in", // Starts gradually
          scrollTrigger: {
            pin: contentWrapper, // contentWrapper is pinned during the animation
            anticipatePin: 1,
            trigger: slide, // Listens to the slide’s position
            start: "top 0%", // Starts when its top reaches the top of the viewport
            end: "+=" + window.innerHeight, // Ends 100vh later
            scrub: true, // Progresses with the scroll
          },
        });

        gsap.to(content, {
          autoAlpha: 0, // Ends at opacity: 0 and visibility: hidden
          ease: "power1.in", // Starts gradually
          scrollTrigger: {
            trigger: content, // Listens to the position of content
            start: "top -80%", // Starts when the top exceeds 80% of the viewport
            end: "+=" + 0.2 * window.innerHeight, // Ends 20% later
            scrub: true, // Progresses with the scroll
          },
        });
      });
    },

    newServiceSlides() {
      if (!isMobileLandscape) {
        const slides = document.querySelectorAll(".slide");

        slides.forEach((slide) => {
          const contentWrapper = slide.querySelector(".content-wrapper");
          const content = slide.querySelector(".content");

          ScrollTrigger.create({
            pin: contentWrapper, // contentWrapper is pinned during the animation
            trigger: slide, // Listens to the slide’s position
            start: "top 0%", // Starts when its top reaches the top of the viewport
            end: "+=" + window.innerHeight * 1.33, // Ends 100vh later
            scrub: true, // Progresses with the scroll
          });

          gsap.to(content, {
            rotationZ: (Math.random() - 0.5) * 10, // RotationZ between -5 and 5 degrees
            scale: 0.7, // Slight reduction of the content
            rotationX: 40,
            ease: "power1.in", // Starts gradually
            scrollTrigger: {
              trigger: slide, // Listens to the slide’s position
              start: "top -25%", // Starts when its top reaches the top of the viewport
              end: "+=" + window.innerHeight * 1.33, // Ends 100vh later
              scrub: true, // Progresses with the scroll
            },
          });

          gsap.to(content, {
            autoAlpha: 0, // Ends at opacity: 0 and visibility: hidden
            ease: "power1.in", // Starts gradually
            scrollTrigger: {
              trigger: content, // Listens to the position of content
              start: "top -100%", // Starts when the top exceeds 80% of the viewport
              end: "+=" + 0.25 * window.innerHeight, // Ends 20% later
              scrub: true, // Progresses with the scroll
            },
          });
        });
      }
    },
  },

  "create-with-us": {
    init() {
      this.initMultiStepForm();
    },
    cleanup() {},

    initMultiStepForm() {
      const actI = $("[data-act=i]");
      const actII = $("[data-act=ii]");
      const actIII = $("[data-act=iii]");
      const actIV = $("[data-act=iv]");
      const startButton = $("[data-button=start-the-story]");
      const actIButton = $('[data-button="act-i"]')[0];
      const actIIButton = $('[data-button="act-ii"]')[0];
      const actIIIButton = $('[data-button="act-iii"]')[0];
      const actIVButton = $('[data-button="act-iv"]')[0];
      const bookingButton = $("[data-button=booking]");
      gsap.set(bookingButton, {
        opacity: 0,
        yPercent: 40,
        pointerEvents: "none",
      });

      function limitCheckboxes(identifier, limit) {
        var $checkboxWrapper = $(`[data-checkboxes=${identifier}]`);

        $checkboxWrapper.find("input[type=checkbox]").on("change", function () {
          if (
            $checkboxWrapper.find("input[type=checkbox]:checked").length > limit
          ) {
            $(this).prop("checked", false).change();
          }

          if (
            $checkboxWrapper.find("input[type=checkbox]:checked").length ===
            limit
          ) {
            $checkboxWrapper
              .find("input[type=checkbox]:not(:checked)")
              .closest("label")
              .css({ opacity: "0.5", "pointer-events": "none" });
          } else {
            $checkboxWrapper
              .find("label")
              .css({ opacity: "", "pointer-events": "" });
          }
        });
      }

      limitCheckboxes("flavor", 2);
      limitCheckboxes("priority", 2);
      limitCheckboxes("success", 2);

      startButton.each(function () {
        $(this).on("click", function () {
          $(this).addClass("is-open");
          actI.removeClass("u-hide");
          actIButton.click();
        });
      });

      function syncNameToHiddenFields() {
        // Get the name value from the first form
        const nameField = document.querySelector('[data-field="name"]');
        const nameValue = nameField ? nameField.value : "";

        // Store in localStorage for persistence across page loads
        localStorage.setItem("userName", nameValue);

        // Populate all hidden fields with data-field="name-hidden"
        const hiddenFields = document.querySelectorAll(
          '[data-field="name-hidden"]'
        );
        hiddenFields.forEach((field) => {
          field.value = nameValue;
        });
      }

      function actISuccess() {
        actII.removeClass("u-hide");
        syncNameToHiddenFields();
        // gsap.delayedCall(2, actIIButton.click()); // Your logic here
        gsap.delayedCall(0.5, function () {
          lenis.scrollTo("#act-ii");
        }); // Your logic here
      }

      function actIISuccess() {
        actIII.removeClass("u-hide");
        // gsap.delayedCall(2, actIIIButton.click()); // Your logic here
        gsap.delayedCall(0.5, function () {
          lenis.scrollTo("#act-iii");
        }); // Your logic here
      }
      function actIIISuccess() {
        gsap.to(bookingButton, {
          opacity: 1,
          yPercent: 0,
          pointerEvents: "auto",
        });
        actIV.removeClass("u-hide");
        // gsap.delayedCall(2, actIVButton.click()); // Your logic here
        gsap.delayedCall(0.5, function () {
          lenis.scrollTo("#act-iv");
        }); // Your logic here
      }

      function initFormSuccessObserver(formEl, func) {
        const form = document.querySelector(formEl);
        if (!form) return;

        const successWrap = form.querySelector(".form_success_wrap");
        if (!successWrap) return;

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "style"
            ) {
              const display = window.getComputedStyle(successWrap).display;

              if (display === "block") {
                func();
                observer.disconnect(); // Stop observing after success
              }
            }
          }
        });

        observer.observe(successWrap, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      initFormSuccessObserver('[data-form="act-i"]', actISuccess);
      initFormSuccessObserver('[data-form="act-ii"]', actIISuccess);
      initFormSuccessObserver('[data-form="act-iii"]', actIIISuccess);
    },

    // Initialise
  },
};

// Initialize Barba with namespaces
// function initialiseBarba() {
//   barba.init({
//     debug: true,
//     preventRunning: true,

//     transitions: [
//       {
//         name: "default-transition",
//         sync: false,

//         leave(data) {
//           // gsap.to(data.current.container, {
//           //   opacity: 0,
//           // });

//           return gsap.fromTo(
//             "[data-transition=wrap]",
//             { y: "100vh" },
//             {
//               y: "0vh",
//               duration: 1,
//               ease: "expo.out",
//             }
//           );
//         },

//         enter(data) {
//           // gsap.from(data.next.container, {
//           //   opacity: 0,
//           //   // delay: 3,
//           // });

//           return gsap.to("[data-transition=wrap]", {
//             y: "-100vh",
//             duration: 1,
//             ease: "expo.out",
//             // delay: 1,
//           });
//         },
//       },
//     ],

//     views: [
//       {
//         namespace: "home",
//         afterEnter() {
//           SouthControl.home.init();
//         },
//         beforeLeave() {
//           SouthControl.home.cleanup?.();
//         },
//       },
//       {
//         namespace: "about",
//         afterEnter() {
//           SouthControl.about.init();
//         },
//         beforeLeave() {
//           SouthControl.about.cleanup?.();
//         },
//       },
//       {
//         namespace: "services",
//         afterEnter() {
//           SouthControl.services.init();
//         },
//         beforeLeave() {
//           SouthControl.services.cleanup?.();
//         },
//       },
//     ],
//   });

//   barba.hooks.beforeEnter(() => {
//     SouthControl.global.cleanup();
//   });

//   barba.hooks.after(() => {
//     SouthControl.global.refresh();
//   });
// }

// Initial site load
function initialiseSouthControl() {
  // SouthControl.global.once();
  // SouthControl.global.refresh(); // ← Add this!

  const currentPage = $("[data-page]").attr("data-page");
  if (currentPage && SouthControl[currentPage]) {
    SouthControl[currentPage].init();
  }

  // Initialize Barba after initial page setup
  // initialiseBarba();
}

// Check if all required libraries are loaded
// if (
//   typeof gsap !== "undefined" &&
//   typeof $ !== "undefined" &&
//   typeof Lenis !== "undefined" &&
//   typeof barba !== "undefined"
// ) {
//   document.fonts.ready.then(() => {
//     if (document.readyState === "loading") {
//       document.addEventListener("DOMContentLoaded", initialiseSouthControl);
//     } else {
//       initialiseSouthControl();
//     }
//   });
// } else {
//   window.addEventListener("load", () => {
//     document.fonts.ready.then(initialiseSouthControl);
//   });
// }

// document.fonts.ready.then(() => initialiseSouthControl());
initialiseSouthControl();
