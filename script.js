/* ============================================================
   ANAGHA EDUCATIONAL & WELFARE TRUST — JAVASCRIPT
   Vanilla JS. Each feature wrapped in its own module/IIFE.
   ============================================================ */
/* Firebase backend removed — this is now a fully static front-end. */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Current year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header on scroll ---------- */
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    if (window.scrollY > 500) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = [...navLinks]
    .map((l) => {
      const id = l.getAttribute("href");
      return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  const setActiveLink = () => {
    const pos = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.offsetTop <= pos) current = sec;
    });
    navLinks.forEach((l) => l.classList.remove("active"));
    const activeLink = document.querySelector(
      '.nav__link[href="#' + current.id + '"]',
    );
    if (activeLink) activeLink.classList.add("active");
  };
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Hero slider ---------- */
  const heroSlider = (() => {
    const slider = document.getElementById("heroSlider");
    if (!slider) return;
    const slides = slider.querySelectorAll(".hero__slide");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");
    const dotsContainer = document.getElementById("heroDots");
    let index = 0;
    let timer = null;
    const INTERVAL = 5000;
    let paused = false;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero__dot" + (i === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll(".hero__dot");

    function goTo(i) {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");
      index = (i + slides.length) % slides.length;
      slides[index].classList.add("active");
      dots[index].classList.add("active");
      resetTimer();
    }

    function next() {
      goTo(index + 1);
    }
    function prev() {
      goTo(index - 1);
    }

    function startTimer() {
      timer = setInterval(() => {
        if (!paused) next();
      }, INTERVAL);
    }
    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    // Pause on hover
    slider.addEventListener("mouseenter", () => {
      paused = true;
    });
    slider.addEventListener("mouseleave", () => {
      paused = false;
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    slider.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) next();
          else prev();
        }
      },
      { passive: true },
    );

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    startTimer();
  })();

  /* ---------- Impact counters ---------- */
  const counters = (() => {
    const nums = document.querySelectorAll(".impact__number");
    if (!nums.length) return;
    let started = false;

    function animate(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString("en-IN") + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString("en-IN") + suffix;
      }
      requestAnimationFrame(tick);
    }

    function runIfVisible() {
      if (started) return;
      const rect = nums[0].getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        started = true;
        nums.forEach(animate);
      }
    }

    window.addEventListener("scroll", runIfVisible, { passive: true });
    runIfVisible();
  })();

  /* ---------- Donation campaigns: interactive tabs + progress bars ---------- */
  (() => {
    const tabs = document.querySelectorAll(".campaign-tab");
    const panels = document.querySelectorAll(".campaign__panel");
    const fills = document.querySelectorAll(".campaign-progress-fill");

    function animateFill(el) {
      const target = el.getAttribute("data-width") || "0";
      el.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.width = target + "%";
        });
      });
    }

    // Animate the visible (active) bar once it scrolls into view.
    if (fills.length) {
      const progressObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const fill = entry.target.querySelector(
                ".campaign-progress-fill",
              );
              if (fill) animateFill(fill);
              progressObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      document
        .querySelectorAll(".campaign__panel.is-active")
        .forEach((panel) => {
          progressObserver.observe(panel);
        });
    }

    if (tabs.length && panels.length) {
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetId = tab.getAttribute("data-target");

          tabs.forEach((t) => {
            t.classList.remove("is-active");
            t.setAttribute("aria-selected", "false");
          });
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");

          panels.forEach((panel) => {
            const isMatch = panel.getAttribute("data-panel") === targetId;
            panel.classList.toggle("is-active", isMatch);
            panel.hidden = !isMatch;
            if (isMatch) {
              const fill = panel.querySelector(".campaign-progress-fill");
              if (fill) animateFill(fill);
              const headerOffset =
                document.querySelector(".header")?.offsetHeight || 80;
              const panelTop =
                panel.getBoundingClientRect().top +
                window.pageYOffset -
                headerOffset -
                16;
              window.scrollTo({ top: panelTop, behavior: "smooth" });
            }
          });
        });
      });
    }
  })();

  /* ---------- Programs: interactive category filter ---------- */
  (() => {
    const filterBtns = document.querySelectorAll(".programs__filter");
    const cards = document.querySelectorAll(".program-card");
    const countEl = document.getElementById("programsCount");

    function applyFilter(category) {
      let visible = 0;
      cards.forEach((card) => {
        const match =
          category === "all" || card.getAttribute("data-category") === category;
        card.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });
      if (countEl) {
        countEl.textContent =
          category === "all"
            ? "Showing all " + visible + " programs"
            : "Showing " + visible + " program" + (visible === 1 ? "" : "s");
      }
    }

    if (filterBtns.length && cards.length) {
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => {
            b.classList.remove("is-active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");
          applyFilter(btn.getAttribute("data-filter"));
        });
      });
      applyFilter("all");
    }
  })();

  /* ---------- FAQ accordion ---------- */
  const faqList = document.getElementById("faqList");
  if (faqList) {
    const items = faqList.querySelectorAll(".faq__item");
    items.forEach((item) => {
      const btn = item.querySelector(".faq__question");
      const answer = item.querySelector(".faq__answer");
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Close all
        items.forEach((other) => {
          other.classList.remove("open");
          other.querySelector(".faq__answer").style.maxHeight = null;
          other
            .querySelector(".faq__question")
            .setAttribute("aria-expanded", "false");
        });
        // Toggle current
        if (!isOpen) {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = (() => {
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbClose = document.getElementById("lightboxClose");
    const lbPrev = document.getElementById("lightboxPrev");
    const lbNext = document.getElementById("lightboxNext");
    const galleryImgs = document.querySelectorAll("#galleryGrid img");
    if (!lb || !galleryImgs.length) return;

    let current = 0;
    const srcs = [...galleryImgs].map((img) => ({
      src: img.src.replace("w=600", "w=1200"),
      alt: img.alt,
    }));

    function open(i) {
      current = i;
      show();
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function show() {
      lbImg.src = srcs[current].src;
      lbImg.alt = srcs[current].alt;
    }
    function next() {
      current = (current + 1) % srcs.length;
      show();
    }
    function prev() {
      current = (current - 1 + srcs.length) % srcs.length;
      show();
    }

    galleryImgs.forEach((img, i) => {
      img.addEventListener("click", () => open(i));
    });
    lbClose.addEventListener("click", close);
    lbNext.addEventListener("click", next);
    lbPrev.addEventListener("click", prev);
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    // Swipe on lightbox
    let startX = 0;
    lb.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    lb.addEventListener(
      "touchend",
      (e) => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
        }
      },
      { passive: true },
    );
  })();

  /* ---------- Testimonials slider ---------- */
  const testimonials = (() => {
    const track = document.getElementById("testimonialTrack");
    const dotsContainer = document.getElementById("testimonialDots");
    if (!track) return;
    const slides = track.querySelectorAll(".testimonial");
    let index = 0;
    let timer = null;
    const INTERVAL = 6000;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "testimonial__dot" + (i === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", () => {
        goTo(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll(".testimonial__dot");

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d) => d.classList.remove("active"));
      dots[index].classList.add("active");
    }
    function next() {
      goTo(index + 1);
    }
    function startTimer() {
      timer = setInterval(next, INTERVAL);
    }
    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    // Swipe
    let startX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        startX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : goTo(index - 1);
          resetTimer();
        }
      },
      { passive: true },
    );

    startTimer();
  })();

  /* ---------- Quick amount buttons ---------- */
  const quickAmounts = document.getElementById("quickAmounts");
  const dAmount = document.getElementById("dAmount");
  if (quickAmounts && dAmount) {
    const buttons = quickAmounts.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        dAmount.value = btn.dataset.amount;
        dAmount.dispatchEvent(new Event("input"));
      });
    });
    dAmount.addEventListener("input", () => {
      buttons.forEach((b) => {
        b.classList.toggle("active", b.dataset.amount === dAmount.value);
      });
    });
  }

  /* ---------- Donation form: static version (no payment gateway / backend) ---------- */
  const donateForm = document.getElementById("donateForm");
  const donateMessage = document.getElementById("donateMessage");
  if (donateForm) {
    donateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(donateForm);
      const fullName = (data.get("fullName") || "").trim();
      const email = (data.get("email") || "").trim();
      const phone = (data.get("phone") || "").trim();
      const pan = (data.get("pan") || "").trim().toUpperCase();
      const amount = Number(data.get("amount"));

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!amount || amount < 1) {
        donateMessage.textContent =
          "Please enter a donation amount to continue.";
        donateMessage.className = "form-message error";
        return;
      }

      // The real UPI QR code (see the "Scan & Pay Instantly" card) stays
      // hidden until the donor submits the form with an amount entered.
      const donateQRCard = document.getElementById("donateQRCard");
      const donateConfirm = document.getElementById("donateConfirm");
      const donateConfirmAmount = document.getElementById(
        "donateConfirmAmount",
      );

      if (donateQRCard) {
        donateQRCard.hidden = false;
      }
      if (donateConfirm && donateConfirmAmount) {
        donateConfirmAmount.textContent =
          "\u20B9" + amount.toLocaleString("en-IN");
        donateConfirm.hidden = false;
      }

      // Email the donor directly, only if they gave us a valid address
      // (requires an EmailJS account - see the <script> setup near the
      // bottom of donate.html for details).
      if (window.emailjs && emailRegex.test(email)) {
        emailjs
          .send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", {
            to_name: fullName || "Donor",
            to_email: email,
            phone: phone,
            pan: pan,
            amount: "\u20B9" + amount.toLocaleString("en-IN"),
          })
          .catch((err) => {
            console.error("EmailJS error:", err);
          });
      }

      donateMessage.textContent = emailRegex.test(email)
        ? "Thank you" +
          (fullName ? ", " + fullName : "") +
          "! Scan the QR code below to complete your payment. A confirmation email is on its way to " +
          email +
          "."
        : "Thank you" +
          (fullName ? ", " + fullName : "") +
          "! Scan the QR code below to complete your payment.";
      donateMessage.className = "form-message success";

      if (donateQRCard) {
        donateQRCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ---------- Contact form: static version (mailto, no backend) ---------- */
  const contactForm = document.getElementById("contactForm");
  const contactMessage = document.getElementById("contactMessage");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      const subject = (data.get("subject") || "").trim();
      const message = (data.get("message") || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !emailRegex.test(email) || !subject || !message) {
        contactMessage.textContent =
          "Please fill in all fields with a valid email.";
        contactMessage.className = "form-message error";
        return;
      }

      const mailSubject = encodeURIComponent(subject);
      const mailBody = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\n\n" + message,
      );
      window.location.href =
        "mailto:info@anaghatrust.org?subject=" +
        mailSubject +
        "&body=" +
        mailBody;

      contactMessage.textContent =
        "Thank you, " +
        name +
        "! We've opened your email app so you can send your message directly.";
      contactMessage.className = "form-message success";
      contactForm.reset();
    });
  }

  /* ---------- Footer WhatsApp enquiry form ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMessage = document.getElementById("newsletterMessage");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(newsletterForm);
      const name = (data.get("name") || "").trim();

      if (!name) {
        newsletterMessage.textContent = "Please enter your name.";
        newsletterMessage.className = "form-message error";
        return;
      }

      const waNumber = "919008762525";
      const waText = encodeURIComponent(
        "Hello, my name is " +
          name +
          ". I would like to know more details about the trust",
      );
      window.open(
        "https://wa.me/" + waNumber + "?text=" + waText,
        "_blank",
        "noopener,noreferrer",
      );

      newsletterMessage.textContent =
        "Thanks, " +
        name +
        "! Opening WhatsApp so you can chat with us directly.";
      newsletterMessage.className = "form-message success";
      newsletterForm.reset();
    });
  }
});
