// refactored-main.js
document.addEventListener('DOMContentLoaded', () => {
    // ---------- Helpers ----------
    const safeQuery = (sel, ctx = document) => ctx.querySelector(sel);
    const safeQueryAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ---------- CTA button hover text ----------
    (function setupCta() {
        const ctaBtn = safeQuery('#ctaBtn');
        const btnText = ctaBtn ? ctaBtn.querySelector('.btn-text') : null;
        if (!ctaBtn || !btnText) return;

        const defaultText = btnText.getAttribute('data-default') || 'Enrol Today';
        const hoverText = btnText.getAttribute('data-hover') || 'Apply Now';

        ctaBtn.addEventListener('mouseenter', () => btnText.textContent = hoverText);
        ctaBtn.addEventListener('mouseleave', () => btnText.textContent = defaultText);
    })();

    // ---------- Parallax for hero shape ----------
    (function setupParallax() {
        const heroShape = safeQuery('.hero-shape');
        if (!heroShape) return;
        const parallaxSpeed = 0.1;
        const maxScrollUp = 20;
        window.addEventListener('scroll', () => {
            const limitedScroll = Math.min(window.scrollY * parallaxSpeed, maxScrollUp);
            heroShape.style.transform = `translateY(${-limitedScroll}px)`;
        }, { passive: true });
    })();

    // ---------- GSAP + SplitType title animation helper ----------
    if (window.gsap && window.ScrollTrigger && window.SplitType) {
        gsap.registerPlugin(ScrollTrigger);
    }

    const createTitleSplitScroll = (selector, triggerSelector = selector, options = {}) => {
        const el = safeQuery(selector);
        if (!el || !window.SplitType || !window.ScrollTrigger) return;

        const split = new SplitType(el, { types: 'words, chars', tagName: 'span' });
        const chars = split.chars || [];
        const total = chars.length;

        const setCharFill = (ch, fillRatio) => {
            const clamped = Math.max(0, Math.min(1, fillRatio));
            if (clamped === 0) {
                ch.style.backgroundImage = '';
                ch.style.color = '#e0e0e0';
                ch.style.webkitBackgroundClip = '';
                ch.style.backgroundClip = '';
                ch.classList.remove('is-active');
                return;
            }
            if (clamped === 1) {
                ch.style.backgroundImage = '';
                ch.style.color = '#111111';
                ch.style.webkitBackgroundClip = '';
                ch.style.backgroundClip = '';
                ch.classList.add('is-active');
                return;
            }
            // Gradient để đạt hiệu ứng nửa ký tự như mẫu
            const pct = (clamped * 100).toFixed(2);
            ch.style.backgroundImage = `linear-gradient(to right, #111111 0%, #111111 ${pct}%, #e0e0e0 ${pct}%, #e0e0e0 100%)`;
            ch.style.webkitBackgroundClip = 'text';
            ch.style.backgroundClip = 'text';
            ch.style.color = 'transparent';
            ch.classList.remove('is-active');
        };

        // reset về xám
        chars.forEach(ch => setCharFill(ch, 0));

        ScrollTrigger.create(Object.assign({
            trigger: triggerSelector,
            start: 'top 80%',
            end: 'bottom top', // kéo dài khoảng cuộn để dễ hoàn thành
            scrub: true,
            onUpdate(self) {
                // Tô theo tỉ lệ nhỏ của từng ký tự (có thể dừng ở nửa ký tự)
                const progress = self.progress * total;
                chars.forEach((ch, i) => {
                    const local = Math.min(1, Math.max(0, progress - i)); // 0->1 cho từng ký tự
                    setCharFill(ch, local);
                });
            },
            onLeave() {
                // Khi cuộn qua hẳn, tất cả ký tự đậm
                chars.forEach(ch => setCharFill(ch, 1));
            },
            onLeaveBack() {
                // Khi cuộn ngược, trả về xám
                chars.forEach(ch => setCharFill(ch, 0));
            }
        }, options));
    };

    // Create for multiple headings
    createTitleSplitScroll('.who-title', '.who-we-are');
    createTitleSplitScroll('.js-cr-title', '.classroom');
    createTitleSplitScroll('.js-events-title', '.events');
    createTitleSplitScroll('.js-news-title', '.news');

    // ---------- "Cuon chu shool academy" (multi-line) ----------
    (function setupJsGsapTitle() {
        const title = safeQuery('.js-gsap-title');
        if (!title || !window.ScrollTrigger || !window.gsap) return;

        const lineNodes = title.querySelectorAll('.line');
        const linesChars = [];

        lineNodes.forEach(line => {
            const text = line.textContent || '';
            line.innerHTML = '';
            const chars = [];
            text.split('').forEach(ch => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = ch;
                line.appendChild(span);
                chars.push(span);
            });
            linesChars.push(chars);
        });

        ScrollTrigger.create({
            trigger: title,
            start: 'top 75%',
            end: 'top 20%',
            scrub: true,
            onUpdate(self) {
                const progress = self.progress;
                linesChars.forEach(chars => {
                    const total = chars.length;
                    const activeCount = Math.floor(progress * total);
                    chars.forEach((ch, i) => ch.classList.toggle('is-active', i < activeCount));
                });
            }
        });
    })();

    // ---------- Flip từng chữ "A new learning experience..." ----------
    (function setupExTitleFlip() {
        const title = safeQuery('.ex-title');
        if (!title || !window.ScrollTrigger || !window.gsap) return;

        // Nếu builder đã có span.word thì dùng luôn; nếu không thì tự bọc thành word
        let words = Array.from(title.querySelectorAll('.word'));
        if (!words.length) {
            const originalHTML = title.innerHTML;
            const lines = originalHTML.split('<br');
            title.innerHTML = '';
            lines.forEach((lineHTML, lineIndex) => {
                const lineText = lineHTML.replace(/<[^>]*>/g, '');
                const lineContainer = document.createElement('span');
                lineContainer.className = 'ex-line';
                lineText.split(/(\s+)/).forEach(token => {
                    if (!token) return;
                    if (/^\s+$/.test(token)) {
                        lineContainer.appendChild(document.createTextNode(token));
                        return;
                    }
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'ex-word';
                    wordSpan.textContent = token;
                    lineContainer.appendChild(wordSpan);
                    words.push(wordSpan);
                });
                title.appendChild(lineContainer);
                if (lineIndex === 0) {
                    const br = document.createElement('br');
                    title.appendChild(br);
                }
            });
        } else {
            // chuẩn hóa class để CSS dùng chung
            words.forEach(w => w.classList.add('ex-word'));
        }

        // trạng thái ban đầu: úp xuống, mờ (theo cụm từ, không chéo)
        words.forEach(w => {
            // từ trên cao, úp xuống (không nghiêng Z, không chiều sâu)
            w.style.transform = 'translateY(-50px) rotateX(-90deg)';
            w.style.opacity = '0';
            w.style.display = 'inline-block';
        });

        // Từ nghiêng (Z) + úp (X) -> lật xuống + hạ vị trí theo cuộn
        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
            onUpdate(self) {
                const total = words.length;
                const progress = self.progress * total;
                words.forEach((w, i) => {
                    const local = Math.min(1, Math.max(0, progress - i * 0.3));
                    const opacity = Math.max(0, Math.min(1, local * 1.2));
                    const ty = -50 + (50 * local);      // từ -50px xuống 0
                    const rx = -90 + (90 * local);      // từ úp -90 về 0
                    w.style.transform = `translateY(${ty}px) rotateX(${rx}deg)`;
                    w.style.opacity = opacity.toString();
                    w.classList.toggle('is-active', local >= 1);
                });
            },
            onLeave() {
                words.forEach(w => {
                    w.style.transform = 'translateY(0px) rotateX(0deg)';
                    w.style.opacity = '1';
                    w.classList.add('is-active');
                });
            },
            onLeaveBack() {
                words.forEach(w => {
                    w.style.transform = 'translateY(-50px) rotateX(-90deg)';
                    w.style.opacity = '0';
                    w.classList.remove('is-active');
                });
            }
        });
    })();
    // ---------- Event cards overlap effect (with guards) ----------
    (function setupEventCards() {
        const cards = safeQueryAll('.event-card');
        const container = safeQuery('.events-cards-container');
        if (!cards.length || !container) return;

        const stickyTop = 80;
        window.addEventListener('scroll', () => {
            const containerRect = container.getBoundingClientRect();

            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const cardHeight = rect.height;
                const cardTop = rect.top;

                // defaults
                let blurAmount = 0, opacity = 1, scale = 1;

                const nextCard = cards[index + 1];
                if (nextCard) {
                    const nextTop = nextCard.getBoundingClientRect().top;
                    const halfCardPos = cardTop + (cardHeight / 2);
                    if (nextTop <= halfCardPos) {
                        const overlapDistance = Math.min(cardHeight / 2, Math.max(0, halfCardPos - nextTop));
                        const progress = overlapDistance / (cardHeight / 2);
                        blurAmount = progress * 5;
                        opacity = 1 - (progress * 0.1);
                        scale = 1 - (progress * 0.08);
                    }
                } else {
                    if (cardTop <= stickyTop) {
                        const containerBottom = containerRect.bottom;
                        const remainingDistance = containerBottom - (stickyTop + cardHeight);
                        const progress = 1 - Math.max(0, Math.min(1, remainingDistance / 300));
                        blurAmount = progress * 5;
                        scale = 1 - (progress * 0.1);
                    }
                }

                card.style.filter = `blur(${blurAmount}px)`;
                card.style.opacity = opacity.toString();
                card.style.transform = `scale(${scale})`;
            });
        }, { passive: true });
    })();

    // ---------- Courses numbers animation (fix suffix k/m) ----------
    function parseDisplay(text) {
        const raw = (text || '').trim();
        if (!raw) return null;
        const hasPlus = raw.endsWith('+');
        const core = hasPlus ? raw.slice(0, -1).trim() : raw;
        const m = core.match(/^(\d+(?:\.\d+)?)([kmKM])?$/);
        if (!m) return null;

        const numStr = m[1];
        const num = parseFloat(numStr);
        const suffix = (m[2] || '').toLowerCase();
        const multiplier = suffix === 'k' ? 1000 : (suffix === 'm' ? 1000000 : 1);
        const decimals = (numStr.split('.')[1] || '').length;

        return {
            num: num * multiplier,   // numeric target (already multiplied)
            displaySuffix: suffix,   // keep original suffix for display if needed
            hasPlus,
            decimals
        };
    }

    function formatDisplay(value, meta) {
        if (!meta) return String(value);
        const displayValue = meta.decimals > 0 ? (value / (meta.displaySuffix === 'k' ? 1000 : meta.displaySuffix === 'm' ? 1000000 : 1)).toFixed(meta.decimals) : String(Math.round(value / (meta.displaySuffix === 'k' ? 1000 : meta.displaySuffix === 'm' ? 1000000 : 1)));
        const suffix = meta.displaySuffix || '';
        return displayValue + suffix + (meta.hasPlus ? '+' : '');
    }

    function animateTo(el, meta, duration = 1200) {
        const start = 0;
        const end = meta.num;
        const startTime = performance.now();
        const easeOutCubic = x => 1 - Math.pow(1 - x, 3);

        function tick(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = easeOutCubic(t);
            const current = start + (end - start) * eased;
            el.textContent = formatDisplay(current, meta);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = formatDisplay(end, meta);
        }
        requestAnimationFrame(tick);
    }

    (function setupCoursesCounter() {
        const els = safeQueryAll('.courses .courses__value');
        if (!els.length) return;
        els.forEach(el => {
            if (!el.dataset.finalText) el.dataset.finalText = el.textContent.trim();
            const meta = parseDisplay(el.dataset.finalText);
            if (meta) el.textContent = formatDisplay(0, meta);
        });

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                if (el.dataset.counted === '1') return;
                el.dataset.counted = '1';
                const meta = parseDisplay(el.dataset.finalText || el.textContent);
                if (!meta) return;
                animateTo(el, meta, 1300);
            });
        }, { threshold: 0.35 });

        els.forEach(el => io.observe(el));
    })();

