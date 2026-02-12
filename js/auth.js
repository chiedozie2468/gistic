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
                                <button onclick="selectRole('staff')" class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                                    <i class="uil uil-briefcase mr-2"></i>
                                    <span>Staff Member</span>
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
            
            // Show loading state
            showLoadingState();
            
            // Simulate API call
            setTimeout(() => {
                // Show login form based on selected role
                if (role === 'admin') {
                    showAdminLogin();
                } else if (role === 'staff') {
                    showStaffLogin();
                }
            }, 1500);
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
