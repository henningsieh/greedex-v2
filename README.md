# Greendex v2 — Carbon Footprint Calculator Portal

**Greendex v2** is a specialized web application and participant portal for managing and calculating the carbon footprint of **Erasmus+ projects** (youth exchanges, training courses, and mobility events). Built for educators, organizers, and participants to raise environmental awareness and inspire sustainable action.

## Overview

Greendex v2 provides a modern, user-friendly portal where project organizers can:
- **Create and manage organizations** for their Erasmus+ projects
- **Invite participants** and track team members across mobility events
- **Calculate CO₂ emissions** from participant journeys (transport modes, accommodation, energy)
- **Visualize sustainability impact** with individual and group-level analytics
- **Organize sustainability challenges** to reduce carbon footprint during projects
- **Plant trees** to offset calculated emissions and join the Greendex movement
- **Support workflows** including Green Moment (30 min), Green Deal (60 min), and Green Day (180 min) workshop formats

This next iteration (v2) redesigns the carbon calculator experience as a **multi-tenant SaaS portal** with:
- Real-time organization and team management via Better Auth
- Secure role-based access control (owner, admin, member)
- Ready-to-scale WebSocket infrastructure for real-time collaboration
- Database-first approach with Drizzle ORM + PostgreSQL

Learn more at [greendex.world](https://greendex.world) and [calculator.greendex.world](https://app.greendex.world/).

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + React 19 | Server & client components, type-safe UI |
| **Language** | TypeScript 5.x | Type safety across the stack |
| **UI Framework** | shadcn/ui + Tailwind CSS | Component library + responsive design |
| **Authentication** | Better Auth + Organization Plugin | Multi-tenant auth, org/member management |
| **State Management** | nuqs | URL-based tab persistence (no extra backend state) |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe migrations and queries |
| **Server** | Node.js + Socket.IO | Custom server for WebSocket POC, real-time features |
| **Code Quality** | Biome | Fast linting & formatting |
| **Package Manager** | Bun | Fast, zero-config package management |

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 18+)
- PostgreSQL database
- Environment variables (see `.env.example` or `.env`)

### Installation

```bash
# Clone the repository
git clone https://github.com/henningsieh/greedex-v2.git
cd greedex-v2

# Install dependencies
bun install
```

### Environment Setup

Create a `.env.local` file based on your configuration:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/greendex

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### Development

Run the development server with Socket.IO support (decoupled for memory leak prevention):
```bash
bun run dev
```

Visit your configured `NEXT_PUBLIC_BASE_URL` in your browser. The Socket.IO server runs separately on port 4000.

### Build & Production

```bash
# Build: compile Next.js application
bun run build

# Start: run production server
bun run start

# Lint & format with Biome
bun run lint
bun run format
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Protected routes (authenticated users)
│   │   ├── dashboard/           # Org dashboard with tabs (Dashboard, Team, Projects)
│   │   ├── org/create/          # Organization creation onboarding
│   │   └── layout.tsx           # Auth guard, redirect to /org/create if no org
│   ├── (auth)/                  # Auth routes (login, signup, verify email)
│   ├── api/auth/[...all]/       # Better Auth API route
│   └── layout.tsx               # Root layout + metadata
├── lib/
│   ├── better-auth/             # Auth config, client initialization
│   ├── drizzle/                 # Database schema, migrations
│   ├── email/                   # Email templates & Nodemailer config
│   └── validations/             # Zod schemas (shared client/server)
├── components/
│   ├── features/                # Feature-specific components
│   │   ├── authentication/      # Login, signup, session UI
│   │   └── organizations/       # Org creation forms, modals
│   └── ui/                      # shadcn/ui + custom components
├── hooks/                        # React hooks (e.g., use-mobile)
└── server.ts                    # Custom Node.js server (Socket.IO, Next handler)
```

---

## Key Features — Phase 1 (Organization Registration & Dashboard)

✅ **Organization Onboarding** (US1)
- New verified users are redirected to create their first organization
- Only one org required to access the dashboard
- Unique slug validation with clear error handling

✅ **Dashboard Navigation** (US2)
- Tabbed interface: Dashboard, Team, Projects
- URL-based tab persistence (via `nuqs`)
- Responsive layout ready for mobile

✅ **Team Members Overview** (US3)
- Display all organization members in a table
- Show name, email, role (owner/admin/member), and join date
- Real-time integration with Better Auth organization schema

✅ **Projects Grid** (US4)
- Empty state with shadcn Empty component
- Placeholder for future project creation & management
- Responsive grid layout

---

## Database & Migrations

The project uses **Drizzle ORM** with **PostgreSQL**. Better Auth automatically manages organization and member tables.

### Run migrations

```bash
# Generate migration files
bun run auth:generate

# Apply migrations
bun run db:migrate
```

Migrations are stored in `src/lib/drizzle/migrations/`.

---

## Authentication & Authorization

This project uses **Better Auth** with the **Organization Plugin** for:
- Email/password + OAuth (GitHub, Discord) authentication
- Multi-tenant organization management
- Role-based access control (owner, admin, member)
- Invitation workflows for adding team members

Configuration: `src/lib/better-auth/index.ts`  
Client: `src/lib/better-auth/auth-client.ts`

---

## WebSocket & Real-Time (Socket.IO)

A POC for **Socket.IO** is implemented in `src/socket-server.ts` (decoupled from the Next.js server):
- Run both servers in dev with `bun run dev` (starts Next.js on 3000 and Socket.IO on 4000)
- Use `bun run dev:inspect` to run an inspect/dev instance on `3001` and a socket server on `4001` (helps avoid port collisions while debugging)
- Production requires `bun run build` then `bun run start` (both `out/server.js` and `out/socket-server.js` will be launched)

To add real-time features (e.g., live team updates), attach Socket.IO event handlers in `src/socket-server.ts` and import the client in your React components.

---

## Code Quality & Linting

This project uses **Biome** for fast, zero-config linting and formatting.

```bash
# Lint
bun run lint

# Format
bun run format

# Check + fix (one command)
bun run lint --fix
```

Configuration: `biome.json`

---

## Deployment

### Recommended: Vercel
1. Push your code to GitHub
2. Connect the repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (Vercel automatically runs `bun run build` and `bun run start`)

### Self-Hosted (Docker / VPS)
1. Build locally or in CI/CD: `bun run build`
2. Set production env vars
3. Run: `bun run start` (expects `out/server.js` from build step)
4. Use a process manager (PM2, systemd) to keep the server running

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally with `bun run dev`
3. Lint & format: `bun run lint && bun run format`
4. Commit with descriptive messages
5. Push and open a PR

For detailed development guidance, see `.github/copilot-instructions.md`.

---

## Roadmap

- **Phase 2**: Carbon Calculator Integration — mobility & accommodation CO₂ calculation
- **Phase 3**: Sustainability Challenges & Leaderboards
- **Phase 4**: Tree Planting Integration & E-Forest
- **Phase 5**: Social Impact & Analytics Dashboard

---

## Support & Resources

- **Greendex Main Site**: [greendex.world](https://greendex.world/)
- **Carbon Calculator Workshops**: [greendex.world/calculator](https://greendex.world/calculator/)
- **Erasmus+**: [erasmus-plus.ec.europa.eu](https://erasmus-plus.ec.europa.eu/)

---

## License

(Add your license here, e.g., MIT, GPL-3.0, etc.)

---

## Maintainers

- **Henning Sieh** (@henningsieh) — Project lead
- Greendex team

---

**Join the movement. Calculate. Offset. Inspire. 🌱 #greendex**
