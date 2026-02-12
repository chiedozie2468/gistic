/**
 * GISTIC Services - Authentication Logic
 * Simulated authentication for workers and admin.
 */

const APPROVED_USERS = [
    { email: 'gisticservice@gmail.com', role: 'admin', name: 'GISTIC Admin' }
];

const PENDING_USERS = []; // Removed legacy mock users

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gistic_user'));
    if (user) {
        updateUIForUser(user);
    }

    // Login Button Listener
    const loginBtns = document.querySelectorAll('.login-btn, [href="login.html"]');
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    });

    if (!document.getElementById('auth-modal')) {
        createAuthModal();
    }
});

function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fade-in text-center border-t-4 border-brand-green">
            <button id="close-auth" class="absolute top-4 right-4 text-gray-400 hover:text-red-500"><i class="uil uil-multiply text-2xl"></i></button>
            <div class="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green">
                <i class="uil uil-shield-check text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2">Admin & Staff Portal</h3>
            <p class="text-gray-500 mb-6 text-sm">Sign in to moderate reviews or join our community.</p>
            
            <form id="auth-form" class="space-y-4 text-left">
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Admin Email</label>
                    <input type="email" id="auth-email" required placeholder="gisticservice@gmail.com" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-green focus:border-brand-green outline-none">
                </div>
                <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                    <input type="password" id="auth-password" required placeholder="••••••••" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-green focus:border-brand-green outline-none">
                </div>
                <button type="submit" class="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition shadow-lg mt-2">
                    Enter Portal
                </button>
            </form>
            
            <div id="auth-error" class="text-red-500 text-xs mt-4 hidden"></div>

            <div class="mt-8 pt-6 border-t border-gray-100">
                 <p class="text-xs text-gray-400 mb-4">The Worker Portal is currently under development.</p>
                 <a href="https://wa.me/message/MFXCC37BZHUDF1" target="_blank" class="flex items-center justify-center gap-2 bg-green-50 text-green-600 font-bold py-2 rounded-xl hover:bg-green-100 transition">
                    <i class="uil uil-whatsapp"></i>
                    Join the Group Chat
                 </a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-auth').addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value; 
        attemptLogin(email, password);
    });
}

function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function attemptLogin(email, password) {
    const errorMsg = document.getElementById('auth-error');
    
    // Admin Check
    if (email === 'gisticservice@gmail.com' && password === '070733gistic') {
        loginUser({ email: 'gisticservice@gmail.com', role: 'admin', name: 'GISTIC Admin' });
        document.getElementById('auth-modal').classList.add('hidden');
        return;
    }

    // Worker Notification
    if (email.includes('@')) {
         errorMsg.innerHTML = `
            <div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-left">
                <strong>Portal Not Ready:</strong> This feature is launching before the end of the year. 
                <a href="https://wa.me/message/MFXCC37BZHUDF1" target="_blank" class="underline font-bold block mt-1">Join the Group Chat instead</a>
            </div>
         `;
         errorMsg.classList.remove('hidden');
    } else {
        errorMsg.innerText = "Invalid credentials.";
        errorMsg.classList.remove('hidden');
    }
}

// Function to show role selection modal
function showRoleSelection() {
    const modal = document.createElement('div');
    modal.id = 'role-selection-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in">
                <button onclick="closeRoleSelection()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-2 shadow-lg">
                        <i class="uil uil-multiply text-xl"></i>
                    </button>
                    
                    <div class="p-8">
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                <i class="uil uil-users-alt text-3xl text-white"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-4">Choose Your Role</h3>
                            <p class="text-gray-600 mb-6">Select your role to continue to the worker portal.</p>
                            
                            <div class="space-y-4">
                                <button onclick="selectRole('admin')" class="w-full bg-gradient-to-r from-brand-green to-brand-dark text-white px-6 py-4 rounded-lg font-bold hover:bg-brand-light transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                                    <i class="uil uil-shield-check mr-2"></i>
                                    <span>Administrator</span>
                                </button>
                                <button onclick="selectRole('worker')" class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                                    <i class="uil uil-briefcase mr-2"></i>
                                    <span>Worker/Staff</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);
}

