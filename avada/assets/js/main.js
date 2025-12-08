document.addEventListener('DOMContentLoaded', function() {
    // ==================== BUTTON HOVER TEXT CHANGE ====================
    const ctaBtn = document.getElementById('ctaBtn');
    const btnText = ctaBtn ? ctaBtn.querySelector('.btn-text') : null;

    if (ctaBtn && btnText) {
        const defaultText = btnText.getAttribute('data-default') || 'Enrol Today';
        const hoverText = btnText.getAttribute('data-hover') || 'Apply Now';

        ctaBtn.addEventListener('mouseenter', function() {
            btnText.textContent = hoverText;
        });

        ctaBtn.addEventListener('mouseleave', function() {
            btnText.textContent = defaultText;
        });
    }

    // ==================== PARALLAX SCROLLING FOR SHAPE ====================
    const heroShape = document.querySelector('.hero-shape');

    // Khởi tạo các giá trị Parallax
    const parallaxSpeed = 0.1;     // Tốc độ di chuyển (10% tốc độ cuộn)
    const maxScrollUp = 20;        // Giới hạn dịch chuyển lên tối đa 20px

    window.addEventListener('scroll', function() {
        if (!heroShape) return; // Đảm bảo phần tử tồn tại

        const scrollPosition = window.scrollY; // Lấy vị trí cuộn

        // 1. Tính toán dịch chuyển
        const parallaxScroll = scrollPosition * parallaxSpeed;

        // 2. Áp dụng giới hạn: Đảm bảo dịch chuyển không quá 20px
        const limitedScroll = Math.min(parallaxScroll, maxScrollUp);

        // 3. Tính toán translateY cuối cùng
        const finalTranslateY = -limitedScroll;

        // 4. Áp dụng biến đổi
        heroShape.style.transform = `translateY(${finalTranslateY}px)`;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Cắt heading thành từng chữ
    const split = new SplitType('.who-title', {
        types: 'words, chars',
        tagName: 'span'
    });

    const chars = split.chars;  // mảng tất cả ký tự
    const total = chars.length;

    // Đảm bảo tất cả bắt đầu ở trạng thái xám
    chars.forEach(ch => ch.classList.remove('is-active'));

    // 2. ScrollTrigger bám theo cuộn
    ScrollTrigger.create({
        trigger: '.who-we-are',   // section chứa heading
        start: 'top 75%',         // khi top section nằm ở 75% viewport
        end: 'top 20%',           // khi top section lên 20% viewport
        scrub: true,              // bám theo vị trí scroll

        onUpdate(self) {
            const progress = self.progress;          // 0 -> 1
            const activeCount = Math.round(progress * total);

            chars.forEach((ch, i) => {
                if (i < activeCount) {
                    ch.classList.add('is-active');
                } else {
                    ch.classList.remove('is-active');
                }
            });
        }
    });
});
// Cuon chu shool academy
document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);

    const title = document.querySelector(".js-gsap-title");
    if (!title) return;

    const lineNodes = title.querySelectorAll(".line");

    // Mỗi phần tử = mảng ký tự của một dòng
    const linesChars = [];

    // Tách từng dòng thành <span class="char">
    lineNodes.forEach(line => {
        const text = line.textContent;
        line.innerHTML = ""; // clear

        const chars = [];
        text.split("").forEach(ch => {
            const span = document.createElement("span");
            span.classList.add("char");
            span.textContent = ch;
            line.appendChild(span);
            chars.push(span);
        });

        linesChars.push(chars);
    });

    ScrollTrigger.create({
        trigger: title,
        start: "top 75%",
        end:   "top 20%",
        scrub: true,
        onUpdate(self) {
            const progress = self.progress;  // 0 → 1

            // Với MỖI DÒNG: activeCount = progress * số ký tự của DÒNG ĐÓ
            linesChars.forEach(chars => {
                const total = chars.length;
                const activeCount = Math.floor(progress * total);

                chars.forEach((ch, i) => {
                    if (i < activeCount) ch.classList.add("is-active");
                    else ch.classList.remove("is-active");
                });
            });
        }
    });
});
// Hiệu ứng blur và thu nhỏ khi card bị đè lên
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.event-card');
    const stickyTop = 80; // Giống với CSS top value
    const container = document.querySelector('.events-cards-container');
    const containerRect = container.getBoundingClientRect();

    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardHeight = rect.height;
        const cardTop = rect.top;

        // Reset hiệu ứng mặc định
        let blurAmount = 0;
        let opacity = 1;
        let scale = 1;

        // Kiểm tra card tiếp theo
        const nextCard = cards[index + 1];
        if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            const nextCardTop = nextRect.top;

            // Tính toán vị trí nửa card
            const halfCardPosition = cardTop + (cardHeight / 2);

            // Nếu card tiếp theo đã đè qua nửa card hiện tại
            if (nextCardTop <= halfCardPosition) {
                // Tính khoảng cách từ vị trí hiện tại đến khi đè hoàn toàn
                const overlapDistance = halfCardPosition - nextCardTop;
                const maxOverlap = cardHeight / 2; // Khoảng cách tối đa để đè hoàn toàn
                const progress = Math.min(1, overlapDistance / maxOverlap);

                // Áp dụng hiệu ứng dựa trên progress (0 → 1)
                blurAmount = progress * 5; // 0 → 12px
                opacity = 1 - (progress * 0.1); // 1.0 → 0.5
                scale = 1 - (progress * 0.1); // 1.0 → 0.92
            }
        } else {
            // Card cuối cùng - làm mờ khi cuộn xuống cuối container
            if (cardTop <= stickyTop) {
                // Tính khoảng cách còn lại của container
                const containerBottom = containerRect.bottom;
                const remainingDistance = containerBottom - (stickyTop + cardHeight);

                // Nếu đang cuộn gần đến cuối container
                if (remainingDistance < 300) {
                    const progress = Math.max(0, 1 - (remainingDistance / 300));

                    blurAmount = progress * 5;
                    scale = 1 - (progress * 0.1);
                }
            }
        }

        // Áp dụng hiệu ứng
        card.style.filter = `blur(${blurAmount}px)`;
        card.style.opacity = opacity;
        card.style.transform = `scale(${scale})`;
    });
});
// Khóa học
function parseDisplay(text) {
    const raw = (text || "").trim().toLowerCase();
    const hasPlus = raw.endsWith("+");
    const t = hasPlus ? raw.slice(0, -1).trim() : raw;

    // number + optional suffix (k/m)
    const m = t.match(/^(\d+(?:\.\d+)?)([km])?$/i);
    if (!m) return null;

    const numStr = m[1];
    const num = parseFloat(numStr);
    const suffix = (m[2] || "").toLowerCase();
    const decimals = (numStr.split(".")[1] || "").length; // giữ số chữ số thập phân như ban đầu

    return { num, suffix, hasPlus, decimals };
}

