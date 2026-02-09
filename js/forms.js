/**
 * GISTIC Services - Forms Handling
 * Specific logic for form interactions and submissions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle URL Success/Error Params globally for clean user feedback
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('success') === 'true' || urlParams.get('sent') === 'true') {
        showSuccessNotification("Submission Received! We will contact you shortly.");
        // Clear URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('error') === 'true') {
        showErrorNotification("Something went wrong. Please try again.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('applied') === 'true') {
        showSuccessNotification("Application submitted successfully. Check your email.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. File Upload Feedback (Global)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                // Find parent wrapper (for custom file inputs)
                const wrapper = input.closest('div.relative');
                if (wrapper) {
                    // Update text
                    const textElement = wrapper.querySelector('p');
                    if (textElement) {
                        textElement.textContent = `Selected: ${fileName}`;
                        textElement.classList.add('text-brand-green', 'font-bold');
                    }
                    // Update icon
                    const icon = wrapper.querySelector('i');
                    if (icon) {
                        icon.className = 'uil uil-check-circle text-3xl text-brand-green';
                    }
                    // Update border
                    wrapper.classList.remove('border-gray-300', 'border-dashed');
                    wrapper.classList.add('border-brand-green', 'bg-green-50');
                } else {
                    // Standard input: Add success styling (green border)
                    input.classList.add('border-brand-green', 'bg-green-50');
                    input.classList.remove('border-gray-300');
                    
                    // Optional: Add a small success message below if not present
                    let successMsg = input.parentNode.querySelector('.file-success-msg');
                    if (!successMsg) {
                        successMsg = document.createElement('p');
                        successMsg.className = 'file-success-msg text-xs text-brand-green mt-1 font-bold';
                        input.parentNode.appendChild(successMsg);
                    }
                    successMsg.textContent = `✓ Attached: ${fileName}`;
                }
            }
        });
    });
});

function showSuccessNotification(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-brand-green text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50';
    toast.innerHTML = `<i class="uil uil-check-circle text-2xl"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

function showErrorNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50';
    toast.innerHTML = `<i class="uil uil-exclamation-triangle text-2xl"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}
