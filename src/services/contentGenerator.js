/**
 * Intelligent Client-Side Content Generator for PostCraft AI
 * Dynamically synthesizes high-quality corporate copy, topic-specific key points,
 * and relevant social posts that are 100% directly related to the user's headline.
 */

import { pollinationsService } from './pollinationsService.js';

// Known business and tech acronyms to format properly
const ACRONYMS = {
  ai: 'AI',
  ml: 'ML',
  api: 'API',
  saas: 'SaaS',
  b2b: 'B2B',
  b2c: 'B2C',
  ciso: 'CISO',
  roi: 'ROI',
  crm: 'CRM',
  erp: 'ERP',
  ui: 'UI',
  ux: 'UX',
  it: 'IT',
  hr: 'HR',
  devops: 'DevOps',
  mcloud: 'MCloud',
  cloud: 'Cloud',
  gcp: 'GCP',
  aws: 'AWS',
  seo: 'SEO',
  llm: 'LLM',
  genai: 'GenAI',
  ivr: 'IVR',
  cto: 'CTO',
  ceo: 'CEO',
  cio: 'CIO'
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Capitalizes and cleans up the input topic with proper acronym casing
 */
export function formatTopic(topic) {
  if (!topic) return "Business Innovation";
  let t = topic.trim().replace(/[.,:;!?]+$/, '');

  const words = t.split(/\s+/).map(w => {
    const lower = w.toLowerCase();
    if (ACRONYMS[lower]) return ACRONYMS[lower];
    if (lower.startsWith('mcloud')) return 'MCloud' + lower.slice(6);
    return w.charAt(0).toUpperCase() + w.slice(1);
  });

  return words.join(' ');
}

/**
 * Extracts a clean topic phrase from a headline if it uses a standard template,
 * or returns the headline itself cleaned up.
 */
export function extractTopicFromHeadline(headline) {
  if (!headline) return 'Business Innovation';
  let clean = headline.trim();
  
  // Strip known prefix patterns
  const prefixes = [
    /^transform your business with\s+/i,
    /^the strategic advantage of\s+/i,
    /^why leaders are prioritizing\s+/i,
    /^unlocking next-generation value through\s+/i,
    /^how modern enterprises scale with\s+/i,
    /^mastering\s+/i,
    /^architecting resilience:\s*best practices for\s+/i,
    /^the executive blueprint for\s+/i,
    /^driving scalability and efficiency with\s+/i,
    /^strengthening resilience:\s*a proactive guide to\s+/i,
    /^why\s+/i,
    /^empowering high-performing teams through\s+/i,
    /^the future of work:\s*rethinking\s+/i,
    /^accelerating sustainable growth with\s+/i,
    /^the modern playbook for\s+/i,
    /^the future of\s+/i
  ];

  for (const prefix of prefixes) {
    if (prefix.test(clean)) {
      clean = clean.replace(prefix, '');
      break;
    }
  }

  // Remove trailing time/context phrases
  clean = clean.replace(/\s+(in 2026|today|for enterprises|for business continuity)$/i, '');
  return formatTopic(clean);
}

/**
 * Domain detectors with priority on specific terms (e.g. generative AI, voice, marking)
 * before falling back to general AI or general business.
 */
function detectDomainContext(topicLower) {
  // 1. Generative AI & LLMs (checked FIRST before generic AI)
  if (topicLower.includes('generative') || topicLower.includes('genai') || topicLower.includes('llm') || topicLower.includes('gpt') || topicLower.includes('chatgpt') || topicLower.includes('copilot') || topicLower.includes('prompt') || topicLower.includes('diffusion') || topicLower.includes('text-to-')) {
    return 'generative_ai';
  }

  // 2. Voice & Calling Agents
  if (topicLower.includes('call') || topicLower.includes('voice') || topicLower.includes('agent') || topicLower.includes('phone') || topicLower.includes('telecom') || topicLower.includes('ivr') || topicLower.includes('receptionist')) {
    return 'voice_calling';
  }

  // 3. Automated Marking & Grading (exclude "market")
  if ((topicLower.includes('mark') && !topicLower.includes('market')) || topicLower.includes('grade') || topicLower.includes('assess') || topicLower.includes('evaluat') || topicLower.includes('rubric') || topicLower.includes('scoring') || topicLower.includes('exam')) {
    return 'marking';
  }

  // 4. Cloud & Infrastructure (handles "mcloud", "cloud computing", "devops", "kubernetes", etc.)
  if (topicLower.includes('cloud') || topicLower.includes('devops') || topicLower.includes('infra') || topicLower.includes('serverless') || topicLower.includes('kubernetes') || topicLower.includes('microservice')) {
    return 'cloud';
  }

  // 5. Cybersecurity & Privacy
  if (topicLower.includes('secur') || topicLower.includes('cyber') || topicLower.includes('privacy') || topicLower.includes('threat') || topicLower.includes('zero-trust') || topicLower.includes('ransomware') || topicLower.includes('infosec')) {
    return 'security';
  }

  // 6. Customer Retention & Churn
  if (topicLower.includes('retention') || topicLower.includes('churn') || topicLower.includes('loyalty') || topicLower.includes('lifetime value') || topicLower.includes('ltv') || topicLower.includes('onboarding')) {
    return 'retention';
  }

  // 7. Hiring, Careers & Talent Acquisition
  if (topicLower.includes('hiring') || topicLower.includes('career') || topicLower.includes('job') || topicLower.includes('recruit') || topicLower.includes('talent') || topicLower.includes('opening') || topicLower.includes('vacancy') || topicLower.includes('internship') || topicLower.includes('fellowship') || topicLower.includes('join our team')) {
    return 'hiring';
  }

  // 8. Marketing, Sales & Growth
  if (topicLower.includes('market') || topicLower.includes('sales') || topicLower.includes('growth') || topicLower.includes('ad') || topicLower.includes('lead') || topicLower.includes('conversion') || topicLower.includes('seo') || topicLower.includes('branding')) {
    return 'marketing';
  }

  // 9. Remote Work, Leadership & Culture
  if (topicLower.includes('remote') || topicLower.includes('leadership') || topicLower.includes('culture') || topicLower.includes('workplace') || topicLower.includes('team') || topicLower.includes('management')) {
    return 'leadership';
  }

  // 9. Data Engineering & Masterclass
  if (topicLower.includes('data engineering') || topicLower.includes('masterclass')) {
    return 'data_engineering';
  }

  // 10. Data, Analytics & BI
  if (topicLower.includes('data') || topicLower.includes('analytic') || topicLower.includes('dashboard') || topicLower.includes('business intelligence') || topicLower.includes('metrics')) {
    return 'data_analytics';
  }

  // 10. Finance & FinTech
  if (topicLower.includes('finan') || topicLower.includes('invest') || topicLower.includes('bank') || topicLower.includes('money') || topicLower.includes('accounting') || topicLower.includes('crypto') || topicLower.includes('trading')) {
    return 'finance';
  }

  // 11. Healthcare & Clinical
  if (topicLower.includes('health') || topicLower.includes('medic') || topicLower.includes('patient') || topicLower.includes('clinic') || topicLower.includes('pharma') || topicLower.includes('clinical')) {
    return 'healthcare';
  }

  // 12. General AI / Automation
  if (topicLower.includes('ai') || topicLower.includes('artificial') || topicLower.includes('automati') || topicLower.includes('machine learn') || topicLower.includes('robot')) {
    return 'ai_automation';
  }

  return 'general';
}

/**
 * Domain-specific templates where {Topic} is explicitly embedded in every sentence and keypoint
 */
const DOMAIN_DATA = {
  // 0. Dedicated Careers & Hiring
  hiring: {
    category: 'Careers & Hiring',
    descriptions: [
      "We are expanding our high-impact engineering squads and actively seeking world-class talent for {Topic}. Join an ambitious culture where your contributions shape enterprise technology and drive real-world innovation.",
      "Accelerate your career journey with {Topic}. We provide top-of-market compensation, flexible hybrid/remote options, comprehensive health perks, and boundless paths for technical and managerial growth.",
      "Looking for your next career milestone? Our product, cloud, and AI engineering teams are actively recruiting for {Topic}. Work alongside elite pioneers building modern, resilient digital solutions."
    ],
    keyPoints: [
      [
        "High-Impact Culture: Work on industry-defining technology with elite engineering peers",
        "Competitive Compensation: Top-tier salary, performance bonuses, and equity options",
        "Modern Tech Stack: Build scalable systems with cutting-edge cloud, AI, and frameworks",
        "Fast-Track Hiring: Streamlined interview rounds with prompt candidate feedback"
      ],
      [
        "Flexible Workplace: Remote and hybrid flexibility designed for peak work-life balance",
        "Comprehensive Benefits: Premium health coverage, wellness stipend, and learning budget",
        "Continuous Learning: Dedicated allowances for conferences, certifications, and courses",
        "Immediate Openings: Fast-track hiring process with feedback within 48 hours"
      ]
    ],
    ctaOptions: [
      "Apply Now & Fast-Track Your Career →",
      "Explore Open Roles & Apply Today →",
      "Join Our Team — Submit Your Application →",
      "Send Your Resume to careers@infinitetechai.com →"
    ],
    defaultTags: ['#WeAreHiring', '#TechCareers', '#JobOpening', '#SoftwareJobs', '#HiringNow']
  },

  // 1. Generative AI & Foundation Models
  generative_ai: {
    category: 'Generative AI & LLMs',
    descriptions: [
      "{Topic} is transforming enterprise capability by empowering teams to create, synthesize, and innovate at unprecedented speed. By leveraging advanced foundation models and multimodal synthesis, organizations can generate human-grade content, write complex code, and uncover deep insights on demand. Adopting {Topic} expands creative bandwidth while dramatically accelerating development cycles.",
      "Integrating {Topic} into enterprise workflows represents a massive leap in knowledge worker productivity. From automated document synthesis to intelligent contextual reasoning, {Topic} enables teams to turn raw information into finished deliverables in seconds. Forward-thinking leaders are utilizing {Topic} to unlock sustained creative agility.",
      "The real power of {Topic} lies in pairing generative intelligence with specialized enterprise knowledge. By training models on proprietary data and integrating guardrails, companies safely automate research, drafting, and problem-solving without compromising accuracy or quality."
    ],
    keyPoints: [
      [
        "{Topic}: Accelerate creative ideation, writing, and coding with foundation models",
        "{Topic}: Synthesize complex enterprise documents into actionable executive summaries",
        "{Topic}: Fine-tune custom domain models to automate specialized knowledge workflows"
      ],
      [
        "{Topic}: Eliminate repetitive drafting and research across cross-functional squads",
        "{Topic}: Embed multimodal contextual reasoning directly into enterprise applications",
        "{Topic}: Boost knowledge worker velocity by 3x with safe, guardrailed AI workflows"
      ]
    ],
    ctaOptions: [
      "Discover What {Topic} Can Do for Your Enterprise. Connect With Us →",
      "Unlock Unprecedented Creative Velocity with {Topic}. Book a Consultation.",
      "Experience the Power of Enterprise {Topic} Today →"
    ],
    defaultTags: ['#GenerativeAI', '#GenAI', '#LLM', '#ArtificialIntelligence', '#AIInnovation']
  },

  // 2. Cloud & Infrastructure
  cloud: {
    category: 'Cloud & Infrastructure',
    descriptions: [
      "Adopting {Topic} enables forward-thinking organizations to modernize operations and deploy workloads at enterprise scale. By unifying scalable cloud infrastructure with automated pipelines, {Topic} eliminates performance bottlenecks, improves observability, and safeguards system resilience. Teams investing in {Topic} achieve greater execution velocity while maintaining strict cost control.",
      "Modernizing your infrastructure through {Topic} bridges the gap between rapid delivery and operational stability. With automated resource provisioning and multi-zone reliability, {Topic} ensures applications remain performant during peak business demand. Implementing {Topic} gives technical leaders real-time visibility and prolonged architectural agility.",
      "The strategic implementation of {Topic} transforms how distributed teams manage complex compute environments. By replacing manual maintenance with declarative pipelines, {Topic} lowers overhead expenses while accelerating deployment cadence across the organization."
    ],
    keyPoints: [
      [
        "{Topic}: Accelerate computing speed and scale infrastructure dynamically on demand",
        "{Topic}: Eliminate deployment bottlenecks and reduce idle cloud compute costs",
        "{Topic}: Gain real-time operational visibility and multi-region system resilience"
      ],
      [
        "{Topic}: Automate container orchestration and multi-cloud infrastructure deployments",
        "{Topic}: Cut infrastructure waste through predictive auto-scaling and spot instances",
        "{Topic}: Empower engineering squads to release features daily with zero downtime"
      ]
    ],
    ctaOptions: [
      "Discover How {Topic} Can Modernize Your Operations Today →",
      "Ready to Scale with {Topic}? Schedule an Architecture Review.",
      "Explore Next-Generation {Topic} Solutions for Your Business →"
    ],
    defaultTags: ['#CloudComputing', '#CloudArchitecture', '#DevOps', '#EnterpriseTech', '#Scalability']
  },

  // 3. Voice AI & Calling Agents
  voice_calling: {
    category: 'Voice AI & Calling Agents',
    descriptions: [
      "Deploying {Topic} represents a decisive breakthrough for modern customer service and enterprise communication. By combining conversational voice intelligence with low-latency response systems, {Topic} handles inbound and outbound calls concurrently with human-like natural fluency. Organizations implementing {Topic} resolve customer inquiries instantly while slashing operational expenses.",
      "Modern organizations are turning to {Topic} to elevate caller engagement and eliminate frustrating queue times. Capable of understanding complex intent, answering inquiries, and syncing data to CRM systems in real time, {Topic} empowers frontline teams to scale 24/7 service without adding overhead.",
      "The introduction of {Topic} transforms traditional call operations into proactive, context-aware touchpoints. With sub-second conversational latency and automated qualification, {Topic} ensures every caller receives prompt, accurate, and empathetic assistance."
    ],
    keyPoints: [
      [
        "{Topic}: Deliver human-like conversational voice responses with sub-second latency",
        "{Topic}: Handle thousands of concurrent customer calls 24/7 without wait queues",
        "{Topic}: Seamlessly route complex callers to specialists with full CRM context"
      ],
      [
        "{Topic}: Automate routine appointment scheduling, order status checks, and follow-ups",
        "{Topic}: Sync call transcripts, sentiment scores, and action items instantly into CRM",
        "{Topic}: Slash contact center operating costs by 60% while boosting first-call resolution"
      ]
    ],
    ctaOptions: [
      "Experience {Topic} in Action. Schedule a Live Demo Today →",
      "Deploy 24/7 Conversational Voice Agents for Your Enterprise →",
      "Upgrade Your Customer Calling Experience with {Topic} Today."
    ],
    defaultTags: ['#VoiceAI', '#AICallingAgent', '#CustomerSupport', '#ConversationalAI', '#ContactCenter']
  },

  // 4. Automated Marking & Grading
  marking: {
    category: 'EdTech & Evaluation',
    descriptions: [
      "Automating evaluation workflows through {Topic} modernizes how educational institutions and corporate trainers assess performance. By evaluating submissions against structured rubrics with verifiable precision, {Topic} eliminates grading backlogs and provides learners with rapid, actionable feedback that accelerates skill mastery.",
      "Implementing {Topic} introduces consistency, fairness, and unprecedented speed to large-scale assessments. Evaluators can slash manual review times, pinpoint common learning gaps early, and redirect valuable hours toward direct mentorship and student guidance through {Topic}.",
      "Modern assessment systems powered by {Topic} combine pedagogical criteria with intelligent analysis. The result is objective scoring, deep analytics on learner strengths, and detailed formative feedback delivered in minutes rather than weeks."
    ],
    keyPoints: [
      [
        "{Topic}: Ensure objective rubric-aligned scoring and transparent assessment criteria",
        "{Topic}: Slash exam and assignment grading turnaround times by over 80%",
        "{Topic}: Provide learners with instant formative feedback to accelerate skill mastery"
      ],
      [
        "{Topic}: Pinpoint class-wide learning gaps and curriculum weak points with deep analytics",
        "{Topic}: Scale evaluation seamlessly across thousands of student submissions without fatigue",
        "{Topic}: Free educators from repetitive grading to focus on impactful 1-on-1 mentorship"
      ]
    ],
    ctaOptions: [
      "Streamline Your Assessment Workflow with {Topic} Today →",
      "Request a Live Walkthrough of Our {Topic} Evaluation Platform →",
      "Discover Smarter, Faster Grading Solutions with {Topic} →"
    ],
    defaultTags: ['#AIMarking', '#AutomatedGrading', '#EdTech', '#SmartAssessment', '#EducationInnovation']
  },

  // 5. Growth & Digital Marketing
  marketing: {
    category: 'Growth & Digital Marketing',
    descriptions: [
      "Modern growth teams are leveraging {Topic} to build high-converting customer journeys that scale. By analyzing real-time buyer intent signals across channels, {Topic} delivers hyper-relevant messaging that boosts engagement, minimizes customer acquisition costs, and drives predictable pipeline growth.",
      "Achieving market leadership demands a disciplined, data-informed strategy centered around {Topic}. When marketing campaigns dynamically align with customer lifecycle stages through {Topic}, brands cultivate lasting customer trust and compound lifetime value.",
      "Transforming your marketing engine through {Topic} unlocks measurable conversion efficiency and consistent revenue acceleration. From predictive audience segmentation to creative optimization, {Topic} keeps organizations ahead of market competitors."
    ],
    keyPoints: [
      [
        "{Topic}: Drive higher conversion rates by delivering personalized cross-channel campaigns",
        "{Topic}: Capture high-intent buyer signals to lower customer acquisition costs (CAC)",
        "{Topic}: Accelerate pipeline velocity by aligning marketing assets with buyer lifecycle stages"
      ],
      [
        "{Topic}: Automate multi-channel campaign orchestration while preserving brand consistency",
        "{Topic}: Gain multi-touch attribution clarity to eliminate non-performing ad expenditures",
        "{Topic}: Turn one-time website visitors into loyal high-value repeat brand champions"
      ]
    ],
    ctaOptions: [
      "Scale Your Revenue Pipeline with {Topic}. Let's Connect Today →",
      "Ready to Elevate Your Growth Strategy with {Topic}? Schedule a Call.",
      "Discover High-Converting Marketing Frameworks with {Topic} →"
    ],
    defaultTags: ['#DigitalMarketing', '#GrowthStrategy', '#B2BMarketing', '#RevenueGrowth', '#ConversionOptimization']
  },

  // 6. Cybersecurity & Trust
  security: {
    category: 'Cybersecurity & Trust',
    descriptions: [
      "In an increasingly interconnected enterprise ecosystem, implementing {Topic} is essential for safeguarding organizational integrity. Modern defense architectures built on {Topic} combine continuous validation with automated threat isolation, ensuring critical company assets remain protected against sophisticated vulnerabilities.",
      "A proactive commitment to {Topic} transforms security from a reactive safeguard into an operational differentiator. By enforcing least-privilege principles and continuous posture monitoring, {Topic} minimizes exposure and maintains compliance across distributed teams.",
      "Protecting corporate data requires moving beyond traditional perimeter boundaries through {Topic}. Continuous verification and real-time posture assessments empower security teams to preempt attacks before they disrupt everyday business operations."
    ],
    keyPoints: [
      [
        "{Topic}: Enforce continuous zero-trust validation and least-privilege access controls",
        "{Topic}: Detect and isolate emerging network threats in real time before lateral movement",
        "{Topic}: Maintain continuous regulatory compliance with automated audit documentation"
      ],
      [
        "{Topic}: Defend enterprise systems against advanced phishing and ransomware vectors",
        "{Topic}: Eliminate security blind spots across hybrid cloud networks and remote endpoints",
        "{Topic}: Cultivate a resilient cybersecurity posture through automated risk assessment"
      ]
    ],
    ctaOptions: [
      "Strengthen Your Enterprise Defense with {Topic}. Schedule an Assessment →",
      "Protect Your Critical Assets. Connect With Our {Topic} Security Team.",
      "Talk to Our Experts About Modern {Topic} Implementation Today →"
    ],
    defaultTags: ['#Cybersecurity', '#ZeroTrust', '#DataProtection', '#InfoSec', '#BusinessResilience']
  },

  // 7. Customer Retention & Churn
  retention: {
    category: 'Customer Retention & Success',
    descriptions: [
      "Mastering {Topic} is the most reliable lever for sustainable enterprise profitability. By predicting churn indicators early and orchestrating tailored onboarding touchpoints, {Topic} enables customer success teams to deepen product adoption, protect recurring revenue, and expand customer lifetime value.",
      "Sustainable enterprise growth is built on strong customer retention rather than endless acquisition. Aligning product value with proactive {Topic} workflows ensures users consistently achieve their desired outcomes, transforming casual buyers into long-term brand champions."
    ],
    keyPoints: [
      [
        "{Topic}: Detect early churn risk indicators and trigger proactive retention campaigns",
        "{Topic}: Maximize customer lifetime value (LTV) through personalized onboarding journeys",
        "{Topic}: Turn real-time user behavior data into repeatable account expansion opportunities"
      ],
      [
        "{Topic}: Boost Net Promoter Scores (NPS) with automated customer satisfaction monitoring",
        "{Topic}: Resolve renewal blockers proactively before contracts reach expiration dates",
        "{Topic}: Empower customer success teams with automated health scores and engagement alerts"
      ]
    ],
    ctaOptions: [
      "Boost Your Customer Retention Rates with {Topic}. Connect Today →",
      "Protect Recurring Revenue. Schedule a {Topic} Strategy Call."
    ],
    defaultTags: ['#CustomerRetention', '#CustomerSuccess', '#ChurnReduction', '#SaaSGrowth', '#LTV']
  },

  // 8. Leadership & Culture
  leadership: {
    category: 'Leadership & Culture',
    descriptions: [
      "Championing {Topic} is fundamental to building high-trust, resilient organizations. By establishing transparent expectations and fostering asynchronous accountability, leaders practicing {Topic} eliminate administrative friction and empower distributed teams to perform at their highest potential.",
      "Navigating modern workplace complexity requires an intentional commitment to {Topic}. When organizations cultivate psychological safety and clear strategic alignment, top talent stays engaged, motivated, and empowered to deliver exceptional results."
    ],
    keyPoints: [
      [
        "{Topic}: Establish transparent outcome-driven goals to elevate cross-team accountability",
        "{Topic}: Foster psychological safety and proactive communication across distributed squads",
        "{Topic}: Streamline operational processes to empower team members to focus on high-impact work"
      ],
      [
        "{Topic}: Retain elite tier talent by cultivating a high-trust, continuous growth culture",
        "{Topic}: Break down organizational silos through asynchronous documentation standards",
        "{Topic}: Lead organizational change with clarity, empathy, and strategic purpose"
      ]
    ],
    ctaOptions: [
      "Elevate Your Team's Performance with {Topic}. Connect With Us →",
      "Build a High-Trust, Resilient Organization. Let's Talk Today."
    ],
    defaultTags: ['#Leadership', '#CompanyCulture', '#FutureOfWork', '#EmployeeEngagement', '#TeamSuccess']
  },

  // 9. Data Engineering & Masterclass
  data_engineering: {
    category: 'Masterclass',
    descriptions: [
      "Skills, Tools, Career Roadmap and What's Next",
      "Comprehensive Masterclass covering modern data stacks, scalable streaming pipelines, and high-impact career trends."
    ],
    keyPoints: [
      [
        "Modern Data Stack",
        "Build Scalable Pipelines",
        "Career Roadmap & Salary Trends",
        "Top Hiring Skills & Tools"
      ]
    ],
    ctaOptions: [
      "Reserve Your Free Masterclass Seat Today →",
      "Master the Modern Data Stack in 2026. Register Now."
    ],
    defaultTags: ['#DataEngineering', '#BigData', '#CloudData', '#Databricks', '#ApacheSpark']
  },

  // 10. Data & Analytics
  data_analytics: {
    category: 'Data & Analytics',
    descriptions: [
      "Unlocking actionable value from enterprise data requires an intentional strategy centered around {Topic}. By replacing fragmented spreadsheets with centralized intelligence pipelines, {Topic} gives leaders real-time visibility to optimize decisions, allocate capital wisely, and identify emerging operational trends.",
      "Modern competitive organizations treat {Topic} as the cornerstone of operational speed. Automated metrics tracking and predictive dashboards eliminate guesswork, allowing cross-functional teams to act on verified evidence."
    ],
    keyPoints: [
      [
        "{Topic}: Unify fragmented data silos into real-time executive decision dashboards",
        "{Topic}: Eliminate manual spreadsheet reporting and uncover hidden operational trends",
        "{Topic}: Empower non-technical teams with trusted self-service data queries and KPI tracking"
      ],
      [
        "{Topic}: Accelerate business decision cycles through automated predictive forecasting",
        "{Topic}: Ensure bulletproof data governance, data lineage, and single-source accuracy",
        "{Topic}: Translate complex business metrics into clear actionable executive priorities"
      ]
    ],
    ctaOptions: [
      "Modernize Your Analytics Infrastructure with {Topic}. Let's Talk →",
      "Turn Complex Data into Strategic Clarity with {Topic}. Schedule a Call."
    ],
    defaultTags: ['#DataAnalytics', '#BusinessIntelligence', '#DataDriven', '#BigData', '#Analytics']
  },

  // 10. Finance & FinTech
  finance: {
    category: 'Finance & FinTech',
    descriptions: [
      "Navigating complex financial markets requires a calculated approach to {Topic}. By unifying real-time transaction data with automated auditing and predictive forecasting, {Topic} enables finance leaders to protect margins while seizing timely capital growth opportunities.",
      "Modern financial institutions are turning to {Topic} to build resilient, transparent operations. Automated reconciliation and intelligent risk assessment powered by {Topic} give executives the clarity needed to navigate shifting fiscal environments with confidence."
    ],
    keyPoints: [
      [
        "{Topic}: Gain real-time visibility into working capital, cash burn, and liquidity reserves",
        "{Topic}: Automate financial reconciliation, expense auditing, and regulatory reporting",
        "{Topic}: Mitigate balance sheet and market risks through predictive scenario modeling"
      ],
      [
        "{Topic}: Optimize corporate capital allocation and protect operating margins against inflation",
        "{Topic}: Accelerate monthly close cycles from weeks to days with automated ledger audits",
        "{Topic}: Make informed investment decisions supported by audited predictive analytics"
      ]
    ],
    ctaOptions: [
      "Modernize Your Financial Infrastructure with {Topic}. Talk to Us Today →",
      "Unlock Greater Capital Efficiency Through {Topic}. Connect With Our Advisors."
    ],
    defaultTags: ['#FinTech', '#CorporateFinance', '#FinancialStrategy', '#CapitalEfficiency', '#BankingTech']
  },

  // 11. Healthcare & Life Sciences
  healthcare: {
    category: 'Healthcare & Life Sciences',
    descriptions: [
      "Enhancing healthcare delivery through {Topic} bridges the gap between technological precision and patient empathy. By streamlining administrative bottlenecks and providing clinicians with intuitive support, {Topic} measurably improves clinical outcomes and care accessibility.",
      "Integrating {Topic} across clinical operations represents a transformative step toward personalized patient wellness. Secure data exchange and collaborative tooling empower medical professionals to make timely, patient-centered decisions with heightened confidence."
    ],
    keyPoints: [
      [
        "{Topic}: Enhance patient care trajectories and treatment adherence with digital workflows",
        "{Topic}: Reduce clinical administrative burdens so care teams can spend more time with patients",
        "{Topic}: Ensure strict adherence to HIPAA, data privacy, and clinical governance protocols"
      ],
      [
        "{Topic}: Streamline patient intake, appointment scheduling, and post-discharge follow-ups",
        "{Topic}: Coordinate multidisciplinary care teams with real-time electronic health records (EHR)",
        "{Topic}: Elevate patient satisfaction scores while lowering readmission rates across facilities"
      ]
    ],
    ctaOptions: [
      "Advance Patient Care with {Topic}. Connect With Our Specialists Today →",
      "Explore Tailored Healthcare Solutions and Clinical Partnerships for {Topic}."
    ],
    defaultTags: ['#HealthTech', '#DigitalHealth', '#PatientCare', '#HealthcareInnovation', '#MedTech']
  },

  // 12. AI & Intelligent Automation
  ai_automation: {
    category: 'AI & Automation',
    descriptions: [
      "Embracing {Topic} is redefining how competitive organizations operate and innovate. By offloading repetitive operational bottlenecks to predictive algorithms, {Topic} unlocks higher execution speed and empowers cross-functional teams to focus on strategic high-value innovation.",
      "Artificial intelligence and {Topic} have evolved into indispensable drivers of enterprise excellence. Organizations that systematically integrate {Topic} into daily workflows achieve tangible gains in output quality, customer responsiveness, and operational efficiency."
    ],
    keyPoints: [
      [
        "{Topic}: Automate complex cognitive tasks and eliminate repetitive manual friction",
        "{Topic}: Leverage predictive algorithms to make fast, evidence-backed strategic decisions",
        "{Topic}: Scale operational capacity and service delivery without expanding headcount"
      ],
      [
        "{Topic}: Integrate intelligent bots and automated workflows into everyday business tools",
        "{Topic}: Reduce workflow error rates by 95% with automated validation and quality checks",
        "{Topic}: Empower high-value employees to focus on strategic growth rather than routine tasks"
      ]
    ],
    ctaOptions: [
      "Discover Practical {Topic} Workflows for Your Business. Connect Today →",
      "Let's Build Something Smarter with {Topic}. Schedule a Consultation."
    ],
    defaultTags: ['#ArtificialIntelligence', '#IntelligentAutomation', '#TechInnovation', '#FutureOfWork', '#DigitalTransformation']
  },

  // 13. General Niche Topic Fallback
  general: {
    category: 'Enterprise Innovation',
    descriptions: [
      "Staying ahead in a rapidly shifting business environment requires an intentional commitment to {Topic}. By adopting structured methodologies and modern best practices around {Topic}, organizations eliminate operational friction, optimize resources, and deliver exceptional value to stakeholders.",
      "Developing a clear strategy around {Topic} is essential for building resilient, high-performing operations. When teams align around practical execution and continuous refinement of {Topic}, they unlock sustainable competitive advantages and elevate service standards."
    ],
    keyPoints: [
      [
        "{Topic}: Accelerate workflow execution and eliminate recurring operational friction",
        "{Topic}: Drive measurable improvements in project quality, team velocity, and client outcomes",
        "{Topic}: Equip organizations with modern, adaptable frameworks designed for sustainable scale"
      ],
      [
        "{Topic}: Unlock new efficiencies and competitive advantages across core business operations",
        "{Topic}: Deliver consistent, high-standard deliverables that exceed customer expectations",
        "{Topic}: Foster continuous optimization and agile execution within cross-functional teams"
      ]
    ],
    ctaOptions: [
      "Take the Next Step in Your Organizational Growth with {Topic}. Let's Talk →",
      "Let's Build Something Exceptional Together. Learn More About {Topic}."
    ],
    defaultTags: ['#BusinessStrategy', '#LeadershipExcellence', '#Innovation', '#OperationalExcellence', '#GrowthMindset']
  }
};

/**
 * Generates custom hashtags from words in the topic
 */
function generateHashtags(topic, defaultTags = []) {
  const words = topic
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['with', 'from', 'that', 'this', 'your', 'about', 'helps', 'help', 'best', 'the', 'and', 'for', 'how'].includes(w.toLowerCase()));

  const customTags = words.map(w => {
    const lower = w.toLowerCase();
    if (ACRONYMS[lower]) return `#${ACRONYMS[lower]}`;
    return `#${w.charAt(0).toUpperCase() + w.slice(1)}`;
  });

  const combined = Array.from(new Set([...customTags, ...(defaultTags || [])])).slice(0, 5);
  return combined;
}

