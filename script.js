document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Particles.js (Live Background Effect) ---
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ["#4a90e2", "#ff69b4", "#ffffff"] }, // Sky Blue, Pink, White
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#0056b3', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 3, direction: 'none', out_mode: 'out', bounce: false },
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        },
        retina_detect: true
    });


    // --- 2. Dark Mode / Light Mode Toggle ---
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const toggleIcon = darkModeToggle.querySelector('i');

    const loadTheme = () => {
        const isDarkMode = localStorage.getItem('isDarkMode') !== 'false';
        if (isDarkMode) {
            body.classList.remove('light-mode');
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        } else {
            body.classList.add('light-mode');
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        }
    };

    const toggleTheme = () => {
        const isLightMode = body.classList.toggle('light-mode');
        localStorage.setItem('isDarkMode', !isLightMode);

        if (isLightMode) {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        } else {
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        }
    };

    darkModeToggle.addEventListener('click', toggleTheme);
    loadTheme();

    // --- 3. Timeline (About Me) Scroll Animation ---
    const timelineItems = document.querySelectorAll('.timeline-item');

    const checkTimelineVisibility = () => {
        const scrollPosition = window.scrollY + window.innerHeight * 0.8;

        timelineItems.forEach(item => {
            if (item.offsetTop < scrollPosition) {
                item.classList.add('show');
            } else {
                item.classList.remove('show');
            }
        });
    };

    // --- 4. Project Slider Logic ---
    const slider = document.querySelector('.projects-slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (slider) {
        // Function to scroll the slider
        const scrollSlider = (direction) => {
            const scrollAmount = 400; // Adjust scroll distance
            if (direction === 'next') {
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        };

        prevBtn.addEventListener('click', () => scrollSlider('prev'));
        nextBtn.addEventListener('click', () => scrollSlider('next'));
    }

    // --- 5. Contact Form Submission (Dummy) ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Dummy submission logic
            formMessage.textContent = 'Thank you for your message, Devi will get back to you soon!';
            formMessage.style.color = 'var(--accent-color)';
            
            // Clear the form after a short delay
            setTimeout(() => {
                contactForm.reset();
                formMessage.textContent = '';
            }, 3000);
        });
    }

    // Initial checks and listeners
    window.addEventListener('scroll', checkTimelineVisibility);
    checkTimelineVisibility();
});