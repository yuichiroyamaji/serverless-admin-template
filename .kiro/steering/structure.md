# Project Structure

## Root Directory Layout

```
/
├── frontend/          # Next.js application
├── backend/           # AWS Lambda functions
├── infra/             # AWS CDK infrastructure code
└── docs/              # Project documentation
```

## Frontend Structure (`/frontend/src`)

### Core Directories

- **`app/`** - Next.js App Router routing files only (page.tsx, layout.tsx, etc.)
  - `(admin)/` - Admin dashboard routes with shared layout
  - `(full-width-pages)/` - Full-width pages (auth, errors)

- **`components/`** - Domain-agnostic, reusable UI components (no business logic)
  - `common/` - Shared components used across the app
  - `ui/` - Generic UI elements (buttons, modals, tables, forms, etc.)

- **`features/`** - Domain-specific modules with all related files co-located
  - Each feature contains: `components/`, `hooks/`, `actions/`, `contexts/`, `types/`, `services/`, `utils/`, `logics/`, `test/`
  - Example: `features/ecommerce/`, `features/user-profile/`

- **`hooks/`** - Global custom hooks (domain-agnostic UI logic)

- **`contexts/`** - React Context providers for global state (e.g., ThemeContext, SidebarContext)

- **`utils/`** - Global utility functions (date processing, string manipulation, etc.)

- **`services/`** - Global service functions (CSV download, data conversion, etc.)

- **`data/`** - Placeholder data and Prisma queries

- **`constants/`** - Global constants

- **`types/`** - Global TypeScript type definitions

- **`lib/`** - Library configurations and wrappers

- **`layout/`** - Layout components

- **`icons/`** - SVG icon files

## Feature Module Structure

Each feature in `/features` follows this pattern:

```
features/
└── [feature-name]/
    ├── components/        # Feature-specific components
    │   ├── children/      # Child components
    │   ├── common/        # Feature-scoped common components
    │   └── ui/            # Feature-scoped customized UI
    ├── hooks/             # UI logic (Container/Presentational pattern)
    ├── actions/           # Server Actions
    ├── contexts/          # Feature-specific contexts
    ├── types/             # Feature-specific type definitions
    ├── services/          # Feature-scoped services
    ├── utils/             # Feature-scoped utilities
    ├── logics/            # Server-side business logic
    └── test/              # Tests for business logic
```

## Infrastructure Structure (`/infra`)

```
infra/
├── bin/               # CDK app entry point
├── lib/
│   ├── constructs/    # Reusable CDK constructs
│   └── stacks/        # CDK stack definitions
│       ├── app-stack.ts
│       └── infra-stack.ts
└── test/              # Infrastructure tests
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `SampleList.tsx`)
- **Child Components**: ParentName + Description (e.g., `SampleListTable.tsx`)
- **Custom Hooks**: camelCase starting with "use" (e.g., `useSampleList.ts`)
- **Server Actions**: ComponentName + "Actions" (e.g., `SampleListActions.ts`)
- **Contexts**: PascalCase + "Context" (e.g., `SampleContext.tsx`)
- **Services**: camelCase + "Service" (e.g., `csvDownloadService.ts`)
- **Utils**: camelCase describing function (e.g., `convertDataToCSV.ts`)
- **DAOs**: camelCase describing data (e.g., `getCancelOrdersMonthly.ts`)

### Folders
- All lowercase with hyphens for multi-word names (e.g., `ui-elements`)

## Key Principles

1. **Routing Separation**: Only Next.js routing files (page.tsx, layout.tsx, etc.) go in `/app`
2. **Feature Co-location**: Keep feature-related code together in `/features`
3. **Shared vs Scoped**: Global utilities in root directories, feature-specific in feature folders
4. **Component Hierarchy**: Distinguish between generic UI components and feature-specific components
