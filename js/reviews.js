/**
 * GISTIC Services - Review Management
 * Handles review display, submission, and deletion with authentication
 */

// Load reviews from localStorage or use default reviews
function loadReviews() {
    const storedReviews = localStorage.getItem('gisticReviews');
    if (storedReviews) {
        return JSON.parse(storedReviews);
    }
    return [
        {
            name: "Chinedu Okeke",
            service: "Electrical Works",
            rating: 5,
            message: "The team was professional and fixed issue effectively. Highly recommended!",
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
            message: "Excellent painting work. The finish was smooth and professional.",
            date: "2024-02-10"
        }
    ];
}

let reviews = loadReviews();

// Check if user is authenticated (admin or staff)
function isAuthenticated() {
    const user = JSON.parse(localStorage.getItem('gistic_user'));
    return user && (user.role === 'admin' || user.role === 'staff');
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const canDelete = isAuthenticated();
    
    if (sortedReviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 px-6">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="uil uil-star text-4xl text-white animate-bounce"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">No Reviews Yet</h3>
                        <p class="text-gray-600 mb-6">Be the first to share your experience with GISTIC Services!</p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="document.getElementById('review-form').scrollIntoView({behavior: 'smooth'})" class="bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-dark transition transform hover:scale-105 shadow-lg flex items-center justify-center">
                                <i class="uil uil-edit-alt mr-2"></i>
                                Write First Review
                            </button>
                            <a href="services.html" class="border border-brand-green text-brand-green px-6 py-3 rounded-lg font-bold hover:bg-brand-green hover:text-white transition flex items-center justify-center">
                                <i class="uil uil-apps mr-2"></i>
                                View Our Services
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    sortedReviews.forEach((review, index) => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden";
        
        // Add gradient overlay effect
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300';
        card.appendChild(gradientOverlay);
        
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            const animationDelay = i * 0.1;
            starsHtml += i < review.rating 
                ? `<i class="uil uil-star text-yellow-400 text-lg animate-pulse" style="animation-delay: ${animationDelay}s"></i>` 
                : `<i class="uil uil-star text-gray-300 text-lg"></i>`;
        }
        
        // Format date
        const reviewDate = new Date(review.date);
        const formattedDate = reviewDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Only show delete button if authenticated
        const deleteButton = canDelete ? `
            <div class="absolute top-4 right-4 z-10">
                <button onclick="showDeleteModal(${index})" class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg" title="Delete review">
                    <i class="uil uil-trash-alt"></i>
                </button>
            </div>
        ` : '';
        
        // Create review content
        const reviewContent = document.createElement('div');
        reviewContent.className = 'relative z-10';
        reviewContent.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        ${review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 text-xl">${review.name}</h4>
                        <p class="text-sm text-gray-500 font-medium">${formattedDate}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-lg">${starsHtml}</div>
                    ${deleteButton}
                </div>
            </div>
            <div class="mb-3">
                <span class="inline-block bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    ${review.service}
                </span>
            </div>
            <p class="text-gray-700 leading-relaxed text-base italic border-l-4 border-brand-green pl-4">"${review.message}"</p>
        `;
        
        card.appendChild(reviewContent);
        container.appendChild(card);
    });
}

// Function to add new review
function addNewReview(reviewData) {
    const newReview = {
        name: reviewData.name,
        service: reviewData.service,
        rating: parseInt(reviewData.rating),
        message: reviewData.message,
        date: new Date().toISOString().split('T')[0] // Current date
    };
    
    reviews.unshift(newReview); // Add to beginning
    
    // Save to localStorage
    localStorage.setItem('gisticReviews', JSON.stringify(reviews));
    
    // Re-render reviews
    renderReviews();
    
    // Show success message
    showSuccessMessage();
}

// Function to show delete confirmation modal
function showDeleteModal(index) {
    const review = reviews[index];
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'delete-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-slide-up">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-transparent opacity-20"></div>
            
            <button onclick="closeDeleteModal()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-2 shadow-lg">
                <i class="uil uil-multiply text-xl"></i>
            </button>
            
            <div class="relative z-10 p-8">
                <div class="text-center mb-8">
                    <div class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="uil uil-exclamation-triangle text-red-500 text-4xl animate-pulse"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-3">Delete Review?</h3>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p class="text-gray-700 mb-4">Are you sure you want to delete this review from <strong class="text-red-600">${review.name}</strong>?</p>
                        <div class="text-left text-sm text-gray-600 space-y-2">
                            <p><strong class="text-gray-800">Service:</strong> <span class="font-medium">${review.service}</span></p>
                            <p><strong class="text-gray-800">Rating:</strong> <span class="text-lg">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span></p>
                            <p><strong class="text-gray-800">Message:</strong></p>
                            <div class="bg-white p-3 rounded border border-gray-200 italic text-gray-700 mt-2">"${review.message}"</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="closeDeleteModal()" class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                        <i class="uil uil-times mr-2"></i>
                        Cancel
                    </button>
                    <button onclick="confirmDelete(${index})" class="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        <i class="uil uil-trash-alt mr-2"></i>
                        Delete Review
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });
    
    // Close on ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeDeleteModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Function to close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to confirm delete
function confirmDelete(index) {
    const review = reviews[index];
    
    // Remove review from array
    reviews.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('gisticReviews', JSON.stringify(reviews));
    
    // Close modal
    closeDeleteModal();
    
    // Re-render reviews
    renderReviews();
    
    // Show delete notification
    showDeleteMessage(review.name);
}

// Function to show success message
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
    successDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="uil uil-check-circle"></i>
            <span>Review submitted successfully! It's now visible on the page.</span>
        </div>
    `;
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Function to show delete message
function showDeleteMessage(reviewName) {
    const deleteDiv = document.createElement('div');
    deleteDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
    deleteDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="uil uil-trash-alt"></i>
            <span>Review from ${reviewName} deleted successfully!</span>
        </div>
    `;
    document.body.appendChild(deleteDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        deleteDiv.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderReviews();
    
    // Handle form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(reviewForm);
            const reviewData = {
                name: formData.get('name'),
                service: formData.get('service'),
                rating: formData.get('rating'),
                message: formData.get('message')
            };
            
            // Validate form
            if (!reviewData.name || !reviewData.service || !reviewData.rating || !reviewData.message) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Add review
            addNewReview(reviewData);
            
            // Reset form
            reviewForm.reset();
        });
    }
});
