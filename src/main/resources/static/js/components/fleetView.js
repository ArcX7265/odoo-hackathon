// TransitOps Fleet Registry View Component (View 2)
export const FleetView = {
    render: async (container, appState, showToast) => {
        const isManager = appState.user && appState.user.role === 'Fleet Manager';
        
        container.innerHTML = `
            <div class="to-container">
                <div class="to-flex-between">
                    <div>
                        <h1 class="to-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary);"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                            Fleet Registry
                        </h1>
                        <p class="to-subtitle">Track and manage vehicle statuses, capacities, and costs across the transport grid.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button id="btn-export-fleet-csv" class="to-btn to-btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;">
                            📥 Export CSV
                        </button>
                        ${isManager ? `
                            <button id="btn-add-vehicle" class="to-btn to-btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add Vehicle
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="to-card" style="margin-bottom: 2rem; padding: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div class="to-search-bar" style="flex-grow: 1; max-width: none;">
                            <input class="to-input" type="text" id="vehicle-search" placeholder="Search by Registration Number or Model...">
                        </div>
                        <button id="btn-search" class="to-btn to-btn-secondary">Search</button>
                        <button id="btn-clear-search" class="to-btn to-btn-secondary">Reset</button>
                    </div>
                </div>

                <div class="to-table-container">
                    <table class="to-table" id="vehicles-table">
                        <thead>
                            <tr>
                                <th>Registration</th>
                                <th>Model</th>
                                <th>Type</th>
                                <th>Max Load Capacity (kg)</th>
                                <th>Odometer (km)</th>
                                <th>Acquisition Cost</th>
                                <th>Status</th>
                                ${isManager ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="vehicles-tbody">
                            <tr>
                                <td colspan="${isManager ? 8 : 7}" style="text-align: center; color: #9ca3af;">Loading vehicles data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Add Vehicle Modal -->
                <div class="to-modal-overlay" id="add-vehicle-modal">
                    <div class="to-modal">
                        <div class="to-modal-header">
                            <h3 class="to-modal-title">Register New Vehicle</h3>
                            <button class="to-modal-close" id="modal-close">&times;</button>
                        </div>
                        <form id="add-vehicle-form">
                            <div class="to-form-group">
                                <label class="to-label" for="veh-reg">Registration Number *</label>
                                <input class="to-input" type="text" id="veh-reg" required placeholder="e.g. TX-9021">
                                <span class="error-msg" id="err-veh-reg" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-model">Model Name *</label>
                                <input class="to-input" type="text" id="veh-model" required placeholder="e.g. Volvo FH16">
                                <span class="error-msg" id="err-veh-model" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-type">Vehicle Type *</label>
                                <select class="to-select" id="veh-type">
                                    <option value="Truck">Truck</option>
                                    <option value="Van">Van</option>
                                    <option value="Bus">Bus</option>
                                    <option value="Car">Car</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-capacity">Max Load Capacity (kg) *</label>
                                <input class="to-input" type="number" id="veh-capacity" min="1" required placeholder="e.g. 25000">
                                <span class="error-msg" id="err-veh-capacity" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-odometer">Current Odometer (km) *</label>
                                <input class="to-input" type="number" id="veh-odometer" min="0" required placeholder="e.g. 12000">
                                <span class="error-msg" id="err-veh-odometer" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-cost">Acquisition Cost (USD) *</label>
                                <input class="to-input" type="number" step="0.01" id="veh-cost" min="0.01" required placeholder="e.g. 145000.00">
                                <span class="error-msg" id="err-veh-cost" style="color: var(--color-danger); font-size: 0.75rem; display: none;"></span>
                            </div>
                            <div class="to-form-group">
                                <label class="to-label" for="veh-status">Initial Status</label>
                                <select class="to-select" id="veh-status">
                                    <option value="Available">Available</option>
                                    <option value="On Trip">On Trip</option>
                                    <option value="In Shop">In Shop</option>
                                    <option value="Retired">Retired</option>
                                </select>
                            </div>
                            
                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                                <button type="button" class="to-btn to-btn-secondary" id="btn-cancel">Cancel</button>
                                <button type="submit" class="to-btn to-btn-primary">Register Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Cache DOM elements
        const tbody = container.querySelector('#vehicles-tbody');
        const searchInput = container.querySelector('#vehicle-search');
        const searchBtn = container.querySelector('#btn-search');
        const clearBtn = container.querySelector('#btn-clear-search');
        const modal = container.querySelector('#add-vehicle-modal');
        const addBtn = container.querySelector('#btn-add-vehicle');
        const cancelBtn = container.querySelector('#btn-cancel');
        const closeBtn = container.querySelector('#modal-close');
        const form = container.querySelector('#add-vehicle-form');

        // Render helper function for badges
        const getStatusBadge = (status) => {
            switch (status) {
                case 'Available':
                    return `<span class="to-badge to-badge-available">${status}</span>`;
                case 'On Trip':
                    return `<span class="to-badge to-badge-trip">${status}</span>`;
                case 'In Shop':
                    return `<span class="to-badge to-badge-shop">${status}</span>`;
                case 'Retired':
                    return `<span class="to-badge to-badge-retired">${status}</span>`;
                default:
                    return `<span class="to-badge">${status}</span>`;
            }
        };

        // Fetch and Render Vehicles Data
        const loadVehicles = async (searchQuery = '') => {
            try {
                tbody.innerHTML = `<tr><td colspan="${isManager ? 8 : 7}" style="text-align: center; color: #9ca3af;">Loading vehicles...</td></tr>`;
                
                let url = '/api/vehicles';
                if (searchQuery) {
                    url += `?search=${encodeURIComponent(searchQuery)}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch vehicles');
                }
                const vehicles = await response.json();
                FleetView.state = FleetView.state || {};
                FleetView.state.vehicles = vehicles;
                
                if (vehicles.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="${isManager ? 8 : 7}" style="text-align: center; color: #9ca3af;">No vehicles found</td></tr>`;
                    return;
                }

                // Format currency
                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });

                tbody.innerHTML = vehicles.map(v => `
                    <tr>
                        <td style="font-weight: 600; color: #ffffff;">${v.registrationNumber}</td>
                        <td>${v.model || 'N/A'}</td>
                        <td>${v.type}</td>
                        <td>${v.maxLoadCapacity ? v.maxLoadCapacity.toLocaleString() : 'N/A'} kg</td>
                        <td>${v.odometer ? v.odometer.toLocaleString() : 0} km</td>
                        <td>${v.acquisitionCost ? formatter.format(v.acquisitionCost) : '$0.00'}</td>
                        <td>${getStatusBadge(v.status)}</td>
                        ${isManager ? `
                            <td>
                                <button class="to-btn to-btn-danger btn-delete-veh" data-id="${v.id}" data-reg="${v.registrationNumber}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                    Delete
                                </button>
                            </td>
                        ` : ''}
                    </tr>
                `).join('');

                // Hook up delete buttons
                if (isManager) {
                    tbody.querySelectorAll('.btn-delete-veh').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const id = btn.getAttribute('data-id');
                            const reg = btn.getAttribute('data-reg');
                            
                            if (confirm(`Are you sure you want to delete vehicle ${reg}?`)) {
                                try {
                                    const delRes = await fetch(`/api/vehicles/${id}`, {
                                        method: 'DELETE'
                                    });
                                    if (delRes.ok) {
                                        showToast(`Deleted vehicle ${reg}`, 'success');
                                        loadVehicles(searchInput.value);
                                    } else {
                                        const errData = await delRes.json();
                                        showToast(errData.message || 'Failed to delete vehicle', 'danger');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    showToast('Network error while deleting', 'danger');
                                }
                            }
                        });
                    });
                }
            } catch (err) {
                console.error(err);
                tbody.innerHTML = `<tr><td colspan="${isManager ? 8 : 7}" style="text-align: center; color: var(--color-danger);">Error fetching vehicles data</td></tr>`;
            }
        };

        // Modal triggers
        if (isManager && addBtn) {
            addBtn.addEventListener('click', () => {
                form.reset();
                // Clear validation errors
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
        searchBtn.addEventListener('click', () => loadVehicles(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadVehicles(searchInput.value);
            }
        });
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            loadVehicles();
        });

        // Export CSV logic
        const exportFleetBtn = container.querySelector('#btn-export-fleet-csv');
        if (exportFleetBtn) {
            exportFleetBtn.addEventListener('click', () => {
                const vehiclesList = (FleetView.state && FleetView.state.vehicles) || [];
                if (vehiclesList.length === 0) {
                    showToast('No vehicles available to export', 'warning');
                    return;
                }

                const headers = ['Registration Number', 'Model', 'Type', 'Max Load Capacity (kg)', 'Odometer (km)', 'Acquisition Cost (USD)', 'Status'];
                const rows = vehiclesList.map(v => [
                    `"${v.registrationNumber}"`,
                    `"${v.model || 'N/A'}"`,
                    `"${v.type}"`,
                    v.maxLoadCapacity || 0,
                    v.odometer || 0,
                    v.acquisitionCost || 0,
                    `"${v.status}"`
                ]);

                const csvContent = [
                    headers.join(','),
                    ...rows.map(r => r.join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `TransitOps_Fleet_Export_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('Fleet export downloaded successfully', 'success');
            });
        }

        // Form submission and validation
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Client-side validations
            let isValid = true;
            const reg = container.querySelector('#veh-reg');
            const model = container.querySelector('#veh-model');
            const capacity = container.querySelector('#veh-capacity');
            const odometer = container.querySelector('#veh-odometer');
            const cost = container.querySelector('#veh-cost');
            const type = container.querySelector('#veh-type');
            const status = container.querySelector('#veh-status');

            // Reset error messages
            container.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

            if (!reg.value.trim()) {
                const err = container.querySelector('#err-veh-reg');
                err.textContent = 'Registration number is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (!model.value.trim()) {
                const err = container.querySelector('#err-veh-model');
                err.textContent = 'Model name is required';
                err.style.display = 'block';
                isValid = false;
            }

            if (parseInt(capacity.value) <= 0) {
                const err = container.querySelector('#err-veh-capacity');
                err.textContent = 'Capacity must be greater than 0';
                err.style.display = 'block';
                isValid = false;
            }

            if (parseInt(odometer.value) < 0) {
                const err = container.querySelector('#err-veh-odometer');
                err.textContent = 'Odometer cannot be negative';
                err.style.display = 'block';
                isValid = false;
            }

            if (parseFloat(cost.value) <= 0) {
                const err = container.querySelector('#err-veh-cost');
                err.textContent = 'Acquisition cost must be positive';
                err.style.display = 'block';
                isValid = false;
            }

            if (!isValid) return;

            const vehiclePayload = {
                registrationNumber: reg.value.trim(),
                model: model.value.trim(),
                type: type.value,
                maxLoadCapacity: parseInt(capacity.value),
                odometer: parseInt(odometer.value),
                acquisitionCost: parseFloat(cost.value),
                status: status.value
            };

            try {
                const response = await fetch('/api/vehicles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(vehiclePayload)
                });

                const data = await response.json();

                if (response.status === 201) {
                    showToast('Vehicle registered successfully!', 'success');
                    closeModal();
                    loadVehicles();
                } else {
                    showToast(data.message || 'Failed to register vehicle', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection error. Failed to add vehicle.', 'danger');
            }
        });

        // Initialize display
        loadVehicles();
    }
};
