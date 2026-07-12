// TransitOps Driver Profiles View Component (View 3)
export const DriverView = {
    render: async (container, appState, showToast) => {
        const canWrite = appState.user && (appState.user.role === 'Fleet Manager' || appState.user.role === 'Safety Officer');
        
        container.innerHTML = `
            <div class="to-container">
                <div class="to-flex-between">
                    <div>
                        <h1 class="to-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Driver Profiles
                        </h1>
                        <p class="to-subtitle">Monitor security compliance, license validity, safety records, and dispatch statuses.</p>
                    </div>
                    <div>
                        ${canWrite ? `
                            <button id="btn-add-driver" class="to-btn to-btn-primary" style="background-color: var(--color-accent); border-color: var(--color-accent);">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add Driver
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="to-card" style="margin-bottom: 2rem; padding: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div class="to-search-bar" style="flex-grow: 1; max-width: none;">
                            <input class="to-input" type="text" id="driver-search" placeholder="Search by Driver Name or License Number...">
                        </div>
                        <button id="btn-search-driver" class="to-btn to-btn-secondary">Search</button>
                        <button id="btn-clear-driver" class="to-btn to-btn-secondary">Reset</button>
                    </div>
                </div>

                <div class="to-card" style="margin-bottom: 2rem; padding: 1rem;">
                    <h3 style="margin-top: 0; margin-bottom: 1rem;">Driver Safety Overview</h3>
                    <div class="chart-container" style="position: relative; height: 250px; width: 100%;">
                        <canvas id="driverSafetyChart"></canvas>
                    </div>
                </div>

                <div class="to-grid" id="drivers-grid">
                    <div style="grid-column: 1 / -1; text-align: center; color: #9ca3af; padding: 3rem 0;">
                        Loading driver profiles...
                    </div>
                </div>

                <!-- Add Driver Modal -->
                <div class="to-modal-overlay" id="add-driver-modal">
                    <div class="to-modal">
                        <div class="to-modal-header">
                            <h3 class="to-modal-title">Register New Operator</h3>
                            <button class="to-modal-close" id="modal-close-driver">&times;</button>
                        </div>
                        <form id="add-driver-form">
                            <div class="to-form-group">
                                <label class="to-label" for="drv-name">Full Name *</label>
                                <input class="to-input" type="text" id="drv-name" required placeholder="e.g. Alex Johnson">
                                <span class="error-msg" id="err-drv-name" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-license">License Number *</label>
                                <input class="to-input" type="text" id="drv-license" required placeholder="e.g. DL-908123">
                                <span class="error-msg" id="err-drv-license" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-category">License Category (Class) *</label>
                                <input class="to-input" type="text" id="drv-category" required placeholder="e.g. Class A CDL">
                                <span class="error-msg" id="err-drv-category" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-expiry">License Expiry Date *</label>
                                <input class="to-input" type="date" id="drv-expiry" required>
                                <span class="error-msg" id="err-drv-expiry" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-contact">Contact Number *</label>
                                <input class="to-input" type="text" id="drv-contact" required placeholder="e.g. +1-555-0199">
                                <span class="error-msg" id="err-drv-contact" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-score">Safety Score (0 - 100) *</label>
                                <input class="to-input" type="number" id="drv-score" min="0" max="100" required placeholder="100">
                                <span class="error-msg" id="err-drv-score" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="drv-status">Operator Status</label>
                                <select class="to-select" id="drv-status">
                                    <option value="Available">Available</option>
                                    <option value="On Trip">On Trip</option>
                                    <option value="Off Duty">Off Duty</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                            
                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                                <button type="button" class="to-btn to-btn-secondary" id="btn-cancel-driver">Cancel</button>
                                <button type="submit" class="to-btn to-btn-primary" style="background-color: var(--color-accent); border-color: var(--color-accent);">Register Driver</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Cache elements
        const grid = container.querySelector('#drivers-grid');
        const searchInput = container.querySelector('#driver-search');
        const searchBtn = container.querySelector('#btn-search-driver');
        const clearBtn = container.querySelector('#btn-clear-driver');
        const modal = container.querySelector('#add-driver-modal');
        const addBtn = container.querySelector('#btn-add-driver');
        const cancelBtn = container.querySelector('#btn-cancel-driver');
        const closeBtn = container.querySelector('#modal-close-driver');
        const form = container.querySelector('#add-driver-form');

        // Status Badge Helper
        const getStatusBadge = (status) => {
            switch (status) {
                case 'Available':
                    return `<span class="to-badge to-badge-available">${status}</span>`;
                case 'On Trip':
                    return `<span class="to-badge to-badge-trip">${status}</span>`;
                case 'Off Duty':
                    return `<span class="to-badge to-badge-off-duty">${status}</span>`;
                case 'Suspended':
                    return `<span class="to-badge to-badge-suspended">${status}</span>`;
                default:
                    return `<span class="to-badge">${status}</span>`;
            }
        };

        // Score Bar Color Class Helper
        const getScoreColor = (score) => {
            if (score >= 90) return 'var(--color-success)';
            if (score >= 75) return 'var(--color-primary)';
            if (score >= 50) return 'var(--color-accent)';
            return 'var(--color-danger)';
        };

        // Fetch & Load Drivers data
        const loadDrivers = async (searchQuery = '') => {
            try {
                grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #9ca3af; padding: 3rem 0;">Loading drivers...</div>`;
                
                let url = '/api/drivers';
                if (searchQuery) {
                    url += `?search=${encodeURIComponent(searchQuery)}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch drivers');
                }

                const drivers = await response.json();
                
                if (drivers.length === 0) {
                    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #9ca3af; padding: 3rem 0;">No drivers found</div>`;
                    return;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                grid.innerHTML = drivers.map(d => {
                    // Check for expiry date
                    let isExpired = false;
                    let formattedExpiry = 'N/A';
                    if (d.licenseExpiryDate) {
                        const expDate = new Date(d.licenseExpiryDate);
                        isExpired = expDate < today;
                        formattedExpiry = expDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                    }

                    const isSuspended = d.status === 'Suspended';
                    const showDanger = isExpired || isSuspended;

                    // Compute score indicators
                    const safety = d.safetyScore || 0;
                    const safetyColor = getScoreColor(safety);

                    return `
                        <div class="to-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                                    <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: #ffffff; margin: 0;">${d.name}</h4>
                                    ${getStatusBadge(d.status)}
                                </div>

                                <div style="font-size: 0.825rem; color: #9ca3af; line-height: 1.5; margin-bottom: 1rem;">
                                    <div><strong>License:</strong> ${d.licenseNumber} (${d.licenseCategory || 'N/A'})</div>
                                    <div><strong>Expiry:</strong> <span style="${isExpired ? 'color: var(--color-danger); font-weight:600;' : ''}">${formattedExpiry}</span></div>
                                    <div><strong>Contact:</strong> ${d.contactNumber || 'N/A'}</div>
                                </div>

                                <div class="to-score-meter">
                                    <span style="font-size: 0.75rem; font-weight: 600; color: #9ca3af; min-width: 75px;">Safety Score:</span>
                                    <div class="to-score-bar">
                                        <div class="to-score-fill" style="width: ${safety}%; background-color: ${safetyColor};"></div>
                                    </div>
                                    <span style="font-size: 0.8rem; font-weight: 700; color: ${safetyColor}">${safety}</span>
                                </div>

                                ${showDanger ? `
                                    <div class="to-danger-indicator">
                                        <span class="to-pulse-dot"></span>
                                        <span>
                                            ${isSuspended ? 'Critical: Status is Suspended.' : ''}
                                            ${isExpired ? 'Critical: License has Expired!' : ''}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${canWrite ? `
                                <div style="margin-top: 1.5rem; text-align: right; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                                    <button class="to-btn to-btn-danger btn-delete-driver" data-id="${d.id}" data-name="${d.name}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                        Remove Operator
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                // Hook up delete buttons
                if (canWrite) {
                    grid.querySelectorAll('.btn-delete-driver').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const id = btn.getAttribute('data-id');
                            const name = btn.getAttribute('data-name');
                            
                            if (confirm(`Are you sure you want to delete driver profiles for ${name}?`)) {
                                try {
                                    const delRes = await fetch(`/api/drivers/${id}`, {
                                        method: 'DELETE'
                                    });
                                    if (delRes.ok) {
                                        showToast(`Removed driver ${name}`, 'success');
                                        loadDrivers(searchInput.value);
                                    } else {
                                        const errData = await delRes.json();
                                        showToast(errData.message || 'Failed to remove driver', 'danger');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    showToast('Network error while deleting', 'danger');
                                }
                            }
                        });
                    });
                }
                
                // Render Chart
                const chartCtx = container.querySelector('#driverSafetyChart');
                if (chartCtx) {
                    if (appState.driverChartInstance) {
                        appState.driverChartInstance.destroy();
                    }
                    
                    const excellentCount = drivers.filter(d => (d.safetyScore || 0) >= 90).length;
                    const goodCount = drivers.filter(d => (d.safetyScore || 0) >= 75 && (d.safetyScore || 0) < 90).length;
                    const avgCount = drivers.filter(d => (d.safetyScore || 0) >= 50 && (d.safetyScore || 0) < 75).length;
                    const poorCount = drivers.filter(d => (d.safetyScore || 0) < 50).length;
                    
                    appState.driverChartInstance = new Chart(chartCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Excellent (90-100)', 'Good (75-89)', 'Average (50-74)', 'Poor (<50)'],
                            datasets: [{
                                label: 'Number of Drivers',
                                data: [excellentCount, goodCount, avgCount, poorCount],
                                backgroundColor: [
                                    'rgba(16, 185, 129, 0.8)', // Success
                                    'rgba(59, 130, 246, 0.8)', // Primary
                                    'rgba(245, 158, 11, 0.8)', // Warning/Accent
                                    'rgba(239, 68, 68, 0.8)'   // Danger
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { stepSize: 1, color: '#94a3b8' },
                                    grid: { color: '#334155' }
                                },
                                x: {
                                    ticks: { color: '#94a3b8' },
                                    grid: { display: false }
                                }
                            }
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--color-danger); padding: 3rem 0;">Error fetching driver registry</div>`;
            }
        };

        // Modal triggering
        if (canWrite && addBtn) {
            addBtn.addEventListener('click', () => {
                form.reset();
                container.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
                modal.classList.add('active');
            });
        }

        const closeModal = () => {
            modal.classList.remove('active');
        };

        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Search triggering
        searchBtn.addEventListener('click', () => loadDrivers(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadDrivers(searchInput.value);
            }
        });
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            loadDrivers();
        });

        // Form submission and validation
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const name = container.querySelector('#drv-name');
            const license = container.querySelector('#drv-license');
            const category = container.querySelector('#drv-category');
            const expiry = container.querySelector('#drv-expiry');
            const contact = container.querySelector('#drv-contact');
            const score = container.querySelector('#drv-score');
            const status = container.querySelector('#drv-status');

            container.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

            if (!name.value.trim()) {
                const err = container.querySelector('#err-drv-name');
                err.textContent = 'Name is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (!license.value.trim()) {
                const err = container.querySelector('#err-drv-license');
                err.textContent = 'License number is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (!category.value.trim()) {
                const err = container.querySelector('#err-drv-category');
                err.textContent = 'License category is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (!expiry.value) {
                const err = container.querySelector('#err-drv-expiry');
                err.textContent = 'License expiry date is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (!contact.value.trim()) {
                const err = container.querySelector('#err-drv-contact');
                err.textContent = 'Contact number is required';
                err.style.display = 'block';
                isValid = false;
            }

            const safetyScoreVal = parseInt(score.value);
            if (isNaN(safetyScoreVal) || safetyScoreVal < 0 || safetyScoreVal > 100) {
                const err = container.querySelector('#err-drv-score');
                err.textContent = 'Score must be between 0 and 100';
                err.style.display = 'block';
                isValid = false;
            }

            if (!isValid) return;

            const driverPayload = {
                name: name.value.trim(),
                licenseNumber: license.value.trim(),
                licenseCategory: category.value.trim(),
                licenseExpiryDate: expiry.value,
                contactNumber: contact.value.trim(),
                safetyScore: safetyScoreVal,
                status: status.value
            };

            try {
                const response = await fetch('/api/drivers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(driverPayload)
                });

                const data = await response.json();

                if (response.status === 201) {
                    showToast('Driver added successfully!', 'success');
                    closeModal();
                    loadDrivers();
                } else {
                    showToast(data.message || 'Failed to add driver profiles', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection error. Failed to add driver.', 'danger');
            }
        });

        // Initialize display
        loadDrivers();
    }
};
