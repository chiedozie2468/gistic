/**
 * GISTIC Services - Reviews Data
 * This file contains approved reviews.
 * To add a new review, manually append to the 'reviews' array.
 */

const reviews = [
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
        service: "Plumbing",
        rating: 5,
        message: "Emergency response was quick. Saved my kitchen from flooding.",
        date: "2024-02-10"
    }
];

function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No reviews yet. Be the first!</p>';
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col gap-4";
        
        // Stars
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < review.rating) {
                starsHtml += '<i class="uil uil-star text-yellow-400"></i>';
            } else {
                starsHtml += '<i class="uil uil-star text-gray-300"></i>';
            }
        }

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center text-brand-green font-bold">
                        ${review.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${review.name}</h4>
                        <p class="text-xs text-gray-500">${review.service} • ${review.date}</p>
                    </div>
                </div>
                <div class="text-sm">${starsHtml}</div>
            </div>
            <p class="text-gray-600 italic">"${review.message}"</p>
        `;
        container.appendChild(card);
    });
}

// Render on load
document.addEventListener('DOMContentLoaded', renderReviews);
