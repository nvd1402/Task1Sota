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
document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);

    const title = document.querySelector(".js-gsap-title");
    const lines = title.querySelectorAll(".line");

    let chars = [];

    // Tách từng dòng thành ký tự
    lines.forEach(line => {
        const text = line.textContent;
        line.innerHTML = ""; // clear

        text.split("").forEach(ch => {
            const span = document.createElement("span");
            span.classList.add("char");
            span.textContent = ch;
            line.appendChild(span);
            chars.push(span);
        });
    });

    // Tổng số ký tự của cả 2 dòng
    const total = chars.length;

    // ScrollTrigger chạy cho toàn bộ heading
    ScrollTrigger.create({
        trigger: title,
        start: "top 75%",
        end: "top 20%",
        scrub: true,
        onUpdate(self) {
            const progress = self.progress;
            const activeCount = Math.floor(progress * total);

            chars.forEach((ch, i) => {
                if (i < activeCount) ch.classList.add("is-active");
                else ch.classList.remove("is-active");
            });
        }
    });
});
