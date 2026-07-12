// TransitOps Orchestrator and Route Manager
import { AuthView } from './components/authView.js';
import { FleetView } from './components/fleetView.js';
import { DriverView } from './components/driverView.js';

const App = {
    state: {
        user: null, // { email, role }
        currentView: 'auth' // 'auth', 'fleet', 'driver'
    },

    init: async () => {
        // Apply body class for base theme mapping
        document.body.classList.add('transitops-theme');

        // Dynamically load the style sheet if not already added to document head
        if (!document.querySelector('link[href*="styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/styles.css';
            document.head.appendChild(link);
        }

        // Add toast container to body
        if (!document.getElementById('to-toast-container')) {
            const container = document.createElement('div');
            container.id = 'to-toast-container';
            container.className = 'to-toast-container';
            document.body.appendChild(container);
        }

        // Check if user has an active session
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const userData = await res.json();
                App.state.user = userData;
                App.state.currentView = 'fleet'; // default view when logged in
            } else {
                App.state.user = null;
                App.state.currentView = 'auth';
            }
        } catch (err) {
            console.error('Session check failed:', err);
            App.state.user = null;
            App.state.currentView = 'auth';
        }

        App.render();
    },

    showToast: (message, type = 'info') => {
        const container = document.getElementById('to-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `to-toast to-toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = '✓';
        else if (type === 'danger') icon = '⚠';
        else if (type === 'warning') icon = '⚡';
        else icon = 'ℹ';

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 700; font-size: 1.1rem;">${icon}</span>
                <span>${message}</span>
            </div>
            <span style="cursor: pointer; margin-left: 1rem; opacity: 0.5;" onclick="this.parentElement.remove()">&times;</span>
        `;

        container.appendChild(toast);

        // Auto remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // Handles quick-swap in the header
    handleQuickSwap: async (newRole) => {
        let email = '';
        if (newRole === 'Fleet Manager') email = 'manager@transitops.com';
        else if (newRole === 'Driver') email = 'driver@transitops.com';
        else if (newRole === 'Safety Officer') email = 'safety@transitops.com';
        else if (newRole === 'Financial Analyst') email = 'finance@transitops.com';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password: 'password' })
            });

            const data = await response.json();

            if (response.ok) {
                App.state.user = data;
                App.showToast(`Swapped to: ${newRole}`, 'success');
                App.render();
            } else {
                App.showToast('Failed to swap personas', 'danger');
            }
        } catch (err) {
            console.error(err);
            App.showToast('Network error during persona swap', 'danger');
        }
    },

    handleLogout: async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                App.state.user = null;
                App.state.currentView = 'auth';
                App.showToast('Signed out successfully', 'success');
                App.render();
            } else {
                App.showToast('Logout failed', 'danger');
            }
        } catch (err) {
            console.error(err);
            App.showToast('Network error on logout', 'danger');
        }
    },

    render: () => {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Target container <main id="content-area"> not found in page.');
            return;
        }

        // If user is not authenticated, load the Auth view
        if (!App.state.user) {
            AuthView.render(
                contentArea,
                App.state,
                (userData) => {
                    App.state.user = userData;
                    App.state.currentView = 'fleet';
                    App.render();
                },
                App.showToast
            );
            return;
        }

        // User is logged in: build the layout wrapper inside <main id="content-area">
        // It includes a navigation header bar and the active tab panel.
        contentArea.innerHTML = `
            <header class="to-card" style="border-radius: 0 0 12px 12px; margin-bottom: 2rem; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark);">
                <div style="display: flex; align-items: center; gap: 2rem;">
                    <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        TransitOps
                    </div>
                    <nav style="display: flex; gap: 0.5rem;">
                        <button id="nav-fleet-tab" class="to-btn ${App.state.currentView === 'fleet' ? 'to-btn-primary' : 'to-btn-secondary'}" style="padding: 0.5rem 1rem;">
                            Fleet Registry
                        </button>
                        <button id="nav-driver-tab" class="to-btn ${App.state.currentView === 'driver' ? 'to-btn-primary' : 'to-btn-secondary'}" style="padding: 0.5rem 1rem;">
                            Driver Profiles
                        </button>
                    </nav>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="text-align: right; font-size: 0.85rem;">
                        <span style="color: #9ca3af;">Signed in as </span>
                        <strong style="color: #ffffff;">${App.state.user.email}</strong>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <label for="header-role-swap" style="font-size: 0.75rem; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Role:</label>
                        <select id="header-role-swap" class="to-select" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; font-size: 0.8rem; width: auto; background-color: var(--bg-card);">
                            <option value="Fleet Manager" ${App.state.user.role === 'Fleet Manager' ? 'selected' : ''}>Fleet Manager</option>
                            <option value="Driver" ${App.state.user.role === 'Driver' ? 'selected' : ''}>Driver</option>
                            <option value="Safety Officer" ${App.state.user.role === 'Safety Officer' ? 'selected' : ''}>Safety Officer</option>
                            <option value="Financial Analyst" ${App.state.user.role === 'Financial Analyst' ? 'selected' : ''}>Financial Analyst</option>
                        </select>
                    </div>

                    <button id="header-logout" class="to-btn to-btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        Sign Out
                    </button>
                </div>
            </header>

            <div id="view-mount-point"></div>
        `;

        // Bind header navigation handlers
        const fleetTab = contentArea.querySelector('#nav-fleet-tab');
        const driverTab = contentArea.querySelector('#nav-driver-tab');
        const logoutBtn = contentArea.querySelector('#header-logout');
        const roleSelector = contentArea.querySelector('#header-role-swap');
        const mountPoint = contentArea.querySelector('#view-mount-point');

        fleetTab.addEventListener('click', () => {
            App.state.currentView = 'fleet';
            App.render();
        });

        driverTab.addEventListener('click', () => {
            App.state.currentView = 'driver';
            App.render();
        });

        logoutBtn.addEventListener('click', () => {
            App.handleLogout();
        });

        roleSelector.addEventListener('change', (e) => {
            App.handleQuickSwap(e.target.value);
        });

        // Render active panel in the mount point
        if (App.state.currentView === 'fleet') {
            FleetView.render(mountPoint, App.state, App.showToast);
        } else if (App.state.currentView === 'driver') {
            DriverView.render(mountPoint, App.state, App.showToast);
        }
    }
};

// Initialize App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

export default App;
