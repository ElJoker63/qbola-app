document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navAnchors = [...document.querySelectorAll(".nav-links a")];
    const sections = [...document.querySelectorAll("main section[id], .site-header[id]")];

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navAnchors.forEach((anchor) => {
            anchor.addEventListener("click", () => {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const target = document.querySelector(anchor.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            const headerOffset = 76;
            const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    const revealTargets = document.querySelectorAll(".feature-card, .media-visual, .media-copy, .desktop-copy, .laptop-preview, .privacy-copy, .privacy-list article, .download-section");

    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealTargets.forEach((target) => target.classList.add("reveal"));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        revealTargets.forEach((target) => observer.observe(target));
    }

    if ("IntersectionObserver" in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const id = entry.target.getAttribute("id");
                navAnchors.forEach((anchor) => {
                    anchor.classList.toggle("active", anchor.getAttribute("href") === `#${id}`);
                });
            });
        }, {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0.01
        });

        sections.forEach((section) => navObserver.observe(section));
    }

    const platformText = {
        windows: "Cliente para Windows en preparación.",
        macos: "Cliente para macOS en preparación.",
        linux: "Cliente para Linux en preparación."
    };
    const platformStatus = document.querySelector(".platform-status");

    document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");

            if (platformStatus) {
                platformStatus.textContent = platformText[tab.dataset.platform] || platformText.windows;
            }
        });
    });
});