// Function to close role selection modal
function closeRoleSelection() {
    const modal = document.getElementById('role-selection-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to select role
function selectRole(role) {
    const modal = document.getElementById('role-selection-modal');
    if (modal) {
        modal.remove();
    }
    
    // Store selected role
    localStorage.setItem('selectedRole', role);
    
    if (role === 'admin') {
        // Show loading state
        showLoadingState();
        
        // Simulate API call
        setTimeout(() => {
            showAdminLogin();
        }, 1500);
    } else if (role === 'worker') {
        // Show worker not ready message
        showWorkerNotReady();
    }
}

// Function to show loading state
function showLoadingState() {
    const modal = document.createElement('div');
    modal.id = 'loading-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center">
            <div class="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                <i class="uil uil-spinner text-2xl text-brand-green"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-800">Loading...</h4>
            <p class="text-gray-600">Please wait while we prepare your login.</p>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) {
            loadingModal.remove();
        }
    }, 2000);
}

// Function to show worker not ready message
function showWorkerNotReady() {
    const modal = document.createElement('div');
    modal.id = 'worker-not-ready-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in">
            <button onclick="closeWorkerNotReady()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-2 shadow-lg">
                <i class="uil uil-multiply text-xl"></i>
            </button>
            
            <div class="p-8">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="uil uil-constructor text-3xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
                    <p class="text-gray-600 mb-6">The Worker Portal is currently under development and will be available soon.</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-blue-700 text-sm font-medium mb-2">Stay Connected:</p>
                        <p class="text-blue-600 text-sm">Join our WhatsApp group to get updates when the portal launches.</p>
                        <a href="https://wa.me/message/MFXCC37BZHUDF1" target="_blank" class="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition mt-3">
                            <i class="uil uil-whatsapp"></i>
                            Join Group Chat
                        </a>
                    </div>
                    
                    <button onclick="closeWorkerNotReady()" class="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                        Got it, Thanks!
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to close worker not ready modal
function closeWorkerNotReady() {
    const modal = document.getElementById('worker-not-ready-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to show admin login
function showAdminLogin() {
    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in">
            <button onclick="closeAdminLogin()" class="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-all duration-300 z-20 bg-white rounded-full p-2 shadow-lg">
                <i class="uil uil-multiply text-xl"></i>
            </button>
            
            <div class="p-8">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-dark rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="uil uil-shield-check text-3xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Admin Login</h3>
                    <p class="text-gray-600 mb-6">Sign in with your GISTIC admin credentials to manage reviews.</p>
                    
                    <form onsubmit="handleAdminLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                            <input type="email" name="email" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" placeholder="gisticservice@gmail.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" name="password" required class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none" placeholder="Enter admin password">
                        </div>
                        <button type="submit" class="w-full bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-dark transition shadow-lg flex items-center justify-center gap-2">
                            <i class="uil uil-sign-in-alt mr-2"></i>
                            Sign In as Admin
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to close admin login modal
function closeAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[name="email"]').value;
    const password = event.target.querySelector('input[name="password"]').value;
    
    // Check admin credentials
    if (email === 'gisticservice@gmail.com' && password === '070733gistic') {
        // Login successful
        localStorage.setItem('gistic_user', JSON.stringify({
            email: 'gisticservice@gmail.com',
            role: 'admin',
            name: 'GISTIC Admin'
        }));
        closeAdminLogin();
        showSuccessMessage('Admin login successful! Redirecting to reviews...');
        
        // Redirect to reviews page
        setTimeout(() => {
            window.location.href = 'reviews.html';
        }, 2000);
    } else {
        // Login failed
        showErrorMessage('Invalid admin credentials. Please try again.');
    }
}

// Function to show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
    successDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="uil uil-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Function to show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
    errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="uil uil-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function loginUser(user) {
    localStorage.setItem('gistic_user', JSON.stringify(user));
    
    if (user.email === 'gisticservice@gmail.com') {
        alert(`ADMIN ACCESS GRANTED\n\nTo delete a review:\n1. Open the "Reviews" page.\n2. Look for the RED TRASH ICON on each review.\n3. Click it to permanently remove the review.`);
    }
    
    updateUIForUser(user);
    if (window.location.pathname.includes('reviews.html')) {
        window.location.reload();
    } else {
        window.location.href = 'reviews.html'; // Redirect to moderator page
    }
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('gistic_user');
        window.location.href = 'index.html';
    }
}

function updateUIForUser(user) {
    const loginBtns = document.querySelectorAll('.login-btn');
    loginBtns.forEach(btn => {
        if (user) {
            btn.innerHTML = `<i class="uil uil-user-circle"></i> Logged in as ${user.name} (Logout)`;
            btn.classList.add('bg-brand-green/10', 'text-brand-green');
            btn.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            btn.innerHTML = `Staff Portal`;
            btn.onclick = (e) => {
                e.preventDefault();
                showLoginModal();
            };
        }
    });
}