function formatDisplay(value, meta) {
    const n = meta.decimals > 0 ? value.toFixed(meta.decimals) : Math.round(value).toString();
    return n + (meta.suffix || "") + (meta.hasPlus ? "+" : "");
}

function animateTo(el, meta, duration = 1200) {
    const start = 0;
    const end = meta.num;

    const startTime = performance.now();
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeOutCubic(t);

        const current = start + (end - start) * eased;
        el.textContent = formatDisplay(current, meta);

        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = formatDisplay(end, meta); // đảm bảo “tới đúng”
    }

    requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
    const els = document.querySelectorAll(".courses .courses__value");
    if (!els.length) return;

    // lưu text gốc và set về 0 trước khi chạy
    els.forEach(el => {
        if (!el.dataset.finalText) el.dataset.finalText = el.textContent.trim();
        const meta = parseDisplay(el.dataset.finalText);
        if (meta) el.textContent = formatDisplay(0, meta);
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            if (el.dataset.counted === "1") return;
            el.dataset.counted = "1";

            const meta = parseDisplay(el.dataset.finalText || el.textContent);
            if (!meta) return;

            animateTo(el, meta, 1300);
        });
    }, { threshold: 0.35 });

    els.forEach(el => io.observe(el));
});

// ==================== CLASSROOM TITLE ANIMATION ====================
document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    const crTitle = document.querySelector('.js-cr-title');
    if (!crTitle) return;

    // 1. Cắt heading thành từng chữ
    const split = new SplitType(crTitle, {
        types: 'words, chars',
        tagName: 'span'
    });

    const chars = split.chars;  // mảng tất cả ký tự
    const total = chars.length;

    // Đảm bảo tất cả bắt đầu ở trạng thái xám
    chars.forEach(ch => ch.classList.remove('is-active'));

    // 2. ScrollTrigger bám theo cuộn - giống hệt who-title
    ScrollTrigger.create({
        trigger: '.classroom',   // section chứa heading
        start: 'top 75%',         // khi top section nằm ở 75% viewport
        end: 'top 20%',           // khi top section lên 20% viewport
        scrub: true,              // bám theo vị trí scroll

        onUpdate(self) {
            const progress = self.progress;          // 0 -> 1
            const activeCount = Math.round(progress * total);

            chars.forEach((ch, i) => {
                if (i < activeCount) {
                    ch.classList.add('is-active');
                } else {
                    ch.classList.remove('is-active');
                }
            });
        }
    });
});

