document.addEventListener('DOMContentLoaded', () => {
    const safeQuery = (sel, ctx = document) => ctx.querySelector(sel);
    const safeQueryAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // CTA button hover text
    (function setupCta() {
        const ctaBtn = safeQuery('#ctaBtn');
        const btnText = ctaBtn ? ctaBtn.querySelector('.btn-text') : null;
        if (!ctaBtn || !btnText) return;

        const defaultText = btnText.getAttribute('data-default') || 'Enrol Today';
        const hoverText = btnText.getAttribute('data-hover') || 'Apply Now';

        ctaBtn.addEventListener('mouseenter', () => btnText.textContent = hoverText);
        ctaBtn.addEventListener('mouseleave', () => btnText.textContent = defaultText);
    })();

    // Parallax for hero shape
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

    // GSAP + SplitType title animation helper
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
            const pct = (clamped * 100).toFixed(2);
            ch.style.backgroundImage = `linear-gradient(to right, #111111 0%, #111111 ${pct}%, #e0e0e0 ${pct}%, #e0e0e0 100%)`;
            ch.style.webkitBackgroundClip = 'text';
            ch.style.backgroundClip = 'text';
            ch.style.color = 'transparent';
            ch.classList.remove('is-active');
        };

        chars.forEach(ch => setCharFill(ch, 0));

        ScrollTrigger.create(Object.assign({
            trigger: triggerSelector,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
            onUpdate(self) {
                const progress = self.progress * total;
                chars.forEach((ch, i) => {
                    const local = Math.min(1, Math.max(0, progress - i));
                    setCharFill(ch, local);
                });
            },
            onLeave() {
                chars.forEach(ch => setCharFill(ch, 1));
            },
            onLeaveBack() {
                chars.forEach(ch => setCharFill(ch, 0));
            }
        }, options));
    };

    createTitleSplitScroll('.who-title', '.who-we-are');
    createTitleSplitScroll('.js-cr-title', '.classroom');
    createTitleSplitScroll('.js-events-title', '.events');
    createTitleSplitScroll('.js-news-title', '.news');

    // School Academics scroll animation
    (function setupJsGsapTitle() {
        const title = safeQuery('.js-gsap-title');
        if (!title || !window.ScrollTrigger || !window.gsap) return;

        const lineNodes = title.querySelectorAll('.line');
        const lines = Array.from(lineNodes);

        lines.forEach(line => {
            const text = line.textContent || '';
            line.innerHTML = '';

            text.split('').forEach(char => {
                const wrapper = document.createElement('span');
                wrapper.className = 'char-wrapper';
                wrapper.style.display = 'inline-block';
                wrapper.style.position = 'relative';
                
                const span = document.createElement('span');
                span.className = 'char';

                if (char === ' ') {
                    span.classList.add('space');
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }

                wrapper.appendChild(span);
                line.appendChild(wrapper);
            });
        });

        const alignmentOffset = -40;
        
        lines.forEach((line, lineIndex) => {
            const wrappers = Array.from(line.querySelectorAll('.char-wrapper'));
            const chars = Array.from(line.querySelectorAll('.char'));

            wrappers.forEach((wrapper, idx) => {
                const char = chars[idx];
                requestAnimationFrame(() => {
                    const rect = wrapper.getBoundingClientRect();
                    wrapper.dataset.initialWidth = rect.width.toString();
                });
                
                gsap.set(wrapper, {
                    marginRight: '-0.1em',
                    verticalAlign: 'top'
                });
            });

            gsap.set(chars, {
                scale: 0.8,
                color: 'rgba(255, 255, 255, 0.4)',
                x: 0,
                y: 0,
                letterSpacing: '0.1em',
                force3D: true,
                transformOrigin: "left center",
                display: "inline-block",
                position: "relative",
                zIndex: 1
            });

            if (lineIndex === 1) {
                chars.forEach(char => {
                    char.dataset.alignmentX = alignmentOffset.toString();
                });
            }

            const spaces = line.querySelectorAll('.char.space');
            gsap.set(spaces, { width: '1.2em' });
        });

        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 3,

            onUpdate(self) {
                const progress = self.progress;

                lines.forEach((line, lineIndex) => {
                    const chars = Array.from(line.querySelectorAll('.char'));
                    const totalChars = chars.length;

                    chars.forEach((char, idx) => {
                        const animationRange = 0.2;
                        
                        let charProgress;
                        if (totalChars > 1) {
                            if (idx === totalChars - 1) {
                                charProgress = 1 - animationRange;
                            } else {
                                charProgress = (idx / (totalChars - 1)) * (1 - animationRange);
                            }
                        } else {
                            charProgress = 0;
                        }
                        
                        const charStart = charProgress;
                        
                        let relativeProgress = 0;
                        if (progress >= charStart) {
                            relativeProgress = Math.min((progress - charStart) / animationRange, 1);
                        }
                        
                        const targetX = lineIndex === 1 ? parseFloat(char.dataset.alignmentX || alignmentOffset) : 0;
                        
                        const currentScale = 0.8 + (relativeProgress * (1.8 - 0.8));
                        const currentOpacity = 0.4 + (relativeProgress * (1 - 0.4));
                        const currentColor = relativeProgress > 0.5 ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
                        const currentLetterSpacing = (0.1 + relativeProgress * 0.7) + 'em';
                        const currentX = relativeProgress * targetX;
                        const currentZIndex = relativeProgress > 0.1 ? 10 : 1;
                        
                        gsap.set(char, {
                            scale: currentScale,
                            color: currentColor,
                            x: currentX,
                            y: 0,
                            letterSpacing: currentLetterSpacing,
                            opacity: currentOpacity,
                            zIndex: currentZIndex,
                            marginRight: '-0.1em'
                        });
                        
                        if (char.classList.contains('space')) {
                            const spaceWidth = 1.2 + (relativeProgress * (2 - 1.2)) + 'em';
                            gsap.set(char, {
                                width: spaceWidth
                            });
                        }
                    });
                });
            }
        });
    })();

    // Flip animation for "A new learning experience..."
    (function setupExTitleFlip() {
        const title = safeQuery('.ex-title');
        if (!title || !window.ScrollTrigger || !window.gsap) return;

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
            words.forEach(w => w.classList.add('ex-word'));
        }

        words.forEach(w => {
            w.style.transform = 'translateY(-50px) rotateX(-90deg)';
            w.style.opacity = '0';
            w.style.display = 'inline-block';
        });

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
                    const ty = -50 + (50 * local);
                    const rx = -90 + (90 * local);
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

    // Event cards overlap effect
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

    // Courses numbers animation
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
            num: num * multiplier,
            displaySuffix: suffix,
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

    // Classroom animated-title
    (function setupAnimatedTitle() {
        const title = safeQuery('#animated-title');
        if (!title || !window.gsap || !window.ScrollTrigger) return;

        const lines = Array.from(title.querySelectorAll('.cf-title-line'));

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

        lines.forEach(line => {
            const chars = Array.from(line.querySelectorAll('.char'));

            gsap.set(chars, {
                scale: 0.7,
                color: '#d0d0d0',
                x: 0,
                force3D: true,
                transformOrigin: "50% 50%",
                display: "inline-block"
            });

            const spaces = line.querySelectorAll('.char.space');
            gsap.set(spaces, { width: '1.2em' });
        });

        ScrollTrigger.create({
            trigger: title,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 0.8,
            anticipatePin: 1,

            onUpdate(self) {
                const progress = self.progress;

                lines.forEach((line, lineIndex) => {
                    const chars = Array.from(line.querySelectorAll('.char'));
                    const totalChars = chars.length;

                    chars.forEach((char, idx) => {
                        // Tính toán progress với overlap cao hơn để mượt hơn
                        const charStart = (idx / totalChars) * 0.6; // tăng overlap
                        const charEnd = charStart + 0.4; // tăng range
                        
                        let localProgress = 0;
                        if (progress >= charStart && progress <= charEnd) {
                            localProgress = (progress - charStart) / 0.4;
                        } else if (progress > charEnd) {
                            localProgress = 1;
                        }
                        
                        // Custom cubic bezier easing (giống ease-out-expo) - cực mượt
                        const eased = localProgress === 1 ? 1 : 1 - Math.pow(2, -10 * localProgress);
                        
                        // Interpolate values với range lớn hơn
                        const currentScale = 0.65 + (eased * 0.35); // 0.65 -> 1
                        const currentOpacity = 0.25 + (eased * 0.75); // 0.25 -> 1
                        
                        // Color interpolation mượt hơn
                        const startR = 208, startG = 208, startB = 208; // #d0d0d0
                        const endR = 42, endG = 42, endB = 42; // #2a2a2a
                        
                        const r = Math.round(startR + (eased * (endR - startR)));
                        const g = Math.round(startG + (eased * (endG - startG)));
                        const b = Math.round(startB + (eased * (endB - startB)));
                        const currentColor = `rgb(${r}, ${g}, ${b})`;
                        
                        // Thêm slight rotation và y-transform cho smooth hơn
                        const currentY = (1 - eased) * 5; // từ 5px xuống 0
                        const currentRotate = (1 - eased) * 2; // từ 2deg về 0
                        
                        gsap.set(char, {
                            scale: currentScale,
                            color: currentColor,
                            opacity: currentOpacity,
                            y: currentY,
                            rotation: currentRotate,
                            force3D: true,
                            transformOrigin: '50% 50%'
                        });

                        if (char.classList.contains('space')) {
                            const spaceWidth = 1.2 - (eased * 0.9); // 1.2em -> 0.3em
                            gsap.set(char, {
                                width: spaceWidth + 'em'
                            });
                        }
                    });
                });
            }
        });

    })();

    // Grid drag to scroll
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

        grid.addEventListener('mousedown', e => startDrag(e.pageX));
        window.addEventListener('mouseup', endDrag);
        grid.addEventListener('mousemove', e => moveDrag(e.pageX));

        grid.addEventListener('touchstart', e => startDrag(e.touches[0].pageX), { passive: true });
        grid.addEventListener('touchend', endDrag);
        grid.addEventListener('touchmove', e => moveDrag(e.touches[0].pageX, false), { passive: false });

        if (btnNext) btnNext.addEventListener('click', () => grid.scrollBy({ left: 330, behavior: 'smooth' }));
        if (btnPrev) btnPrev.addEventListener('click', () => grid.scrollBy({ left: -330, behavior: 'smooth' }));
    })();

    // Classroom Carousel (Swiper)
    (function setupClassroomCarousel() {
        const wrapper  = safeQuery('.cr-cards-wrapper');
        const swiperEl = safeQuery('.cr-swiper');

        if (!wrapper || !swiperEl || !window.Swiper) return;

        const swiper = new Swiper(swiperEl, {
            slidesPerView: 'auto',
            spaceBetween: 28,
            grabCursor: true,
            speed: 600,
            freeMode: {
                enabled: true,
                sticky: true,
                momentum: true,
                momentumRatio: 0.5,
                momentumVelocityRatio: 0.5,
                minimumVelocity: 0.02
            },
            mousewheel: {
                enabled: true,
                forceToAxis: true,
                sensitivity: 1.5,
                releaseOnEdges: true,
                invert: false
            },
            resistance: true,
            resistanceRatio: 0.5,
            pagination: {
                el: '.cr-pagination',
                clickable: true,
                dynamicBullets: true
            },
            breakpoints: {
                0: { 
                    slidesPerView: 1,
                    spaceBetween: 20,
                    centeredSlides: false
                },
                680: { 
                    slidesPerView: 1.5,
                    spaceBetween: 24,
                    centeredSlides: false
                },
                968: { 
                    slidesPerView: 2,
                    spaceBetween: 24
                },
                1200: { 
                    slidesPerView: 3,
                    spaceBetween: 28
                },
                1400: { 
                    slidesPerView: 4,
                    spaceBetween: 28
                }
            }
        });
        
        // Thêm hỗ trợ cuộn ngang bằng wheel event cho mượt mà hơn
        let rafId = null;
        let targetTranslate = null;
        
        wrapper.addEventListener('wheel', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const isHovering = e.clientX >= rect.left && e.clientX <= rect.right && 
                               e.clientY >= rect.top && e.clientY <= rect.bottom;
            
            if (!isHovering) return;
            
            // Tính toán delta - ưu tiên cuộn ngang, nếu không có thì dùng cuộn dọc
            let delta = 0;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                delta = e.deltaX;
            } else if (Math.abs(e.deltaY) > 0) {
                delta = e.deltaY;
            } else {
                return;
            }
            
            e.preventDefault();
            
            const currentTranslate = swiper.getTranslate();
            const maxTranslate = swiper.maxTranslate();
            const minTranslate = swiper.minTranslate();
            
            // Hệ số sensitivity để điều chỉnh tốc độ cuộn
            const sensitivity = 0.5;
            const newTarget = currentTranslate - (delta * sensitivity);
            
            // Cập nhật target translate
            targetTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTarget));
            
            // Hủy animation frame cũ nếu có
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            
            // Tạo smooth animation với requestAnimationFrame
            const startTranslate = currentTranslate;
            const distance = targetTranslate - startTranslate;
            const startTime = performance.now();
            const duration = 200; // 200ms để mượt và responsive
            
            function smoothScroll(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic) để mượt hơn
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                const currentPos = startTranslate + (distance * easeOut);
                swiper.setTranslate(currentPos);
                
                // Nếu chưa đến target và còn đang cuộn, tiếp tục animate
                if (progress < 1 && Math.abs(swiper.getTranslate() - targetTranslate) > 0.5) {
                    rafId = requestAnimationFrame(smoothScroll);
                } else {
                    swiper.setTranslate(targetTranslate); // Đảm bảo đạt đúng target
                    rafId = null;
                }
            }
            
            rafId = requestAnimationFrame(smoothScroll);
        }, { passive: false });

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

            deltaX = moveX * 0.4;

            swiper.setTranslate(swiper.getTranslate() + deltaX);
        });

        function releaseDrag(e) {
            if (!isDown) return;
            isDown = false;

            const endY = e.clientY - startY;

            if (Math.abs(endY) > 40) {
                if (endY < 0) {
                    swiper.slideNext();
                } else {
                    swiper.slidePrev();
                }
            } else {
                swiper.slideTo(swiper.activeIndex);
            }
        }

        wrapper.addEventListener('mouseup', releaseDrag);
        wrapper.addEventListener('mouseleave', releaseDrag);

    })();

    // Classroom Floating Icon Follow Mouse
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

    // Scroll to Top Button
    (function setupScrollToTop() {
        const scrollBtn = safeQuery('#scrollToTop');
        const progressTop = scrollBtn ? scrollBtn.querySelector('.progress-top') : null;
        const progressRight = scrollBtn ? scrollBtn.querySelector('.progress-right') : null;
        const progressBottom = scrollBtn ? scrollBtn.querySelector('.progress-bottom') : null;
        const progressLeft = scrollBtn ? scrollBtn.querySelector('.progress-left') : null;
        
        if (!scrollBtn) {
            console.warn('Scroll to top button not found');
            return;
        }
        
        if (!progressTop || !progressRight || !progressBottom || !progressLeft) {
            console.warn('Progress bars not found', { progressTop, progressRight, progressBottom, progressLeft });
            return;
        }
        
        // Kiểm tra nếu là mobile thì ẩn nút
        function checkMobileAndHide() {
            if (window.innerWidth <= 768) {
                scrollBtn.style.display = 'none';
            } else {
                // Đảm bảo nút có style đúng
                scrollBtn.style.position = 'fixed';
                scrollBtn.style.bottom = '30px';
                scrollBtn.style.right = '30px';
                scrollBtn.style.left = 'auto';
                scrollBtn.style.top = 'auto';
                scrollBtn.style.zIndex = '100000';
                scrollBtn.style.width = '48px';
                scrollBtn.style.height = '48px';
                // Không set background ở đây để CSS có thể override
                scrollBtn.style.border = '1px solid rgba(138, 138, 138, 0.3)';
                scrollBtn.style.borderRadius = '8px';
                scrollBtn.style.display = 'flex';
                scrollBtn.style.alignItems = 'center';
                scrollBtn.style.justifyContent = 'center';
                scrollBtn.style.overflow = 'hidden';
            }
        }
        
        // Kiểm tra lần đầu
        checkMobileAndHide();
        
        // Kiểm tra khi resize
        window.addEventListener('resize', checkMobileAndHide);
        
        // Đảm bảo icon có màu trắng
        const icon = scrollBtn.querySelector('i');
        if (icon) {
            icon.style.color = '#ffffff';
        }
        
        // Khởi tạo style cho các cạnh progress bar
        [progressTop, progressRight, progressBottom, progressLeft].forEach(bar => {
            if (bar) {
                bar.style.position = 'absolute';
                bar.style.background = '#27c4e5';
                bar.style.zIndex = '2';
                bar.style.transition = 'width 0.1s linear, height 0.1s linear';
                bar.style.display = 'block';
                bar.style.visibility = 'visible';
                bar.style.opacity = '1';
                bar.style.pointerEvents = 'none';
            }
        });
        
        // Set vị trí và kích thước ban đầu cho từng cạnh
        if (progressTop) {
            progressTop.style.top = '0';
            progressTop.style.left = '0';
            progressTop.style.width = '0%';
            progressTop.style.height = '4px';
            progressTop.style.borderRadius = '8px 0 0 0';
        }
        if (progressRight) {
            progressRight.style.top = '0';
            progressRight.style.right = '0';
            progressRight.style.width = '4px';
            progressRight.style.height = '0%';
            progressRight.style.borderRadius = '0 8px 0 0';
        }
        if (progressBottom) {
            progressBottom.style.bottom = '0';
            progressBottom.style.right = '0';
            progressBottom.style.width = '0%';
            progressBottom.style.height = '4px';
            progressBottom.style.borderRadius = '0 0 8px 0';
        }
        if (progressLeft) {
            progressLeft.style.bottom = '0';
            progressLeft.style.left = '0';
            progressLeft.style.width = '4px';
            progressLeft.style.height = '0%';
            progressLeft.style.borderRadius = '0 0 0 8px';
        }
        
        // Theo dõi hướng scroll
        let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let isScrollingDown = true;
        
        function updateScrollProgress() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollableHeight = documentHeight - windowHeight;
            
            // Tính toán progress từ 0 đến 1
            const scrollProgress = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;
            
            // Tính toán progress cho từng cạnh (chu vi = 4 cạnh)
            // Cạnh trên: 0% - 25%
            // Cạnh phải: 25% - 50%
            // Cạnh dưới: 50% - 75%
            // Cạnh trái: 75% - 100%
            const totalProgress = scrollProgress * 4; // 0 đến 4
            
            let topWidth = 0, rightHeight = 0, bottomWidth = 0, leftHeight = 0;
            
            if (totalProgress <= 1) {
                // Chỉ cạnh trên
                topWidth = totalProgress * 100;
            } else if (totalProgress <= 2) {
                // Cạnh trên đầy + cạnh phải
                topWidth = 100;
                rightHeight = (totalProgress - 1) * 100;
            } else if (totalProgress <= 3) {
                // Cạnh trên + phải đầy + cạnh dưới
                topWidth = 100;
                rightHeight = 100;
                bottomWidth = (totalProgress - 2) * 100;
            } else {
                // Tất cả cạnh đầy
                topWidth = 100;
                rightHeight = 100;
                bottomWidth = 100;
                leftHeight = (totalProgress - 3) * 100;
            }
            
            // Cập nhật trực tiếp vào từng element progress bar
            if (progressTop) {
                progressTop.style.width = topWidth + '%';
            }
            if (progressRight) {
                progressRight.style.height = rightHeight + '%';
            }
            if (progressBottom) {
                progressBottom.style.width = bottomWidth + '%';
            }
            if (progressLeft) {
                progressLeft.style.height = leftHeight + '%';
            }
            
            // Xác định hướng scroll
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            isScrollingDown = currentScrollTop > lastScrollTop;
            lastScrollTop = currentScrollTop;
            
            // Kiểm tra nếu là mobile thì luôn ẩn
            if (window.innerWidth <= 768) {
                scrollBtn.style.display = 'none';
                return;
            }
            
            // Hiển thị/ẩn nút:
            // - Ẩn khi ở đầu trang (scrollTop <= 10)
            // - Chỉ hiển thị khi cuộn xuống và đã scroll > 100px
            // - Ẩn khi đang scroll lên
            if (scrollTop <= 10) {
                // Ở đầu trang - ẩn nút
                scrollBtn.classList.remove('show');
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
                scrollBtn.style.pointerEvents = 'none';
            } else if (isScrollingDown && scrollTop > 100) {
                // Đang scroll xuống và đã scroll > 100px - hiển thị nút
                scrollBtn.classList.add('show');
                scrollBtn.style.opacity = '0.9';
                scrollBtn.style.visibility = 'visible';
                scrollBtn.style.pointerEvents = 'auto';
            } else if (!isScrollingDown) {
                // Đang scroll lên - ẩn nút
                scrollBtn.classList.remove('show');
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
                scrollBtn.style.pointerEvents = 'none';
            }
        }
        
        // Xử lý hover để đổi màu nền
        scrollBtn.addEventListener('mouseenter', () => {
            if (scrollBtn.classList.contains('show')) {
                scrollBtn.style.background = '#27c4e5';
                scrollBtn.style.borderColor = '#27c4e5';
            }
        });
        
        scrollBtn.addEventListener('mouseleave', () => {
            if (scrollBtn.classList.contains('show')) {
                scrollBtn.style.background = '#575656e4';
                scrollBtn.style.borderColor = 'rgba(138, 138, 138, 0.3)';
            }
        });
        
        // Xử lý click để scroll lên đầu
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Cập nhật khi scroll
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        
        // Đảm bảo nút không hiển thị khi load trang
        scrollBtn.classList.remove('show');
        
        // Cập nhật lần đầu - đảm bảo nút ẩn khi ở đầu trang
        updateScrollProgress();
    })();

});
