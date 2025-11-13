Plan: Streamline `.github/instructions` files

**Goal**  
- Minimize agent-context clutter by relocating detailed instruction files from `.github/instructions` to `docs/instructions`, while retaining concise, canonical pointers in `.github/instructions`.

**Rationale**  
- `.github/instructions` is part of the AI agent's recurring context. Excessive large files can hinder reasoning efficiency.  
- `docs/` is better suited for detailed guides, making them accessible to humans and retrievable by agents on demand.

**Proposal**  

1. **Create `docs/instructions/` structure**:  
   - Subfolders:  
     - `docs/instructions/better-auth`  
     - `docs/instructions/orpc`  
     - `docs/instructions/shadcn`  
     - `docs/instructions/react-email`  

2. **Move detailed files to `docs/instructions/`**:  
   - Relocate:  
     - `orpc.*.instructions.md` → `docs/instructions/orpc/`  
     - `shadcn-*.instructions.md` → `docs/instructions/shadcn/`  
     - `react.email/*` → `docs/instructions/react-email/`  
     - `better-auth.options.instructions.md` and `better-auth.organizations.md.instructions.md` → `docs/instructions/better-auth/`  
   - Retain:  
     - `better-auth.documentation.instructions.md` in `.github/instructions` (canonical entry point).  

3. **Slim down `.github/instructions`**:  
   - Keep only high-level pointers and canonical files.  
   - Replace moved files with 1–3 line stubs pointing to `docs/` (e.g., `See docs/instructions/orpc/orpc.init.installation.instructions.md`).  

4. **Add `.github/instructions/README.md`**:  
   - Explain the folder's purpose, canonical entries, and where detailed content resides.  
   - Include instructions for pulling specific docs into the agent context.  

5. **Optional helpers**:  
   - Create `scripts/sync-instructions.sh` to manage file movement between `.github/instructions` and `docs/instructions`.  
   - Update the main `README.md` or `CONTRIBUTING` with guidelines for `.github/instructions` usage (e.g., max 3 files or <200KB).  

6. **Prepare a git patch/PR**:  
   - Implement changes for review.  

**Files to move**:  
- `.github/instructions/orpc.*.instructions.md`  
- `.github/instructions/shadcn-*.instructions.md`  
- `.github/instructions/react.email/*`  
- `.github/instructions/better-auth.options.instructions.md`  
- `.github/instructions/better-auth.organizations.md.instructions.md`  

**Files to keep in `.github/instructions`**:  
- `better-auth.documentation.instructions.md`  
- `README.md` (new index).  

**Migration steps**:  
1. Create `docs/instructions/` and subfolders.  
2. Move files to their new locations.  
3. Add stub files in `.github/instructions`.  
4. Write `.github/instructions/README.md`.  
5. Commit changes as a single patch or topic-based commits.  

**Agent-focused README content**:  
- Purpose: Minimal instruction set for agents; detailed docs in `docs/instructions/`.  
- Canonical entries: `better-auth.documentation.instructions.md`.  
- Fetching docs: Copy from `docs/instructions/<topic>/...` as needed.  
- Maintenance: Prefer `docs/instructions/` for new content unless always-needed by agents.  

**Optional sync helper (`scripts/sync-instructions.sh`)**:  
- Automate staging/unstaging files between `.github/instructions` and `docs/instructions`.  

**Follow-ups**:  
- Prepare the git patch/PR.  
- Create `docs/instructions/` structure and stubs without moving files.  
- Generate `README.md` text for review.  

**Questions**:  
- Should additional files remain in `.github/instructions`?  
- Include `scripts/sync-instructions.sh` in the PR?  