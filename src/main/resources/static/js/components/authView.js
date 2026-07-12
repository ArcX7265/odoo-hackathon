// TransitOps Auth View Component (View 0)
export const AuthView = {
    render: (container, appState, onLoginSuccess, showToast) => {
        container.innerHTML = `
            <div class="to-auth-container">
                <div class="to-card">
                    <div class="to-auth-header">
                        <div class="to-auth-logo">TransitOps</div>
                        <p class="to-subtitle" style="margin-bottom: 0.5rem;">Smart Transport Operations Platform</p>
                    </div>
                    
                    <form id="auth-login-form">
                        <div class="to-form-group">
                            <label class="to-label" for="login-email">Email Address</label>
                            <input class="to-input" type="email" id="login-email" required placeholder="name@transitops.com">
                        </div>
                        
                        <div class="to-form-group">
                            <label class="to-label" for="login-password">Password</label>
                            <input class="to-input" type="password" id="login-password" required placeholder="••••••••">
                        </div>
                        
                        <div class="to-form-group">
                            <label class="to-label" for="login-role">Persona Selector (for judging)</label>
                            <select class="to-select" id="login-role">
                                <option value="Fleet Manager">Fleet Manager</option>
                                <option value="Driver">Driver</option>
                                <option value="Safety Officer">Safety Officer</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="to-btn to-btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.75rem;">
                            Sign In
                        </button>
                    </form>

                    <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <p class="to-label" style="text-align: center; font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.75rem;">
                            Quick-Swap Judge Personas
                        </p>
                        <div class="to-persona-selector-grid">
                            <button class="to-persona-pill" data-email="manager@transitops.com" data-role="Fleet Manager">Manager</button>
                            <button class="to-persona-pill" data-email="driver@transitops.com" data-role="Driver">Driver</button>
                            <button class="to-persona-pill" data-email="safety@transitops.com" data-role="Safety Officer">Safety</button>
                            <button class="to-persona-pill" data-email="finance@transitops.com" data-role="Financial Analyst">Finance</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const form = container.querySelector('#auth-login-form');
        const emailInput = container.querySelector('#login-email');
        const passwordInput = container.querySelector('#login-password');
        const roleSelect = container.querySelector('#login-role');
        const personaPills = container.querySelectorAll('.to-persona-pill');

        // Setup persona pills click handler
        personaPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const email = pill.getAttribute('data-email');
                const role = pill.getAttribute('data-role');
                
                emailInput.value = email;
                passwordInput.value = 'password';
                roleSelect.value = role;
                
                showToast(`Filled fields for: ${role}`, 'warning');
            });
        });

        // Setup form submission handler
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showToast('Login Successful!', 'success');
                    onLoginSuccess(data);
                } else {
                    showToast(data.message || 'Login failed. Please check credentials.', 'danger');
                }
            } catch (err) {
                console.error('Error logging in:', err);
                showToast('Server connection error. Is the API running?', 'danger');
            }
        });
    }
};
