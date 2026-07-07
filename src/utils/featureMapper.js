/* ═══════════════════════════════════════════════════════
   Spam Detection Rules & Analysis Engine
   Rule-based heuristic analysis with weighted scoring
   ═══════════════════════════════════════════════════════ */

export const SAMPLES = [
  {
    label: 'Nigerian Prince',
    text: 'DEAR BELOVED, I AM PRINCE ADAMU FROM NIGERIA. I HAVE $15,000,000 USD INHERITANCE THAT I NEED TO TRANSFER TO YOUR ACCOUNT URGENTLY. PLEASE SEND YOUR BANK DETAILS IMMEDIATELY. ACT NOW!!! CLICK HERE: http://free-money.xyz/claim'
  },
  {
    label: 'Pharmacy Ad',
    text: 'GET 80% OFF on all medications!!! Viagra, Cialis, Xanax — no prescription needed! Order now at www.cheap-pills.biz. Limited time offer! FREE SHIPPING! Call 1-900-555-0199 now!!!'
  },
  {
    label: 'Work Meeting',
    text: 'Hi team, just a reminder about our Q4 planning meeting tomorrow at 2pm in Conference Room B. Please review the attached agenda and come prepared with your department updates. Let me know if you have any conflicts. Thanks, Sarah'
  },
  {
    label: 'Crypto Scam',
    text: 'URGENT: Your Bitcoin wallet has been selected for our EXCLUSIVE doubling program! Send 0.5 BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa and receive 1.0 BTC back in 24 hours GUARANTEED!!! Act now before slots fill up!'
  },
  {
    label: 'Newsletter',
    text: 'This week in design: We explore the evolution of brutalist web interfaces and interview three leading studios about their approach to typography. Plus, our monthly roundup of open-source tools you might have missed.'
  }
];

