# RQI ERP Architecture Documentation

## Admin Panel Strategy
We follow a **Single Application (Monolith Frontend)** strategy instead of a separate Admin Panel application.

### Why?
1.  **Unified Codebase**: Shared components (UI, Auth, API hooks) reduce development time.
2.  **Role-Based Rendering**: Menus and Routes are protected by `RoleGuard`.
    *   `Admin`: Sees "Tenant Settings", "Global Reports", "Audit Logs".
    *   `Manager`: Sees "Project Management", "Team Overview".
    *   `User`: Sees "My Tasks", "Time Tracking".
3.  **Seamless Experience**: Users with multiple roles can switch contexts without re-login.

## Security Architecture
### 1. Logging
We catch **ALL** movements using `SecurityLoggerInterceptor`.
*   **Data Points**: IP, Country, City, Device ID (User-Agent), Action (Method + URL).
*   **Storage**: `SecurityLog` table in PostgreSQL.

### 2. Access Control
*   **RBAC**: Role-based access control via Guards.
*   **Policies**: `AccessPolicy` table allows defining temporal (Time/Day) and network (IP) restrictions per user/role.
