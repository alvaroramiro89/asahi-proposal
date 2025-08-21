// Asahi Intecc Project Proposal - Interactive Features
class ProjectProposalApp {
  constructor() {
    this.state = {
      currentSection: "context-task",
      sections: ["context-task", "project-proposals", "asahi-academy"],
    };

    this.init();
  }

  init() {
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.sections = document.querySelectorAll(".section");

    this.setupEventListeners();
    this.setupAccessibility();
    this.setupAnimations();
  }

  setupEventListeners() {
    // Navigation button clicks
    this.navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const targetSection = e.currentTarget.dataset.section;
        if (targetSection) {
          this.navigateToSection(targetSection);
        }
      });

      // Keyboard navigation
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const targetSection = e.currentTarget.dataset.section;
          if (targetSection) {
            this.navigateToSection(targetSection);
          }
        }
      });
    });

    // Card hover effects
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", this.handleCardHover.bind(this));
      card.addEventListener("mouseleave", this.handleCardLeave.bind(this));
    });

    // Timeline item interactions
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => {
      item.addEventListener("click", this.handleTimelineClick.bind(this));
    });

    // KPI animations
    this.setupKPIAnimations();
  }

  setupAccessibility() {
    // Add ARIA labels and roles
    this.navButtons.forEach((button, index) => {
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.setAttribute("aria-controls", button.dataset.section || "");
    });

    this.sections.forEach((section, index) => {
      section.setAttribute("role", "tabpanel");
      section.setAttribute("aria-labelledby", this.navButtons[index]?.id || "");
    });

    // Skip to content link
    this.createSkipLink();
  }

  createSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className = "skip-link";
    skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--asahi-red);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        `;

    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "6px";
    });

    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-40px";
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe cards for animation
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      observer.observe(card);
    });
  }

  setupKPIAnimations() {
    const kpis = document.querySelectorAll(".kpi h4");

    const animateValue = (element, start, end, duration) => {
      const startTime = performance.now();
      const isPercentage = element.textContent?.includes("%");
      const isPlus = element.textContent?.includes("+");

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = start + (end - start) * this.easeOutQuart(progress);

        if (isPercentage) {
          element.textContent = `${Math.round(current)}%`;
        } else if (isPlus) {
          element.textContent = `+${Math.round(current)}%`;
        } else {
          element.textContent = Math.round(current).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    const kpiObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const kpiElement = entry.target;
            const text = kpiElement.textContent || "";
            const numericValue = parseInt(text.replace(/[^\d]/g, ""));

            if (!isNaN(numericValue)) {
              animateValue(kpiElement, 0, numericValue, 1500);
              kpiObserver.unobserve(kpiElement);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    kpis.forEach((kpi) => kpiObserver.observe(kpi));
  }

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  navigateToSection(sectionId) {
    // Update state
    this.state.currentSection = sectionId;

    // Update navigation buttons
    this.navButtons.forEach((button) => {
      const isActive = button.dataset.section === sectionId;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive.toString());
    });

    // Update sections
    this.sections.forEach((section) => {
      const isActive = section.id === sectionId;
      section.classList.toggle("active", isActive);

      if (isActive) {
        section.setAttribute("aria-hidden", "false");
        section.focus();
      } else {
        section.setAttribute("aria-hidden", "true");
      }
    });

    // Update URL hash
    window.location.hash = sectionId;

    // Trigger custom event
    this.dispatchNavigationEvent(sectionId);
  }

  handleCardHover(e) {
    const card = e.currentTarget;
    card.style.transform = "translateY(-8px) scale(1.02)";
  }

  handleCardLeave(e) {
    const card = e.currentTarget;
    card.style.transform = "translateY(0) scale(1)";
  }

  handleTimelineClick(e) {
    const timelineItem = e.currentTarget;
    const content = timelineItem.querySelector(".timeline-content");

    if (content) {
      content.classList.toggle("expanded");

      // Add smooth height transition
      if (content.classList.contains("expanded")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = "0";
      }
    }
  }

  dispatchNavigationEvent(sectionId) {
    const event = new CustomEvent("sectionChange", {
      detail: { sectionId, timestamp: Date.now() },
    });
    document.dispatchEvent(event);
  }

  // Public methods
  getCurrentSection() {
    return this.state.currentSection;
  }

  navigateToSectionById(sectionId) {
    if (this.state.sections.includes(sectionId)) {
      this.navigateToSection(sectionId);
    }
  }

  addSectionChangeListener(callback) {
    document.addEventListener("sectionChange", (e) => {
      callback(e.detail.sectionId);
    });
  }
}

// Analytics tracking
class AnalyticsTracker {
  constructor() {
    if (AnalyticsTracker.instance) {
      return AnalyticsTracker.instance;
    }
    AnalyticsTracker.instance = this;
    this.events = [];
  }

  trackEvent(type, data = {}) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // In a real app, you'd send this to your analytics service
    console.log("Analytics Event:", event);
  }

  getEvents() {
    return [...this.events];
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new ProjectProposalApp();
  const analytics = new AnalyticsTracker();

  // Track section changes
  app.addSectionChangeListener((sectionId) => {
    analytics.trackEvent("section_navigation", { sectionId });
  });

  // Track card interactions
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const cardTitle = card.querySelector("h3")?.textContent || "Unknown";
      analytics.trackEvent("card_click", { cardTitle });
    });
  });

  // Handle URL hash changes
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (hash && app.getCurrentSection() !== hash) {
      app.navigateToSectionById(hash);
    }
  });

  // Initialize with hash if present
  const initialHash = window.location.hash.slice(1);
  if (initialHash && initialHash !== app.getCurrentSection()) {
    app.navigateToSectionById(initialHash);
  }

  // Add loading animation
  document.body.classList.add("loaded");
});
