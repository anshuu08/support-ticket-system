# ⚡ SupportDesk — AI-Powered Support Ticket System

## Features
- 🔐 Authentication (register/login/logout, token-based)
- 🤖 AI auto-classification of tickets (category + priority) via Claude Haiku
- 🤖 AI suggested replies for staff
- 📊 Stats dashboard with priority/category/status breakdowns
- 🎫 Ticket detail modal with full activity log
- 💬 Comments with internal notes (staff only)
- 👥 Ticket assignment to staff members
- 📅 Due dates with overdue highlighting
- 📎 File attachments
- ✅ Bulk actions (status/priority changes)
- 📥 CSV export
- 🔍 Search + filter by category/priority/status
- 🔄 Sort by newest/oldest/priority/due date
- 🛡️ Admins see all tickets; users see their own

## Setup

### 1. Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 2. Run:
```bash
docker-compose up --build
```

### 3. Open http://localhost:5173

### 4. Create an admin:
```bash
docker-compose exec backend python manage.py createsuperuser
```

## LLM Choice: Anthropic Claude Haiku
- Extremely fast (ideal for on-blur classification UX)
- Cost-efficient for high-volume classification
- Reliable JSON output with constrained prompts
- Used for both ticket classification and reply suggestions

## Design Decisions
- **Debounced classification**: fires 800ms after user stops typing (30+ chars)
- **Graceful degradation**: LLM failure doesn't block ticket submission
- **DB-level aggregation**: stats use Django ORM annotate/aggregate only
- **Nested router**: comments live at `/api/tickets/{id}/comments/`
- **Role-based visibility**: admins see all, users see their own
- **Token auth**: simple, stateless, works well for this scale
