const sitePreloader = document.querySelector(".site-preloader");

if (sitePreloader) {
  const finishPreload = () => {
    document.body.classList.add("preloader-done");
    document.body.classList.remove("preloading");

    window.setTimeout(() => {
      sitePreloader.remove();
      document.body.classList.remove("preloader-done");
    }, 460);
  };

  window.setTimeout(finishPreload, 5000);
}

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const menuIcon = document.querySelector(".menu-icon");
const closeIcon = document.querySelector(".close-icon");

if (menuToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");

    if (menuIcon && closeIcon) {
      menuIcon.hidden = false;
      closeIcon.hidden = true;
    }
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);

    if (menuIcon && closeIcon) {
      menuIcon.hidden = isOpen;
      closeIcon.hidden = !isOpen;
    }
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeMenu();
    }
  });
}

document.querySelectorAll(
  ".site-footer .footer-about > a, .site-footer .footer-inner > div:nth-child(3) a, .site-footer .footer-support > a, .site-footer .footer-bottom a"
).forEach((link) => {
  link.setAttribute("aria-disabled", "true");
  link.setAttribute("tabindex", "-1");
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

document.querySelectorAll("[data-home-search]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const location = form.querySelector('[name="location"]')?.value.trim();
    const typeSelect = form.querySelector('[name="type"]');
    const budgetSelect = form.querySelector('[name="budget"]');
    const type = typeSelect?.value;
    const budget = budgetSelect?.value;
    const summary = document.querySelector("[data-home-search-summary]");

    if (location) {
      params.set("location", location);
    }

    if (type) {
      params.set("type", type);
    }

    if (budget) {
      params.set("budget", budget);
    }

    const resultUrl = `listings.html${params.toString() ? `?${params.toString()}` : ""}#available-properties`;

    if (summary) {
      const locationText = summary.querySelector("[data-search-location]");
      const typeText = summary.querySelector("[data-search-type]");
      const budgetText = summary.querySelector("[data-search-budget]");
      const searchLink = summary.querySelector("[data-search-link]");

      if (locationText) {
        locationText.textContent = location || "Any location";
      }

      if (typeText && typeSelect) {
        typeText.textContent = typeSelect.options[typeSelect.selectedIndex]?.text || "Any home";
      }

      if (budgetText && budgetSelect) {
        budgetText.textContent = budgetSelect.options[budgetSelect.selectedIndex]?.text || "Any price";
      }

      if (searchLink) {
        searchLink.href = resultUrl;
      }

      summary.hidden = false;
      summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    window.location.href = resultUrl;
  });
});

const listingsGrid = document.querySelector("#available-properties .listing-grid");
const listingCards = listingsGrid ? Array.from(listingsGrid.querySelectorAll(".listing-card")) : [];
const listingFilters = document.querySelector("[data-listing-filters]");

