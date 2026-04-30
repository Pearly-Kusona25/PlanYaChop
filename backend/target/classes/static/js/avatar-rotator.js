document.addEventListener("DOMContentLoaded", () => {
    const portraits = document.querySelectorAll(".dynamic-portrait");
    if (!portraits.length) {
        return;
    }

    const key = "portrait-visit-counter";
    const current = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(current));

    portraits.forEach((portrait) => {
        const imgA = portrait.dataset.imgA;
        const imgB = portrait.dataset.imgB;
        if (!imgA || !imgB) {
            return;
        }

        portrait.src = current % 2 === 0 ? imgA : imgB;
    });
});
