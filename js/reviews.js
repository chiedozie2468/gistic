/**
 * GISTIC Services - Reviews Logic
 * Handles rendering and administrative management of customer feedback.
 */

// Initial data if storage is empty
const INITIAL_REVIEWS = [
    {
        name: "Chinedu Okeke",
        service: "Electrical Works",
        rating: 5,
        message: "The team was professional and fixed the issue effectively. Highly recommended!",
        date: "2024-01-15"
    },
    {
        name: "Amaka Udeh",
        service: "Housekeeping",
        rating: 4,
        message: "Great cleaning service. The staff was polite and thorough.",
        date: "2024-02-02"
    },
    {
        name: "Tunde Bakare",
        service: "Painting",
        rating: 5,
        message: "Emergency response was quick. Saved my kitchen from flooding.",
        date: "2024-02-10"
    }
];

// Load reviews from localStorage or use initial set
let reviews = JSON.parse(localStorage.getItem('gistic_reviews')) || INITIAL_REVIEWS;

function saveReviews() {
    localStorage.setItem('gistic_reviews', JSON.stringify(reviews));
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    // Check if current user is the specific authorized admin
    const currentUser = JSON.parse(localStorage.getItem('gistic_user'));
    const isSuperAdmin = currentUser && currentUser.email === 'gisticservice@gmail.com';

    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 w-full py-10">No reviews yet. Be the first to share your experience!</p>';
        return;
    }

    reviews.forEach((review, index) => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col gap-4 relative group";
        
        // Stars
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += `<i class="uil uil-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`;
        }

        // Admin Delete Button (Only for specific email)
        const deleteBtnHtml = isSuperAdmin ? `
            <button onclick="deleteReview(${index})" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" title="Delete Review">
                <i class="uil uil-trash-alt text-xl"></i>
            </button>
        ` : '';

        card.innerHTML = `
            ${deleteBtnHtml}
            <div class="flex justify-between items-start pr-8">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-brand-green font-bold text-lg">
                        ${review.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${review.name}</h4>
                        <p class="text-xs text-gray-500">${review.service} • ${review.date}</p>
                    </div>
                </div>
            </div>
            <div class="flex gap-1">${starsHtml}</div>
            <p class="text-gray-600 italic leading-relaxed">"${review.message}"</p>
        `;
        container.appendChild(card);
    });
}

/**
 * Admin Only: Delete a review
 */
window.deleteReview = function(index) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    // Check auth again for safety
    const currentUser = JSON.parse(localStorage.getItem('gistic_user'));
    if (!currentUser || currentUser.email !== 'gisticservice@gmail.com') {
        alert('Unauthorized action.');
        return;
    }

    reviews.splice(index, 1);
    saveReviews();
    renderReviews();
    
    // Show toast or alert
    console.log('Review deleted successfully');
}

// Render on load
document.addEventListener('DOMContentLoaded', renderReviews);