if (listingsGrid && listingCards.length) {
  const params = new URLSearchParams(window.location.search);
  const hasSearchFilters = params.has("location") || params.has("type") || params.has("budget");
  const rawLocation = (params.get("location") || "").trim();
  const labelMaps = {
    type: {
      "": "Any home",
      "single-family": "Single family",
      condo: "Condo",
      townhouse: "Townhouse",
      "luxury-estate": "Luxury estate"
    },
    budget: {
      "": "Any price",
      "400-700": "$400k - $700k",
      "700-1200": "$700k - $1.2m",
      "1200-plus": "$1.2m+"
    }
  };
  const searchState = {
    status: params.get("status") || (hasSearchFilters ? "" : "for-sale"),
    location: rawLocation.toLowerCase(),
    type: params.get("type") || "",
    budget: params.get("budget") || ""
  };
  const sectionHead = document.querySelector("#available-properties .section-head");

  if (hasSearchFilters && sectionHead) {
    const summary = document.createElement("div");
    summary.className = "listing-search-summary";

    const locationLabel = rawLocation || "Any location";
    const typeLabel = labelMaps.type[searchState.type] || "Any home";
    const budgetLabel = labelMaps.budget[searchState.budget] || "Any price";

    const summaryLabel = document.createElement("span");
    summaryLabel.textContent = "Showing results for";
    summary.appendChild(summaryLabel);

    [locationLabel, typeLabel, budgetLabel].forEach((label) => {
      const chip = document.createElement("strong");
      chip.textContent = label;
      summary.appendChild(chip);
    });

    sectionHead.appendChild(summary);
  }

  const noResults = document.createElement("p");
  noResults.className = "listing-empty";
  noResults.textContent = "No homes match those filters right now. Try a different type, budget, or location.";
  noResults.hidden = true;
  listingsGrid.after(noResults);

  const matchesBudget = (price) => {
    if (!searchState.budget) {
      return true;
    }

    if (searchState.budget === "400-700") {
      return price >= 400 && price <= 700;
    }

    if (searchState.budget === "700-1200") {
      return price >= 700 && price <= 1200;
    }

    if (searchState.budget === "1200-plus") {
      return price >= 1200;
    }

    return true;
  };

  const applyListingFilters = () => {
    let visibleCount = 0;

    listingCards.forEach((card) => {
      const price = Number(card.dataset.price || 0);
      const searchText = card.dataset.search || card.textContent.toLowerCase();
      const matchesStatus = !searchState.status || card.dataset.status === searchState.status;
      const matchesLocation = !searchState.location || searchText.includes(searchState.location);
      const matchesType = !searchState.type || card.dataset.type === searchState.type;
      const isVisible = matchesStatus && matchesLocation && matchesType && matchesBudget(price);

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    noResults.hidden = visibleCount > 0;
  };

  listingFilters?.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === searchState.status);
    button.addEventListener("click", () => {
      searchState.status = button.dataset.filter ?? "";

      listingFilters.querySelectorAll("[data-filter]").forEach((filterButton) => {
        filterButton.classList.toggle("active", filterButton === button);
      });

      applyListingFilters();
    });
  });

  applyListingFilters();
}

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (form.matches("[data-home-search]")) {
      return;
    }

    event.preventDefault();

    if (form.classList.contains("auth-card")) {
      const username = form.querySelector("[data-username]");
      const email = form.querySelector('input[type="email"]');
      const password = form.querySelector('input[type="password"]');
      const checkbox = form.querySelector('input[type="checkbox"]');

      if (username && username.value.trim() === "") {
        alert("Please enter your username.");
        username.focus();
        return;
      }

      if (email && email.value.trim() === "") {
        alert("Please enter your email address.");
        email.focus();
        return;
      }

      if (password && password.value.trim() === "") {
        alert("Please enter your password.");
        password.focus();
        return;
      }

      if (checkbox && !checkbox.checked) {
        alert("Please check Remember Me.");
        checkbox.focus();
        return;
      }

      if (username && username.value.trim() !== "") {
        localStorage.setItem("stackly_username", username.value.trim());
      } else if (email && email.value.trim() !== "") {
        const emailPrefix = email.value.trim().split("@")[0];
        const capitalized = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        localStorage.setItem("stackly_username", capitalized);
      }

      const redirectTarget = form.dataset.redirect;
      showLoginSuccess(redirectTarget);
      return;
    }

    const redirectTarget = form.dataset.redirect;
    if (redirectTarget) {
      window.location.href = redirectTarget;
    }
  });
});

document.querySelectorAll(".google-btn").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "Not found.html";
  });
});

const showLoginSuccess = (redirectTarget) => {
  const userName = localStorage.getItem("stackly_username") || "Client";
  const popup = document.createElement("div");
  popup.className = "login-success-overlay";
  popup.setAttribute("role", "status");
  popup.setAttribute("aria-live", "polite");
  popup.innerHTML = `
    <div class="login-success-card">
      <div class="success-burst" aria-hidden="true">🎉</div>
      <h2>Successfully logged in!</h2>
      <p>Welcome ${userName}. Taking you to your dashboard.</p>
    </div>
  `;

  document.body.appendChild(popup);

  window.setTimeout(() => {
    if (redirectTarget) {
      window.location.href = redirectTarget;
    }
  }, 1800);
};

const dashboardUserName = document.getElementById("dashboard-user-name");
const savedDashboardUserName = localStorage.getItem("stackly_username") || "Username";

if (dashboardUserName) {
  dashboardUserName.textContent = savedDashboardUserName;
}

document.querySelectorAll(".sidebar-note").forEach((note) => {
  const name = note.querySelector("strong");
  const status = note.querySelector("span");

  if (name) {
    name.textContent = savedDashboardUserName;
  }

  if (status) {
    status.textContent = "Online";
    status.classList.add("online-status");
  }
});