/**
 * Intelligently constructs an accurate, context-aware visual prompt for AI diffusion models.
 * Automatically adapts style based on topic intent:
 * - Festivals & Cultural Greetings: authentic warm lighting, clay diyas, festive lights, celebratory atmosphere
 * - Careers & Hiring: modern architectural creative workspace, collaborative team, daylight
 * - AI, Voice, Calling Agents: sleek modern robot avatars or 3D concepts
 * - General Business/Finance/Tech: refined professional minimalist aesthetic
 */
export function buildContextualImagePrompt(headline = '', category = '', topic = '') {
  const combined = `${headline} ${category} ${topic}`.toLowerCase();

  // 1. Festivals, Holidays & Cultural Celebrations
  if (/diwali|deepavali|deepawali|diwaly|diya/.test(combined)) {
    return 'Warm traditional glowing clay diya oil lamps burning with golden flames, decorated with vibrant orange marigold floral garlands, soft warm festive bokeh background lights, cinematic celebration atmosphere, rich golden warm glow, centered composition, high resolution, no text, no letters, no watermark';
  }
  if (/christmas|xmas|santa|holiday season/.test(combined)) {
    return 'Festive holiday pine tree branches decorated with glowing warm golden fairy lights, red ribbon and ornaments, cozy winter ambient bokeh, cinematic lighting, high resolution, no text, no letters, no watermark';
  }
  if (/new year|newyear/.test(combined)) {
    return 'Sophisticated celebratory golden sparkling confetti burst with warm glowing ambient lights, luxury midnight festive celebration, elegant celebratory atmosphere, high resolution, no text, no letters, no watermark';
  }
  if (/eid|ramadan|mubarak/.test(combined)) {
    return 'Elegant golden crescent moon and glowing traditional ornate brass lantern with warm candle light, arabesque festive celebration ambiance, high resolution, no text, no letters, no watermark';
  }
  if (/festival|festive|celebrat|wishes|greeting|greetings|congratulat|anniversary/.test(combined)) {
    return 'Warm celebratory festive lighting with elegant festive elements, joyous celebration aesthetic, soft golden bokeh background, cinematic studio lighting, high resolution, no text, no letters, no watermark';
  }

  // 2. Careers & Hiring
  if (/hiring|hire|career|job|opening|recruitment|vacancy|walk-in|join our team|talent|intern|internship|roles/.test(combined)) {
    return 'Modern bright architectural creative office workspace with contemporary glass walls, collaborative professional creative environment, warm natural daylight, editorial photography, high resolution, no text, no letters, no watermark';
  }

  // 3. AI Voice & Calling Agents
  if (/voice|calling agent|call center|voice agent|phone call|telecom|customer support/.test(combined)) {
    return 'Sleek futuristic 3D white robot avatar wearing call center headset with microphone, glowing cyan visor eyes and smiling face, modern tech aesthetic, clean studio lighting, high resolution, no text, no letters, no watermark';
  }

  // 4. Healthcare & Medical
  if (/health|medical|doctor|clinical|patient|hospital|pharma|biotech|nursing/.test(combined)) {
    return 'Modern clean medical innovation concept, minimalist clinical aesthetic, soft soothing light, pristine laboratory or healthcare environment, high resolution, no text, no letters, no watermark';
  }

  // 5. Finance, Banking & Wealth
  if (/finance|fintech|banking|capital|investment|money|crypto|stock|wealth|treasury/.test(combined)) {
    return 'Sleek corporate architectural finance concept, premium obsidian and metallic materials, sophisticated ambient lighting, minimalist executive atmosphere, high resolution, no text, no letters, no watermark';
  }

  // 6. Technology, Cloud & Software
  if (/ai|cloud|data|machine learning|software|developer|devops|cyber|analytics|algorithm/.test(combined)) {
    const cleanSubject = headline.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40) || 'Artificial Intelligence';
    return `${cleanSubject} modern 3D technology visual concept, clean studio lighting, elegant depth of field, minimalist tech aesthetic, centered subject, high resolution, no text, no letters, no watermark`;
  }

  // 7. Default Professional Editorial
  const cleanSubject = headline.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40) || 'Business Innovation';
  return `${cleanSubject} modern elegant corporate visual illustration, clean studio lighting, professional minimalist aesthetic, high resolution, centered composition, no text, no letters, no watermark`;
}

