---
name: "Code Standards"
description: "TypeScript, JavaScript, React, and testing best practices"
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Code Standards

This document describes TypeScript, JavaScript, React, and testing best practices for this project.

Oxc linting (see `docs/oxc/`) catches most issues automatically. Focus on patterns Oxc cannot enforce.

---

## TypeScript Best Practices

### Type Safety & Explicitness

**Use explicit types when they enhance clarity**:

```typescript
// ✅ Good: Clear intent for public APIs
function calculateEmissions(input: EmissionsInput): EmissionsResult {
  // ...
}

// ⚠️ Acceptable: Inference is clear
const userName = user.name; // string is obvious
```

**Prefer `unknown` over `any`**:

```typescript
// ✅ Good: Forces type checking
function parseJSON(input: string): unknown {
  return JSON.parse(input);
}

const data = parseJSON(json);
if (typeof data === "object" && data !== null) {
  // Now TypeScript knows it's an object
}

// ❌ Avoid: Bypasses type checking
function parseJSON(input: string): any {
  return JSON.parse(input);
}
```

**Use const assertions for literal types**:

```typescript
// ✅ Good: Type is { role: "admin" }, not { role: string }
const config = { role: "admin" } as const;

// ✅ Good: Type is readonly ["a", "b", "c"]
const statuses = ["pending", "approved", "rejected"] as const;
type Status = (typeof statuses)[number]; // "pending" | "approved" | "rejected"
```

**Leverage type narrowing instead of assertions**:

```typescript
// ✅ Good: Type narrowing
if (typeof value === "string") {
  console.log(value.toUpperCase()); // TypeScript knows it's a string
}

// ❌ Avoid: Type assertion (bypasses safety)
console.log((value as string).toUpperCase());
```

**Extract magic numbers into named constants**:

```typescript
// ✅ Good: Self-documenting
const MAX_PROJECT_NAME_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 20;

// ❌ Avoid: Magic numbers
if (name.length > 100) {
  /* ... */
}
```

---

## Modern JavaScript/TypeScript Patterns

### Arrow Functions

Use for callbacks and short functions:

```typescript
// ✅ Good
const doubled = numbers.map((n) => n * 2);
const handleClick = () => setCount(count + 1);

// ⚠️ Acceptable for methods that need `this`
class Component {
  method() {
    // Traditional function if you need `this` binding
  }
}
```

### Loops

Prefer `for...of` over `.forEach()` and indexed loops:

```typescript
// ✅ Best: Modern and readable
for (const user of users) {
  console.log(user.name);
}

// ⚠️ Acceptable: When you need the index
for (const [index, user] of users.entries()) {
  console.log(`${index}: ${user.name}`);
}

// ❌ Avoid: Verbose and error-prone
for (let i = 0; i < users.length; i++) {
  console.log(users[i].name);
}
```

### Optional Chaining & Nullish Coalescing

```typescript
// ✅ Good: Safe property access
const userName = user?.profile?.name;

// ✅ Good: Default only for null/undefined
const count = userCount ?? 0; // Keeps 0, false, ""

// ❌ Avoid: Defaults for any falsy value
const count = userCount || 0; // Replaces 0, false, ""
```

### Template Literals

```typescript
// ✅ Good
const message = `Hello, ${user.name}!`;

// ❌ Avoid
const message = "Hello, " + user.name + "!";
```

### Destructuring

```typescript
// ✅ Good: Object destructuring
const { name, email } = user;
const { data, error } = await fetchUser();

// ✅ Good: Array destructuring
const [first, second] = items;
const [count, setCount] = useState(0);

// ✅ Good: Function parameter destructuring
function createUser({ name, email, role = "user" }: CreateUserInput) {
  // ...
}
```

### Variable Declarations

```typescript
// ✅ Default to const
const userId = user.id;

// ✅ Use let only when reassignment is needed
let count = 0;
count++;

// ❌ Never use var
var oldStyle = "don't do this";
```

---

## Async & Promises

### Always await promises

