const ctaBtn = document.getElementById("ctaBtn");
const ctaText = ctaBtn.querySelector(".btn-text");

// Khi hover -> đổi Enrol Today thành Apply Now
ctaBtn.addEventListener("mouseenter", () => {
    ctaText.textContent = "Apply Now";
});

// Khi rời chuột -> trả về Enrol Today
ctaBtn.addEventListener("mouseleave", () => {
    ctaText.textContent = "Enrol Today";
});
// hero
const shape = document.querySelector('.hero-shape');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Di chuyển shape lên nhẹ khi cuộn
    const offset = Math.min(scrollY * 0.15, 40); // tối đa 40px

    shape.style.transform = `translateY(-${offset}px)`;
});