/**
 * Generates completely fresh, custom-crafted content based on a headline or topic.
 * Guarantees that {Topic} is explicitly discussed in the description, keypoints, and CTA.
 */
export function generateMatchingDescription(headline, brandConfig = {}, variationOffset = 0) {
  const extractedTopic = extractTopicFromHeadline(headline);
  const topicLower = extractedTopic.toLowerCase();
  const domainKey = detectDomainContext(topicLower);
  const domain = DOMAIN_DATA[domainKey] || DOMAIN_DATA.general;

  const seed = hashString(extractedTopic || headline) + variationOffset;

  // 1. Description: guarantees {Topic} is prominently placed and discussed
  const descTemplates = domain.descriptions;
  const descRaw = descTemplates[seed % descTemplates.length];
  const description = descRaw.replace(/\{Topic\}/g, extractedTopic);

  // 2. Key Points: guarantees every single point explicitly details {Topic}
  const kpSets = domain.keyPoints;
  const kpSet = kpSets[seed % kpSets.length];
  const keyPoints = kpSet.map(pt => pt.replace(/\{Topic\}/g, extractedTopic));

  // 3. CTA
  const ctaTemplates = domain.ctaOptions;
  const rawCta = (brandConfig.defaultCta && brandConfig.defaultCta.trim()) || ctaTemplates[seed % ctaTemplates.length];
  const cta = rawCta.replace(/\{Topic\}/g, extractedTopic);

  // 4. Hashtags
  const hashtags = generateHashtags(extractedTopic, domain.defaultTags);

  // 5. Category
  const categoryName = domain.category;

  const companyName = brandConfig.companyName || 'Infinite Tech';

  // Construct formatted caption
  const caption = `${headline}

${description}

Key Takeaways:
${keyPoints.map(kp => `✓ ${kp}`).join('\n')}

💬 ${cta}

${hashtags.join(' ')}

—
Follow ${companyName} for more insights and industry updates.`;

  return {
    extractedTopic,
    categoryName,
    description,
    keyPoints,
    cta,
    hashtags,
    caption
  };
}

