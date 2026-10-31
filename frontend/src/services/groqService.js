/**
 * Groq AI Service for ultra-fast B2B social content and image prompt generation
 * Powered by Groq LPU Inference (sub-second response: ~0.2s - 0.5s)
 */

const DEFAULT_GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'qwen/qwen3.8-27b';

export const groqService = {
  /**
   * Retrieves active Groq API Key from environment or localStorage
   */
  getApiKey() {
    return (
      import.meta.env.VITE_GROQ_API_KEY ||
      localStorage.getItem('postcraft_groq_api_key') ||
      ''
    ).trim();
  },

  /**
   * Saves custom Groq API Key to localStorage
   */
  setApiKey(key) {
    if (key) {
      localStorage.setItem('postcraft_groq_api_key', key.trim());
    } else {
      localStorage.removeItem('postcraft_groq_api_key');
    }
  },

  /**
   * Generates complete social post copy AND diffusion image prompt in a single sub-second call,
   * fully structured and tailored by post category.
   */
  async generatePostAndImagePrompt(topicOrHeadline, brand = {}, isHeadline = false, category = 'hiring') {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'No Groq API key configured' };
    }

    const companyName = brand?.companyName || 'Our Company';
    const modelsToTry = [DEFAULT_GROQ_MODEL, 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

    // Category-specific instructions
    let categoryGuide = '';
    let categorySchemaProps = '';

    if (category === 'hiring') {
      categoryGuide = `The user is creating a HIRING / JOB POST.
Generate:
- "role": Specific job title (e.g. "Cloud Infrastructure Engineer")
- "experience": Realistic experience range (e.g. "2 - 5 Years")
- "location": "Bengaluru / Remote" or top tech hub
- "salary": Realistic competitive CTC (e.g. "₹12 - 20 LPA")
- "fresherSalary": e.g. "₹5 - 7 LPA"
- "jobType": "Full-Time | Immediate"
- "techStack": An array of 8-12 technology tool names that precisely match this exact role (e.g. for Cloud Engineer: ["AWS", "Terraform", "Kubernetes", "Docker", "Linux", "Python", "GCP", "Git", "Ansible", "CI/CD"]). NEVER give web frontend tools like React for a Cloud/DevOps role!
- "requirements": 4 to 6 concise, punchy 1-sentence requirements. IMPORTANT: Keep each point between 8 to 14 words maximum so they fit cleanly inside social graphic cards without text cramping!`;
      categorySchemaProps = `
  "role": "...",
  "experience": "...",
  "location": "...",
  "salary": "...",
  "fresherSalary": "...",
  "jobType": "Full-Time | Immediate",
  "techStack": ["AWS", "Terraform", "Kubernetes", "Docker", "Linux", "Python", "GCP", "CI/CD"],
  "requirements": [
    "Hands-on experience with AWS cloud infrastructure.",
    "Proficiency in Infrastructure as Code with Terraform.",
    "Deploying containerized microservices on Kubernetes.",
    "Strong Linux shell scripting and CI/CD automation."
  ],`;
    } else if (category === 'education') {
      categoryGuide = `The user is creating an EDUCATION, INTERNSHIP, or BOOTCAMP POST.
Generate:
- "programTitle": Compelling title (e.g. "Winter Internship Program 2026-27" or "Cloud Engineering Bootcamp")
- "months": 3 timeline month pills (e.g. ["November", "December", "January"])
- "kicker": A short, punchy 3-5 word uppercase kicker relevant to this specific program
- "features": 6 program highlight cards tailored to this topic with { "icon": "💻", "title": "Project-Based Learning", "desc": "Hands-on live tasks" }
- "pillars": ["Build Your Skills", "Strengthen Resume", "Ready for Next"]`;
      categorySchemaProps = `
  "programTitle": "...",
  "months": ["Month 1", "Month 2", "Month 3"],
  "kicker": "...",
  "features": [
    { "icon": "💻", "title": "...", "desc": "..." },
    { "icon": "⚙️", "title": "...", "desc": "..." },
    { "icon": "📄", "title": "...", "desc": "..." },
    { "icon": "📜", "title": "...", "desc": "..." },
    { "icon": "👥", "title": "...", "desc": "..." },
    { "icon": "🌐", "title": "...", "desc": "..." }
  ],
  "pillars": ["Build Your Skills", "Strengthen Resume", "Ready for Next"],`;
    } else if (category === 'career-roadmap') {
      categoryGuide = `The user is creating a "LIFE OF AN ENGINEER" CAREER PROGRESSION INFOGRAPHIC.
Generate:
- "roleTitle": The role (e.g. "Cloud Engineer", "DevOps Engineer", "Frontend Architect")
- "quote": A short inspiring quote or motto specifically relevant to this career track
- "stages": Exactly 6 career milestone stages progressing from Junior to CTO (0-2y, 2-4y, 4-6y, 6-8y, 8-10y, 10+y) tailored specifically to this role with title, badge, and 3-4 bullet points.`;
      categorySchemaProps = `
  "roleTitle": "...",
  "quote": "...",
  "stages": [
    { "role": "Junior Engineer", "years": "0 - 2 yrs", "badge": "Learn • Explore • Build", "points": ["Learns core tools & workflows", "Writes first automation scripts", "Supports junior cloud tasks"] },
    { "role": "Cloud Engineer", "years": "2 - 4 yrs", "badge": "Automate • Deploy • Repeat", "points": ["Manages cloud infrastructure", "Builds reliable CI/CD pipelines", "Maintains high uptime"] },
    { "role": "Senior Engineer", "years": "4 - 6 yrs", "badge": "Stability • Scale • Reliability", "points": ["Architects multi-region clusters", "Improves observability & FinOps", "Mentors mid-level engineers"] },
    { "role": "Platform / AI Infra Lead", "years": "6 - 8 yrs", "badge": "Design • Standardize • Enable", "points": ["Builds internal developer platform", "Optimizes cost & zero-trust security", "Standardizes AI/ML infrastructure"] },
    { "role": "Principal Architect", "years": "8 - 10 yrs", "badge": "Strategy • Influence • Lead", "points": ["Sets long-term cloud strategy", "Architects enterprise resilience", "Drives engineering standards"] },
    { "role": "CTO / VP Engineering", "years": "10+ yrs", "badge": "Vision • Business • Impact", "points": ["Defines technology roadmap", "Scales world-class engineering squads", "Aligns tech investments with revenue"] }
  ],`;
    } else if (category === 'services') {
      categoryGuide = `The user is creating a B2B SERVICES & ENTERPRISE SOLUTIONS POST.
Generate:
- "serviceName": Core service offering (e.g. "Cloud Modernization & DevOps Consulting")
- "keyBenefits": 4 punchy value metrics (e.g. "99.99% Guaranteed SLA Uptime", "38% Cloud Spend Reduction", "Zero-Downtime Migration", "24/7 Managed NOC & Security")
- "cta": "Book a Discovery Call →"`;
      categorySchemaProps = `
  "serviceName": "...",
  "keyBenefits": [
    "99.99% Guaranteed SLA Uptime",
    "35% Cloud Spend Optimization",
    "Zero-Downtime Migration Architecture",
    "24/7 Managed NOC & Security Monitoring"
  ],`;
    } else if (category === 'product') {
      categoryGuide = `The user is creating a PRODUCT LAUNCH / SOFTWARE SHOWCASE POST.
Generate:
- "productName": Product name
- "tagline": Punchy product tagline
- "features": 4 feature cards (e.g. "Instant Data", "Multilingual", "Smart Routing", "CRM Sync")
- "cta": "Start Free Trial →"`;
      categorySchemaProps = `
  "productName": "...",
  "tagline": "...",
  "features": [
    { "title": "Instant Data", "desc": "Real-time responses and insights" },
    { "title": "Multilingual", "desc": "Connect in 40+ global languages" },
    { "title": "Smart Routing", "desc": "Automated workflow orchestration" },
    { "title": "CRM Sync", "desc": "Seamless 2-way native sync" }
  ],`;
    }

    const systemPrompt = `You are an elite B2B social media content strategist and creative director.
Category Context: ${category.toUpperCase()}
${categoryGuide}

General Requirements:
1. "headline": A commanding, high-impact headline (5-9 words).
2. "description": A compelling, concise description (35-50 words) suitable for reading on social feeds.
3. "keyPoints": 3 to 4 actionable takeaways. Keep each point concise (10-14 words max).
4. "cta": A high-converting Call To Action.
5. "hashtags": 5 relevant hashtags.
6. "caption": A ready-to-publish social media caption formatted with headline, description, key takeaways with checkmarks, CTA, hashtags, and company sign-off.
7. "imagePrompt": A tailored visual prompt for image diffusion models (FLUX / Pollinations).
   Rules for imagePrompt:
   - For Hiring: "Professional [Role] sitting at modern ergonomic desk workstation with dual displays showing [Topic] diagrams and code, natural sunlight, sleek contemporary corporate office, high-end photography"
   - For Education/Internship: "Young ambitious Indian college student holding laptop and study notebook smiling in bright university innovation center, modern campus, cinematic lighting"
   - For Services: "Futuristic enterprise cloud data center server corridor with neon cyan holographic server network overlay, high-tech server racks, octane render"
   - For Products: "Sleek modern 3D smartphone on illuminated pedestal with glowing teal and cyan accents, clean studio lighting, octane render"
   - For Life of Engineer: "Modern clean technology workspace with notebook, laptop, coffee, engineering diagrams, editorial lighting"
   - For Festivals (Diwali, etc): Traditional golden clay diya oil lamps, marigold garlands, warm bokeh lights, festive celebration.
   ALWAYS end imagePrompt with: "centered composition, clean studio lighting, 8k resolution, photorealistic, no text, no letters, no watermarks".

Return ONLY a valid JSON object matching this exact schema:
{
  "headline": "${isHeadline ? topicOrHeadline : '...'}",
  "description": "...",
  "keyPoints": [
    "First concise point",
    "Second concise point",
    "Third concise point"
  ],
  "cta": "...",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "caption": "...",
  "imagePrompt": "...",${categorySchemaProps}
  "category": "${category}"
}`;

    const userPrompt = `Generate complete social media post package and diffusion visual prompt for topic: "${topicOrHeadline}" for company ${companyName}. Category: ${category}.`;

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.6,
            max_tokens: 2500
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Groq error with model ${model}:`, errData);
          continue; // try next model
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Extract JSON from response (in case of markdown fences)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          continue;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const finalHeadline = isHeadline ? topicOrHeadline : (parsed.headline || topicOrHeadline);
        const finalDesc = parsed.description || '';
        const finalKp = Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [];
        const finalCta = parsed.cta || 'Explore More';
        const finalTags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
        const finalCaption = parsed.caption || `${finalHeadline}\n\n${finalDesc}\n\nKey Takeaways:\n${finalKp.map(kp => `✓ ${kp}`).join('\n')}\n\n💬 ${finalCta}\n\n${finalTags.join(' ')}\n\n—\nFollow ${companyName} for more insights.`;

        return {
          success: true,
          data: {
            topic: topicOrHeadline,
            formattedTopic: topicOrHeadline,
            headline: finalHeadline,
            description: finalDesc,
            keyPoints: finalKp,
            cta: finalCta,
            hashtags: finalTags,
            caption: finalCaption,
            imagePrompt: parsed.imagePrompt || `${finalHeadline}, professional photography, clean studio lighting, 8k resolution, no text`,
            category: parsed.category || category,
            // Hiring specific fields
            role: parsed.role || finalHeadline,
            experience: parsed.experience || '2 - 5 Years',
            location: parsed.location || 'Bengaluru / Remote',
            salary: parsed.salary || '₹10 - 18 LPA',
            fresherSalary: parsed.fresherSalary || '₹5 - 7 LPA',
            jobType: parsed.jobType || 'Full-Time | Immediate',
            techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
            requirements: Array.isArray(parsed.requirements) ? parsed.requirements : finalKp,
            // Education / Internship fields
            programTitle: parsed.programTitle || finalHeadline,
            months: Array.isArray(parsed.months) ? parsed.months : null,
            kicker: parsed.kicker || '',
            features: Array.isArray(parsed.features) ? parsed.features : null,
            pillars: Array.isArray(parsed.pillars) ? parsed.pillars : null,
            // Career roadmap fields
            roleTitle: parsed.roleTitle || finalHeadline,
            stages: Array.isArray(parsed.stages) ? parsed.stages : null,
            quote: parsed.quote || '',
            // Services / Product fields
            serviceName: parsed.serviceName || finalHeadline,
            keyBenefits: Array.isArray(parsed.keyBenefits) ? parsed.keyBenefits : null,
            productName: parsed.productName || finalHeadline,
            tagline: parsed.tagline || finalDesc,
            source: 'groq'
          }
        };

      } catch (err) {
        console.warn(`Groq attempt failed for ${model}:`, err);
      }
    }

    return { success: false, error: 'Could not generate with Groq API' };
  }
};
