
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Automatically update the footer year
  const yearElement = document.getElementById("currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Mobile navigation
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  function closeMobileMenu() {
    if (!menuToggle || !navMenu) return;

    navMenu.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (menuToggle && navMenu) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

    menuToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    // Close after tapping a navigation link
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    // Close when tapping outside the menu
    document.addEventListener("click", function (event) {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });

    // Close when pressing Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    // Close the mobile menu when resizing to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    });
  }

  // Smooth scrolling for section links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        event.preventDefault();

        targetElement.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
          block: "start"
        });
      }
    });
  });

  // Scroll-reveal animations
  const revealElements = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    !reduceMotion &&
    "IntersectionObserver" in window &&
    revealElements.length > 0
  ) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("visible");
    });
  }

  // Animate the SVG route line
  const routePath = document.querySelector(".route-path");

  if (
    routePath &&
    !reduceMotion &&
    typeof routePath.getTotalLength === "function"
  ) {
    const pathLength = routePath.getTotalLength();

    if (pathLength > 0) {
      routePath.style.strokeDasharray = String(pathLength);
      routePath.style.strokeDashoffset = String(pathLength);

      if ("IntersectionObserver" in window) {
        const routeObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                routePath.style.transition = "stroke-dashoffset 2s ease";
                routePath.style.strokeDashoffset = "0";
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );

        routeObserver.observe(routePath);
      } else {
        routePath.style.strokeDashoffset = "0";
      }
    }
  }

  // Prevent booking dates in the past
  // =========================================================
// BOOKING DATE & TIME
// Default = current date and current time
// Customer can change them for pre-booking
// =========================================================

const bookingDate = document.querySelector(
  '#bookingForm input[name="date"]'
);

const bookingTime = document.querySelector(
  '#bookingForm input[name="time"]'
);

if (bookingDate || bookingTime) {

  const now = new Date();

  // Current date
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const today = `${year}-${month}-${day}`;

  // Current time
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const currentTime = `${hours}:${minutes}`;

  // Date field
  if (bookingDate) {
    bookingDate.min = today;

    // Automatically fill today's date
    if (!bookingDate.value) {
      bookingDate.value = today;
    }
  }

  // Time field
  if (bookingTime) {

    // Automatically fill current time
    if (!bookingTime.value) {
      bookingTime.value = currentTime;
    }
  }
}

  // Booking form, backend database and WhatsApp integration
  const bookingForm = document.getElementById("bookingForm");
  const bookingMessage = document.getElementById("bookingMessage");

  
const API_URL =
  "https://purpletaxi-backend.onrender.com/api/bookings";

  const whatsappNumber = "917871483345";

  function showMessage(message, type) {
    if (!bookingMessage) {
      window.alert(message);
      return;
    }

    bookingMessage.textContent = message;
    bookingMessage.classList.remove("success", "error");
    bookingMessage.classList.add(type);
    bookingMessage.setAttribute("role", "status");
    bookingMessage.setAttribute("aria-live", "polite");
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (bookingMessage) {
        bookingMessage.textContent = "";
        bookingMessage.classList.remove("success", "error");
      }

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      const data = new FormData(bookingForm);

      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const pickup = String(data.get("pickup") || "").trim();
      const drop = String(data.get("drop") || "").trim();
      const date = String(data.get("date") || "").trim();
      const time = String(data.get("time") || "").trim();

      const phoneDigits = phone.replace(/\D/g, "");

      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        showMessage("Please enter a valid phone number.", "error");
        return;
      }

      const selectedDate = new Date(date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!date || Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
        showMessage(
          "Please select today or a future travel date.",
          "error"
        );
        return;
      }

      const submitButton = bookingForm.querySelector(
        'button[type="submit"]'
      );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        // Save the booking to the backend first.
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            phone: phone,
            pickup: pickup,
            drop: drop,
            date: date,
            time: time
          })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to save your booking."
          );
        }

        // Prepare the WhatsApp message after successful saving.
        const bookingText = [
          "TAXI BOOKING REQUEST",
          "",
          "Booking ID: " + result.bookingId,
          "Name: " + name,
          "Customer phone: " + phone,
          "Pickup: " + pickup,
          "Destination: " + drop,
          "Travel date: " + date,
          "Pickup time: " + time,
          "",
          "Please confirm availability and fare."
        ].join("\n");

        const whatsappURL =
          "https://wa.me/" +
          whatsappNumber +
          "?text=" +
          encodeURIComponent(bookingText);

        
showMessage(
  "Your booking has been saved successfully. Opening WhatsApp...",
  "success"
);

window.location.href = whatsappURL;


        bookingForm.reset();

        // Keep the minimum travel date set to today.
        const dateInput = bookingForm.querySelector('input[name="date"]');

        if (dateInput) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");

          dateInput.min = `${year}-${month}-${day}`;
        }
      } catch (error) {
        console.error("Booking submission failed:", error);

        showMessage(
          error.message ||
            "Could not submit your booking. Please try again.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Booking Request ↗";
        }
      }
    });
  }
});
