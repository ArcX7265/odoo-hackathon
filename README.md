# TransitOps 🚚

**TransitOps** is a comprehensive, end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management. It enforces business rules, manages role-based access, and provides operational insights to streamline logistics workflows.

Built as part of an 8-Hour Hackathon challenge, TransitOps replaces manual logbooks and spreadsheets with a centralized, real-time control system.

## 🌟 Key Features

- **Fleet Registry & Management:** Track active, available, and retired vehicles. Monitor load capacities and vehicle statuses.
- **Driver Management:** Manage driver profiles, track license expiries, and monitor safety scores.
- **Trip Dispatcher:** Create and dispatch trips dynamically. Features real-time cargo capacity validation and assigns vehicles/drivers based on their "Available" status.
- **Maintenance & Fuel Logs:** Log vehicle maintenance and fuel consumption. Automatically resolves issues and calculates operational costs.
- **Financial Analytics & ROI:** Monitor fleet utilization, acquisition costs, and total operational costs. Generates real-time ROI reports for individual vehicles.
- **Role-Based Access Control:** Secure portals customized for different roles:
  - `FLEET_MANAGER`: Full access to the Fleet Dashboard, Vehicle Registry, and Analytics.
  - `FINANCIAL_ANALYST`: Access to Ledgers, Financial Dashboards, and ROI metrics.
  - `DISPATCHER`: Access to the Trip Dispatching portal.
  - `DRIVER`: Access to Driver Portal and trip assignments.

## 🛠️ Technology Stack

**Backend**
- **Java 17+**
- **Spring Boot 3.x** (Web, Data JPA, Security)
- **H2 Database** (In-memory database for rapid prototyping and testing)
- **Hibernate / JPA** (ORM mapping)
- **Maven** (Dependency management)

**Frontend**
- **HTML5 & CSS3** (Custom UI with a modern dark theme)
- **Vanilla JavaScript (ES6 Modules)** (Component-based architecture)
- **Chart.js** (Data visualization)
- **jsPDF / html2pdf** (Automated report generation)

## 🚀 Getting Started

### Prerequisites
- JDK 17 or higher
- Maven 3.x

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ArcX7265/odoo-hackathon.git
   cd odoo-hackathon
   ```

2. **Build and Run the Application:**
   Using Maven wrapper or local Maven installation:
   ```bash
   mvn clean spring-boot:run
   ```
   
   The server will start on `http://localhost:8080`. 
   *Note: The application automatically seeds the in-memory H2 database with initial mock data (Drivers, Vehicles, Trips, etc.) upon startup.*

3. **Access the Application:**
   Open your browser and navigate to:
   [http://localhost:8080/](http://localhost:8080/)

### Default Login Roles
The application enforces role-based access. By default, you can explore the different functionalities using these views (depending on your testing flow, you can modify roles in the Database Seeder):

- **Fleet Manager Dashboard:** `/fleet.html`
- **Financial Analytics:** `/financial.html`
- **Dispatcher Portal:** `/dispatcher.html`
- **Driver Portal:** `/driver.html`

## 📁 Project Structure

```
├── src/main/java/com/transitops/api/
│   ├── config/          # Spring Security and CORS configurations
│   ├── controllers/     # REST API Endpoints (Trips, Vehicles, Analytics)
│   ├── models/          # JPA Entities (Vehicle, Driver, Trip, etc.)
│   ├── repositories/    # Spring Data JPA interfaces
│   └── services/        # Core business logic and database seeding
├── src/main/resources/
│   ├── application.properties # Spring configuration (H2 config, Port)
│   └── static/          # Frontend SPA assets
│       ├── css/         # Stylesheets
│       ├── js/          # ES Modules (app.js, components)
│       └── *.html       # Role-specific HTML views
```

## ⚠️ Notes for Developers

- **In-Memory Database:** The application uses an H2 in-memory database. All data will reset when the server restarts. The `DatabaseSeeder.java` file handles populating the initial required mock data.
- **Module Scripts:** The frontend relies on ES Modules (`<script type="module">`). Ensure your browser supports ES modules (all modern browsers do). The JavaScript initializes directly rather than waiting for `DOMContentLoaded` to avoid execution timing issues.
