# Coding Conventions

## Component & Function Declarations

### Components
Use `function` declarations with `export default` at declaration time:

```typescript
// ✓ Correct
export default function Page() {
  return <h1>Hello Next.js!</h1>
}

// ✗ Avoid
const Page = () => {
  return <h1>Hello Next.js!</h1>
}
export default Page;
```

### Functions Inside Components
Use arrow functions for functions defined within components:

```typescript
export default function useSampleHook() {
  const handleClick = (value: string) => {
    console.log('value:', value);
  };
  
  const handleSubmit = async () => {
    // async logic
  };
}
```

### Service & Utility Functions
Use arrow function expressions (these are used within components):

```typescript
export const getLastDayOfMonth = (date: Date): Date => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay;
};
```

## Type Definitions

- **`interface`** for Component Props
- **`type`** for everything else

```typescript
// Component Props - use interface
interface SampleComponentProps {
  clientId: number;
  selectedMonth: string;
}

// Other types - use type
export type Chat = {
  avatar: string;
  name: string;
  text: string;
};
```

### Type Definition Location
- Component props: defined in the component file
- Feature-specific types: `features/[feature-name]/types/`
- Global types: `src/types/`

## Logging

### Client Components
Use standard `console.log()` for client-side logging.

### Server Components
Use Pino logger (logs to `/data/logs/server.log`):

```typescript
import { logger } from '@/lib/pino/logger';

export default function sampleFunction({clientId, selectedMonth}: SampleProps) {
  // Function start
  logger.info(`[FUNCTION][START]sampleFunction(clientId: ${clientId}, selectedMonth: ${selectedMonth})`);
  
  // Error handling
  try {
    // logic
  } catch (error) {
    logger.error(`[ERROR]sampleFunction(errorMessage: ${error})`);
    return null;
  }
  
  // Object logging
  logger.infoObj(data);
  
  // Function end
  logger.info(`[FUNCTION][END]sampleFunction(response: data => BELOW)`);
  return data;
}
```

## Custom Hooks

Return values as objects for flexible destructuring:

```typescript
// Hook definition
export const useCounter = () => {
  return { count, setCount, incrementCount, decrementCount };
};

// Usage
const { count, incrementCount } = useCounter();
```

## Documentation Comments

Add JSDoc comments for services and utilities:

```typescript
/**
 * @description Download CSV content as file with directory selection
 * @param csvContent - CSV content string to download
 * @param filename - Suggested filename (e.g., 'data_20250623-143052.csv')
 * @returns Promise that resolves when download starts
 */
export async function csvDownloadService(csvContent: string, filename: string) {
  // implementation
}
```

## String Handling

Use template literals instead of concatenation:

```typescript
// ✓ Correct
const msg = `Message 01 ${message02} Message 03`;

// ✗ Avoid
const msg = 'Message 01' + message02 + 'Message 03';
```

## Server Actions vs API Routes

**Prefer Server Actions** for most server-side operations. Use API Routes only when:
- Triggering logic on page navigation/load (e.g., SMS authentication on page open)
- Handling webhooks or external API calls
- Non-form-based operations that need explicit HTTP endpoints

Server Actions are ideal for form submissions and user-triggered operations.

## Next.js App Router Files

Standard Next.js file names and their purposes:
- `page.tsx` - Route page component
- `layout.tsx` - Shared UI that persists across routes
- `loading.tsx` - Loading UI
- `error.tsx` - Error handling UI
- `not-found.tsx` - 404 page
- `route.tsx` - API endpoint
- `template.tsx` - Re-rendered shared UI (unlike layout)
- `default.tsx` - Default fallback
- `middleware.tsx` - Request middleware

## General Best Practices

1. **Export Defaults**: Declare at function definition, not at file end
2. **State Management**: Combine `useState` with Server Actions; use `useFormState` for form error handling
3. **Logging**: Add tracking logs at function entry/exit and error points
4. **Index Files**: Use `index.ts` only when a folder contains a single logical export