/**
 * Generates full post content package for initial creation
 */
export function generatePostContent(rawTopic, brandConfig = {}, variationIndex = 0) {
  const lower = (rawTopic || '').toLowerCase();

  // 1. SkyPro AI Calling Agent Flagship Poster (Only when explicitly requested by exact topic)
  if (lower.includes('skypro') || lower.includes('calling agent')) {
    const isCustomHeadline = rawTopic && rawTopic.trim().length > 15 && !rawTopic.includes('SkyPro AI Calling Agent: 50,000 Calls');
    const headline = isCustomHeadline ? rawTopic.trim() : '50,000 Calls Every Morning. AI Can.';

    if (isCustomHeadline) {
      const matching = generateMatchingDescription(headline, brandConfig, variationIndex);
      return {
        topic: rawTopic,
        formattedTopic: formatTopic(rawTopic),
        categoryName: matching.categoryName,
        headlinePrefix: "",
        headline,
        description: matching.description,
        keyPoints: matching.keyPoints,
        cta: matching.cta,
        hashtags: matching.hashtags,
        caption: matching.caption,
        websiteUrl: brandConfig?.websiteUrl || '',
        imageUrl: pollinationsService.buildImageUrl(
          buildContextualImagePrompt(headline, matching.categoryName, rawTopic),
          800,
          1000
        ),
        source: 'template'
      };
    }

    return {
      topic: rawTopic || 'AI Voice Agents for Enterprise Workflows',
      formattedTopic: 'AI Voice Agents',
      categoryName: 'AI Voice Agents',
      headlinePrefix: "",
      headline: '50,000 Calls Every Morning. AI Can.',
      description: 'Automate customer calls, lead follow-ups, reminders and collections with AI Voice Agents. Turn every call into an opportunity.',
      keyPoints: [
        'More Calls: Never miss a customer',
        'Faster Follow-ups: Turn leads into customers',
        'Higher Conversions: Boost business growth',
        'Multilingual: Connect with customers in their language'
      ],
      cta: 'Explore More',
      hashtags: ['#VoiceAI', '#Automation', '#CustomerSuccess', '#AI'],
      caption: `50,000 Calls Every Morning. AI Can.\n\nAutomate customer calls, lead follow-ups, reminders and collections with AI Voice Agents. Turn every call into an opportunity.\n\n✓ More Calls — Never miss a customer\n✓ Faster Follow-ups — Turn leads into customers\n✓ Higher Conversions — Boost business growth\n✓ Multilingual — Connect with customers in their language\n\n💬 Explore More at ${brandConfig?.websiteUrl || 'our website'}\n\n#VoiceAI #Automation #CustomerSuccess #AI`,
      websiteUrl: brandConfig?.websiteUrl || '',
      imageUrl: pollinationsService.buildImageUrl(
        'sleek futuristic 3D white robot avatar wearing call center headset with microphone, glowing cyan visor eyes and smiling face, 3d render, modern tech aesthetic, clean studio lighting, high resolution, no text',
        800,
        1000
      ),
      source: 'template'
    };
  }

  if (lower.includes('data engineering') || lower.includes('masterclass')) {
    return {
      topic: rawTopic,
      formattedTopic: 'Data Engineering',
      categoryName: 'Masterclass',
      headline: 'Data Engineering in 2026',
      description: "Skills, Tools, Career Roadmap and What's Next",
      keyPoints: [
        'Modern Data Stack',
        'Build Scalable Pipelines',
        'Career Roadmap & Salary Trends',
        'Top Hiring Skills & Tools'
      ],
      presenterName: 'by Shivank Agrawal',
      presenterRole: 'Sr. V.P., Data Science at Scaler',
      learnerCount: '2200+ Learners',
      rating: '⭐ 4.9 Rating',
      eventDate: '31st Oct, Sat',
      eventTime: '5:00 – 7:30 PM',
      cta: 'Reserve Your Free Masterclass Seat →',
      hashtags: ['#DataEngineering', '#BigData', '#Scaler', '#Databricks', '#ApacheSpark'],
      caption: `Data Engineering in 2026\n\nSkills, Tools, Career Roadmap and What's Next\n\nKey Takeaways:\n✓ Modern Data Stack\n✓ Build Scalable Pipelines\n✓ Career Roadmap & Salary Trends\n✓ Top Hiring Skills & Tools\n\n📅 31st Oct, Sat | 🕒 5:00 – 7:30 PM\nSpeaker: Shivank Agrawal (Sr. V.P., Data Science at Scaler)\n\nReserve your free seat today!`,
      source: 'template'
    };
  }

  const topic = formatTopic(rawTopic);
  const seed = hashString(topic) + variationIndex;

  const headlinePrefixes = [
    "Transform Your Business with {Topic}",
    "The Strategic Advantage of {Topic} in 2026",
    "Why Leaders Are Prioritizing {Topic}",
    "Unlocking Next-Generation Value Through {Topic}",
    "How Modern Enterprises Scale with {Topic}"
  ];

  const headline = headlinePrefixes[seed % headlinePrefixes.length].replace('{Topic}', topic);
  const matching = generateMatchingDescription(headline, brandConfig, variationIndex);
  const smartCat = generateSmartCategoryContent(rawTopic || headline, 'hiring', brandConfig, variationIndex);

  return {
    topic: rawTopic,
    formattedTopic: topic,
    categoryName: matching.categoryName,
    headline,
    description: matching.description,
    keyPoints: matching.keyPoints,
    cta: matching.cta,
    hashtags: matching.hashtags,
    caption: matching.caption,
    source: 'template',
    ...smartCat
  };
}

