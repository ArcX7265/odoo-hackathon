// ==============================================
// TRIP DISPATCHER LOGIC
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    const vehicleSelect = document.getElementById('vehicleSelect');
    const driverSelect = document.getElementById('driverSelect');
    const cargoWeightInput = document.getElementById('cargoWeight');
    const dispatchBtn = document.getElementById('dispatchBtn');
    const capacityWarning = document.getElementById('capacityWarning');
    const dispatchForm = document.getElementById('dispatchForm');
    const activeTripsBody = document.getElementById('active-trips-body');

    // Completion modal elements
    const completionModal = document.getElementById('completion-modal');
    const completeTripForm = document.getElementById('complete-trip-form');
    const completeTripId = document.getElementById('complete-trip-id');
    const completeOdometer = document.getElementById('complete-odometer');
    const completeFuel = document.getElementById('complete-fuel');

    if (!vehicleSelect) return;

    fetchAssets();
    fetchActiveTrips();

    async function fetchAssets() {
        try {
            const response = await fetch('/api/trips/available-assets');
            if (!response.ok) throw new Error('Failed to fetch assets');
            
            const data = await response.json();
            populateVehicles(data.vehicles || []);
            populateDrivers(data.drivers || []);
            validateCapacity();
        } catch (error) {
            console.error('Error fetching assets:', error);
            vehicleSelect.innerHTML = '<option disabled selected>Error loading vehicles</option>';
            driverSelect.innerHTML = '<option disabled selected>Error loading drivers</option>';
        }
    }

    function populateVehicles(vehicles) {
        vehicleSelect.innerHTML = '<option value="" disabled selected>Select a vehicle</option>';
        vehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id;
            option.dataset.capacity = v.maxLoadCapacity;
            option.textContent = `${v.registrationNumber} - ${v.model} (Max Load: ${v.maxLoadCapacity}kg)`;
            vehicleSelect.appendChild(option);
        });
    }

    function populateDrivers(drivers) {
        driverSelect.innerHTML = '<option value="" disabled selected>Select a driver</option>';
        drivers.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = `${d.name} (License: ${d.licenseCategory})`;
            driverSelect.appendChild(option);
        });
    }

    // --- Real-Time Capacity Validation ---
    function validateCapacity() {
        const weight = parseInt(cargoWeightInput.value, 10);
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.dataset.capacity || isNaN(weight)) {
            capacityWarning.style.display = 'none';
            dispatchBtn.disabled = !checkFormValidity(); 
            return;
        }

        const maxCapacity = parseInt(selectedOption.dataset.capacity, 10);
        if (weight > maxCapacity) {
            capacityWarning.style.display = 'block';
            dispatchBtn.disabled = true;
        } else {
            capacityWarning.style.display = 'none';
            dispatchBtn.disabled = !checkFormValidity();
        }
    }
    
    function checkFormValidity() {
        return document.getElementById('source').value.trim() !== '' &&
               document.getElementById('destination').value.trim() !== '' &&
               vehicleSelect.value !== '' &&
               driverSelect.value !== '' &&
               cargoWeightInput.value !== '';
    }
    
    ['source', 'destination', 'vehicleSelect', 'driverSelect', 'cargoWeight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', validateCapacity);
            el.addEventListener('change', validateCapacity);
        }
    });

    // --- Dispatch Logic ---
    dispatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (dispatchBtn.disabled) return;
        
        dispatchBtn.disabled = true;
        dispatchBtn.textContent = 'Dispatching...';

        const payload = {
            source: document.getElementById('source').value,
            destination: document.getElementById('destination').value,
            vehicle: { id: parseInt(vehicleSelect.value, 10) },
            driver: { id: parseInt(driverSelect.value, 10) },
            cargoWeight: parseInt(cargoWeightInput.value, 10)
        };

        try {
            // Create Draft
            let res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Failed to create Draft Trip');
            const draftTrip = await res.json();
            
            // Transition to Dispatched
            res = await fetch(`/api/trips/${draftTrip.id}/status?status=Dispatched`, {
                method: 'PUT'
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Failed to dispatch trip');
            }

            dispatchForm.reset();
            dispatchBtn.textContent = 'Dispatch Trip';
            dispatchBtn.disabled = true;
            
            fetchAssets();
            fetchActiveTrips();
            
            // Show toast if App exists
            if (window.App && window.App.showToast) {
                window.App.showToast('Trip dispatched successfully!', 'success');
            }

        } catch (error) {
            console.error(error);
            alert(`Dispatch Error: ${error.message}`);
            dispatchBtn.disabled = false;
            dispatchBtn.textContent = 'Dispatch Trip';
        }
    });

    // --- Active Trips Logic ---
    async function fetchActiveTrips() {
        try {
            const response = await fetch('/api/trips/active');
            if (!response.ok) throw new Error('Failed to fetch active trips');
            const trips = await response.json();
            
            activeTripsBody.innerHTML = '';
            
            if (trips.length === 0) {
                activeTripsBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--text-muted);">No active trips currently.</td></tr>`;
                return;
            }
            
            trips.forEach(trip => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 500;">${trip.source} &rarr;</div>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">${trip.destination}</div>
                    </td>
                    <td>
                        <div>${trip.vehicle?.registrationNumber || 'Unknown'}</div>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">${trip.driver?.name || 'Unknown'}</div>
                    </td>
                    <td><span class="status-badge" style="background: rgba(139, 92, 246, 0.1); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.2); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${trip.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-primary complete-btn" data-id="${trip.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Complete</button>
                            <button class="btn cancel-btn" data-id="${trip.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: transparent; border: 1px solid var(--error-color); color: var(--error-color);">Cancel</button>
                        </div>
                    </td>
                `;
                activeTripsBody.appendChild(tr);
            });
            
            // Attach event listeners for buttons
            document.querySelectorAll('.cancel-btn').forEach(btn => {
                btn.addEventListener('click', (e) => cancelTrip(e.target.dataset.id));
            });
            document.querySelectorAll('.complete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openCompletionModal(e.target.dataset.id));
            });
        } catch (error) {
            console.error('Error fetching active trips:', error);
            activeTripsBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--error-color);">Failed to load active trips</td></tr>`;
        }
    }

    async function cancelTrip(id) {
        if (!confirm('Are you sure you want to cancel this trip?')) return;
        
        try {
            const res = await fetch(`/api/trips/${id}/status?status=Cancelled`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to cancel trip');
            
            fetchAssets();
            fetchActiveTrips();
            
            if (window.App && window.App.showToast) {
                window.App.showToast('Trip cancelled', 'info');
            }
        } catch (error) {
            console.error(error);
            alert(`Error cancelling trip: ${error.message}`);
        }
    }

    function openCompletionModal(id) {
        completeTripId.value = id;
        completeTripForm.reset();
        completionModal.style.display = 'flex';
    }

    completeTripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = completeTripId.value;
        const odo = completeOdometer.value;
        const fuel = completeFuel.value;
        
        try {
            const res = await fetch(`/api/trips/${id}/status?status=Completed&finalOdometer=${odo}&fuelConsumed=${fuel}`, {
                method: 'PUT'
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Failed to complete trip');
            }
            
            completionModal.style.display = 'none';
            fetchAssets();
            fetchActiveTrips();
            
            if (window.App && window.App.showToast) {
                window.App.showToast('Trip completed successfully!', 'success');
            }
        } catch (error) {
            console.error(error);
            alert(`Error completing trip: ${error.message}`);
        }
    });

    // Map functionality removed as per user request
});
