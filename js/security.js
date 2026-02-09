/**
 * GISTIC Services - Security & Form Handling
 * Implements frontend security measures and form enhancements.
 */

const RATE_LIMIT_TIME = 60000; // 1 minute between submissions
const MAX_SUBMISSIONS = 3; // Max 3 submissions per hour

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // 1. Rate Limiting
            if (isRateLimited()) {
                e.preventDefault();
                alert('You are submitting too fast. Please wait a moment.');
                return;
            }

            // 2. Input Sanitization
            const inputs = form.querySelectorAll('input[type="text"], textarea');
            let hasMaliciousContent = false;
            inputs.forEach(input => {
                if (containsMaliciousCode(input.value)) {
                    hasMaliciousContent = true;
                    input.classList.add('border-red-500');
                } else {
                    input.classList.remove('border-red-500');
                    // Basic sanitization (trim)
                    input.value = input.value.trim();
                }
            });

            if (hasMaliciousContent) {
                e.preventDefault();
                alert('Security Alert: HTML or Script tags are not allowed in forms.');
                return;
            }

            // 3. Disable Submit Button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="uil uil-spinner px-2 animate-spin"></i> Sending...';
                // Re-enable after 10 seconds just in case (or rely on page reload)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Submit';
                }, 10000);
            }

            // Log submission
            recordSubmission();
        });
    });
});

function containsMaliciousCode(str) {
    const pattern = /<script\b[^>]*>([\s\S]*?)<\/script>|<[^>]+>/gmi;
    // Simple check for <script> or specific HTML tags
    return pattern.test(str);
}

function isRateLimited() {
    const submissions = JSON.parse(localStorage.getItem('gistic_submissions') || '[]');
    const now = Date.now();
    
    // Clean old submissions (> 1 hour)
    const recentSubmissions = submissions.filter(time => now - time < 3600000);
    localStorage.setItem('gistic_submissions', JSON.stringify(recentSubmissions));

    // Check limit
    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
        return true;
    }
    
    // Check immediate frequency
    if (recentSubmissions.length > 0 && (now - recentSubmissions[recentSubmissions.length - 1]) < RATE_LIMIT_TIME) {
        return true;
    }

    return false;
}

function recordSubmission() {
    const submissions = JSON.parse(localStorage.getItem('gistic_submissions') || '[]');
    submissions.push(Date.now());
    localStorage.setItem('gistic_submissions', JSON.stringify(submissions));
}