// ---------- Classroom animated-title (multi-line with GSAP) ----------
    (function setupAnimatedTitle() {
        const title = safeQuery('#animated-title');
        if (!title || !window.gsap || !window.ScrollTrigger) return;

        const lines = Array.from(title.querySelectorAll('.cf-title-line'));

        // Tạo span từng ký tự
        lines.forEach(line => {
            const text = line.getAttribute('data-text') || '';
            line.innerHTML = '';

            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = 'char';

                if (char === ' ') {
                    span.classList.add('space');
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }

                line.appendChild(span);
            });
        });

        // Trạng thái ban đầu
        lines.forEach(line => {
            const chars = Array.from(line.querySelectorAll('.char'));

            // ⭐ Giữ chữ nhỏ đứng yên – không nhảy khi scale
            gsap.set(chars, {
                scale: 0.7,
                color: '#d0d0d0',
                x: 0,
                force3D: true,
                transformOrigin: "50% 50%",
                display: "inline-block" // ⭐ cực quan trọng
            });

            // Width ban đầu của space
            const spaces = line.querySelectorAll('.char.space');
            gsap.set(spaces, { width: '1.2em' });
        });

        // ScrollTrigger
        ScrollTrigger.create({
            trigger: title,
            start: 'top 75%',
            end: 'bottom 35%',
            scrub: 3,

            onUpdate(self) {
                const progress = self.progress;

                lines.forEach(line => {
                    const chars = Array.from(line.querySelectorAll('.char'));
                    const totalChars = chars.length;

                    chars.forEach((char, idx) => {
                        const charProgress = idx / totalChars;

                        // Animate IN — phóng to như bong bóng
                        if (progress >= charProgress && !char.classList.contains('animated')) {
                            char.classList.add('animated');

                            gsap.to(char, {
                                scale: 1,
                                color: '#2a2a2a',
                                duration: 0.4,
                                ease: 'power1.out',
                                force3D: true
                            });

                            // Space thu nhỏ (1.2em → 0.3em)
                            if (char.classList.contains('space')) {
                                gsap.to(char, {
                                    width: '0.3em',
                                    duration: 0.35,
                                    ease: 'power1.out'
                                });
                            }
                        }

                        // Animate OUT — thu nhỏ lại nhưng GIỮ NGUYÊN VỊ TRÍ
                        else if (progress < charProgress && char.classList.contains('animated')) {
                            char.classList.remove('animated');

                            gsap.to(char, {
                                scale: 0.7,
                                color: '#d0d0d0',
                                duration: 0.4,
                                ease: 'power1.in',
                                force3D: true
                            });

                            // Space trở lại width cũ (0.3em → 1.2em)
                            if (char.classList.contains('space')) {
                                gsap.to(char, {
                                    width: '1.2em',
                                    duration: 0.35,
                                    ease: 'power1.in'
                                });
                            }
                        }
                    });
                });
            }
        });

    })();



    // ---------- Grid drag to scroll (mouse + touch) ----------
    (function setupGridDrag() {
        const grid = safeQuery('.cr-grid');
        const btnPrev = safeQuery('.cr-nav-prev');
        const btnNext = safeQuery('.cr-nav-next');
        if (!grid) return;

        let isDown = false, startX = 0, scrollLeft = 0;
        const multiplier = 1.3;

        const startDrag = (x) => {
            isDown = true;
            startX = x - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            grid.classList.add('dragging');
        };
        const endDrag = () => { isDown = false; grid.classList.remove('dragging'); };
        const moveDrag = (x, prevent = true) => {
            if (!isDown) return;
            if (prevent) event && event.preventDefault && event.preventDefault();
            const xPos = x - grid.offsetLeft;
            const walk = (xPos - startX) * multiplier;
            grid.scrollLeft = scrollLeft - walk;
        };

        // mouse
        grid.addEventListener('mousedown', e => startDrag(e.pageX));
        window.addEventListener('mouseup', endDrag);
        grid.addEventListener('mousemove', e => moveDrag(e.pageX));

        // touch
        grid.addEventListener('touchstart', e => startDrag(e.touches[0].pageX), { passive: true });
        grid.addEventListener('touchend', endDrag);
        grid.addEventListener('touchmove', e => moveDrag(e.touches[0].pageX, false), { passive: false });

        if (btnNext) btnNext.addEventListener('click', () => grid.scrollBy({ left: 330, behavior: 'smooth' }));
        if (btnPrev) btnPrev.addEventListener('click', () => grid.scrollBy({ left: -330, behavior: 'smooth' }));
    })();

