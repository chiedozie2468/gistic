/**
 * GISTIC Services - Main JavaScript
 * Handles global UI interactions, splash screen, and navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader after page load
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            document.documentElement.classList.add('hide-preloader');
            // Mark as visited for future sessions
            localStorage.setItem('gistic_preloader_visited_v2', 'true');
        }, 1500); // Show for 1.5 seconds
    }

    // Sticky Navbar Logic
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('glass-nav', 'shadow-sm');
            navbar.classList.remove('bg-transparent', 'py-4');
            navbar.classList.add('py-2');
        } else {
            navbar.classList.remove('glass-nav', 'shadow-sm', 'py-2');
            navbar.classList.add('bg-transparent', 'py-4');
        }
    });

    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('uil-multiply');
                icon.classList.add('uil-bars');
            } else {
                icon.classList.remove('uil-bars');
                icon.classList.add('uil-multiply');
            }
        });
    }

    // Statistics Counter Animation
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const animateCounters = () => {
        counters.forEach(counter => {
            counter.innerText = '0'; // Reset to 0 before animating
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText.replace(/,/g, '');
                const inc = target / speed;

                if (count < target) {
                    const nextCount = Math.ceil(count + inc);
                    counter.innerText = nextCount.toLocaleString();
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            updateCount();
        });
    }
    
    // Trigger counter animation when in view
    const statsSection = document.querySelector('.counter')?.closest('section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                animateCounters();
            }
        }, { threshold: 0.2 }); // Trigger when 20% visible
        observer.observe(statsSection);
    }
});

/**
 * Global Map Modal Functions
 */
const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126839.0682057774!2d7.4970425!3d6.448574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1044a3d4632d4339%3A0x6b864d306544490f!2sEnugu!5e0!3m2!1sen!2sng!4v1717171717171!5m2!1sen!2sng";

window.toggleMapModal = function(show) {
    const modal = document.getElementById('map-modal');
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Search Map Functionality
window.searchMap = function() {
    const input = document.getElementById('map-search-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    
    const iframe = document.getElementById('main-map-iframe');
    const status = document.getElementById('map-status');
    
    if (iframe) iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    if (status) status.innerHTML = `<i class="uil uil-search text-brand-green mr-2"></i> Result for: ${query}`;
}

window.locateMe = function() {
    const status = document.getElementById('map-status');
    if (status) status.innerHTML = `<i class="uil uil-spinner-alt animate-spin text-brand-green mr-2"></i> Finding your location...`;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const iframe = document.getElementById('main-map-iframe');
            
            if (iframe) iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            if (status) status.innerHTML = `<i class="uil uil-location-point text-brand-green mr-2"></i> Showing your current location`;
        }, (error) => {
            if (status) status.innerHTML = `<i class="uil uil-exclamation-triangle text-red-500 mr-2"></i> Permission denied or error`;
        });
    } else {
        if (status) status.innerHTML = "Geolocation not supported";
    }
}

window.resetMap = function() {
    const iframe = document.getElementById('main-map-iframe');
    const status = document.getElementById('map-status');
    const input = document.getElementById('map-search-input');
    
    if (iframe) iframe.src = defaultMapUrl;
    if (status) status.innerHTML = "GISTIC HQ - Enugu, Nigeria";
    if (input) input.value = "";
}

// Global Enter key listener for map search
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'map-search-input') {
        window.searchMap();
    }
});

/**
 * Service Modal Logic
 */
window.openServiceModal = function(serviceName) {
    const modal = document.getElementById('service-modal');
    const nameSpan = document.getElementById('modal-service-name');
    const serviceInput = document.getElementById('service-input');
    
    if (nameSpan) nameSpan.innerText = serviceName;
    if (serviceInput) serviceInput.value = serviceName;
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

window.closeServiceModal = function() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}
