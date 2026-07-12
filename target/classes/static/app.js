// Global App State
let currentCredentials = {
    username: "manager@transitops.com",
    password: "password",
    role: "manager"
};

// Available Vehicles Cache
let vehiclesList = [];

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Navigation Routing
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const viewId = item.getAttribute("data-view");
            switchView(viewId);
        });
    });

    // 2. Role Switcher
    const roleSelect = document.getElementById("role-select");
    if (roleSelect) {
        roleSelect.addEventListener("change", (e) => {
            const selectedRole = e.target.value;
            if (selectedRole === "manager") {
                currentCredentials = { username: "manager@transitops.com", password: "password", role: "manager" };
            } else if (selectedRole === "analyst") {
                currentCredentials = { username: "analyst@transitops.com", password: "password", role: "analyst" };
            } else if (selectedRole === "driver") {
                currentCredentials = { username: "driver@transitops.com", password: "password", role: "driver" };
            }
            
            // Refresh active view based on new credentials
            const activeNav = document.querySelector(".nav-item.active");
            if (activeNav) {
                switchView(activeNav.getAttribute("data-view"));
            }
        });
    }

    // 3. Form Setup and Tab bindings
    setupForms();
    
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    const maintDate = document.getElementById("maint-date");
    if (maintDate) maintDate.value = today;
    
    const fuelDate = document.getElementById("fuel-date");
    if (fuelDate) fuelDate.value = today;
    
    const expDate = document.getElementById("exp-date");
    if (expDate) expDate.value = today;

    // Load initial data
    if (document.getElementById("maint-vehicle") || document.getElementById("fuel-vehicle")) {
        loadVehiclesDropdowns();
    }
    
    // Load default dashboard
    switchView("dashboard");
}

function switchView(viewId) {
    // Hide all views
    const views = document.querySelectorAll(".view-section");
    views.forEach(v => v.classList.remove("active"));
    
    // Show target view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add("active");
    }

    // Set view header title
    const viewTitleMap = {
        "dashboard": "Dashboard Summary",
        "maintenance": "Maintenance Portal",
        "ledgers": "Fuel & Expense Ledgers",
        "analytics": "Analytics Reports",
        "vehicles": "Fleet Directory"
    };
    
    const viewTitleEl = document.getElementById("view-title");
    if (viewTitleEl) {
        viewTitleEl.textContent = viewTitleMap[viewId] || "Control Center";
    }

    // Load specific view data
    if (viewId === "dashboard" && document.getElementById("kpi-active-vehicles")) {
        loadKpis();
    } else if (viewId === "maintenance" && document.getElementById("maintenance-ledger-body")) {
        loadMaintenanceLedger();
    } else if (viewId === "ledgers" && document.getElementById("fuel-ledger-body")) {
        loadLedgerData();
    } else if (viewId === "analytics" && document.getElementById("analytics-grid-body")) {
        loadAnalyticsReport();
    } else if (viewId === "vehicles" && document.getElementById("master-vehicles-table")) {
        loadMasterVehicles();
    }
}

