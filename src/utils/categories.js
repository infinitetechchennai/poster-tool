/**
 * Post Categories & Schemas for PostCraft AI
 * Defines the 6 primary business post types with their respective fields,
 * default templates, and sample topics.
 */

export const POST_CATEGORIES = [
  {
    id: 'hiring',
    label: 'Hiring & Jobs',
    icon: '💼',
    color: '#008080',
    description: 'Job vacancies, role specs, tech stack split & hiring alerts',
    defaultTemplate: 'hiring-01',
    recommendedTemplates: [
      'hiring-01',
      'hiring-02',
      'hiring-03',
      'hiring-04',
      'hiring-05',
      'hiring-06',
      'hiring-07',
      'hiring-08',
      'hiring-09',
      'hiring-10'
    ],
    sampleTopics: [
      'Cloud Infrastructure Engineer',
      'Senior DevOps Engineer (AWS & K8s)',
      'Full Stack Developer (React & Node)',
      'AI & Machine Learning Engineer',
      'Data Platform Engineer'
    ]
  },
  {
    id: 'product',
    label: 'Products & Launch',
    icon: '🚀',
    color: '#F59E0B',
    description: 'Product showcases, SaaS features, 3D device frames & tool releases',
    defaultTemplate: 'product-01',
    recommendedTemplates: [
      'product-01',
      'product-02',
      'product-03',
      'product-04',
      'product-05',
      'product-06',
      'product-07',
      'product-08',
      'product-09',
      'product-10'
    ],
    sampleTopics: [
      'Step Into Infinity: Mobile App Showcase',
      'Google Rankings Matter Less: AI Recommendations Matter More',
      'Next-Gen Realtime Voice AI Platform',
      'Enterprise Cloud & Database Automation Suite',
      'SaaS Growth Engine & Conversion Dashboard'
    ]
  },
  {
    id: 'festival',
    label: 'Festivals & Celebrations',
    icon: '🎉',
    color: '#F59E0B',
    description: 'Diwali, New Year, holiday specials, festive sales & milestone greetings',
    defaultTemplate: 'festival-01',
    recommendedTemplates: [
      'festival-01',
      'festival-02',
      'festival-03',
      'festival-04',
      'festival-05',
      'festival-06',
      'festival-07',
      'festival-08',
      'festival-09',
      'festival-10'
    ],
    sampleTopics: [
      'Happy Diwali: Festival of Lights Celebration',
      'Happy New Year 2027: New Horizons & Growth',
      'Merry Christmas & Festive Holiday Wishes',
      'Eid Mubarak: Peace, Joy & Harmony',
      'Mega Festive Sale: 50% Off Everything'
    ]
  },
  {
    id: 'knowledge',
    label: 'Common & Business Insights',
    icon: '💡',
    color: '#8B5CF6',
    description: 'Brand strategy, thought leadership, industry trends & viral knowledge posters',
    defaultTemplate: 'common-01',
    recommendedTemplates: [
      'common-01',
      'common-02',
      'common-03',
      'common-04',
      'common-05',
      'common-06',
      'common-07',
      'common-08',
      'common-09',
      'common-10',
      'common-11',
      'common-12',
      'common-13',
      'common-14',
      'common-15',
      'common-16',
      'common-17',
      'common-18',
      'common-19',
      'common-20'
    ],
    sampleTopics: [
      'Your Brand Is Talking. Is Anyone Listening?',
      'Your Website Should Do More Than Look Good',
      '5 Strategic Truths Every Founder Needs in 2027',
      'Why AI-First Teams Ship 10x Faster',
      'The Shift from Search to Neural Recommendations'
    ]
  },
  {
    id: 'services',
    label: 'Services & Solutions',
    icon: '🛠️',
    color: '#059669',
    description: 'Client services, B2B solutions, consulting & enterprise offerings',
    defaultTemplate: 'common-01',
    recommendedTemplates: [
      'common-01',
      'common-02',
      'common-06',
      'common-10',
      'common-18'
    ],
    sampleTopics: [
      'Graphic Design & Creative Services',
      'Enterprise Cloud Migration & Modernization',
      'Automated CI/CD & DevOps Consulting',
      'Custom Generative AI Agent Development',
      '24/7 Managed Cloud Security Services'
    ]
  },
  {
    id: 'education',
    label: 'Education & Campus',
    icon: '🎓',
    color: '#3B82F6',
    description: 'Internships, bootcamps, academy cohorts & certifications',
    defaultTemplate: 'hiring-08',
    recommendedTemplates: [
      'hiring-08',
      'hiring-05',
      'common-07'
    ],
    sampleTopics: [
      'Winter Internship Program 2026-27',
      'Full Stack Web Development Bootcamp',
      'GenAI & Prompt Engineering Fellowship',
      'Cloud Computing Campus Training'
    ]
  },
  {
    id: 'career-roadmap',
    label: 'Life of an Engineer',
    icon: '🗺️',
    color: '#8B5CF6',
    description: 'Career progression graphs, 0-10+ yrs milestones & engineer life',
    defaultTemplate: 'hiring-01',
    recommendedTemplates: [
      'hiring-01',
      'hiring-07',
      'common-03'
    ],
    sampleTopics: [
      'Life of a Cloud Engineer (0 to 10+ yrs)',
      'Life of a DevOps Engineer',
      'Life of a Full Stack Developer',
      'Life of an AI/ML Engineer',
      'Life of a Cybersecurity Architect'
    ]
  }
];

