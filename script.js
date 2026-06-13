document.addEventListener("DOMContentLoaded", () => {
    const releaseApiUrl = "https://api.github.com/repos/ElJoker63/qbola-app/releases/latest";
    const releaseFallbackUrl = "https://github.com/ElJoker63/qbola-app/releases/latest";
    const assetNames = {
        android: "app-release.apk",
        windows: "app-release.exe"
    };
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

    const setDownloadState = (type, url, options = {}) => {
        document.querySelectorAll(`[data-download="${type}"]`).forEach((link) => {
            link.href = url;
            link.classList.toggle("is-unavailable", Boolean(options.unavailable));

            if (options.label) {
                link.setAttribute("aria-label", options.label);
                link.title = options.label;
            }
        });
    };

    const formatReleaseDate = (isoDate) => {
        if (!isoDate) return "";

        try {
            return new Intl.DateTimeFormat("es", {
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(new Date(isoDate));
        } catch {
            return "";
        }
    };

    const updateReleaseLinks = async () => {
        const versionLabels = document.querySelectorAll("[data-release-version]");
        const windowsStatusLabels = document.querySelectorAll("[data-windows-status]");

        try {
            const response = await fetch(releaseApiUrl, {
                headers: { Accept: "application/vnd.github+json" }
            });

            if (!response.ok) {
                throw new Error(`GitHub release lookup failed: ${response.status}`);
            }

            const release = await response.json();
            const assets = Array.isArray(release.assets) ? release.assets : [];
            const androidAsset = assets.find((asset) => asset.name === assetNames.android);
            const windowsAsset = assets.find((asset) => asset.name === assetNames.windows);
            const releaseName = release.name || release.tag_name || "último release";
            const releaseDate = formatReleaseDate(release.published_at);

            versionLabels.forEach((label) => {
                label.textContent = `Versión ${releaseName}${releaseDate ? ` · ${releaseDate}` : ""}`;
            });

            if (androidAsset?.browser_download_url) {
                setDownloadState("android", androidAsset.browser_download_url, {
                    label: `Descargar ${assetNames.android} de Qbolá ${releaseName}`
                });
            } else {
                setDownloadState("android", release.html_url || releaseFallbackUrl, {
                    label: `Ver último release de Qbolá ${releaseName}`
                });
            }

            if (windowsAsset?.browser_download_url) {
                setDownloadState("windows", windowsAsset.browser_download_url, {
                    label: `Descargar ${assetNames.windows} de Qbolá ${releaseName}`
                });
                windowsStatusLabels.forEach((label) => {
                    label.textContent = "Windows";
                });
            } else {
                setDownloadState("windows", release.html_url || releaseFallbackUrl, {
                    unavailable: true,
                    label: `${assetNames.windows} no está publicado en ${releaseName}`
                });
                windowsStatusLabels.forEach((label) => {
                    label.textContent = "No disponible aún";
                });
            }
        } catch (error) {
            versionLabels.forEach((label) => {
                label.textContent = "Último release en GitHub";
            });
            windowsStatusLabels.forEach((label) => {
                label.textContent = "Ver release";
            });
            setDownloadState("android", releaseFallbackUrl, {
                label: "Abrir último release de Qbolá en GitHub"
            });
            setDownloadState("windows", releaseFallbackUrl, {
                label: "Abrir último release de Qbolá en GitHub"
            });
            console.warn(error);
        }
    };

    updateReleaseLinks();

    const revealTargets = document.querySelectorAll(".feature-grid article, .desktop-card, .desktop-copy, .download, .download-proof");

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

});