// Authentication fetch wrapper
async function fetchWithAuth(url, options = {}) {
    const authHeader = "Basic " + btoa(currentCredentials.username + ":" + currentCredentials.password);
    
    // Merge headers
    options.headers = {
        ...options.headers,
        "Authorization": authHeader,
        "Content-Type": "application/json"
    };

    const response = await fetch(url, options);
    
    if (response.status === 401 || response.status === 403) {
        // Access Denied handler
        throw { status: response.status, message: "Access Denied" };
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Populate Vehicle dropdowns
async function loadVehiclesDropdowns() {
    try {
        const vehicles = await fetchWithAuth("/api/vehicles");
        vehiclesList = vehicles;

        const maintSelect = document.getElementById("maint-vehicle");
        const fuelSelect = document.getElementById("fuel-vehicle");
        const expSelect = document.getElementById("exp-vehicle");

        // Clear existing options
        if (maintSelect) maintSelect.innerHTML = '<option value="">Choose a vehicle...</option>';
        if (fuelSelect) fuelSelect.innerHTML = '<option value="">Choose a vehicle...</option>';
        if (expSelect) expSelect.innerHTML = '<option value="">Choose a vehicle...</option>';

        vehicles.forEach(v => {
            const optionText = `${v.registrationNumber} - ${v.model} (${v.status})`;
            
            if (maintSelect) {
                const opt1 = document.createElement("option");
                opt1.value = v.id;
                opt1.textContent = optionText;
                maintSelect.appendChild(opt1);
            }

            if (fuelSelect) {
                const opt2 = document.createElement("option");
                opt2.value = v.id;
                opt2.textContent = optionText;
                fuelSelect.appendChild(opt2);
            }

            if (expSelect) {
                const opt3 = document.createElement("option");
                opt3.value = v.id;
                opt3.textContent = optionText;
                expSelect.appendChild(opt3);
            }
        });
    } catch (err) {
        console.error("Failed to load vehicles dropdowns:", err);
    }
}

// View 1: Load Dashboard KPIs
async function loadKpis() {
    try {
        const kpis = await fetchWithAuth("/api/analytics/kpi-summary");
        
        document.getElementById("kpi-active-vehicles").textContent = kpis.activeVehicles;
        document.getElementById("kpi-available-vehicles").textContent = kpis.availableVehicles;
        document.getElementById("kpi-in-maintenance").textContent = kpis.vehiclesInMaintenance;
        document.getElementById("kpi-active-trips").textContent = kpis.activeTrips;
        document.getElementById("kpi-fleet-utilization").textContent = `${kpis.fleetUtilization}%`;

        // Fetch ROI details to show summary stats in the overview panel
        const roiList = await fetchWithAuth("/api/analytics/vehicle-roi");
        let totalAcq = 0;
        let totalOps = 0;
        roiList.forEach(item => {
            totalAcq += item.acquisitionCost || 0;
            totalOps += item.totalOperationalCost || 0;
        });
        
        const totalAcqEl = document.getElementById("stats-total-acq");
        const totalOpsEl = document.getElementById("stats-total-ops");
        
        if (totalAcqEl) totalAcqEl.textContent = `$${totalAcq.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        if (totalOpsEl) totalOpsEl.textContent = `$${totalOps.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Hide access denied covers (if role changed back)
        const expensesDenied = document.getElementById("expenses-access-denied");
        const analyticsDenied = document.getElementById("analytics-access-denied");
        if (expensesDenied) expensesDenied.style.display = "none";
        if (analyticsDenied) analyticsDenied.style.display = "none";
        
    } catch (err) {
        console.error("Error loading Dashboard KPIs:", err);
        if (err.status === 403 || err.status === 401) {
            if (document.getElementById("kpi-active-vehicles")) {
                document.getElementById("kpi-active-vehicles").textContent = "🔒";
                document.getElementById("kpi-available-vehicles").textContent = "🔒";
                document.getElementById("kpi-in-maintenance").textContent = "🔒";
                document.getElementById("kpi-active-trips").textContent = "🔒";
                document.getElementById("kpi-fleet-utilization").textContent = "🔒";
            }
            if (document.getElementById("stats-total-acq")) document.getElementById("stats-total-acq").textContent = "Access Denied";
            if (document.getElementById("stats-total-ops")) document.getElementById("stats-total-ops").textContent = "Access Denied";
        }
    }
}

// View 5: Maintenance Ledger
async function loadMaintenanceLedger() {
    try {
        const logs = await fetchWithAuth("/api/maintenance");
        const tbody = document.getElementById("maintenance-ledger-body");
        if (!tbody) return;
        
        tbody.innerHTML = "";

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No maintenance logs found</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement("tr");
            
            const isClosed = log.status.toLowerCase() === "closed";
            const badgeClass = isClosed ? "badge-closed" : "badge-open";
            const statusLabel = isClosed ? "Resolved" : "Active";
            
            const actionButton = isClosed 
                ? `<span class="badge badge-closed">Resolved</span>`
                : `<button class="btn btn-sm btn-outline-orange" onclick="resolveMaintenanceLog(${log.id})">Mark Resolved</button>`;

            tr.innerHTML = `
                <td class="text-bold">${log.vehicle ? log.vehicle.registrationNumber : 'Unknown'}</td>
                <td>${log.description}</td>
                <td>$${log.cost.toFixed(2)}</td>
                <td>${log.logDate}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td>${actionButton}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Failed to load maintenance ledger:", err);
    }
}

// View 5: Resolve Maintenance (Action Trigger)
async function resolveMaintenanceLog(id) {
    try {
        await fetchWithAuth(`/api/maintenance/${id}/resolve`, {
            method: "PUT"
        });
        
        // Pro-Tip: Visual Feedback. Immediate refresh of tables and dropdowns
        await loadMaintenanceLedger();
        await loadVehiclesDropdowns();
    } catch (err) {
        console.error("Failed to resolve maintenance log:", err);
        alert("Failed to resolve maintenance. Check user permissions.");
    }
}

// View 6: Tabbed Ledgers
async function loadLedgerData() {
    const expensesOverlay = document.getElementById("expenses-access-denied");
    
    try {
        // Load Fuel logs (publicly available for all authenticated users)
        const fuelLogs = await fetchWithAuth("/api/fuel-logs");
        const fuelBody = document.getElementById("fuel-ledger-body");
        
        if (fuelBody) {
            fuelBody.innerHTML = "";
            if (fuelLogs.length === 0) {
                fuelBody.innerHTML = '<tr><td colspan="5" class="text-center">No fuel refill logs found</td></tr>';
            } else {
                fuelLogs.forEach(log => {
                    const tr = document.createElement("tr");
                    const pricePerLiter = log.liters > 0 ? (log.cost / log.liters).toFixed(2) : '0.00';
                    tr.innerHTML = `
                        <td class="text-bold">${log.vehicle ? log.vehicle.registrationNumber : 'Unknown'}</td>
                        <td>${log.liters.toFixed(2)} L</td>
                        <td>$${log.cost.toFixed(2)}</td>
                        <td>$${pricePerLiter}/L</td>
                        <td>${log.logDate}</td>
                    `;
                    fuelBody.appendChild(tr);
                });
            }
        }

        // Hide overlay in case it was shown before
        if (expensesOverlay) expensesOverlay.style.display = "none";

        // Load Expenses (Role restricted)
        const expenses = await fetchWithAuth("/api/expenses");
        const expBody = document.getElementById("expense-ledger-body");
        
        if (expBody) {
            expBody.innerHTML = "";
            if (expenses.length === 0) {
                expBody.innerHTML = '<tr><td colspan="4" class="text-center">No operational expenses found</td></tr>';
            } else {
                expenses.forEach(e => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="text-bold">${e.vehicle ? e.vehicle.registrationNumber : 'Unknown'}</td>
                        <td><span class="badge badge-trip">${e.type}</span></td>
                        <td>$${e.amount.toFixed(2)}</td>
                        <td>${e.date}</td>
                    `;
                    expBody.appendChild(tr);
                });
            }
        }

    } catch (err) {
        console.error("Access issue in Ledger Data:", err);
        if (err.status === 403 || err.status === 401) {
            if (expensesOverlay) expensesOverlay.style.display = "flex";
        }
    }
}

