document.addEventListener("DOMContentLoaded", () => {
    const revealSections = document.querySelectorAll(".reveal-section");
    if (!revealSections.length) {
        return;
    }

    const revealOnScroll = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    revealSections.forEach((section) => revealOnScroll.observe(section));
});
