const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const yearEl = document.getElementById("year");
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!revealItems.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function animateStats() {
  const counters = document.querySelectorAll("[data-count]");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const suffix = Number.isInteger(target) ? "+" : "";

    let current = 0;
    const increment = target / 60;

    const update = () => {
      current += increment;
      if (current >= target) {
        counter.textContent = `${target}${suffix}`;
        return;
      }
      const displayValue = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
      counter.textContent = `${displayValue}${suffix}`;
      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  });
}

function setupAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

function setupContactForm() {
  if (!contactForm || !formNote) {
    return;
  }

  if (new URLSearchParams(window.location.search).get("enquiry") === "sent") {
    formNote.textContent = "Thank you. Your enquiry has been sent successfully.";
  }

  const returnUrl = new URL(window.location.href);
  returnUrl.searchParams.set("enquiry", "sent");
  returnUrl.hash = "contact";
  const redirectField = contactForm.querySelector('input[name="_next"]');
  if (redirectField) {
    redirectField.value = returnUrl.toString();
  }

  contactForm.addEventListener("submit", () => {
    const name = document.getElementById("name")?.value.trim();
    const subject = contactForm.querySelector('input[name="_subject"]');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (subject && name) {
      subject.value = `Custom Quote Request from ${name}`;
    }

    if (redirectField) {
      const currentPage = new URL(window.location.href);
      currentPage.searchParams.set("enquiry", "sent");
      currentPage.hash = "contact";
      redirectField.value = currentPage.toString();
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending inquiry...";
    }
    formNote.textContent = "Sending your inquiry. Please wait...";
  });
}

function setupNavigationHighlight() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));
}

setupAnalytics();
setupRevealAnimations();
animateStats();
setupContactForm();
setupNavigationHighlight();

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const link = target.closest("a");
  if (!link) {
    return;
  }

  const href = link.getAttribute("href") || "";
  if (href.startsWith("tel:")) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "click_call", href });
  }
  if (href.includes("wa.me")) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "click_whatsapp", href });
  }
});
