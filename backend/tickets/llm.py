import os
import json
import anthropic

SYSTEM_PROMPT = """You are a support ticket classification assistant.
Given a support ticket description, you must return ONLY a valid JSON object with two fields:
- "category": one of ["billing", "technical", "account", "general"]
- "priority": one of ["low", "medium", "high", "critical"]

Rules for priority:
- critical: system down, data loss, security breach, complete inability to work
- high: major feature broken, significant business impact
- medium: partial functionality affected, workaround exists
- low: minor issue, cosmetic problem, general question

Rules for category:
- billing: payment, invoice, subscription, refund, pricing
- technical: bugs, errors, performance, integrations, API
- account: login, password, profile, permissions, access
- general: everything else

Respond with ONLY the JSON object, no explanation, no markdown."""


def classify_ticket(description: str) -> dict | None:
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return None
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Classify this support ticket:\n\n{description}"}]
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        category = data.get('category', '').lower()
        priority = data.get('priority', '').lower()
        if category not in {'billing', 'technical', 'account', 'general'}:
            return None
        if priority not in {'low', 'medium', 'high', 'critical'}:
            return None
        return {'suggested_category': category, 'suggested_priority': priority}
    except Exception:
        return None


def suggest_reply(ticket_title: str, ticket_description: str, category: str) -> str | None:
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return None
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system="""You are a helpful support agent. Write a brief, professional, empathetic reply to a support ticket.
Keep it under 100 words. Be specific to their issue. Start with acknowledgment, then next steps.""",
            messages=[{"role": "user", "content": f"Ticket: {ticket_title}\nCategory: {category}\n\n{ticket_description}"}]
        )
        return message.content[0].text.strip()
    except Exception:
        return None