// View 7: Financial ROI Analytics
async function loadAnalyticsReport() {
    const analyticsOverlay = document.getElementById("analytics-access-denied");
    
    try {
        const roiList = await fetchWithAuth("/api/analytics/vehicle-roi");
        if (analyticsOverlay) analyticsOverlay.style.display = "none";

        const grid = document.getElementById("analytics-grid-body");
        if (!grid) return;
        
        grid.innerHTML = "";

        if (roiList.length === 0) {
            grid.innerHTML = '<div class="text-center w-100 pad-20">No vehicle data available.</div>';
            return;
        }

        roiList.forEach(item => {
            const card = document.createElement("div");
            card.className = "analytics-card";
            
            const roiVal = item.roi || 0.0;
            const isPositive = roiVal >= 0;
            const badgeClass = isPositive ? "roi-positive" : "roi-negative";
            const prefix = isPositive ? "+" : "";
            
            // ROI Bar Color
            const barColor = isPositive ? "var(--accent-green)" : "var(--accent-red)";
            // ROI Bar Percentage (capped at 100% for bar visualization, minimum 0)
            const barWidth = Math.max(0, Math.min(100, Math.abs(roiVal)));

            card.innerHTML = `
                <div class="analytics-card-header">
                    <div class="vehicle-info">
                        <h3>${item.registrationNumber}</h3>
                        <span>${item.model} • ${item.type}</span>
                    </div>
                    <div class="roi-badge ${badgeClass}">
                        ROI: ${prefix}${roiVal.toFixed(2)}%
                    </div>
                </div>
                <div class="analytics-metrics">
                    <div class="metric-row">
                        <span class="metric-name">Acquisition Cost</span>
                        <span class="metric-value">$${item.acquisitionCost.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-name">Operational Cost</span>
                        <span class="metric-value">$${item.totalOperationalCost.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-name"> - Maintenance Cost</span>
                        <span class="metric-value">$${item.totalMaintenanceCost.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-name"> - Fuel Cost</span>
                        <span class="metric-value">$${item.totalFuelCost.toFixed(2)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-name">Calculated Revenue</span>
                        <span class="metric-value">$${item.revenue.toFixed(2)}</span>
                    </div>
                </div>
                <div class="roi-bar-container">
                    <div class="roi-bar" style="width: ${barWidth}%; background-color: ${barColor};"></div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Access issue in Analytics view:", err);
        if (err.status === 403 || err.status === 401) {
            if (analyticsOverlay) analyticsOverlay.style.display = "flex";
        }
    }
}

// Setup Form Handlers and tab actions
function setupForms() {
    // 1. Maintenance Form Submission
    const maintForm = document.getElementById("maintenance-form");
    if (maintForm) {
        maintForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const vehicleId = document.getElementById("maint-vehicle").value;
            const description = document.getElementById("maint-description").value;
            const cost = parseFloat(document.getElementById("maint-cost").value);
            const date = document.getElementById("maint-date").value;

            try {
                await fetchWithAuth("/api/maintenance", {
                    method: "POST",
                    body: JSON.stringify({
                        vehicle: { id: parseInt(vehicleId) },
                        description: description,
                        cost: cost,
                        logDate: date,
                        status: "Open"
                    })
                });

                // Reset Form and reload dropdowns/ledgers
                maintForm.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById("maint-date").value = today;

                await loadVehiclesDropdowns();
                await loadMaintenanceLedger();
            } catch (err) {
                console.error("Failed to submit maintenance log:", err);
                alert("Error submitting log. Check credentials and role settings.");
            }
        });
    }

    // 2. Fuel Log Form Submission
    const fuelForm = document.getElementById("fuel-form");
    if (fuelForm) {
        fuelForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const vehicleId = document.getElementById("fuel-vehicle").value;
            const liters = parseFloat(document.getElementById("fuel-liters").value);
            const cost = parseFloat(document.getElementById("fuel-cost").value);
            const date = document.getElementById("fuel-date").value;

            try {
                await fetchWithAuth("/api/fuel-logs", {
                    method: "POST",
                    body: JSON.stringify({
                        vehicle: { id: parseInt(vehicleId) },
                        liters: liters,
                        cost: cost,
                        logDate: date
                    })
                });

                fuelForm.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById("fuel-date").value = today;

                await loadLedgerData();
            } catch (err) {
                console.error("Failed to submit fuel log:", err);
                alert("Error logging fuel refills.");
            }
        });
    }

    // 3. Operational Expense Form Submission
    const expForm = document.getElementById("expense-form");
    if (expForm) {
        expForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const vehicleId = document.getElementById("exp-vehicle").value;
            const type = document.getElementById("exp-type").value;
            const amount = parseFloat(document.getElementById("exp-amount").value);
            const date = document.getElementById("exp-date").value;

            try {
                await fetchWithAuth("/api/expenses", {
                    method: "POST",
                    body: JSON.stringify({
                        vehicle: { id: parseInt(vehicleId) },
                        type: type,
                        amount: amount,
                        date: date
                    })
                });

                expForm.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById("exp-date").value = today;

                await loadLedgerData();
            } catch (err) {
                console.error("Failed to submit expense log:", err);
                alert("Failed to log expense. Check permission credentials.");
            }
        });
    }

    // 4. Tab switcher triggers: Form Switcher (Fuel vs Expense Forms)
    const formTabFuel = document.getElementById("form-tab-fuel");
    const formTabExpense = document.getElementById("form-tab-expense");
    
    if (formTabFuel && formTabExpense) {
        formTabFuel.addEventListener("click", () => {
            formTabFuel.classList.add("active");
            formTabExpense.classList.remove("active");
            
            fuelForm.classList.remove("hidden");
            expForm.classList.add("hidden");
        });

        formTabExpense.addEventListener("click", () => {
            formTabExpense.classList.add("active");
            formTabFuel.classList.remove("active");
            
            if (expForm) expForm.classList.remove("hidden");
            if (fuelForm) fuelForm.classList.add("hidden");
        });
    }

    // 5. Tab switcher triggers: Ledger Table Switcher
    const tabBtnFuel = document.getElementById("tab-btn-fuel");
    const tabBtnExpense = document.getElementById("tab-btn-expense");
    const tabContentFuel = document.getElementById("tab-content-fuel");
    const tabContentExpense = document.getElementById("tab-content-expense");

    if (tabBtnFuel && tabBtnExpense && tabContentFuel && tabContentExpense) {
        tabBtnFuel.addEventListener("click", () => {
            tabBtnFuel.classList.add("active");
            tabBtnExpense.classList.remove("active");
            
            tabContentFuel.classList.remove("hidden");
            tabContentExpense.classList.add("hidden");
        });

        tabBtnExpense.addEventListener("click", () => {
            tabBtnExpense.classList.add("active");
            tabBtnFuel.classList.remove("active");
            
            tabContentExpense.classList.remove("hidden");
            tabContentFuel.classList.add("hidden");
        });
    }

    // Modal bindings for Add Vehicle
    const btnAddVehicle = document.getElementById("btn-add-vehicle");
    const modalVehicle = document.getElementById("add-vehicle-modal");
    const btnCloseModal = document.getElementById("btn-close-vehicle-modal");

    if (btnAddVehicle && modalVehicle) {
        btnAddVehicle.addEventListener("click", () => {
            modalVehicle.classList.remove("hidden");
            document.getElementById("veh-error-msg").style.display = "none";
        });
        
        btnCloseModal.addEventListener("click", () => {
            modalVehicle.classList.add("hidden");
        });
        
        modalVehicle.addEventListener("click", (e) => {
            if (e.target === modalVehicle) {
                modalVehicle.classList.add("hidden");
            }
        });
    }

    // Add Vehicle Form Submission
    const addVehicleForm = document.getElementById("add-vehicle-form");
    if (addVehicleForm) {
        addVehicleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = addVehicleForm.querySelector("button[type='submit']");
            const originalText = btn.textContent;
            btn.textContent = "Saving...";
            btn.disabled = true;
            
            const errorMsg = document.getElementById("veh-error-msg");
            errorMsg.style.display = "none";

            const payload = {
                registrationNumber: document.getElementById("veh-reg").value,
                model: document.getElementById("veh-model").value,
                type: document.getElementById("veh-type").value,
                status: document.getElementById("veh-status").value,
                maxLoadCapacity: document.getElementById("veh-load").value ? parseInt(document.getElementById("veh-load").value) : null,
                odometer: document.getElementById("veh-odo").value ? parseInt(document.getElementById("veh-odo").value) : 0,
                acquisitionCost: document.getElementById("veh-cost").value ? parseFloat(document.getElementById("veh-cost").value) : null
            };

            try {
                const result = await fetchWithAuth("/api/vehicles", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                
                // Refresh list and close modal
                addVehicleForm.reset();
                modalVehicle.classList.add("hidden");
                loadMasterVehicles();
                loadVehiclesDropdowns(); // Refresh dropdowns across app
            } catch (err) {
                errorMsg.textContent = "Error: " + err.message;
                errorMsg.style.display = "block";
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
}

// -------------------------------------------------------------
// MASTER VEHICLES LIST LOGIC
// -------------------------------------------------------------
async function loadMasterVehicles() {
    const tbody = document.querySelector("#master-vehicles-table tbody");
    if (!tbody) return;

    try {
        const vehicles = await fetchWithAuth("/api/vehicles");
        tbody.innerHTML = "";
        
        if (vehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No vehicles found in fleet.</td></tr>';
            return;
        }

        vehicles.forEach(veh => {
            const tr = document.createElement("tr");
            
            // Status badge logic
            let statusBadge = "neutral";
            if (veh.status === "Available") statusBadge = "success";
            if (veh.status === "On Trip") statusBadge = "warning";
            if (veh.status === "In Shop") statusBadge = "danger";
            if (veh.status === "Retired") statusBadge = "dark";

            const loadText = veh.maxLoadCapacity ? veh.maxLoadCapacity.toLocaleString() : "N/A";
            const costText = veh.acquisitionCost ? `$${veh.acquisitionCost.toLocaleString()}` : "N/A";
            
            tr.innerHTML = `
                <td><strong>${veh.registrationNumber}</strong></td>
                <td>${veh.model || "Unknown"}</td>
                <td>${veh.type}</td>
                <td>${loadText}</td>
                <td>${veh.odometer ? veh.odometer.toLocaleString() : 0}</td>
                <td>${costText}</td>
                <td><span class="badge ${statusBadge}">${veh.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        if (err.status === 403 || err.status === 401) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:var(--danger-color)">Access Denied. You do not have permission to view vehicles.</td></tr>`;
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:var(--danger-color)">Error loading vehicles: ${err.message}</td></tr>`;
        }
    }
}
