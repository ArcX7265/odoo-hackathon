document.addEventListener('DOMContentLoaded', () => {
    const vehicleSelect = document.getElementById('vehicleSelect');
    const driverSelect = document.getElementById('driverSelect');
    const cargoWeightInput = document.getElementById('cargoWeight');
    const dispatchBtn = document.getElementById('dispatchBtn');
    const capacityWarning = document.getElementById('capacityWarning');
    const dispatchForm = document.getElementById('dispatchForm');

    // Fetch available assets on page load
    fetchAssets();

    async function fetchAssets() {
        try {
            const response = await fetch('/api/trips/available-assets');
            if (!response.ok) throw new Error('Failed to fetch assets');
            
            const data = await response.json();
            populateVehicles(data.vehicles || []);
            populateDrivers(data.drivers || []);
            
            // Re-validate in case of re-fetches
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
            // Store capacity in a data attribute for real-time DOM validation
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
    
    cargoWeightInput.addEventListener('input', validateCapacity);
    vehicleSelect.addEventListener('change', validateCapacity);

    function validateCapacity() {
        const weight = parseInt(cargoWeightInput.value, 10);
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        
        // Only validate if both are present
        if (!selectedOption || !selectedOption.dataset.capacity || isNaN(weight)) {
            capacityWarning.classList.add('hidden');
            dispatchBtn.disabled = !checkFormValidity(); 
            return;
        }

        const maxCapacity = parseInt(selectedOption.dataset.capacity, 10);

        if (weight > maxCapacity) {
            // Show warning and block submission
            capacityWarning.querySelector('span').textContent = `Warning: Cargo (${weight}kg) exceeds vehicle capacity (${maxCapacity}kg)!`;
            capacityWarning.classList.remove('hidden');
            dispatchBtn.disabled = true;
        } else {
            // Hide warning, enable if form is valid
            capacityWarning.classList.add('hidden');
            dispatchBtn.disabled = !checkFormValidity();
        }
    }
    
    // Basic helper to check if HTML5 required fields are met
    function checkFormValidity() {
        return document.getElementById('source').value.trim() !== '' &&
               document.getElementById('destination').value.trim() !== '' &&
               vehicleSelect.value !== '' &&
               driverSelect.value !== '' &&
               cargoWeightInput.value !== '';
    }
    
    // Re-check validity on other inputs too to toggle button dynamically
    ['source', 'destination', 'vehicleSelect', 'driverSelect'].forEach(id => {
        document.getElementById(id).addEventListener('input', validateCapacity);
        document.getElementById(id).addEventListener('change', validateCapacity);
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
            // Step 1: Create Draft
            let res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Failed to create Draft Trip');
            const draftTrip = await res.json();
            
            // Animate Tracker: Draft -> Dispatched
            const stepDraft = document.getElementById('step-draft');
            const stepDispatched = document.getElementById('step-dispatched');
            
            stepDraft.classList.add('completed');
            stepDraft.classList.remove('active');
            stepDispatched.classList.add('active');

            // Step 2: Transition to Dispatched
            res = await fetch(`/api/trips/${draftTrip.id}/status?status=Dispatched`, {
                method: 'PUT'
            });

            if (!res.ok) {
                // If backend validation blocked it (e.g., MySQL triggers or Service validation)
                const errorText = await res.text();
                throw new Error(errorText || 'Failed to dispatch trip');
            }

            // Success Animation
            dispatchBtn.textContent = 'Trip Dispatched!';
            dispatchBtn.style.background = 'var(--success-color)';
            dispatchBtn.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.5)';
            
            // Reset form and reload assets after 3 seconds for continuous dispatching
            setTimeout(() => {
                fetchAssets();
                dispatchForm.reset();
                dispatchBtn.textContent = 'Dispatch Trip';
                dispatchBtn.style.background = '';
                dispatchBtn.style.boxShadow = '';
                
                // Reset Tracker
                stepDraft.classList.add('active');
                stepDraft.classList.remove('completed');
                stepDispatched.classList.remove('active');
                dispatchBtn.disabled = true; // Wait for input again
            }, 3000);

        } catch (error) {
            console.error(error);
            alert(`Dispatch Error: ${error.message}`);
            dispatchBtn.disabled = false;
            dispatchBtn.textContent = 'Dispatch Trip';
        }
    });
});