// =============================================================================
// SMART MULTI-CATEGORY CONTENT ENGINE (Hiring, Services, Products, Roadmap, Edu)
// =============================================================================

export const SMART_CATEGORY_DOMAINS = {
  cloud_devops: {
    roles: ['Cloud & DevOps Engineer', 'Senior Cloud Architect', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Infrastructure Lead'],
    techStack: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Python', 'Linux', 'Git', 'CI/CD', 'Helm', 'Ansible', 'Prometheus', 'Grafana'],
    requirements: [
      'Architect, configure, and maintain resilient multi-region AWS/GCP cloud environments with 99.99% uptime.',
      'Implement and optimize automated CI/CD deployment pipelines using GitHub Actions, ArgoCD, and Docker.',
      'Manage production Kubernetes clusters, Helm charts, and containerized microservice orchestrations.',
      'Automate Infrastructure as Code (IaC) using reusable Terraform modules and Ansible playbooks.',
      'Monitor system health, SLOs/SLAs, and alert responses using Prometheus, Grafana, and Datadog.',
      'Lead FinOps initiatives to reduce cloud infrastructure costs by 30%+ while eliminating single points of failure.'
    ],
    deliverables: [
      'Multi-Region Cloud Architecture & VPC Design',
      'Production Kubernetes Fleet & GitOps Setup',
      'Automated Zero-Downtime CI/CD Delivery Pipelines',
      'Infrastructure as Code (Terraform & Ansible)',
      '24/7 SRE Monitoring & Real-Time Incident Response',
      'FinOps Cloud Cost Optimization & Right-Sizing',
      'Zero-Trust IAM & Cloud Security Compliance',
      'High-Availability Database Clustering & Replication',
      'Serverless Microservices Migration & Modernization',
      'Automated Disaster Recovery & Failover Playbooks'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'One-Click Cloud Provisioning', desc: 'Deploy entire secure multi-cloud environments in under 3 minutes with automated IaC compliance.' },
      { icon: 'shield', title: 'Autonomous Guardrails & IAM', desc: 'Continuously enforce SOC2, HIPAA, and least-privilege security policies without manual reviews.' },
      { icon: 'chart', title: 'AI FinOps Cost Engine', desc: 'Predictive rightsizing and spot instance management that slashes monthly cloud bills by 35-50%.' },
      { icon: 'gear', title: 'Self-Healing Kubernetes Fleet', desc: 'Automated node recovery, intelligent traffic rerouting, and zero-downtime rolling upgrades.' }
    ],
    stages: [
      { stage: 1, role: 'Junior Cloud Associate', years: '0 - 1 yr', skills: 'Linux, Bash, Git, AWS Practitioner, Networking', desc: 'Provision cloud VMs, configure VPC subnets, and monitor basic system health metrics.' },
      { stage: 2, role: 'Cloud & DevOps Engineer', years: '1 - 3 yrs', skills: 'Docker, Terraform, Python, CI/CD, AWS Solutions Architect', desc: 'Build automated deployment pipelines and write maintainable Terraform configurations.' },
      { stage: 3, role: 'Senior Cloud Engineer', years: '3 - 5 yrs', skills: 'Kubernetes, Helm, Multi-Cloud, Observability, Security', desc: 'Lead production cluster migrations, fine-tune container runtimes, and optimize latency.' },
      { stage: 4, role: 'Platform & SRE Lead', years: '5 - 8 yrs', skills: 'Site Reliability Engineering, FinOps, Incident Response', desc: 'Architect resilient platform infrastructure, maintain 99.99% uptime, and mentor teams.' },
      { stage: 5, role: 'Principal Cloud Architect', years: '8 - 12 yrs', skills: 'Enterprise Architecture, Zero Trust, Multi-Region DR', desc: 'Define organization-wide cloud transformation roadmap and evaluate emergent technologies.' },
      { stage: 6, role: 'Head of Infrastructure / VP', years: '12+ yrs', skills: 'Executive Tech Strategy, Global Scaling, Budget Governance', desc: 'Lead global infrastructure organizations and drive top-level engineering decisions.' }
    ],
    hashtags: ['#CloudEngineer', '#DevOps', '#Kubernetes', '#AWS', '#Terraform', '#SRE']
  },

  ai_ml: {
    roles: ['AI & Machine Learning Engineer', 'Generative AI Specialist', 'LLM Systems Architect', 'Computer Vision Scientist', 'Data Science Lead'],
    techStack: ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'Hugging Face', 'FastAPI', 'Pandas', 'Vector DB', 'SQL', 'Docker', 'LLMs', 'MLflow'],
    requirements: [
      'Design, fine-tune, and deploy state-of-the-art LLM pipelines and Retrieval-Augmented Generation (RAG) architectures.',
      'Build scalable, low-latency model inference APIs using FastAPI, Triton Inference Server, and Docker.',
      'Optimize vector databases (Pinecone, Qdrant, Milvus) for sub-15ms semantic search across enterprise knowledge bases.',
      'Collaborate with cross-functional product and engineering teams to integrate autonomous agent workflows.',
      'Establish robust MLOps evaluation frameworks, data validation pipelines, and drift detection with MLflow.',
      'Implement safety guardrails, prompt defense, and hallucination reduction mechanisms for production GenAI.'
    ],
    deliverables: [
      'Enterprise LLM & RAG Knowledge Base Deployment',
      'Autonomous AI Agent & Multi-Step Workflow Automation',
      'Custom Predictive Machine Learning Models',
      'Computer Vision, OCR & Visual Intelligence Systems',
      'Natural Language Processing (NLP) & Sentiment Analyzers',
      'Open-Source Model Fine-Tuning & Quantization',
      'High-Speed Vector Database Similarity Search',
      'AI Safety, Guardrails & Hallucination Audits',
      'Production Model Inference Hosting & Scaling',
      'End-to-End MLOps & Experiment Tracking Pipelines'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'Autonomous Agentic Workflows', desc: 'Deploy multi-agent systems that reason, call APIs, and execute complex business logic autonomously.' },
      { icon: 'shield', title: 'Zero-Retention Enterprise Privacy', desc: 'Strict zero-data-retention inference with automated PII sanitization and SOC2 compliance.' },
      { icon: 'chart', title: 'Real-Time Semantic Analytics', desc: 'Turn millions of unstructured customer interactions into actionable insights and trend clusters.' },
      { icon: 'gear', title: 'Sub-10ms Hybrid Vector Search', desc: 'Query dense vector embeddings and sparse lexical indices simultaneously with instant recall.' }
    ],
    stages: [
      { stage: 1, role: 'Junior AI / Python Developer', years: '0 - 1 yr', skills: 'Python, NumPy, Pandas, SQL, Linear Algebra, Math', desc: 'Perform exploratory data analysis, clean unstructured datasets, and write baseline ML models.' },
      { stage: 2, role: 'Machine Learning Engineer', years: '1 - 3 yrs', skills: 'PyTorch, Scikit-Learn, Docker, FastAPI, Experiment Tracking', desc: 'Train predictive models, build model serving APIs, and deploy models into staging environments.' },
      { stage: 3, role: 'Senior AI / LLM Engineer', years: '3 - 5 yrs', skills: 'Hugging Face, LangChain, Vector DBs, RAG, Fine-Tuning', desc: 'Architect production generative AI applications, fine-tune open weights, and optimize token latency.' },
      { stage: 4, role: 'AI Tech Lead & MLOps Architect', years: '5 - 8 yrs', skills: 'Kubeflow, Triton Server, Distributed GPU Training, Drift', desc: 'Scale inference clusters across GPU fleets, establish model governance, and mentor AI engineers.' },
      { stage: 5, role: 'Principal AI Scientist', years: '8 - 12 yrs', skills: 'Novel Architectures, Multi-Modal Systems, Strategic AI IP', desc: 'Direct advanced enterprise AI research, evaluate cutting-edge foundation models, and author AI patents.' },
      { stage: 6, role: 'Chief AI Officer / VP of AI', years: '12+ yrs', skills: 'Executive AI Strategy, AI Ethics, Enterprise Transformation', desc: 'Steer corporate AI roadmap, manage multi-million dollar GPU budgets, and lead executive AI vision.' }
    ],
    hashtags: ['#AI', '#MachineLearning', '#GenerativeAI', '#LLMs', '#Python', '#DeepLearning']
  },

  frontend: {
    roles: ['Senior Frontend Engineer', 'React / Next.js Developer', 'UI Architect', 'Web Performance Engineer', 'Frontend Lead'],
    techStack: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'HTML5/CSS3', 'Vite', 'GraphQL', 'Jest', 'Webpack', 'Figma', 'Node.js'],
    requirements: [
      'Build responsive, pixel-perfect user interfaces using React 19, Next.js App Router, and TypeScript.',
      'Architect scalable design systems with reusable components, Tailwind CSS, and headless accessibility primitives.',
      'Optimize Core Web Vitals, SSR caching, code-splitting, and asset pipelines for blazing fast load times.',
      'Integrate complex RESTful endpoints, GraphQL schemas, and WebSockets with optimistic client updates.',
      'Write robust unit and integration test suites using Vitest, React Testing Library, and Playwright.',
      'Champion modern web accessibility (WCAG 2.1 AA) and cross-browser responsiveness across all screen sizes.'
    ],
    deliverables: [
      'Modern High-Performance Web Application Development',
      'Reusable Enterprise UI Component Design Systems',
      'Next.js Full-Stack App Router Architecture',
      'Core Web Vitals & Page Speed Optimization',
      'Single Page App (SPA) to SSR Migration',
      'GraphQL & RESTful API Frontend Integration',
      'Cross-Device Responsive & Mobile-First UI',
      'WCAG 2.1 AA Web Accessibility Compliance',
      'End-to-End Test Automation (Playwright & Vitest)',
      'Interactive Dashboards & Data Visualization'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'Instant 60fps Interactions', desc: 'Optimized hydration and zero-layout-shift rendering for smooth, desktop-grade web UX.' },
      { icon: 'shield', title: 'Accessible By Default', desc: 'Built-in ARIA support, keyboard navigation, and high-contrast compliance out of the box.' },
      { icon: 'chart', title: 'Built-In Web Vitals Monitoring', desc: 'Track real user metrics, LCP, INP, and CLS directly from live user sessions in real time.' },
      { icon: 'gear', title: 'Modular Tokenized Design System', desc: 'Swap themes, brands, and layouts seamlessly with modern CSS variables and Tailwind tokens.' }
    ],
    stages: [
      { stage: 1, role: 'Junior Web Developer', years: '0 - 1 yr', skills: 'HTML5, CSS3, JavaScript ES6+, Git, Responsive Design', desc: 'Code semantic web layouts, style responsive landing pages, and resolve cross-browser quirks.' },
      { stage: 2, role: 'Frontend Engineer', years: '1 - 3 yrs', skills: 'React, TypeScript, Tailwind CSS, REST APIs, State Management', desc: 'Build interactive UI components, handle asynchronous API state, and ship clean user features.' },
      { stage: 3, role: 'Senior Frontend Developer', years: '3 - 5 yrs', skills: 'Next.js, Performance Optimization, GraphQL, Testing Library', desc: 'Architect application architecture, optimize Core Web Vitals, and lead complex UI refactors.' },
      { stage: 4, role: 'Staff UI Engineer / Lead', years: '5 - 8 yrs', skills: 'Design Systems, Micro-Frontends, Webpack/Vite Internals', desc: 'Maintain company-wide UI component libraries, establish frontend standards, and mentor engineers.' },
      { stage: 5, role: 'Principal Frontend Architect', years: '8 - 12 yrs', skills: 'Cross-Platform Web Strategy, Framework Evaluation, DX', desc: 'Define technical frontend roadmaps, evaluate cutting-edge web specs, and drive developer productivity.' },
      { stage: 6, role: 'VP of Frontend Engineering', years: '12+ yrs', skills: 'Tech Strategy, Global Engineering Org, Executive Leadership', desc: 'Align engineering execution with executive business goals and oversee web product delivery.' }
    ],
    hashtags: ['#Frontend', '#ReactJS', '#TypeScript', '#NextJS', '#WebDev', '#TailwindCSS']
  },

  backend: {
    roles: ['Backend Systems Engineer', 'Senior Go / Java Developer', 'Distributed Systems Architect', 'API Platform Engineer', 'Backend Lead'],
    techStack: ['Go / Golang', 'Node.js', 'Python', 'Java Spring', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'gRPC', 'REST APIs', 'AWS'],
    requirements: [
      'Design, build, and maintain high-throughput, low-latency microservices handling millions of daily requests.',
      'Architect robust relational and NoSQL database schemas, queries, and connection pools with PostgreSQL and Redis.',
      'Implement asynchronous event-driven messaging pipelines using Apache Kafka, RabbitMQ, and AWS SQS.',
      'Design clean, secure API contracts with OpenAPI, gRPC, and strict rate-limiting policies.',
      'Ensure bulletproof security with OAuth2, JWT authentication, and automated vulnerability scanning.',
      'Collaborate closely with infrastructure teams on container orchestration, CI/CD, and distributed tracing.'
    ],
    deliverables: [
      'High-Throughput Microservices Architecture',
      'Ultra-Fast REST & gRPC API Platform Design',
      'Database Modeling, Sharding & Query Optimization',
      'Event-Driven Streaming with Apache Kafka',
      'Redis In-Memory Caching & Distributed Locks',
      'OAuth2, JWT & Zero-Trust Authentication Systems',
      'Automated Load Testing & Fault Tolerance',
      'Payment Gateway & Third-Party API Integrations',
      'Data Warehousing & Real-Time Sync Pipelines',
      'SLA-Backed 99.99% Backend Reliability'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'Sub-5ms Microsecond Latency', desc: 'Engineered in Go and Rust for unmatched throughput and minimal memory footprints.' },
      { icon: 'shield', title: 'Bank-Grade Security & Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit, and automated audit trails for full regulatory compliance.' },
      { icon: 'chart', title: 'Real-Time Distributed Tracing', desc: 'Full OpenTelemetry instrumentation giving immediate root-cause visibility into every request hop.' },
      { icon: 'gear', title: 'Elastic Auto-Scaling Clusters', desc: 'Automatically scale worker instances based on real-time request queue depths and CPU thresholds.' }
    ],
    stages: [
      { stage: 1, role: 'Junior Backend Developer', years: '0 - 1 yr', skills: 'Node.js / Python, SQL, REST APIs, Git, Linux Basics', desc: 'Write CRUD API endpoints, write basic SQL queries, and implement basic authentication.' },
      { stage: 2, role: 'Backend Engineer', years: '1 - 3 yrs', skills: 'Go / Java, PostgreSQL, Docker, Redis, Unit Testing', desc: 'Design database schemas, write efficient transactions, and containerize service applications.' },
      { stage: 3, role: 'Senior Backend Engineer', years: '3 - 5 yrs', skills: 'Kafka, Microservices, gRPC, Distributed Caching, CI/CD', desc: 'Build scalable event-driven services, optimize database query bottlenecks, and lead code reviews.' },
      { stage: 4, role: 'Staff Backend Architect', years: '5 - 8 yrs', skills: 'Distributed Systems, Sharding, High Availability, Security', desc: 'Architect multi-tier backend systems, design zero-downtime migration strategies, and mentor engineers.' },
      { stage: 5, role: 'Principal Systems Architect', years: '8 - 12 yrs', skills: 'Enterprise Scale, Consensus Algorithms, Disaster Recovery', desc: 'Guide company-wide architecture decisions, evaluate technology stacks, and author architectural RFCs.' },
      { stage: 6, role: 'VP of Engineering', years: '12+ yrs', skills: 'Engineering Org Scaling, Executive Tech Vision, Roadmaps', desc: 'Lead engineering department operations, manage multimillion-dollar budgets, and report to board.' }
    ],
    hashtags: ['#Backend', '#Golang', '#Microservices', '#SystemDesign', '#PostgreSQL', '#Cloud']
  },

  graphic_design: {
    roles: ['Senior Graphic Designer', 'Creative Director', 'Brand Identity Designer', 'Visual Storyteller', 'Marketing Designer'],
    techStack: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Figma', 'After Effects', 'Canva Pro', 'Typography', 'Vector Art', 'Branding', 'Print Production', 'Color Theory', 'Layout'],
    requirements: [
      'Create high-converting, visually stunning graphic assets for social media, digital advertising, and print collateral.',
      'Develop cohesive brand identities including logos, color palettes, typography standards, and brand guidelines.',
      'Produce print-ready marketing materials such as brochures, flyers, banners, and corporate presentation decks.',
      'Collaborate with marketing teams to translate campaign concepts into captivating visual storytelling.',
      'Master industry-standard design tools including Adobe Creative Cloud (Photoshop, Illustrator, InDesign) and Figma.',
      'Maintain organized asset libraries and ensure high visual consistency across all customer-facing touchpoints.'
    ],
    deliverables: [
      'Flyer, Poster & Event Graphics',
      'Social Media Covers, Carousels & Posts',
      'Corporate Brochures & Company Profiles',
      'Display Banners & Event Signage',
      'Letterhead, Business Cards & Stationery Kits',
      'High-Converting Digital Ads & Web Graphics',
      'Logo Creation & Visual Identity Guidelines',
      'Custom Vector Illustrations & Icon Sets',
      'Book & Magazine Editorial Cover Art',
      'Infographics & Visual Data Representations',
      'Email Newsletter & Promotion Templates',
      'Custom Packaging & Merchandise Mockups'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'Pixel-Perfect Brand Consistency', desc: 'Ensure every visual asset conforms strictly to your official brand colors, fonts, and grid guidelines.' },
      { icon: 'shield', title: 'High-Resolution Vector Graphics', desc: 'Scalable vector illustrations and SVG assets that remain razor-sharp from mobile screens to billboards.' },
      { icon: 'chart', title: 'Engagement-Driven Visuals', desc: 'Designed specifically to capture attention in fast-scrolling feeds and increase social click-through rates.' },
      { icon: 'gear', title: 'Multi-Format Export Ready', desc: 'Instant export in print-ready 300DPI CMYK PDFs, web-optimized PNGs, WebP, and social-ready formats.' }
    ],
    stages: [
      { stage: 1, role: 'Junior Graphic Designer', years: '0 - 1 yr', skills: 'Photoshop, Illustrator, Color Theory, Layout Basics', desc: 'Create social media graphics, format basic banner ads, and retouch product photography.' },
      { stage: 2, role: 'Brand & Visual Designer', years: '1 - 3 yrs', skills: 'InDesign, Figma, Typography, Vector Art, Print Specs', desc: 'Design marketing brochures, brand identity elements, and campaign visual collateral.' },
      { stage: 3, role: 'Senior Graphic Designer', years: '3 - 5 yrs', skills: 'Creative Direction, Campaign Strategy, Motion Basics', desc: 'Lead complex brand redesigns, oversee multi-channel campaigns, and ensure top visual quality.' },
      { stage: 4, role: 'Lead Visual Designer / Art Director', years: '5 - 8 yrs', skills: 'Brand Systems, Team Mentorship, Client Strategy', desc: 'Direct visual strategy across campaigns, manage creative team sprints, and present to stakeholders.' },
      { stage: 5, role: 'Creative Director', years: '8 - 12 yrs', skills: 'Executive Creative Vision, Multi-Brand Strategy', desc: 'Shape overarching brand voice and visual strategy for enterprise clients and major product launches.' },
      { stage: 6, role: 'VP of Brand & Design', years: '12+ yrs', skills: 'Executive Leadership, Brand Equity, Global Campaigns', desc: 'Guide global brand positioning, lead design departments, and cultivate world-class creative culture.' }
    ],
    hashtags: ['#GraphicDesign', '#Branding', '#VisualDesign', '#Creatives', '#LogoDesign', '#Marketing']
  },

  marketing_growth: {
    roles: ['Growth Marketing Manager', 'Performance Marketing Lead', 'SEO & Content Strategist', 'Digital Marketing Director', 'Demand Generation Lead'],
    techStack: ['Google Analytics 4', 'SEMrush', 'HubSpot', 'Meta Ads', 'Google Ads', 'Mailchimp', 'Hotjar', 'A/B Testing', 'Copywriting', 'Canva', 'CRM', 'SQL'],
    requirements: [
      'Develop and execute data-driven multi-channel growth marketing strategies across paid, organic, and referral channels.',
      'Manage and optimize high-budget Google Ads and Meta performance campaigns for maximum ROAS and CAC reduction.',
      'Lead organic SEO initiatives, technical audits, keyword research, and high-ranking content marketing strategies.',
      'Build automated email nurture funnels, lead scoring systems, and customer retention workflows in HubSpot / Klaviyo.',
      'Analyze full-funnel conversion metrics, set up A/B testing experiments, and report weekly ROI performance to leadership.',
      'Collaborate with creative teams to produce high-converting ad copy, landing pages, and social video creatives.'
    ],
    deliverables: [
      'Data-Driven Search Engine Optimization (SEO)',
      'High-ROAS Google & Meta Performance PPC Campaigns',
      'Social Media Strategy, Growth & Community Management',
      'Automated Email Marketing & Drip Nurturing Funnels',
      'Conversion Rate Optimization (CRO) & A/B Testing',
      'Brand Storytelling, Copywriting & Content Marketing',
      'Real-Time Analytics Dashboards & Attribution Models',
      'Influencer Marketing & Strategic Brand Partnerships',
      'B2B Account-Based Marketing (ABM) Playbooks',
      'Full-Funnel Go-To-Market & Product Launch Strategy'
    ],
    productFeatures: [
      { icon: 'rocket', title: 'Automated Lead Acquisition', desc: 'Target high-intent buyers with AI-optimized bidding and hyper-personalized ad copy variations.' },
      { icon: 'shield', title: 'Clean First-Party Data Capture', desc: 'Privacy-compliant tracking and server-side tracking that bypasses iOS tracking limitations.' },
      { icon: 'chart', title: 'Multi-Touch Attribution Modeling', desc: 'Understand exactly which channel, ad, and touchpoint drove every conversion and dollar of revenue.' },
      { icon: 'gear', title: 'Dynamic Content Personalization', desc: 'Automatically adapt landing page headlines and CTA messaging based on incoming traffic sources.' }
    ],
    stages: [
      { stage: 1, role: 'Marketing Associate', years: '0 - 1 yr', skills: 'Social Media, Copywriting, Google Analytics Basics, Canva', desc: 'Publish daily social content, draft blog posts, and assist with campaign scheduling and reporting.' },
      { stage: 2, role: 'Growth & Performance Specialist', years: '1 - 3 yrs', skills: 'Google Ads, Meta Ads, Email Automation, SEO Tools', desc: 'Run paid search and social campaigns, build email drip sequences, and optimize conversion funnels.' },
      { stage: 3, role: 'Senior Growth Marketing Manager', years: '3 - 5 yrs', skills: 'A/B Testing, Attribution, ROAS Optimization, Team Lead', desc: 'Manage significant ad budgets, lead organic acquisition strategy, and optimize customer acquisition costs.' },
      { stage: 4, role: 'Head of Demand Generation', years: '5 - 8 yrs', skills: 'Full-Funnel Strategy, CRM Operations, Pipeline Revenue', desc: 'Own marketing pipeline revenue targets, coordinate sales alignment, and scale acquisition channels.' },
      { stage: 5, role: 'VP of Growth & Marketing', years: '8 - 12 yrs', skills: 'Executive GTM Strategy, Brand Equity, Global Expansion', desc: 'Drive comprehensive corporate market positioning, lead cross-functional growth teams, and drive ARR.' },
      { stage: 6, role: 'Chief Marketing Officer (CMO)', years: '12+ yrs', skills: 'Executive Leadership, Enterprise Strategy, Board Reporting', desc: 'Steer corporate brand legacy, define global marketing investments, and report directly to CEO.' }
    ],
    hashtags: ['#Marketing', '#GrowthHacking', '#SEO', '#DigitalMarketing', '#PerformanceMarketing', '#B2B']
  }
};