// Logout Modal Logic
const logoutTriggers = document.querySelectorAll(".dashboard-logout");

if (logoutTriggers.length) {
  let activeLogoutTrigger = null;
  let logoutModal = document.getElementById("logout-modal");

  if (!logoutModal) {
    logoutModal = document.createElement("div");
    logoutModal.className = "logout-modal-overlay";
    logoutModal.id = "logout-modal";
    logoutModal.setAttribute("aria-hidden", "true");
    logoutModal.innerHTML = `
      <div class="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <h3 id="logout-title">Confirm Logout</h3>
        <p>Are you sure you want to sign out of your Stackly workspace?</p>
        <div class="logout-actions">
          <button class="logout-btn-cancel" id="logout-cancel" type="button">Cancel</button>
          <button class="logout-btn-confirm" id="logout-confirm" type="button">Logout</button>
        </div>
      </div>
    `;
    document.body.appendChild(logoutModal);
  }

  const logoutCancel = logoutModal.querySelector("#logout-cancel");
  const logoutConfirm = logoutModal.querySelector("#logout-confirm");

  const openLogoutModal = () => {
    logoutModal.classList.add("is-visible");
    logoutModal.setAttribute("aria-hidden", "false");
    logoutConfirm?.focus();
  };

  const closeLogoutModal = () => {
    logoutModal.classList.remove("is-visible");
    logoutModal.setAttribute("aria-hidden", "true");
    activeLogoutTrigger?.focus();
  };

  logoutTriggers.forEach((logoutTrigger) => {
    logoutTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      activeLogoutTrigger = logoutTrigger;
      openLogoutModal();
    });
  });

  logoutCancel?.addEventListener("click", () => {
    closeLogoutModal();
  });

  logoutConfirm?.addEventListener("click", () => {
    localStorage.removeItem("stackly_username");
    window.location.href = "login.html";
  });

  logoutModal.addEventListener("click", (event) => {
    if (event.target === logoutModal) {
      closeLogoutModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && logoutModal.classList.contains("is-visible")) {
      closeLogoutModal();
    }
  });
}

// Intersection Observer for scroll animations
const fadeObserverOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, fadeObserverOptions);

document.querySelectorAll('.fade-in-up, .fade-in-down, .roll-in').forEach(element => {
  fadeObserver.observe(element);
});

document.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
  const slides = Array.from(slideshow.querySelectorAll(".showcase-slide"));
  const dots = Array.from(slideshow.querySelectorAll("[data-slide-to]"));
  const prevButton = slideshow.querySelector('[data-slide="prev"]');
  const nextButton = slideshow.querySelector('[data-slide="next"]');
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let timer;

  if (!slides.length) {
    return;
  }

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  const nextSlide = () => showSlide(activeIndex + 1);
  const startTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(nextSlide, 4800);
  };
  const stopTimer = () => window.clearInterval(timer);

  prevButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startTimer();
  });

  nextButton?.addEventListener("click", () => {
    nextSlide();
    startTimer();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startTimer();
    });
  });

  slideshow.addEventListener("mouseenter", stopTimer);
  slideshow.addEventListener("mouseleave", startTimer);
  slideshow.addEventListener("focusin", stopTimer);
  slideshow.addEventListener("focusout", startTimer);

  showSlide(activeIndex);
  startTimer();
});

// Hero Background Slideshow
const heroSection = document.querySelector(".hero");
if (heroSection) {
  heroSection.classList.add("has-slideshow");

  const heroSlides = [
    "../assets/listing-lakeview.webp",
    "../assets/listing-garden.webp",
    "../assets/listing-canyon.webp"
  ];

  const heroSlideshowContainer = document.createElement("div");
  heroSlideshowContainer.className = "hero-bg-slideshow";

  heroSlides.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.className = "hero-bg-slide";
    if (index === 0) slide.classList.add("is-active");
    slide.style.backgroundImage = `url('${src}')`;
    heroSlideshowContainer.appendChild(slide);
  });

  heroSection.prepend(heroSlideshowContainer);

  let currentHeroIndex = 0;
  const slideElements = heroSlideshowContainer.querySelectorAll(".hero-bg-slide");

  setInterval(() => {
    slideElements[currentHeroIndex].classList.remove("is-active");
    currentHeroIndex = (currentHeroIndex + 1) % slideElements.length;
    slideElements[currentHeroIndex].classList.add("is-active");
  }, 2000);
}
