document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger effect for elements appearing at the same time
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150); // 150ms delay per item

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    // Added .book to ensure the story sections fade in
    const animateElements = document.querySelectorAll('.product-card, .section-title, .book');

    animateElements.forEach(el => {
        // Only set initial state if not already visible (to avoid hiding things on reload if scrolled)
        // But for consistency we usually force it. 
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)'; // Increased distance slightly
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });

    // --- Mobile Menu Logic ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');

    if (menuBtn && navUl) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to header
            navUl.classList.toggle('show');
            menuBtn.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navUl.contains(e.target) && navUl.classList.contains('show')) {
                navUl.classList.remove('show');
                menuBtn.classList.remove('active');
            }
        });
    }

    // --- Carousel Logic ---
    const trackContainer = document.querySelector('.carousel-track-container');
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (trackContainer && track && prevBtn && nextBtn) {
        // Function to get exact scroll amount (card width + gap)
        const getScrollAmount = () => {
            const card = document.querySelector('.product-card');
            if (!card) return 300;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            return card.offsetWidth + gap;
        };

        nextBtn.addEventListener('click', () => {
            trackContainer.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            trackContainer.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });
    }

    // --- Flip Card Logic ---
    const books = document.querySelectorAll('.book');

    books.forEach(book => {
        const flippables = book.querySelectorAll('.flippable');

        flippables.forEach(flippable => {
            const readMore = flippable.querySelector('.read-more-btn');
            const backBtn = flippable.querySelector('.back-btn');
            const backSide = flippable.querySelector('.page-side.back');

            if (readMore) {
                readMore.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    flippable.classList.add('flipped');
                });
            }

            // Flip back when clicking the back button
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    flippable.classList.remove('flipped');
                });
            }

            // Also flip back when clicking anywhere on the back side content
            if (backSide) {
                backSide.addEventListener('click', (e) => {
                    // Only flip back if we didn't click a specific link/button inside (though there are none currently)
                    if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                        flippable.classList.remove('flipped');
                    }
                });
            }
        });
    });
});
