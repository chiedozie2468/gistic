/**
 * GISTIC Services - Animations
 * Handles scroll-reveal animations using Intersection Observer.
 */

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-slide-up, .animate-fade-in');

    const observerOptions = {
        threshold: 0.15, // Trigger when 15% is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger animation
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // If it's a keyframe animation from Tailwind, ensure it starts
                entry.target.style.animationPlayState = 'running';
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        // Initial State
        el.style.opacity = '0';
        
        if (el.classList.contains('animate-slide-up')) {
            el.style.transform = 'translateY(30px)';
        }

        // Apply transition properties
        el.style.transitionProperty = 'opacity, transform';
        el.style.transitionDuration = '800ms';
        el.style.transitionTimingFunction = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
        
        // Respect inline style transition-delay if set
        const delay = el.getAttribute('style')?.match(/transition-delay:\s*(\d+)ms/);
        if (delay) {
            el.style.transitionDelay = delay[1] + 'ms';
        }

        observer.observe(el);
    });
});
