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
 * Global Map Modal Functions (Leaflet Version)
 */
let map;
let companyMarker;
let currentMapStyle = 'street';

// GISTIC Services Company Coordinates (Enugu, Nigeria)
const companyLocation = [6.448574, 7.4970425];

window.toggleMapModal = function(show) {
    const modal = document.getElementById('map-modal');
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        // Initialize map when modal opens
        setTimeout(() => {
            window.initializeMap();
        }, 100);
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        
        // Clean up map
        if (map) {
            map.remove();
            map = null;
        }
    }
}

// Support older function name
window.openMapModal = () => window.toggleMapModal(true);
window.closeMapModal = () => window.toggleMapModal(false);

window.initializeMap = function() {
    const mapContainer = document.getElementById('interactive-map');
    if (!mapContainer || map) return; // No container or already initialized
    
    try {
        // Create map centered on company location
        map = L.map('interactive-map').setView(companyLocation, 15);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add custom company marker
        const companyIcon = L.divIcon({
            html: '<div style="background-color: #10b981; color: white; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="uil uil-building" style="font-size: 16px;"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'company-marker'
        });
        
        companyMarker = L.marker(companyLocation, { icon: companyIcon }).addTo(map);
        companyMarker.bindPopup(`
            <div style="text-align: center; padding: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #10b981; font-weight: bold;">GISTIC Services</h4>
                <p style="margin: 5px 0; color: #666;">Professional Home Services</p>
                <p style="margin: 5px 0; color: #666; font-size: 12px;">Enugu Metropolis, Nigeria</p>
                <p style="margin: 5px 0; color: #666; font-size: 12px;">📞 09020966002</p>
            </div>
        `).openPopup();
        
        // Add circle to show service area
        L.circle(companyLocation, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.1,
            radius: 5000 // 5km radius
        }).addTo(map);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
                <div style="text-align: center; padding: 20px;">
                    <i class="uil uil-map-marker" style="font-size: 48px; color: #10b981; margin-bottom: 10px;"></i>
                    <h3 style="color: #374151; margin-bottom: 10px;">GISTIC Services</h3>
                    <p style="color: #6b7280; margin-bottom: 15px;">Enugu Metropolis, Nigeria</p>
                    <button onclick="window.getDirections()" class="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition">
                        Get Directions
                    </button>
                </div>
            </div>
        `;
    }
}

window.searchLocation = function() {
    const input = document.getElementById('map-search');
    const searchTerm = input ? input.value : "";
    if (!searchTerm) return;
    
    if (!map) {
        alert('Map is not loaded yet. Please try again.');
        return;
    }
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                
                map.setView([lat, lon], 16);
                
                const searchIcon = L.divIcon({
                    html: '<div style="background-color: #ef4444; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="uil uil-map-marker" style="font-size: 12px;"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    className: 'search-marker'
                });
                
                L.marker([lat, lon], { icon: searchIcon })
                    .addTo(map)
                    .bindPopup(`<strong>${result.display_name}</strong>`)
                    .openPopup();
            } else {
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            alert('Search failed. Please try again.');
        });
}

window.resetMapView = function() {
    if (map) {
        map.setView(companyLocation, 15);
        if (companyMarker) companyMarker.openPopup();
    }
}

window.getCurrentLocation = function() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        if (map) {
            const userIcon = L.divIcon({
                html: '<div style="background-color: #3b82f6; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="uil uil-user" style="font-size: 12px;"></i></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'user-marker'
            });
            
            L.marker([lat, lon], { icon: userIcon })
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
            
            map.setView([lat, lon], 15);
        }
    });
}

window.toggleMapStyle = function() {
    if (!map) return;
    
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    
    if (currentMapStyle === 'street') {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19
        }).addTo(map);
        currentMapStyle = 'satellite';
    } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        currentMapStyle = 'street';
    }
}

window.getDirections = function() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${companyLocation[0]},${companyLocation[1]}`, '_blank');
}

// Support for older enter key listener
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.id === 'map-search' || e.target.id === 'map-search-input') {
            window.searchLocation();
        }
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