/// ---------- Classroom Carousel (Swiper) ----------
    (function setupClassroomCarousel() {
        const wrapper  = safeQuery('.cr-cards-wrapper');
        const swiperEl = safeQuery('.cr-swiper');

        if (!wrapper || !swiperEl || !window.Swiper) return;

        const swiper = new Swiper(swiperEl, {
            slidesPerView: 4,
            spaceBetween: 28,
            grabCursor: true,
            speed: 500,
            pagination: {
                el: '.cr-pagination',
                clickable: true
            },
            breakpoints: {
                1200: { slidesPerView: 4 },
                992:  { slidesPerView: 3 },
                768:  { slidesPerView: 2 },
                0:    { slidesPerView: 1 }
            }
        });

        // ---------- Drag Control (Up & Down quyết định trái / phải) ----------
        let isDown = false;
        let startX = 0;
        let startY = 0;
        let deltaX = 0;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.clientX;
            startY = e.clientY;
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;

            const moveX = e.clientX - startX;
            const moveY = e.clientY - startY;

            deltaX = moveX * 0.4; // ghì nhẹ cũng thấy card đi

            swiper.setTranslate(swiper.getTranslate() + deltaX);
        });

        function releaseDrag(e) {
            if (!isDown) return;
            isDown = false;

            const endY = e.clientY - startY;

            // Vuốt lên -> sang phải | Vuốt xuống -> sang trái
            if (Math.abs(endY) > 40) {
                if (endY < 0) {
                    swiper.slideNext();
                } else {
                    swiper.slidePrev();
                }
            } else {
                swiper.slideTo(swiper.activeIndex); // trả lại vị trí
            }
        }

        wrapper.addEventListener('mouseup', releaseDrag);
        wrapper.addEventListener('mouseleave', releaseDrag);

    })();




