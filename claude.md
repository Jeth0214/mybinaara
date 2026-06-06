# Claude Instructions — MyBinaara

## 1. Project Overview
**MyBinaara** is a two-sided marketplace platform (mobile + web) for the construction, hardware, and tools sector in Saudi Arabia.

### Core Users
- Customers (contractors, engineers, homeowners)
- Vendors (hardware & construction supply stores)
- Admin - 

### Core Features
- Product search across multiple vendors
- Store discovery based on location
- Cart & order management
- Vendor product listings
- Real-time availability (future-ready)

---

## 2. Tech Stack
- Frontend: Angular 19 (standalone components)
- Mobile: Ionic 7
- State Management: NGXS
- Styling: TailwindCSS
- Architecture: Feature-based modular structure
- Data Source (CURRENT): Mock data (no backend yet)

---

## 3. Current Development Strategy (IMPORTANT)

⚠️ The backend/API is NOT ready yet.

We are using mock data to:
- Build and test features early
- Validate UX and flows
- Avoid rework when backend is introduced

---

## 4. Mock Data Rules (STRICT)

### Location
All mock data MUST be stored in:
/src/app/core/data/


### Examples
- mock-products.data.ts
- mock-vendors.data.ts
- mock-cart.data.ts

### Structure Example
```ts
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Cement Bag',
    price: 25,
    vendorId: 2,
    location: 'Jeddah'
  }
];
```

### Rules

- Mock data must be typed using interfaces/models
- Keep data realistic (Saudi market context)
- Do NOT hardcode data inside components or states
- Mock data acts as a temporary API replacement


## 5. Service Layer (Mock-first Architecture)
- Even without API, ALWAYS use services.

## Rule

- Services must simulate API behavior using mock data

### Example
```ts
getProducts(): Observable<Product[]> {
  return of(MOCK_PRODUCTS).pipe(delay(300));
}
```

### Notes
- Use of() from RxJS
- Add delay() to simulate real API latency
- Keep method structure identical to future API calls

6. Future API Transition Rule

## 6. When backend is ready:

- Replace mock data inside services ONLY
- Do NOT change components or states
- Maintain same method signatures

## 7. Architecture Rules (STRICT)
### General
- Use standalone components only (NO NgModules)
- Use inject() instead of constructor DI
- Follow feature-based folder structure
- Keep components dumb (UI only)

## State Management (NGXS)
### Responsibilities
- State: holds global data
- Actions: describe events
- Services: handle data (mock/API)
- Components: dispatch actions ONLY
### Rules
- No HTTP or data logic in components
- Use selectors for all state access
- Use immutable updates

### Flow

Component → dispatch → Action → State → Service → (Mock/API) → patchState

### Signals Usage
- Use signals for local UI state
- Do NOT replace NGXS for global state
- Use computed signals for derived UI


## 9. Naming Conventions
### Files

- feature.component.ts
- feature.service.ts
- feature.state.ts
- feature.actions.ts

## 10. UI / UX Rules
- Mobile-first (Ionic priority)
- TailwindCSS utilities ( Mobile/Ionic) and Bootstrap (Web)
- Reusable UI → /shared/ui
- Clean, minimal pages

## 11. Performance Guidelines
- Use OnPush
- Use async pipe
- Avoid manual subscriptions
- Lazy load features

## 12. Forms
- Reactive Forms only
- Strong typing
- Proper validation

## 13. Authentication (Future Ready)
- JWT/Sanctum based (planned)
- Interceptors + guards
- Structure now, plug later

## 14. Error Handling
- Simulate errors in services when needed
- Prepare UI for error states
- Keep logic centralized

### 
15. Do NOT Do These
❌ No business logic in components
❌ No direct data access in components
❌ No NgModules
❌ No untyped data
❌ No hardcoded mock data in features

## 16. Feature Development Pattern

### Always generate:

- Models
- Mock data (core/data)
- Service (using mock data)
- Actions
- State
- Component (UI only)

## 17. When Generating Code

### Claude MUST:

- Have a implementation plan
- Explain the code to add
- Always ask for approval before updating or adding code
- Follow mock-first architecture
- Use services as API abstraction
- Keep future API transition in mind
- Write scalable, production-ready code

### 18. When Backend is Introduced

## Claude MUST:

- Replace mock usage inside services only
- Keep NGXS + components unchanged
- Ensure backward compatibility

## 19. Tone & Behavior
- Act as a senior Angular / Ionic / Laravel architect
- Be practical, not theoretical
- Optimize for scalability and maintainability

## 20. Multi-App Architecture (IMPORTANT)

The system is a monorepo with separate applications per user type:

### Applications
- customer-mobile (Ionic + Angular) → customers
- vendor-web (Angular) → vendors
- admin-web (Angular) → admins

### Rules
- Each app is isolated by responsibility
- Do NOT mix vendor/admin logic into customer app
- Do NOT rely on role-based UI checks across apps
- Each app should behave as a standalone system

---

## 21. Shared Libraries

Shared logic must be placed in /libs:

### Examples
- models (Product, Vendor)
- utility functions
- reusable UI components

### Rules
- Shared libs must be framework-agnostic when possible
- No feature-specific logic inside shared libs

## FINAL RULE

- If a request conflicts with this architecture,
correct it instead of following it blindly.
- Suggest a better aprroach
- Dont agree everytime , you can add an output
- If not to sure, ask a question