/**
 * Detects domain and role semantics from headline text
 */
export function detectRoleAndDomain(rawHeadline) {
  const text = (rawHeadline || '').toLowerCase();

  // 1. Check Cloud / DevOps / SRE
  if (text.includes('cloud') || text.includes('devops') || text.includes('sre') || text.includes('kubernetes') || text.includes('aws') || text.includes('azure') || text.includes('terraform') || text.includes('docker') || text.includes('platform engineer') || text.includes('infrastructure')) {
    return 'cloud_devops';
  }

  // 2. Check AI / Machine Learning / Data Science
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning') || text.includes('ml') || text.includes('llm') || text.includes('generative') || text.includes('genai') || text.includes('deep learning') || text.includes('data science') || text.includes('data scientist')) {
    return 'ai_ml';
  }

  // 3. Check Graphic Design / Creative Agency
  if (text.includes('graphic design') || text.includes('creative agency') || text.includes('branding') || text.includes('logo') || text.includes('illustration') || text.includes('photoshop') || text.includes('brochure') || text.includes('banner')) {
    return 'graphic_design';
  }

  // 4. Check Frontend / UI / React
  if (text.includes('frontend') || text.includes('front-end') || text.includes('react') || text.includes('next.js') || text.includes('nextjs') || text.includes('ui developer') || text.includes('vue') || text.includes('angular') || text.includes('web developer')) {
    return 'frontend';
  }

  // 5. Check Backend / API / Golang / Java
  if (text.includes('backend') || text.includes('back-end') || text.includes('golang') || text.includes('microservice') || text.includes('api engineer') || text.includes('java') || text.includes('spring boot') || text.includes('system design')) {
    return 'backend';
  }

  // 6. Check Marketing / Growth / SEO
  if (text.includes('market') || text.includes('growth') || text.includes('seo') || text.includes('ad agency') || text.includes('social media') || text.includes('demand gen')) {
    return 'marketing_growth';
  }

  // Default fallback to cloud_devops for modern high-tech appeal
  return 'cloud_devops';
}