export function getCategoryById(id) {
  return POST_CATEGORIES.find(c => c.id === id) || POST_CATEGORIES[0];
}

/**
 * Auto-detects the best category from an input topic string
 */
export function detectCategoryFromTopic(topic = '') {
  const t = topic.toLowerCase();

  if (/life of (a|an)|career (roadmap|progression|ladder|stages|journey)|from .* to .*(impact|scale|architect)/i.test(t)) {
    return 'career-roadmap';
  }

  if (/internship|fellowship|bootcamp|campus|academy|student|batch|course|program 202|workshop|training|college|university|curriculum/i.test(t)) {
    return 'education';
  }

  // Explicit hiring phrases
  if (/hiring|hire|vacancy|opening|join our team|we are hiring|we're hiring|apply now|walk-in|job alert|looking for (a|an)? (developer|engineer|designer|manager|architect)/i.test(t)) {
    return 'hiring';
  }

  // Festivals & Holidays
  if (/festival|celebrat|diwali|deepavali|eid|christmas|new year|xmas|holiday|thanksgiving|pongal|sankranti|holi|onam|anniversary|festive sale|black friday/i.test(t)) {
    return 'festival';
  }

  // Client Services & Consulting
  if (/consulting|migration|managed service|solutions|audit|outsourcing|implementation|sla/i.test(t)) {
    return 'services';
  }

  // AI & Cloud Products / Platforms / SaaS
  if (/ai cloud|cloud ai|cloud platform|cloud computing|saas|app|platform|launch|product|feature|release|upgrade|showcase|v[0-9]|tool|api suite|automation suite|dashboard/i.test(t)) {
    return 'product';
  }

  // Industry Insights & Thought Leadership
  if (/top [0-9]|tips|best practices|how to|guide|architecture|vs|comparison|framework|insights|checklist|strategy|leadership|brand|founder|finance|banking|investment|healthcare|medical|marketing|growth/i.test(t)) {
    return 'knowledge';
  }

  // Job titles with role suffix
  if (/(senior|lead|principal|junior|staff|vp|head of)\s+(engineer|developer|architect|designer|manager|analyst)|(engineer|developer|architect|designer|manager)\s+role/i.test(t)) {
    return 'hiring';
  }

  if (/software development|coding|programming/i.test(t)) {
    return 'product';
  }

  return 'product';
}

