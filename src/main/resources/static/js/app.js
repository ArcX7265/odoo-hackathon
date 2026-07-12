// TransitOps Orchestrator and Route Manager (ES Module)
import { FleetView } from './components/fleetView.js';
import { DriverView } from './components/driverView.js';

// Global App State
const App = {
    state: {
        user: null, // { email, role }
        currentView: 'dashboard',
        roiChartInstance: null
    },

    init: async () => {
        // Apply body class for base theme mapping
        document.body.classList.add('transitops-theme');

        // Check if user has an active session
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const userData = await res.json();
                App.state.user = userData;
            } else {
                // If not logged in, redirect to login page
                window.location.href = '/login.html';
                return;
            }
        } catch (err) {
            console.error('Session check failed:', err);
            window.location.href = '/login.html';
            return;
        }

        // Initialize navigation items
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                navItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                
                const viewId = item.getAttribute("data-view");
                App.switchView(viewId);
            });
        });

        // Form Setup and Tab bindings
        App.setupForms();
        
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
            App.loadVehiclesDropdowns();
        }

        // Load default dashboard
        App.switchView("dashboard");
    },

    switchView: async (viewId) => {
        App.state.currentView = viewId;

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
            "fleet-registry": "Fleet Registry",
            "driver-management": "Driver Profiles"
        };
        
        const viewTitleEl = document.getElementById("view-title");
        if (viewTitleEl) {
            viewTitleEl.textContent = viewTitleMap[viewId] || "Control Center";
        }

        // Load specific view data / render components
        if (viewId === "dashboard" && document.getElementById("kpi-active-vehicles")) {
            App.loadKpis();
        } else if (viewId === "maintenance" && document.getElementById("maintenance-ledger-body")) {
            App.loadMaintenanceLedger();
        } else if (viewId === "ledgers" && document.getElementById("fuel-ledger-body")) {
            App.loadLedgerData();
        } else if (viewId === "analytics" && document.getElementById("analytics-grid-body")) {
            App.loadAnalyticsReport();
        } else if (viewId === "fleet-registry") {
            const mount = document.getElementById("fleet-registry-mount");
            if (mount) {
                // Render modular FleetView component
                await FleetView.render(mount, App.state, App.showToast);
            }
        } else if (viewId === "driver-management") {
            const mount = document.getElementById("driver-management-mount");
            if (mount) {
                // Render modular DriverView component
                await DriverView.render(mount, App.state, App.showToast);
            }
        }
    },

    showToast: (message, type = 'info') => {
        // Safe alert fallback or simple log
        console.log(`[Toast ${type}] ${message}`);
        // To make it pretty we can create a dynamic toast on the body
        let container = document.getElementById('to-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'to-toast-container';
            container.className = 'to-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `to-toast to-toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = '✓';
        else if (type === 'danger') icon = '⚠';
        else if (type === 'warning') icon = '⚡';
        else icon = 'ℹ';

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; color: #fff;">
                <span style="font-weight: 700; font-size: 1.1rem;">${icon}</span>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid var(--border-color);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(8px);
            animation: slideIn 0.3s ease;
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // Load Dashboard KPIs
    loadKpis: async () => {
        try {
            const vType = document.getElementById("filter-vehicle-type") ? document.getElementById("filter-vehicle-type").value : "";
            const vStatus = document.getElementById("filter-vehicle-status") ? document.getElementById("filter-vehicle-status").value : "";
            const queryParams = new URLSearchParams();
            if (vType) queryParams.append("vehicleType", vType);
            if (vStatus) queryParams.append("status", vStatus);

            const res = await fetch(`/api/analytics/kpi-summary?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Failed to load KPIs");
            const kpis = await res.json();
            
            document.getElementById("kpi-active-vehicles").textContent = kpis.activeVehicles;
            document.getElementById("kpi-available-vehicles").textContent = kpis.availableVehicles;
            document.getElementById("kpi-in-maintenance").textContent = kpis.vehiclesInMaintenance;
            document.getElementById("kpi-active-trips").textContent = kpis.activeTrips;
            document.getElementById("kpi-fleet-utilization").textContent = `${kpis.fleetUtilization}%`;

            const pendingTripsEl = document.getElementById("kpi-pending-trips");
            if (pendingTripsEl) pendingTripsEl.textContent = kpis.pendingTrips !== undefined ? kpis.pendingTrips : "-";
            
            const driversOnDutyEl = document.getElementById("kpi-drivers-on-duty");
            if (driversOnDutyEl) driversOnDutyEl.textContent = kpis.driversOnDuty !== undefined ? kpis.driversOnDuty : "-";

            // Fetch ROI details to show summary stats in the overview panel
            const roiRes = await fetch("/api/analytics/vehicle-roi");
            if (roiRes.ok) {
                const roiList = await roiRes.json();
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
            }
            
            // Hide access denied covers (if role changed back)
            const expensesDenied = document.getElementById("expenses-access-denied");
            const analyticsDenied = document.getElementById("analytics-access-denied");
            if (expensesDenied) expensesDenied.style.display = "none";
            if (analyticsDenied) analyticsDenied.style.display = "none";
            
        } catch (err) {
            console.error("Error loading Dashboard KPIs:", err);
        }
    },

    // Populate Vehicle dropdowns
    loadVehiclesDropdowns: async () => {
        try {
            const res = await fetch("/api/vehicles");
            if (!res.ok) throw new Error("Failed to load vehicles");
            const vehicles = await res.json();

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
    },

    // Maintenance Ledger
    loadMaintenanceLedger: async () => {
        try {
            const res = await fetch("/api/maintenance");
            if (!res.ok) throw new Error("Failed to load maintenance");
            const logs = await res.json();
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
                    : `<button class="btn btn-sm btn-outline-orange" data-id="${log.id}">Mark Resolved</button>`;

                tr.innerHTML = `
                    <td class="text-bold">${log.vehicle ? log.vehicle.registrationNumber : 'Unknown'}</td>
                    <td>${log.description}</td>
                    <td>$${log.cost.toFixed(2)}</td>
                    <td>${log.logDate}</td>
                    <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                    <td>${actionButton}</td>
                `;
                tbody.appendChild(tr);

                // Add event listener to resolve button
                if (!isClosed) {
                    const btn = tr.querySelector("button");
                    btn.addEventListener("click", () => App.resolveMaintenanceLog(log.id));
                }
            });
        } catch (err) {
            console.error("Failed to load maintenance ledger:", err);
        }
    },

    // Resolve Maintenance
    resolveMaintenanceLog: async (id) => {
        try {
            const res = await fetch(`/api/maintenance/${id}/resolve`, {
                method: "PUT"
            });
            if (!res.ok) throw new Error("Failed to resolve maintenance");
            
            await App.loadMaintenanceLedger();
            await App.loadVehiclesDropdowns();
        } catch (err) {
            console.error("Failed to resolve maintenance log:", err);
            alert("Failed to resolve maintenance.");
        }
    },

    // Tabbed Ledgers
    loadLedgerData: async () => {
        const expensesOverlay = document.getElementById("expenses-access-denied");
        
        try {
            // Load Fuel logs
            const fuelRes = await fetch("/api/fuel-logs");
            if (fuelRes.ok) {
                const fuelLogs = await fuelRes.json();
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
            }

            // Hide overlay in case it was shown before
            if (expensesOverlay) expensesOverlay.style.display = "none";

            // Load Expenses (Role restricted)
            const expRes = await fetch("/api/expenses");
            if (expRes.status === 403 || expRes.status === 401) {
                if (expensesOverlay) expensesOverlay.style.display = "flex";
                return;
            }
            if (expRes.ok) {
                const expenses = await expRes.json();
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
            }

        } catch (err) {
            console.error("Access issue in Ledger Data:", err);
        }
    },

    // Financial ROI Analytics
    loadAnalyticsReport: async () => {
        const analyticsOverlay = document.getElementById("analytics-access-denied");
        
        try {
            const res = await fetch("/api/analytics/vehicle-roi");
            if (res.status === 403 || res.status === 401) {
                if (analyticsOverlay) analyticsOverlay.style.display = "flex";
                return;
            }
            if (!res.ok) throw new Error("Failed to load ROI report");
            const roiList = await res.json();
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
                const barWidth = Math.max(0, Math.min(100, Math.abs(roiVal)));
                // Feature 5: Real-Time ROI Alerts
                let pulseClass = "";
                let warningText = "";
                if (!isPositive) {
                    pulseClass = "pulse-red";
                    warningText = `<div class="critical-alert-text">⚠️ CRITICAL: Asset Operating at a Loss</div>`;
                }

                card.innerHTML = `
                    <div class="analytics-card-header ${pulseClass}">
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
                    ${warningText}
                `;
                grid.appendChild(card);
            });
            
            // Save data for PDF export (Feature 4)
            App.state.lastRoiData = roiList;

            // --- Render Chart ---
            const ctx = document.getElementById('roiChart');
            if (ctx) {
                if (App.state.roiChartInstance) {
                    App.state.roiChartInstance.destroy();
                }
                
                const labels = roiList.map(item => item.registrationNumber);
                const revenues = roiList.map(item => item.revenue);
                const costs = roiList.map(item => item.totalOperationalCost);
                const rois = roiList.map(item => item.roi);
                
                App.state.roiChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Revenue ($)',
                                data: revenues,
                                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Operational Cost ($)',
                                data: costs,
                                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'ROI (%)',
                                data: rois,
                                type: 'line',
                                fill: false,
                                borderColor: 'rgba(16, 185, 129, 1)',
                                tension: 0.1,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: { display: true, text: 'Amount ($)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#334155' }
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: { display: true, text: 'ROI (%)', color: '#94a3b8' },
                                ticks: { color: '#94a3b8' },
                                grid: { drawOnChartArea: false }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#334155' }
                            }
                        },
                        plugins: {
                            legend: { labels: { color: '#f8fafc' } }
                        }
                    }
                });
            }

        } catch (err) {
            console.error("Access issue in Analytics view:", err);
        }
    },

    exportRoiCsv: async () => {
        try {
            const res = await fetch("/api/analytics/vehicle-roi");
            if (!res.ok) throw new Error("Failed to load ROI report");
            const roiList = await res.json();
            
            if (roiList.length === 0) {
                alert("No data to export");
                return;
            }
            
            // Format CSV
            const headers = Object.keys(roiList[0]).join(",");
            const rows = roiList.map(item => Object.values(item).join(","));
            const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
            
            // Trigger download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "roi_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export ROI CSV:", err);
            alert("Failed to export ROI CSV.");
        }
    },

    // Setup Forms
    setupForms: () => {
        const btnRefreshKpi = document.getElementById("btn-refresh-kpi");
        if (btnRefreshKpi) {
            btnRefreshKpi.addEventListener("click", () => {
                App.loadKpis();
            });
        }
        
        const btnExportRoi = document.getElementById("btn-export-roi");
        if (btnExportRoi) {
            btnExportRoi.addEventListener("click", () => {
                App.exportRoiCsv();
            });
        }

        // Maintenance Form
        const maintForm = document.getElementById("maintenance-form");
        if (maintForm) {
            maintForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const vehicleId = document.getElementById("maint-vehicle").value;
                const description = document.getElementById("maint-description").value;
                const cost = parseFloat(document.getElementById("maint-cost").value);
                const date = document.getElementById("maint-date").value;

                try {
                    const res = await fetch("/api/maintenance", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            vehicle: { id: parseInt(vehicleId) },
                            description: description,
                            cost: cost,
                            logDate: date,
                            status: "Open"
                        })
                    });
                    if (!res.ok) throw new Error("Failed to submit maintenance");

                    maintForm.reset();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById("maint-date").value = today;

                    await App.loadVehiclesDropdowns();
                    await App.loadMaintenanceLedger();
                } catch (err) {
                    console.error("Failed to submit maintenance log:", err);
                    alert("Error submitting log.");
                }
            });
        }

        // Fuel Form
        const fuelForm = document.getElementById("fuel-form");
        if (fuelForm) {
            fuelForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const vehicleId = document.getElementById("fuel-vehicle").value;
                const liters = parseFloat(document.getElementById("fuel-liters").value);
                const cost = parseFloat(document.getElementById("fuel-cost").value);
                const date = document.getElementById("fuel-date").value;

                try {
                    const res = await fetch("/api/fuel-logs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            vehicle: { id: parseInt(vehicleId) },
                            liters: liters,
                            cost: cost,
                            logDate: date
                        })
                    });
                    if (!res.ok) throw new Error("Failed to log fuel");

                    fuelForm.reset();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById("fuel-date").value = today;

                    await App.loadLedgerData();
                } catch (err) {
                    console.error("Failed to submit fuel log:", err);
                    alert("Error logging fuel.");
                }
            });
        }

        // Expense Form
        const expForm = document.getElementById("expense-form");
        if (expForm) {
            expForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const vehicleId = document.getElementById("exp-vehicle").value;
                const type = document.getElementById("exp-type").value;
                const amount = parseFloat(document.getElementById("exp-amount").value);
                const date = document.getElementById("exp-date").value;

                try {
                    const res = await fetch("/api/expenses", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            vehicle: { id: parseInt(vehicleId) },
                            type: type,
                            amount: amount,
                            date: date
                        })
                    });
                    if (!res.ok) throw new Error("Failed to log expense");

                    expForm.reset();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById("exp-date").value = today;

                    await App.loadLedgerData();
                } catch (err) {
                    console.error("Failed to submit expense log:", err);
                    alert("Failed to log expense.");
                }
            });
        }

        // Form Switcher Tabs (Fuel vs Expense Forms)
        const formTabFuel = document.getElementById("form-tab-fuel");
        const formTabExpense = document.getElementById("form-tab-expense");
        
        if (formTabFuel && formTabExpense) {
            formTabFuel.addEventListener("click", () => {
                formTabFuel.classList.add("active");
                formTabExpense.classList.remove("active");
                
                fuelForm.classList.remove("hidden");
                if (expForm) expForm.classList.add("hidden");
            });

            formTabExpense.addEventListener("click", () => {
                formTabExpense.classList.add("active");
                formTabFuel.classList.remove("active");
                
                if (expForm) expForm.classList.remove("hidden");
                fuelForm.classList.add("hidden");
            });
        }

        // Ledger Table Switcher (Fuel vs Expense Tables)
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
        
        // PDF Export Button (Feature 4)
        const btnExportPdf = document.getElementById("btn-export-pdf");
        if (btnExportPdf) {
            btnExportPdf.addEventListener("click", () => {
                App.generatePDF();
            });
        }
    },

    // Feature 4: Generate PDF
    generatePDF: () => {
        if (!window.jspdf) {
            alert("PDF library not loaded yet.");
            return;
        }
        
        const data = App.state.lastRoiData || [];
        if (data.length === 0) {
            alert("No data available to export.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text("TransitOps Financial ROI Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        // Prepare table data
        const tableColumn = ["Registration", "Model", "Type", "Revenue", "Ops Cost", "ROI %"];
        const tableRows = [];

        data.forEach(item => {
            const rowData = [
                item.registrationNumber,
                item.model || "N/A",
                item.type,
                `$${item.revenue.toFixed(2)}`,
                `$${item.totalOperationalCost.toFixed(2)}`,
                `${(item.roi || 0).toFixed(2)}%`
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
            didParseCell: function(data) {
                // Highlight negative ROI rows
                if (data.section === 'body' && data.column.index === 5) {
                    const roiValue = parseFloat(data.cell.raw);
                    if (roiValue < 0) {
                        data.cell.styles.textColor = [220, 38, 38]; // Tailwind red-600
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [22, 163, 74]; // Tailwind green-600
                    }
                }
            }
        });
        
        // Summary stats
        let totalRev = 0, totalOps = 0;
        data.forEach(item => { totalRev += item.revenue; totalOps += item.totalOperationalCost; });
        const finalY = doc.lastAutoTable.finalY || 40;
        doc.text(`Total Fleet Revenue: $${totalRev.toFixed(2)}`, 14, finalY + 10);
        doc.text(`Total Fleet Operational Cost: $${totalOps.toFixed(2)}`, 14, finalY + 18);

        doc.save("TransitOps_Financial_Report.pdf");
    }
};

// Initialize App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on the main workspace page (fleet.html or financial.html)
    if (document.querySelector('.workspace')) {
        App.init();
    }
});

export default App;

// ==============================================
// TRIP DISPATCHER LOGIC (from origin/main)
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    const vehicleSelect = document.getElementById('vehicleSelect');
    const driverSelect = document.getElementById('driverSelect');
    const cargoWeightInput = document.getElementById('cargoWeight');
    const dispatchBtn = document.getElementById('dispatchBtn');
    const capacityWarning = document.getElementById('capacityWarning');
    const dispatchForm = document.getElementById('dispatchForm');

    // Only run if we are on the dispatch page (dispatcher.html)
    if (!vehicleSelect) return;

    fetchAssets();

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

    cargoWeightInput.addEventListener('input', validateCapacity);
    vehicleSelect.addEventListener('change', validateCapacity);

    function validateCapacity() {
        const weight = parseInt(cargoWeightInput.value, 10);
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.dataset.capacity || isNaN(weight)) {
            capacityWarning.classList.add('hidden');
            dispatchBtn.disabled = !checkFormValidity(); 
            return;
        }

        const maxCapacity = parseInt(selectedOption.dataset.capacity, 10);

        if (weight > maxCapacity) {
            capacityWarning.querySelector('span').textContent = `Warning: Cargo (${weight}kg) exceeds vehicle capacity (${maxCapacity}kg)!`;
            capacityWarning.classList.remove('hidden');
            dispatchBtn.disabled = true;
        } else {
            capacityWarning.classList.add('hidden');
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
    
    ['source', 'destination', 'vehicleSelect', 'driverSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', validateCapacity);
            el.addEventListener('change', validateCapacity);
        }
    });

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
            let res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Failed to create Draft Trip');
            const draftTrip = await res.json();
            
            const stepDraft = document.getElementById('step-draft');
            const stepDispatched = document.getElementById('step-dispatched');
            
            stepDraft.classList.add('completed');
            stepDraft.classList.remove('active');
            stepDispatched.classList.add('active');

            res = await fetch(`/api/trips/${draftTrip.id}/status?status=Dispatched`, {
                method: 'PUT'
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Failed to dispatch trip');
            }

            dispatchBtn.textContent = 'Trip Dispatched!';
            dispatchBtn.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                fetchAssets();
                dispatchForm.reset();
                dispatchBtn.textContent = 'Dispatch Trip';
                dispatchBtn.style.background = '';
                
                stepDraft.classList.add('active');
                stepDraft.classList.remove('completed');
                stepDispatched.classList.remove('active');
                dispatchBtn.disabled = true;
            }, 3000);

        } catch (error) {
            console.error(error);
            alert(`Dispatch Error: ${error.message}`);
            dispatchBtn.disabled = false;
            dispatchBtn.textContent = 'Dispatch Trip';
        }
    });
});
