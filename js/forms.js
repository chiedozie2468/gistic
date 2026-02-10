/**
 * GISTIC Services - Forms Handling
 * Complete local handling (No redirects to other sites)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create a hidden iframe for file submissions (keeps user on page)
    const hiddenIframe = document.createElement('iframe');
    hiddenIframe.id = 'form_submit_iframe';
    hiddenIframe.name = 'form_submit_iframe';
    hiddenIframe.style.display = 'none';
    document.body.appendChild(hiddenIframe);

    // 2. Global Feedback Helper (Cleanup URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') || urlParams.get('sent') || urlParams.get('applied')) {
        showSuccessNotification("Submitted Successfully! We will contact you shortly.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 3. File Upload UI Feedback
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                const wrapper = input.closest('div.relative') || input.closest('div.border-2');
                if (wrapper) {
                    const textElement = wrapper.querySelector('p');
                    if (textElement) {
                        textElement.textContent = `Attached: ${fileName}`;
                        textElement.classList.add('text-brand-green', 'font-bold');
                    }
                    const icon = wrapper.querySelector('i');
                    if (icon) icon.className = 'uil uil-check-circle text-3xl text-brand-green';
                    wrapper.classList.remove('border-gray-300', 'border-dashed');
                    wrapper.classList.add('border-brand-green', 'bg-green-50');
                }
            }
        });
    });

    // 4. Handle ALL Forms
    const allForms = document.querySelectorAll('form[action^="https://formsubmit.co"]');
    allForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const hasFiles = form.querySelector('input[type="file"]');
            
            if (hasFiles) {
                // SOLUTION FOR FILES: Submit via hidden iframe
                // This keeps user on the current page while sending files to FormSubmit
                form.target = 'form_submit_iframe';
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.innerHTML : 'Send';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="uil uil-spinner-alt animate-spin text-xl"></i> Sending...`;
                }

                // Listen for iframe load (meaning submission finished)
                hiddenIframe.onload = function() {
                    showSuccessNotification("Submitted Successfully! Check your email for confirmation.");
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                    // Reset UI for file inputs
                    const fileSuccessMsgs = form.querySelectorAll('p.text-brand-green');
                    fileSuccessMsgs.forEach(p => p.textContent = "Upload File");
                    
                    // Specific logic for modals
                    if (typeof closeServiceModal === 'function') setTimeout(closeServiceModal, 2000);
                    
                    hiddenIframe.onload = null; // Clean up
                };
            } else {
                // STANDARD AJAX (For text-only forms)
                e.preventDefault();
                handleAjaxSubmit(form);
            }
        });
    });
});

async function handleAjaxSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="uil uil-spinner-alt animate-spin text-xl"></i> Sending...`;
    }

    try {
        const formData = new FormData(form);
        const actionUrl = form.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");

        const response = await fetch(actionUrl, {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        const result = await response.json();

        if (response.ok || result.success === "true") {
            showSuccessNotification("Submitted Successfully! We will contact you shortly.");
            form.reset();
            if (form.id === 'booking-form' && typeof closeServiceModal === 'function') setTimeout(closeServiceModal, 2000);
            if (form.id === 'review-form' && typeof renderReviews === 'function') renderReviews(); 
        } else {
            showErrorNotification("Submission failed. Please try again.");
        }
    } catch (error) {
        showErrorNotification("Network error. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

function showSuccessNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-brand-green text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-[150] font-bold';
    toast.innerHTML = `<i class="uil uil-check-circle text-2xl"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.5s ease-out';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

function showErrorNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-[150] font-bold';
    toast.innerHTML = `<i class="uil uil-exclamation-triangle text-2xl"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.5s ease-out';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}
