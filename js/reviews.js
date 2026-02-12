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

// Check if user is admin (only gisticservice@gmail.com can delete)
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('gistic_user'));
    return user && user.email === 'gisticservice@gmail.com';
}

// Check if user is authenticated (can view and write reviews)
function isAuthenticated() {
    const user = JSON.parse(localStorage.getItem('gistic_user'));
    return user && (user.role === 'admin' || user.role === 'staff');
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) {
        // Check if we're on home page - if so, don't render reviews
        // Home page has its own review section with navigation
        return;
    }
    
    container.innerHTML = '';
    
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const canDelete = isAdmin();
    
    if (sortedReviews.length === 0) {
        container.innerHTML = `<div class="text-center py-16 px-6"><div class="max-w-md mx-auto"><div class="bg-white rounded-2xl shadow-xl p-8 mb-6"><div class="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center mx-auto mb-6"><i class="uil uil-star text-4xl text-white animate-bounce"></i></div><h3 class="text-2xl font-bold text-gray-800 mb-2">No Reviews Yet</h3><p class="text-gray-600 mb-6">Be the first to share your experience with GISTIC Services!</p><div class="flex flex-col sm:flex-row gap-4 justify-center"><button onclick="document.getElementById('review-form').scrollIntoView({behavior: 'smooth'})" class="bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-dark transition transform hover:scale-105 shadow-lg flex items-center justify-center"><i class="uil uil-edit-alt mr-2"></i> Write First Review</button><a href="services.html" class="border border-brand-green text-brand-green px-6 py-3 rounded-lg font-bold hover:bg-brand-green hover:text-white transition flex items-center justify-center"><i class="uil uil-apps mr-2"></i> View Our Services</a></div></div></div></div>`;
        return;
    }
    
    sortedReviews.forEach((review, index) => {
        const card = document.createElement('div');
        card.className = "bg-gray-50 p-4 rounded-2xl";
        
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
        
        // Only show delete button if admin
        const deleteButton = canDelete ? `
            <div class="absolute top-4 right-4 z-10">
                <button onclick="showDeleteModal(${index})" class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg" title="Delete review (Admin only)">
                    <i class="uil uil-trash-alt"></i>
                </button>
            </div>
        ` : '';
        
        // Create review content
        const reviewContent = document.createElement('div');
        reviewContent.className = 'relative z-10';
        reviewContent.innerHTML = `
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-900 text-2xl mb-2">${review.name}</h4>
                        <div class="flex items-center gap-2 mb-4">
                            <div class="text-2xl">${starsHtml}</div>
                            <div class="text-sm text-gray-500">${formattedDate}</div>
                        </div>
                    </div>
                    ${deleteButton}
                </div>
                <div class="mb-4">
                    <span class="inline-block bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                        ${review.service}
                    </span>
                </div>
                <p class="text-gray-700 leading-relaxed text-base italic border-l-4 border-blue-500 pl-4">"${review.message}"</p>
            </div>
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
        date: new Date().toISOString()
    };
    
    reviews.push(newReview);
    localStorage.setItem('gisticReviews', JSON.stringify(reviews));
    
    // Refresh both reviews displays
    renderReviews();
    renderHomeReviewsPreview(); // Refresh home page preview
}

// Function to show delete confirmation modal
function showDeleteModal(index) {
    const review = reviews[index];
    view = reviews[index];
    
    // Remove review from array
    reviews.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('gisticReviews', JSON.stringify(reviews));
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'delete-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-slide-up">
            <!-- Modern Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent opacity-30"></div>
            
            <button onclick="closeDeleteModal()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-3 shadow-xl backdrop-blur-sm border border-gray-200">
                <i class="uil uil-multiply text-xl"></i>
            </button>
            
            <div class="relative z-10 p-8">
                <div class="text-center mb-8">
                    <div class="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                        <div class="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                        <i class="uil uil-exclamation-triangle text-white text-5xl animate-pulse relative z-10"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-4">Delete Review?</h3>
                    <p class="text-gray-600 mb-8 text-lg">Are you sure you want to permanently delete this review?</p>
                    
                    <div class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <i class="uil uil-user text-red-500 text-2xl"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-900 text-lg mb-1">${review.name}</h4>
                                <p class="text-sm text-gray-500">${formattedDate}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">
                                <div class="text-3xl">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                                <span class="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">${review.service}</span>
                            </div>
                            <div class="bg-white rounded-lg p-4 border border-gray-200">
                                <p class="text-gray-700 italic mb-3">"${review.message}"</p>
                            </div>
                        </div>
                        
                        <div class="bg-red-100 border border-red-300 rounded-lg p-4">
                            <div class="flex items-center gap-2 mb-3">
                                <i class="uil uil-shield-check text-red-600 text-xl"></i>
                                <span class="text-red-700 font-bold">Admin-Only Action</span>
                            </div>
                            <p class="text-red-600 text-sm">This action can only be performed by administrators. The review will be permanently removed.</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="closeDeleteModal()" class="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                        <i class="uil uil-arrow-left text-lg"></i>
                        <span>Keep Review</span>
                    </button>
                    <button onclick="confirmDelete(${index})" class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3">
                        <i class="uil uil-trash-alt text-xl"></i>
                        <span>Delete Permanently</span>
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
    // Check if user is admin
    if (!isAdmin()) {
        alert('Only administrators can delete reviews. Please login as admin to access this feature.');
        closeDeleteModal();
        return;
    }
    
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
    renderHomeReviewsPreview(); // Render home page preview
    
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
            
            // Add review locally first
            addNewReview(reviewData);
            
            // Also send email notification
            sendReviewEmail(reviewData);
            
            // Reset form
            reviewForm.reset();
        });
    }
});

// Function to show text overlay
function showTextOverlay() {
    const modal = document.createElement('div');
    modal.id = 'text-overlay';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-slide-up">
            <!-- Modern Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-brand-dark/5 to-transparent opacity-30"></div>
            
            <button onclick="closeTextOverlay()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-3 shadow-xl">
                <i class="uil uil-multiply text-xl"></i>
            </button>
            
            <div class="relative z-10 p-8">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <i class="uil uil-edit-alt text-3xl text-white"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-4">Write Your Review</h3>
                    <p class="text-gray-600 text-lg mb-8">Share your experience with GISTIC Services and help others make informed decisions.</p>
                </div>
                
                <form onsubmit="submitTextReview(event)" class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                        <input type="text" name="name" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" placeholder="John Doe">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
                        <select name="service" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none">
                            <option value="">Select a service</option>
                            <option value="Home Cleaning">Home Cleaning</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Painting">Painting</option>
                            <option value="Carpentry">Carpentry</option>
                            <option value="Landscaping">Landscaping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                        <div class="flex gap-3 justify-center mb-6">
                            ${[1,2,3,4,5].map(r => `
                                <button type="button" onclick="setOverlayRating(${r})" class="rating-star w-12 h-12 text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${r}">
                                    <i class="uil uil-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <input type="hidden" name="rating" id="overlay-rating" value="0" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                        <textarea name="message" required rows="4" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none resize-none" placeholder="Tell us about your experience..."></textarea>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="button" onclick="closeTextOverlay()" class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all duration-300">
                            Cancel
                        </button>
                        <button type="submit" class="flex-1 bg-gradient-to-r from-brand-green to-brand-dark text-white px-6 py-3 rounded-lg font-bold hover:from-brand-dark hover:to-brand-darker transition-all duration-300 shadow-lg">
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to close text overlay
function closeTextOverlay() {
    const modal = document.getElementById('text-overlay');
    if (modal) {
        modal.remove();
    }
}

// Function to set rating in overlay
function setOverlayRating(rating) {
    document.getElementById('overlay-rating').value = rating;
    
    // Update star buttons
    document.querySelectorAll('.rating-star').forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

// Function to submit review from overlay
function submitTextReview(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reviewData = {
        name: formData.get('name'),
        service: formData.get('service'),
        rating: formData.get('rating'),
        message: formData.get('message')
    };
    
    // Validate
    if (!reviewData.name || !reviewData.service || !reviewData.rating || !reviewData.message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Add review
    addNewReview(reviewData);
    
    // Close overlay
    closeTextOverlay();
    
    // Show success message
    showSuccessMessage();
    
    // Redirect to reviews page to see the review
    setTimeout(() => {
        window.location.href = 'reviews.html';
    }, 2000);
}

// Function to render reviews on home page preview
function renderHomeReviewsPreview() {
    const container = document.getElementById('home-reviews-preview');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show only first 3 reviews
    const previewReviews = sortedReviews.slice(0, 3);
    
    if (previewReviews.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No reviews yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    previewReviews.forEach((review) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-4 rounded-xl';
        
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += i < review.rating 
                ? `<i class="uil uil-star text-yellow-400 text-sm"></i>` 
                : `<i class="uil uil-star text-gray-300 text-sm"></i>`;
        }
        
        const reviewDate = new Date(review.date);
        const formattedDate = reviewDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        card.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div class="mb-3">
                    <h4 class="font-bold text-gray-900 text-lg mb-1">${review.name}</h4>
                    <div class="flex items-center gap-2 mb-2">
                        <div class="text-sm">${starsHtml}</div>
                        <div class="text-xs text-gray-500">${formattedDate}</div>
                    </div>
                </div>
                <div class="mb-3">
                    <span class="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                        ${review.service}
                    </span>
                </div>
                <p class="text-gray-700 text-sm italic line-clamp-3">"${review.message}"</p>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Function to send email notification
function sendReviewEmail(reviewData) {
    // Create email content
    const emailSubject = `New Customer Review - ${reviewData.service}`;
    const emailBody = `
You have received a new customer review for GISTIC Services.

\n📝 Review Details:
==================
Name: ${reviewData.name}
Service: ${reviewData.service}
Rating: ${reviewData.rating} stars
Message: "${reviewData.message}"
Date: ${new Date().toLocaleDateString()}

==================

This review is now displayed on the website and saved in the local database.

Best regards,
GISTIC Services Review System
    `;
    
    // Send email using mailto link (fallback)
    const mailtoLink = `mailto:gisticservice@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
    
    // Try to send via FormSubmit.co as backup
    setTimeout(() => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://formsubmit.co/gisticservice@gmail.com';
        form.style.display = 'none';
        
        // Add form fields
        const fields = [
            { name: '_subject', value: emailSubject },
            { name: '_template', value: 'table' },
            { name: '_captcha', value: 'false' },
            { name: 'name', value: reviewData.name },
            { name: 'service', value: reviewData.service },
            { name: 'rating', value: reviewData.rating },
            { name: 'message', value: reviewData.message },
            { name: '_next', value: window.location.href }
        ];
        
        fields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }, 1000);
}