// ---------- Classroom Floating Icon Follow Mouse + Drag Direction ----------
    (function setupClassroomFloatIcon() {
        const wrapper   = safeQuery('.cr-cards-wrapper');
        const floatIcon = safeQuery('.cr-float-icon');

        if (!wrapper || !floatIcon) return;

        let mouseX = 0;
        let mouseY = 0;
        let rafId  = null;

        let startY = 0;
        let isHold = false;

        wrapper.addEventListener('mousemove', function (e) {
            const rect = wrapper.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            if (!rafId) rafId = requestAnimationFrame(updatePosition);
        });

        function updatePosition() {
            floatIcon.style.left = mouseX + 'px';
            floatIcon.style.top  = mouseY + 'px';
            rafId = null;
        }

        wrapper.addEventListener('mousedown', function (e) {
            startY = e.clientY;
            isHold = true;
            floatIcon.classList.add('is-hold');
        });

        document.addEventListener('mouseup', function (e) {
            if (!isHold) return;

            const deltaY = e.clientY - startY;

            floatIcon.classList.remove('is-hold');

            if (deltaY < -20) {
                floatIcon.classList.add('to-right');
            }
            else if (deltaY > 20) {
                floatIcon.classList.add('to-left');
            }

            setTimeout(() => {
                floatIcon.classList.remove('to-left', 'to-right');
            }, 300);

            isHold = false;
        });

    })();


});