```typescript
// ✅ Good: Actually waits for the result
const user = await getUser(id);
console.log(user.name);

// ❌ Avoid: Promise returned but not awaited
const user = getUser(id); // Returns Promise<User>, not User
console.log(user.name); // Runtime error!
```

### Prefer async/await over promise chains

```typescript
// ✅ Good: Readable and clear
async function fetchUserProjects(userId: string) {
  const user = await getUser(userId);
  const projects = await getProjects(user.projectIds);
  return projects;
}

// ❌ Avoid: Hard to read
function fetchUserProjects(userId: string) {
  return getUser(userId)
    .then((user) => getProjects(user.projectIds))
    .then((projects) => projects);
}
```

### Handle errors appropriately

```typescript
// ✅ Good: Explicit error handling
async function createProject(input: CreateProjectInput) {
  try {
    const project = await db.insert(projects).values(input);
    return project;
  } catch (error) {
    logger.error("Failed to create project", error);
    throw new Error("Project creation failed");
  }
}

// ❌ Avoid: Silent failures
async function createProject(input: CreateProjectInput) {
  const project = await db.insert(projects).values(input); // Error crashes the app
  return project;
}
```

### Don't use async functions as Promise executors

```typescript
// ❌ Avoid: Async function in Promise constructor
new Promise(async (resolve, reject) => {
  const data = await fetchData();
  resolve(data);
});

// ✅ Good: Just use the async function directly
async function fetchData() {
  // ...
  return data;
}
```

---

## React & JSX

### Function Components

Use function components over class components:

```typescript
// ✅ Good: Function component
export function ProjectCard({ project }: { project: Project }) {
  return <div>{project.name}</div>;
}

// ❌ Avoid: Class component (outdated)
export class ProjectCard extends React.Component { /* ... */ }
```

### Hooks Rules

**Call hooks at the top level only**:

```typescript
// ✅ Good
function MyComponent() {
  const [count, setCount] = useState(0);
  const user = useUser();

  return <div>{count}</div>;
}

// ❌ Avoid: Conditional hooks
function MyComponent({ showCount }) {
  if (showCount) {
    const [count, setCount] = useState(0); // ❌ Breaks React
  }
  return <div>...</div>;
}
```

**Specify all dependencies correctly**:

```typescript
// ✅ Good: All dependencies listed
useEffect(() => {
  fetchData(userId, filters);
}, [userId, filters]);

// ❌ Avoid: Missing dependencies
useEffect(() => {
  fetchData(userId, filters); // filters not in deps
}, [userId]);
```

### Keys in Lists

Use unique IDs, not array indices:

```typescript
// ✅ Good: Stable unique IDs
{projects.map(project => (
  <ProjectCard key={project.id} project={project} />
))}

// ❌ Avoid: Array indices (causes bugs during reordering)
{projects.map((project, index) => (
  <ProjectCard key={index} project={project} />
))}
```

### Children Composition

Nest children between opening/closing tags:

```typescript
// ✅ Good
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid: Children as props
<Card children={<CardContent>Content</CardContent>} />
```

### Component Definition Location

Don't define components inside other components:

```typescript
// ❌ Avoid: Re-created on every render
function ParentComponent() {
  const ChildComponent = () => <div>Child</div>;
  return <ChildComponent />;
}

// ✅ Good: Defined at module level
const ChildComponent = () => <div>Child</div>;

function ParentComponent() {
  return <ChildComponent />;
}
```

### Accessibility

- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<article>`
- Provide meaningful alt text: `<img alt="Project logo" />`
- Use proper heading hierarchy: `h1` → `h2` → `h3`
- Add labels for form inputs: `<Label htmlFor="email">Email</Label>`
- Include keyboard handlers alongside mouse events:
  ```typescript
  <div
    onClick={handleClick}
    onKeyDown={(e) => e.key === "Enter" && handleClick()}
    role="button"
    tabIndex={0}
  >
    Click me
  </div>
  ```

### React 19+ Patterns

Use `ref` as a prop instead of `React.forwardRef`:

```typescript
// ✅ Good: React 19+
function Input({ ref, ...props }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// ⚠️ Outdated: React 18 pattern
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

---

## Error Handling & Debugging

### Production Code Cleanliness

Remove debugging statements:

```typescript
// ❌ Avoid in committed code
console.log("user data:", user);
debugger;
alert("Debug message");

// ✅ Good: Use proper logging in development
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

### Throw Error Objects

```typescript
// ✅ Good: Error objects with messages
throw new Error("Project not found");
throw new NotFoundError("User with ID ${id} does not exist");

// ❌ Avoid: Strings or other types
throw "Project not found"; // ❌ String
throw 404; // ❌ Number
```

### Meaningful Error Handling

```typescript
// ✅ Good: Catch and handle appropriately
try {
  await deleteProject(id);
} catch (error) {
  logger.error("Failed to delete project", error);
  toast.error("Unable to delete project. Please try again.");
}

// ❌ Avoid: Catch just to rethrow
try {
  await deleteProject(id);
} catch (error) {
  throw error; // Pointless
}
```

### Early Returns

```typescript
// ✅ Good: Early returns reduce nesting
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;

  return user.name.toUpperCase();
}

// ❌ Avoid: Nested conditionals
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      return user.name.toUpperCase();
    }
  }
  return null;
}
```

---

## Code Organization

### Function Complexity

Keep functions focused and under reasonable cognitive complexity:

```typescript
// ✅ Good: Single responsibility
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password);
}

// ❌ Avoid: Does too much
function validateUser(user: User): boolean {
  // 50 lines of validation logic
}
```

### Extract Complex Conditions

```typescript
// ✅ Good: Named boolean variables
const isEligibleForDiscount = user.isPremium && order.total > 100;
const canEditProject = user.role === "admin" || project.ownerId === user.id;

if (isEligibleForDiscount) {
  applyDiscount();
}

// ❌ Avoid: Inline complex conditions
if (user.isPremium && order.total > 100) {
  applyDiscount();
}
```

### Avoid Nested Ternaries

```typescript
// ✅ Good: Clear if/else or switch
let badge;
if (status === "approved") badge = "success";
else if (status === "pending") badge = "warning";
else badge = "error";

// ❌ Avoid: Nested ternaries
const badge =
  status === "approved" ? "success" : status === "pending" ? "warning" : "error";
```

---

## Security

### External Links

```typescript
// ✅ Good: Prevent window.opener access
<a href={externalUrl} target="_blank" rel="noopener noreferrer">
  Link
</a>

// ❌ Avoid: Missing rel attribute
<a href={externalUrl} target="_blank">Link</a>
```

### Dangerous HTML

```typescript
// ❌ Avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good: Use sanitization library if needed
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Best: Avoid entirely; render as text
<div>{userInput}</div>
```

### Input Validation

Always validate and sanitize user input on the server (Zod schemas in oRPC procedures).

---

## Testing Best Practices

### Structure

```typescript
// ✅ Good: Descriptive test structure
describe("calculateEmissions", () => {
  it("should calculate correct CO2 for flight", () => {
    const result = calculateEmissions({ type: "flight", distance: 1000 });
    expect(result.co2).toBe(250);
  });

  it("should throw error for negative distance", () => {
    expect(() => calculateEmissions({ type: "flight", distance: -100 })).toThrow(
      "Distance must be positive",
    );
  });
});
```

### Async Tests

```typescript
// ✅ Good: Use async/await
it("should fetch user data", async () => {
  const user = await getUser("123");
  expect(user.name).toBe("John");
});

// ❌ Avoid: done() callbacks (outdated)
it("should fetch user data", (done) => {
  getUser("123").then((user) => {
    expect(user.name).toBe("John");
    done();
  });
});
```

### Test Isolation

Don't use `.only()` or `.skip()` in committed code (breaks CI).

---

## For More Details

- **Oxc linting**: `docs/oxc/`
- **React patterns**: Official React docs (react.dev)
- **TypeScript handbook**: typescriptlang.org
