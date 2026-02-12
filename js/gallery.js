/**
 * GISTIC Services - Gallery Logic
 * Handles rendering and administrative management of the project gallery.
 */

// Initial data if storage is empty
const INITIAL_GALLERY = [
    {
        type: 'image',
        url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Electrical Rewiring Project',
        description: 'Complete home rewiring emphasizing safety and efficiency.',
        date: '2024-01-20'
    },
    {
        type: 'image',
        url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Interior Painting',
        description: 'High-quality finish for a modern living room.',
        date: '2024-02-05'
    }
];

// Load gallery from localStorage or use initial set
let galleryItems = JSON.parse(localStorage.getItem('gistic_gallery')) || INITIAL_GALLERY;

function saveGallery() {
    localStorage.setItem('gistic_gallery', JSON.stringify(galleryItems));
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    // Check if current user is admin
    const currentUser = JSON.parse(localStorage.getItem('gistic_user'));
    const isAdmin = currentUser && currentUser.email === 'gisticservice@gmail.com';

    // Show/Hide Admin Form
    const adminPanel = document.getElementById('gallery-admin-panel');
    if (adminPanel) {
        if (isAdmin) {
            adminPanel.classList.remove('hidden');
        } else {
            adminPanel.classList.add('hidden');
        }
    }

    if (galleryItems.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 w-full py-20 translate-y-2">No projects showcased yet. Check back soon!</p>';
        return;
    }

    galleryItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = "group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 animate-slide-up";
        itemEl.style.animationDelay = `${index * 100}ms`;

        const mediaHtml = item.type === 'video' 
            ? `<video src="${item.url}" class="w-full h-64 object-cover" controls></video>`
            : `<img src="${item.url}" alt="${item.title}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700">`;

        const deleteBtnHtml = isAdmin ? `
            <button onclick="deleteGalleryItem(${index})" class="absolute top-4 right-4 z-10 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100">
                <i class="uil uil-trash-alt text-xl"></i>
            </button>
        ` : '';

        itemEl.innerHTML = `
            ${deleteBtnHtml}
            <div class="relative overflow-hidden">
                ${mediaHtml}
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p class="text-white text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">${item.date}</p>
                    <h3 class="text-white text-lg font-bold">${item.title}</h3>
                </div>
            </div>
            <div class="p-6">
                <p class="text-gray-600 text-sm leading-relaxed">${item.description}</p>
            </div>
        `;
        container.appendChild(itemEl);
    });
}

/**
 * Admin Logic: Add New Item
 */
window.addGalleryItem = function(event) {
    event.preventDefault();
    
    // Auth check
    const currentUser = JSON.parse(localStorage.getItem('gistic_user'));
    if (!currentUser || currentUser.email !== 'gisticservice@gmail.com') {
        alert('Unauthorized access.');
        return;
    }

    const type = document.getElementById('item-type').value;
    const url = document.getElementById('item-url').value;
    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const date = new Date().toISOString().split('T')[0];

    const newItem = { type, url, title, description, date };
    galleryItems.unshift(newItem); // Add to beginning
    saveGallery();
    renderGallery();
    
    // Reset form
    document.getElementById('gallery-form').reset();
    alert('Project added to gallery successfully!');
}

/**
 * Admin Logic: Delete Item
 */
window.deleteGalleryItem = function(index) {
    if (!confirm('Are you sure you want to remove this from the gallery?')) return;
    
    galleryItems.splice(index, 1);
    saveGallery();
    renderGallery();
}

// Render on load
document.addEventListener('DOMContentLoaded', renderGallery);
