/**
 * GISTIC Services - Authentication Logic
 * Simulated authentication for workers and admin.
 */

const APPROVED_USERS = [
    { email: 'gisticservice@gmail.com', role: 'admin', name: 'GISTIC Admin' },
    { email: 'worker@gistic.com', role: 'worker', name: 'John Doe (Electrician)' }
];

const PENDING_USERS = [
    { email: 'new@gistic.com', role: 'worker', name: 'Jane Smith' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gistic_user'));
    if (user) {
        updateUIForUser(user);
    }

    // Login Button Listener (Generic class for any login button)
    const loginBtns = document.querySelectorAll('.login-btn, [href="login.html"]'); // Handle diverse selectors
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    });

    // Create Modal if it doesn't exist
    if (!document.getElementById('auth-modal')) {
        createAuthModal();
    }
});

function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fade-in text-center">
            <button id="close-auth" class="absolute top-4 right-4 text-gray-400 hover:text-red-500"><i class="uil uil-multiply text-2xl"></i></button>
            <div class="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green">
                <i class="uil uil-lock text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2">Worker Portal</h3>
            <p class="text-gray-500 mb-6 text-sm">Enter your credentials to access the internal dashboard.</p>
            
            <form id="auth-form" class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                    <input type="email" id="auth-email" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-green focus:border-brand-green">
                </div>
                <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                    <input type="password" id="auth-password" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-green focus:border-brand-green">
                </div>
                <button type="submit" class="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition shadow-lg mt-2">
                    Sign In
                </button>
            </form>
            <p id="auth-error" class="text-red-500 text-xs mt-4 hidden"></p>
            <p class="text-xs text-gray-400 mt-4">Forgot password? Contact HR.</p>
        </div>
    `;
    document.body.appendChild(modal);

    // Event Listeners
    document.getElementById('close-auth').addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value; // In real app, hash this!
        
        attemptLogin(email, password);
    });
}

function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function attemptLogin(email, password) {
    // Simulated Backend Logic
    const errorMsg = document.getElementById('auth-error');
    
    // 1. Check if user exists in "DB"
    const approvedUser = APPROVED_USERS.find(u => u.email === email);
    const pendingUser = PENDING_USERS.find(u => u.email === email);

    if (pendingUser) {
        errorMsg.innerText = "Account Pending Approval. Please check your email for status updates.";
        errorMsg.classList.remove('hidden');
        return;
    }

    if (approvedUser) {
        // Mock password check
        if (password === 'password123') { // Simple mock password
            loginUser(approvedUser);
            document.getElementById('auth-modal').classList.add('hidden');
        } else {
            errorMsg.innerText = "Invalid credentials.";
            errorMsg.classList.remove('hidden');
        }
    } else {
        errorMsg.innerText = "User not found or not authorized.";
        errorMsg.classList.remove('hidden');
    }
}

function loginUser(user) {
    localStorage.setItem('gistic_user', JSON.stringify(user));
    alert(`Welcome back, ${user.name}! Administrative features enabled.`);
    updateUIForUser(user);
    // Reload if on reviews page to show delete buttons
    if (window.location.pathname.includes('reviews.html')) {
        window.location.reload();
    }
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('gistic_user');
        window.location.reload();
    }
}

function updateUIForUser(user) {
    const loginBtns = document.querySelectorAll('.login-btn');
    loginBtns.forEach(btn => {
        if (user) {
            btn.innerHTML = `<i class="uil uil-sign-out-alt"></i> Logout (${user.role})`;
            btn.classList.add('bg-red-50', 'text-red-600');
            btn.classList.remove('text-gray-300');
            btn.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            // Reset to default if needed (though reload handles this mostly)
            btn.innerHTML = `Staff Portal`;
            btn.onclick = (e) => {
                e.preventDefault();
                showLoginModal();
            };
        }
    });
}
