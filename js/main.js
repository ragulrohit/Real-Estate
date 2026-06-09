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

document.querySelectorAll("[data-countdown]").forEach((countdown) => {
  const deadline = Date.now() + 23 * 60 * 60 * 1000;
  const daysEl = countdown.querySelector("[data-days]");
  const hoursEl = countdown.querySelector("[data-hours]");
  const minutesEl = countdown.querySelector("[data-minutes]");
  const secondsEl = countdown.querySelector("[data-seconds]");
  let timer;

  const pad = (value) => String(value).padStart(2, "0");

  const updateCountdown = () => {
    const remaining = Math.max(0, deadline - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (daysEl) {
      daysEl.textContent = pad(days);
    }
    if (hoursEl) {
      hoursEl.textContent = pad(hours);
    }
    if (minutesEl) {
      minutesEl.textContent = pad(minutes);
    }
    if (secondsEl) {
      secondsEl.textContent = pad(seconds);
    }

    if (remaining <= 0) {
      window.clearInterval(timer);
    }
  };

  updateCountdown();
  timer = window.setInterval(updateCountdown, 1000);
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

      const accountType = form.querySelector('input[name="login-account-type"]:checked, input[name="account-type"]:checked');
      if (accountType) {
        localStorage.setItem("stackly_account_type", accountType.value);
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

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  const field = button.closest(".password-field");
  const input = field?.querySelector("[data-password-input]");
  const eyeIcon = button.querySelector(".eye-icon");
  const eyeOffIcon = button.querySelector(".eye-off-icon");

  if (!input) {
    return;
  }

  button.addEventListener("click", () => {
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    button.classList.toggle("is-visible", isPassword);

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.hidden = false;
      eyeOffIcon.hidden = false;
    }
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
const savedDashboardAccountType = localStorage.getItem("stackly_account_type") || "buyer";

if (dashboardUserName) {
  dashboardUserName.textContent = savedDashboardUserName;
}

const dashboardProfiles = {
  buyer: {
    title: "Buyer Dashboard",
    intro: "Buyer workspace",
    nav: {
      saved: "Saved Homes",
      tours: "Tours",
    },
    stats: [
      ["Next tour", "Lakeview Modern - Jun 11"],
      ["Saved homes", "8 properties active"],
      ["Offer packet", "2 documents pending"],
      ["Pre-approval", "$1.35M verified"],
    ],
    firstPanel: {
      title: "Upcoming Tours",
      rows: [
        ["green", "Lakeview Modern Residence", "Austin, TX - Jun 11, 10:30 AM", "Confirmed", ""],
        ["red", "Garden District Townhome", "Charlotte, NC - Jun 14, 2:00 PM", "Pending", "pending"],
        ["gold", "Canyon Ridge Estate", "Scottsdale, AZ - Jun 18, 7:30 AM", "Confirmed", ""],
      ],
    },
    market: {
      title: "Market Summary",
      rows: [
        ["Austin median price", "$742K", "82%", "#0f846b"],
        ["Buyer competition", "Moderate", "58%", "#c69a2d"],
        ["Inventory movement", "18 days", "76%", "#0f846b"],
        ["Offer readiness", "Strong", "88%", "#1d5da8"],
      ],
    },
    properties: {
      title: "Priority Properties",
      link: "View listings",
      rows: [
        ["../assets/listing-lakeview.webp", "Lakeview Modern Residence living room", "Lakeview Modern Residence", "$1,245,000 - 4 bed - Austin, TX"],
        ["../assets/listing-garden.webp", "Garden District Townhome kitchen", "Garden District Townhome", "$875,000 - 3 bed - Charlotte, NC"],
        ["../assets/listing-canyon.webp", "Canyon Ridge Estate exterior", "Canyon Ridge Estate", "$2,390,000 - 5 bed - Scottsdale, AZ"],
      ],
    },
  },
  seller: {
    title: "Seller Dashboard",
    intro: "Seller workspace",
    nav: {
      saved: "My Listing",
      tours: "Showings",
    },
    stats: [
      ["Next showing", "Canyon Ridge - Jun 12"],
      ["Active listing", "920 Mesa Point live"],
      ["Seller packet", "3 documents pending"],
      ["Target value", "$2.39M strategy"],
    ],
    firstPanel: {
      title: "Showing Schedule",
      rows: [
        ["green", "Private buyer tour", "Canyon Ridge Estate - Jun 12, 11:00 AM", "Confirmed", ""],
        ["gold", "Broker preview", "Pricing feedback session - Jun 13, 4:30 PM", "Scheduled", ""],
        ["red", "Inspection window", "Awaiting buyer confirmation", "Pending", "pending"],
      ],
    },
    market: {
      title: "Seller Market Summary",
      rows: [
        ["Comparable list range", "$2.25M - $2.45M", "84%", "#0f846b"],
        ["Buyer demand", "Strong", "72%", "#0f846b"],
        ["Days-on-market target", "14 days", "68%", "#c69a2d"],
        ["Pricing confidence", "High", "90%", "#1d5da8"],
      ],
    },
    properties: {
      title: "Listing Priorities",
      link: "View services",
      rows: [
        ["../assets/listing-canyon.webp", "Canyon Ridge Estate exterior", "Canyon Ridge Estate", "Photography, staging, and offer strategy active"],
        ["../assets/service-advisory.webp", "Advisor reviewing a home", "Pricing Review", "Comparable sales and timing notes ready"],
        ["../assets/valuation-home.webp", "Home valuation detail", "Valuation Package", "Seller disclosure and market packet in progress"],
      ],
    },
  },
};

const setPanelHeading = (heading, text) => {
  if (!heading) {
    return;
  }

  const icon = heading.querySelector("svg");
  heading.textContent = "";
  if (icon) {
    heading.append(icon);
  }
  heading.append(text);
};

const applyDashboardProfile = () => {
  const profile = dashboardProfiles[savedDashboardAccountType] || dashboardProfiles.buyer;
  document.body.dataset.accountType = savedDashboardAccountType;

  const topbarTitle = document.querySelector(".dashboard-topbar h1");
  const topbarCopy = document.querySelector(".dashboard-topbar p");

  if (topbarTitle) {
    topbarTitle.textContent = profile.title;
  }

  if (topbarCopy) {
    topbarCopy.innerHTML = `Welcome back, <strong id="dashboard-user-name">${savedDashboardUserName}</strong> - ${profile.intro}`;
  }

  const navLinks = Array.from(document.querySelectorAll(".dashboard-nav a"));
  const savedNav = navLinks.find((link) => link.getAttribute("href") === "dashboard-saved-homes.html");
  const toursNav = navLinks.find((link) => link.getAttribute("href") === "dashboard-tours.html");
  savedNav?.querySelector("span") && (savedNav.querySelector("span").textContent = profile.nav.saved);
  toursNav?.querySelector("span") && (toursNav.querySelector("span").textContent = profile.nav.tours);

  document.querySelectorAll(".dashboard-stats .dash-stat").forEach((stat, index) => {
    const data = profile.stats[index];
    if (!data) {
      return;
    }

    const label = stat.querySelector("span");
    const value = stat.querySelector("strong");
    if (label) {
      label.textContent = data[0];
    }
    if (value) {
      value.textContent = data[1];
    }
  });

  const firstPanel = document.querySelector(".tours-panel");
  setPanelHeading(firstPanel?.querySelector("h2"), profile.firstPanel.title);
  const firstList = firstPanel?.querySelector(".dash-list");
  if (firstList) {
    firstList.innerHTML = profile.firstPanel.rows.map(([dot, title, copy, status, statusClass]) => `
      <div class="dash-row"><span class="dot ${dot}"></span><div><strong>${title}</strong><p>${copy}</p></div><em class="${statusClass}">${status}</em></div>
    `).join("");
  }

  const marketPanel = document.querySelector(".market-panel");
  setPanelHeading(marketPanel?.querySelector("h2"), profile.market.title);
  if (marketPanel) {
    marketPanel.querySelectorAll(".market-meter").forEach((meter, index) => {
      const data = profile.market.rows[index];
      if (!data) {
        return;
      }

      const label = meter.querySelector("span");
      const value = meter.querySelector("strong");
      const bar = meter.querySelector("i");
      if (label) {
        label.textContent = data[0];
      }
      if (value) {
        value.textContent = data[1];
      }
      if (bar) {
        bar.style.setProperty("--value", data[2]);
        bar.style.setProperty("--bar", data[3]);
      }
    });
  }

  const propertyPanel = document.querySelector(".property-panel");
  setPanelHeading(propertyPanel?.querySelector("h2"), profile.properties.title);
  const propertyLink = propertyPanel?.querySelector(".dashboard-section-head a");
  if (propertyLink) {
    propertyLink.textContent = profile.properties.link;
    propertyLink.href = savedDashboardAccountType === "seller" ? "services.html" : "listings.html";
  }

  const propertyGrid = propertyPanel?.querySelector(".dash-property-grid");
  if (propertyGrid) {
    propertyGrid.innerHTML = profile.properties.rows.map(([src, alt, title, copy]) => `
      <article><img src="${src}" alt="${alt}" /><div><strong>${title}</strong><p>${copy}</p></div></article>
    `).join("");
  }
};

if (document.querySelector(".dashboard-stats")) {
  applyDashboardProfile();
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
    localStorage.removeItem("stackly_account_type");
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

// Shared page animation and letter reveals
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const animatedSelectors = [
  ".section-head",
  ".listing-card",
  ".neighborhood-card",
  ".service-card",
  ".info-card",
  ".agent-card",
  ".dash-stat",
  ".dash-panel",
  ".dash-property-grid article",
  ".auth-card",
  ".auth-media",
  ".signup-promo",
  ".valuation-panel > *",
  ".footer-inner > *",
  ".footer-bottom",
];

document.querySelectorAll(animatedSelectors.join(",")).forEach((element, index) => {
  if (!element.classList.contains("fade-in-up") && !element.classList.contains("fade-in-down") && !element.classList.contains("roll-in")) {
    element.classList.add("fade-in-up");
  }

  const delay = Math.min(index % 6, 5) * 45;
  if (!element.style.animationDelay) {
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  }
});

document.querySelectorAll("h1, .hero h2, .auth-copy h1, .dashboard-topbar h1").forEach((heading) => {
  if (heading.dataset.lettersReady || heading.querySelector("svg")) {
    return;
  }

  const text = heading.textContent.trim();
  if (!text) {
    return;
  }

  heading.dataset.lettersReady = "true";
  heading.setAttribute("aria-label", text);
  heading.textContent = "";
  heading.classList.add("letter-reveal");

  Array.from(text).forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00a0" : char;
    span.style.setProperty("--letter-delay", `${Math.min(index, 42) * 24}ms`);
    heading.appendChild(span);
  });
});

const fadeObserverOptions = {
  root: null,
  rootMargin: "0px 0px -8% 0px",
  threshold: 0.14,
};

if (motionQuery.matches) {
  document.querySelectorAll(".fade-in-up, .fade-in-down, .roll-in, .letter-reveal").forEach((element) => {
    element.classList.add("visible");
  });
} else {
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, fadeObserverOptions);

  document.querySelectorAll(".fade-in-up, .fade-in-down, .roll-in, .letter-reveal").forEach((element) => {
    fadeObserver.observe(element);
  });
}

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
document.querySelectorAll(".hero").forEach((heroSection) => {
  if (heroSection.querySelector(".hero-bg-slideshow")) {
    return;
  }

  heroSection.classList.add("has-slideshow");

  const declaredImage = getComputedStyle(heroSection).getPropertyValue("--hero-image").trim().replace(/^url\(["']?|["']?\)$/g, "");
  const heroSlides = [
    declaredImage,
    "../assets/listing-lakeview.webp",
    "../assets/listing-garden.webp",
    "../assets/listing-canyon.webp",
    "../assets/neighborhood-harbor.webp",
  ].filter(Boolean);

  const uniqueSlides = Array.from(new Set(heroSlides));
  const heroSlideshowContainer = document.createElement("div");
  heroSlideshowContainer.className = "hero-bg-slideshow";

  uniqueSlides.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.className = "hero-bg-slide";
    if (index === 0) {
      slide.classList.add("is-active");
    }
    slide.style.backgroundImage = `url('${src}')`;
    heroSlideshowContainer.appendChild(slide);
  });

  heroSection.prepend(heroSlideshowContainer);

  if (uniqueSlides.length < 2 || motionQuery.matches) {
    return;
  }

  let currentHeroIndex = 0;
  const slideElements = Array.from(heroSlideshowContainer.querySelectorAll(".hero-bg-slide"));

  window.setInterval(() => {
    slideElements[currentHeroIndex].classList.remove("is-active");
    currentHeroIndex = (currentHeroIndex + 1) % slideElements.length;
    slideElements[currentHeroIndex].classList.add("is-active");
  }, 3600);
});