// ==================== EVENTS TITLE ANIMATION ====================
document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    const eventsTitle = document.querySelector('.js-events-title');
    if (!eventsTitle) return;

    // 1. Cắt heading thành từng chữ
    const split = new SplitType(eventsTitle, {
        types: 'words, chars',
        tagName: 'span'
    });

    const chars = split.chars;  // mảng tất cả ký tự
    const total = chars.length;

    // Đảm bảo tất cả bắt đầu ở trạng thái xám
    chars.forEach(ch => ch.classList.remove('is-active'));

    // 2. ScrollTrigger bám theo cuộn - giống hệt who-title
    ScrollTrigger.create({
        trigger: '.events',   // section chứa heading
        start: 'top 75%',         // khi top section nằm ở 75% viewport
        end: 'top 20%',           // khi top section lên 20% viewport
        scrub: true,              // bám theo vị trí scroll

        onUpdate(self) {
            const progress = self.progress;          // 0 -> 1
            const activeCount = Math.round(progress * total);

            chars.forEach((ch, i) => {
                if (i < activeCount) {
                    ch.classList.add('is-active');
                } else {
                    ch.classList.remove('is-active');
                }
            });
        }
    });
});

const grid = document.querySelector(".cr-grid");
const btnPrev = document.querySelector(".cr-nav-prev");
const btnNext = document.querySelector(".cr-nav-next");
const dots = document.querySelectorAll(".cr-dots span");
const floatIcon = document.querySelector(".cr-float-nav");

/* -------------------------------
   DRAG TO SCROLL
--------------------------------*/
let isDown = false;
let startX;
let scrollLeft;

grid.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.pageX - grid.offsetLeft;
    scrollLeft = grid.scrollLeft;
    grid.classList.add("dragging");
});

grid.addEventListener("mouseleave", () => {
    isDown = false;
    grid.classList.remove("dragging");
});

grid.addEventListener("mouseup", () => {
    isDown = false;
    grid.classList.remove("dragging");
});

grid.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - grid.offsetLeft;
    const walk = (x - startX) * 1.3;
    grid.scrollLeft = scrollLeft - walk;
});

/* -------------------------------
   BUTTON NAVIGATION
--------------------------------*/
btnNext.addEventListener("click", () => {
    grid.scrollBy({ left: 330, behavior: "smooth" });
});
btnPrev.addEventListener("click", () => {
    grid.scrollBy({ left: -330, behavior: "smooth" });
});



// ==================== NEWS TITLE ANIMATION ====================
document.addEventListener('DOMContentLoaded', function () {
    gsap.registerPlugin(ScrollTrigger);

    const newsTitle = document.querySelector('.js-news-title');
    if (!newsTitle) return;

    // 1. Cắt heading thành từng chữ
    const split = new SplitType(newsTitle, {
        types: 'words, chars',
        tagName: 'span'
    });

    const chars = split.chars;  // mảng tất cả ký tự
    const total = chars.length;

    // Đảm bảo tất cả bắt đầu ở trạng thái xám
    chars.forEach(ch => ch.classList.remove('is-active'));

    // 2. ScrollTrigger bám theo cuộn - giống hệt who-title
    ScrollTrigger.create({
        trigger: '.news',   // section chứa heading
        start: 'top 75%',         // khi top section nằm ở 75% viewport
        end: 'top 20%',           // khi top section lên 20% viewport
        scrub: true,              // bám theo vị trí scroll

        onUpdate(self) {
            const progress = self.progress;          // 0 -> 1
            const activeCount = Math.round(progress * total);

            chars.forEach((ch, i) => {
                if (i < activeCount) {
                    ch.classList.add('is-active');
                } else {
                    ch.classList.remove('is-active');
                }
            });
        }
    });
});

// ClassRoom