/**
 * Extracts a clean, elegant Job Role or Topic Subject from a user's headline.
 * E.g. "Senior Cloud & DevOps Engineer (AWS & Kubernetes)" -> "Senior Cloud & DevOps Engineer"
 * E.g. "cloud engineer" -> "Cloud Engineer"
 */
export function extractCleanRole(headline) {
  if (!headline) return 'Senior Software Engineer';
  let clean = headline.trim();

  // Strip common prompt wrappers
  clean = clean.replace(/^(we are|we're)\s+hiring\s*[:\-]?\s*/i, '');
  clean = clean.replace(/^hiring\s*[:\-]?\s*/i, '');
  clean = clean.replace(/^looking\s+for\s+(an?|our)?\s*/i, '');
  clean = clean.replace(/^join\s+(our\s+team\s+as\s+an?|us\s+as\s+an?)\s*/i, '');
  clean = clean.replace(/^wanted\s*[:\-]?\s*/i, '');

  // Strip trailing parentheticals if they are tech stacks e.g. "(AWS & Kubernetes)"
  clean = clean.replace(/\s*\([^)]{3,40}\)\s*$/, '');

  // Clean trailing punctuation
  clean = clean.replace(/[.,:;!?]+$/, '').trim();

  return formatTopic(clean);
}

/**
 * Generates smart category-specific content (Role, TechStack, Requirements,
 * Deliverables, Product Features, Career Roadmap Stages, CTC, Experience)
 * based directly on the provided headline.
 */
export function generateSmartCategoryContent(headline = '', category = 'hiring', brandConfig = {}, variationOffset = 0, styleId = '') {
  const domainKey = detectRoleAndDomain(headline);
  const domain = SMART_CATEGORY_DOMAINS[domainKey] || SMART_CATEGORY_DOMAINS.cloud_devops;
  const cleanRole = extractCleanRole(headline);
  const headlineLower = (headline || '').toLowerCase();

  // 1. Detect Seniority from Headline
  let experience = '3 - 5 Years';
  let salary = '₹12 - 18 LPA';
  let fresherSalary = '₹5 - 7 LPA';

  if (headlineLower.includes('lead') || headlineLower.includes('principal') || headlineLower.includes('staff') || headlineLower.includes('architect') || headlineLower.includes('director') || headlineLower.includes('head') || headlineLower.includes('vp')) {
    experience = '7 - 10+ Years';
    salary = '₹30 - 45 LPA';
    fresherSalary = 'Not Applicable (Senior Only)';
  } else if (headlineLower.includes('senior') || headlineLower.includes('sr.') || headlineLower.includes('sr ')) {
    experience = '5 - 8 Years';
    salary = '₹20 - 30 LPA';
    fresherSalary = '₹6 - 8 LPA';
  } else if (headlineLower.includes('junior') || headlineLower.includes('jr.') || headlineLower.includes('jr ') || headlineLower.includes('associate') || headlineLower.includes('intern') || headlineLower.includes('fresher') || headlineLower.includes('entry')) {
    experience = '0 - 2 Years';
    salary = '₹6 - 10 LPA';
    fresherSalary = '₹4 - 6 LPA';
  }

  // 2. Synthesize Role-tailored Tech Stack
  let techStack = [...domain.techStack];
  // If user mentioned specific techs in headline e.g. "Python", "Kubernetes", "React", make sure they are included!
  const candidateTechs = ['Python', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Docker', 'React', 'Node.js', 'TypeScript', 'Terraform', 'Golang', 'Java', 'Figma', 'Linux', 'SQL', 'FastAPI', 'PyTorch', 'Next.js', 'PostgreSQL', 'Redis', 'Kafka'];
  candidateTechs.forEach(t => {
    if (headlineLower.includes(t.toLowerCase()) && !techStack.includes(t)) {
      techStack.unshift(t);
    }
  });
  techStack = techStack.slice(0, 12);

  // 3. Tailored Requirements (6 items for Hiring)
  const requirements = domain.requirements.map(req => {
    return req.replace(/AWS\/GCP/g, headlineLower.includes('azure') ? 'Azure' : 'AWS/GCP');
  });

  // 4. Tailored Deliverables (10 items for Services)
  const deliverables = [...domain.deliverables];

  // 5. Tailored Product Features (4 cards for Product)
  const features = domain.productFeatures.map(f => ({ ...f }));

  // 6. Tailored Career Roadmap Stages (6 milestones)
  const stages = domain.stages.map(st => ({
    ...st,
    role: st.stage === 3 ? cleanRole : st.role
  }));

  // 7. Service & Product Names
  let serviceName = `${cleanRole} Services`;
  if (domainKey === 'graphic_design') serviceName = 'Graphic Design & Creative Services';
  else if (domainKey === 'marketing_growth') serviceName = 'Growth Marketing & SEO Services';
  else if (domainKey === 'cloud_devops') serviceName = 'Cloud Architecture & DevOps Services';
  else if (domainKey === 'ai_ml') serviceName = 'Enterprise AI & Machine Learning Services';

  const productName = `${cleanRole.split(/\s+/)[0] || 'Enterprise'} Platform`;
  const tagline = `Scalable, production-ready solutions engineered to elevate your ${cleanRole.toLowerCase()} capabilities.`;

  return {
    role: cleanRole,
    roleTitle: cleanRole,
    experience,
    salary,
    fresherSalary,
    location: 'Bengaluru / Remote',
    jobType: 'Full-Time | Immediate Joiner',
    employmentType: 'Full-Time | Immediate Joiner',
    techStack,
    requirements,
    deliverables,
    features,
    stages,
    serviceName,
    productName,
    tagline,
    phone: brandConfig.phone || '+91 98765 43210',
    months: '6 Months Intensive',
    kicker: `${cleanRole.toUpperCase()} PROGRAM`,
    status: 'Applications Open • 2026 Batch',
    badge: 'Cohort Open'
  };
}