export const RULES = [
  {
    id: 'urgency_words',
    name: 'Urgency Triggers',
    desc: 'Words designed to create false urgency',
    icon: 'fa-solid fa-bolt',
    patterns: [/urgent/i, /act now/i, /immediate/i, /hurry/i, /limited time/i, /don't miss/i, /before it/i, /asap/i, /respond now/i],
    weight: 12,
    type: 'flag'
  },
  {
    id: 'excessive_caps',
    name: 'Excessive Caps Lock',
    desc: 'Overuse of uppercase for attention',
    icon: 'fa-solid fa-font',
    check: (t) => {
      const caps = (t.match(/[A-Z]{3,}/g) || []).length;
      return { score: Math.min(caps * 6, 30), detail: `${caps} all-caps segments` };
    },
    weight: 6,
    type: 'flag'
  },
  {
    id: 'money_mentions',
    name: 'Money / Financial Bait',
    desc: 'Unsolicited money-related promises',
    icon: 'fa-solid fa-dollar-sign',
    patterns: [/\$\d[\d,]*\d/, /million/i, /inheritance/i, /transfer.*account/i, /free money/i, /earn.*\$/i, /profit/i, /investment.*guarantee/i],
    weight: 14,
    type: 'flag'
  },
  {
    id: 'suspicious_urls',
    name: 'Suspicious URLs',
    desc: 'Untrustworthy or obfuscated links',
    icon: 'fa-solid fa-link',
    check: (t) => {
      const urls = t.match(/https?:\/\/[^\s]+/g) || [];
      let suspicious = 0;
      const susWords = ['free', 'cheap', 'deal', 'offer', 'claim', 'win', 'bonus', 'click', 'xyz', '.biz', '.tk', '.top'];
      urls.forEach(u => { if (susWords.some(w => u.toLowerCase().includes(w))) suspicious++; });
      if (urls.length > 3) suspicious += 2;
      return { score: suspicious * 10, detail: `${suspicious}/${urls.length} URLs flagged` };
    },
    weight: 15,
    type: 'flag'
  },
  {
    id: 'excessive_punctuation',
    name: 'Excessive Punctuation',
    desc: 'Multiple exclamation marks or question marks',
    icon: 'fa-solid fa-exclamation',
    check: (t) => {
      const excl = (t.match(/!{2,}/g) || []).length;
      const ques = (t.match(/\?{2,}/g) || []).length;
      return { score: (excl + ques) * 5, detail: `${excl} exclamation bursts, ${ques} question bursts` };
    },
    weight: 5,
    type: 'flag'
  },
  {
    id: 'pharma_keywords',
    name: 'Pharmaceutical Keywords',
    desc: 'Drug names or pharmacy-related spam',
    icon: 'fa-solid fa-pills',
    patterns: [/viagra/i, /cialis/i, /xanax/i, /valium/i, /no prescription/i, /medication/i, /pharmacy/i, /diet pill/i, /weight loss.*guarantee/i],
    weight: 18,
    type: 'flag'
  },
  {
    id: 'click_bait',
    name: 'Click-Bait Phrases',
    desc: 'Manipulative phrases to drive clicks',
    icon: 'fa-solid fa-arrow-pointer',
    patterns: [/click here/i, /click now/i, /sign up now/i, /subscribe now/i, /open now/i, /verify.*account/i, /confirm.*details/i, /update.*information/i],
    weight: 10,
    type: 'flag'
  },
  {
    id: 'greeting_quality',
    name: 'Greeting Quality',
    desc: 'Generic or impersonal salutations',
    icon: 'fa-solid fa-hand',
    check: (t) => {
      const bad = ['dear friend', 'dear beloved', 'dear customer', 'dear user', 'dear member', 'attention:', 'hello dear'];
      const found = bad.filter(g => t.toLowerCase().includes(g));
      const hasPersonal = /\b(hi|hey|hello)\s+[A-Z][a-z]+\b/.test(t);
      return { score: found.length * 8, detail: found.length ? `"${found[0]}" detected` : (hasPersonal ? 'Personalized greeting' : 'No greeting detected') };
    },
    weight: 8,
    type: 'warn'
  },
  {
    id: 'sender_impersonation',
    name: 'Impersonation Signals',
    desc: 'Claims of authority or fake identity',
    icon: 'fa-solid fa-user-secret',
    patterns: [/prince/i, /king/i, /minister/i, /ceo.*need/i, /bank.*manager/i, /fbi/i, /irs/i, /government/i, /official.*notice/i, /account.*suspended/i],
    weight: 16,
    type: 'flag'
  },
  {
    id: 'personalization',
    name: 'Contextual Relevance',
    desc: 'Evidence of genuine, specific context',
    icon: 'fa-solid fa-message',
    check: (t) => {
      const signals = [
        /\b(yesterday|tomorrow|last week|next week)\b/i,
        /\b(meeting|call|lunch|coffee|standup)\b/i,
        /\b(attachment|attached|document|file)\b/i,
        /\b(please review|please check|could you|would you)\b/i,
        /\b(project|task|deadline|milestone)\b/i,
      ];
      const hits = signals.filter(s => s.test(t)).length;
      return { score: -hits * 6, detail: `${hits} contextual signals found` };
    },
    weight: 6,
    type: 'clear'
  },
  {
    id: 'structure_quality',
    name: 'Writing Structure',
    desc: 'Sentence variety and paragraph formatting',
    icon: 'fa-solid fa-paragraph',
    check: (t) => {
      const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const avgLen = sentences.length ? sentences.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / sentences.length : 0;
      const paragraphs = t.split(/\n\n+/).filter(p => p.trim().length > 20).length;
      let score = 0;
      if (avgLen > 5 && avgLen < 25) score -= 5;
      if (paragraphs >= 2) score -= 4;
      if (sentences.length >= 3) score -= 3;
      return { score, detail: `${sentences.length} sentences, avg ${Math.round(avgLen)} words, ${paragraphs} paragraphs` };
    },
    weight: 4,
    type: 'clear'
  }
];

export function analyzeEmail(text) {
  if (!text.trim()) return null;

  const features = [];
  let totalScore = 0;

  RULES.forEach(rule => {
    let result;

    if (rule.check) {
      result = rule.check(text);
    } else if (rule.patterns) {
      const matches = rule.patterns.filter(p => p.test(text));
      result = {
        score: matches.length * rule.weight,
        detail: matches.length ? `${matches.length} pattern(s) matched` : 'No matches'
      };
    }

    const clampedScore = Math.max(-20, Math.min(35, result.score));
    totalScore += clampedScore;

    const rawPct = Math.abs(clampedScore) / 35 * 100;
    let severity;
    if (clampedScore <= 0) severity = 'none';
    else if (rawPct < 30) severity = 'low';
    else if (rawPct < 65) severity = 'medium';
    else severity = 'high';

    features.push({
      id: rule.id,
      name: rule.name,
      desc: result.detail,
      icon: rule.icon,
      score: clampedScore,
      severity,
      type: rule.type
    });
  });

  const confidence = Math.round(Math.max(0, Math.min(100, (totalScore + 40) / 160 * 100)));

  let classification;
  if (confidence >= 70) classification = 'spam';
  else if (confidence >= 40) classification = 'suspicious';
  else classification = 'safe';

  return { confidence, classification, features, text: text.trim() };
}