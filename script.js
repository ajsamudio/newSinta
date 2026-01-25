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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animateElements = document.querySelectorAll('.product-card, .giving-content, .giving-image, .section-title');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
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
        const flippable = book.querySelector('.flippable');
        const readMore = book.querySelector('.read-more-btn');
        const back = book.querySelector('.back-btn');

        if (flippable && readMore && back) {
            readMore.addEventListener('click', () => {
                flippable.classList.add('flipped');
            });

            back.addEventListener('click', () => {
                flippable.classList.remove('flipped');
            });
        }
    });
});
