/*
 * onboarding.service.js — Claude-powered conversational onboarding.
 *
 * Runs one turn of the AI onboarding chat via the official Anthropic SDK
 * (model claude-haiku-4-5). A warm, role-specific system prompt drives a
 * natural conversation; a `complete_onboarding` tool lets Claude emit the same
 * structured preference fields the scripted flow collected once it has gathered
 * them. Returns { available:false } when ANTHROPIC_API_KEY is unset so callers
 * can fall back to the scripted questionnaire. Stateless — the caller passes the
 * full message history each turn.
 */
'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5';

// Opens the conversation; never shown to the user. Anchors a valid user-first turn.
const SEED = "Hi! I just joined Builder.AI Market and I'm ready to set up my profile.";

let _client;
let _clientKey;
function getClient() {
  // Blank / whitespace-only key = feature off (callers fall back to scripted flow).
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) return null;
  // Rebuild if the key changed (so editing .env + restart always takes effect).
  if (!_client || _clientKey !== key) {
    _client = new Anthropic({ apiKey: key });
    _clientKey = key;
  }
  return _client;
}

function builderSystem(name) {
  return `You are the AI host welcoming a new BUILDER named ${name} to Builder.AI Market, a marketplace that matches property and infrastructure builders with investors.

Your job is to get to know ${name} the way a warm, genuinely curious person would over coffee — not to run a form. Have a real conversation: react to what they say, ask natural follow-ups, and let them tell their story.

Across the chat, come away understanding four things about them:
1. Where they're based (their home city / primary market).
2. What kind of projects they specialise in (e.g. luxury residential, commercial, infrastructure, smart cities).
3. Their track record — roughly how many projects they've completed.
4. The typical funding range they look for per project.

How to behave:
- Keep every message short and human — 1 to 3 sentences. Ask about ONE thing at a time.
- When you offer the user specific options to choose between, wrap each option in **double asterisks** — e.g. "**luxury residential**, **commercial**, or **infrastructure**" — so the choices stand out. Only bold the actual options, never ordinary words.
- Open with a warm welcome and your first question.
- Never list the four points or sound like a survey. Weave them in naturally from the flow of the conversation.
- Acknowledge and show real interest before moving on.
- Don't invent details they didn't give. If something's vague, ask once, then make a reasonable call.
- When you're reasonably confident you understand all four, call the complete_onboarding tool with what you learned (normalise to short, sensible values), and add one short, warm closing line in your message.`;
}

function investorSystem(name) {
  return `You are the AI host welcoming a new INVESTOR named ${name} to Builder.AI Market, a marketplace that matches investors with property and infrastructure builders.

Your job is to get to know ${name} the way a warm, genuinely curious person would over coffee — not to run a form. Have a real conversation: react to what they say, ask natural follow-ups, and let them tell their story.

Across the chat, come away understanding four things about them:
1. What kind of investor they are (e.g. individual investor, VC firm, PE fund).
2. The sectors that interest them most (e.g. residential, commercial, infrastructure, PropTech).
3. Their typical investment range per project.
4. The regions of India they're focused on.

How to behave:
- Keep every message short and human — 1 to 3 sentences. Ask about ONE thing at a time.
- When you offer the user specific options to choose between, wrap each option in **double asterisks** — e.g. "**individual investor**, a **VC firm**, or a **PE fund**" — so the choices stand out. Only bold the actual options, never ordinary words.
- Open with a warm welcome and your first question.
- Never list the four points or sound like a survey. Weave them in naturally from the flow of the conversation.
- Acknowledge and show real interest before moving on.
- Don't invent details they didn't give. If something's vague, ask once, then make a reasonable call.
- When you're reasonably confident you understand all four, call the complete_onboarding tool with what you learned (normalise to short, sensible values), and add one short, warm closing line in your message.`;
}

const BUILDER_TOOL = {
  name: 'complete_onboarding',
  description: "Record the builder's preferences once you've gathered them all through conversation.",
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      city:               { type: 'string', description: 'Home city / primary market, e.g. "Hyderabad".' },
      project_type:       { type: 'string', description: 'Their specialisation, e.g. "Luxury Residential".' },
      projects_completed: { type: 'string', description: 'Roughly how many projects completed, e.g. "12".' },
      funding_range:      { type: 'string', description: 'Typical funding range per project, e.g. "₹50–100 Cr".' },
    },
    required: ['city', 'project_type', 'projects_completed', 'funding_range'],
  },
};

const INVESTOR_TOOL = {
  name: 'complete_onboarding',
  description: "Record the investor's preferences once you've gathered them all through conversation.",
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      investor_type:    { type: 'string', description: 'Kind of investor, e.g. "VC Firm".' },
      sectors:          { type: 'string', description: 'Sectors of interest, e.g. "Residential, PropTech".' },
      investment_range: { type: 'string', description: 'Typical investment range per project, e.g. "₹10–50 Cr".' },
      regions:          { type: 'string', description: 'Regions of focus, e.g. "Hyderabad, Bangalore".' },
    },
    required: ['investor_type', 'sectors', 'investment_range', 'regions'],
  },
};

/**
 * Run one conversational onboarding turn.
 * @param {{ role: 'builder'|'investor', userName: string, messages: Array<{role:'user'|'assistant', content:string}> }} args
 * @returns {Promise<{available:boolean, done?:boolean, message?:string|null, preferences?:object|null}>}
 */
async function runOnboardingTurn({ role, userName, messages }) {
  const client = getClient();
  if (!client) return { available: false };

  const isInvestor = role === 'investor';
  const system = isInvestor ? investorSystem(userName) : builderSystem(userName);
  const tool   = isInvestor ? INVESTOR_TOOL : BUILDER_TOOL;

  const resp = await client.messages.create({
    model:      MODEL,
    max_tokens: 1024,
    system,
    tools:      [tool],
    messages:   [{ role: 'user', content: SEED }, ...messages],
  });

  let text = '';
  let preferences = null;
  for (const block of resp.content) {
    if (block.type === 'text') text += block.text;
    else if (block.type === 'tool_use' && block.name === 'complete_onboarding') preferences = block.input;
  }

  return { available: true, done: !!preferences, message: text.trim() || null, preferences };
}

module.exports = { runOnboardingTurn };
