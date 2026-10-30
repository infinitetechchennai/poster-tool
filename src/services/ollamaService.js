/**
 * Ollama Local AI Service for optional local LLM text generation
 */

export const ollamaService = {
  /**
   * Tests connection to local Ollama server and lists installed models
   */
  async testConnection(url = 'http://localhost:11434') {
    const cleanUrl = url.replace(/\/+$/, '');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${cleanUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { success: false, error: `Server responded with status ${res.status}` };
      }

      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      return { success: true, models };
    } catch (err) {
      let msg = 'Could not connect to Ollama. Make sure Ollama is running (`ollama serve`).';
      if (err.name === 'AbortError') {
        msg = 'Connection timed out. Check Ollama host URL.';
      }
      return { success: false, error: msg };
    }
  },

  /**
   * Generates post content using local Ollama model
   */
  async generateContent(topic, model = 'llama3', url = 'http://localhost:11434', brand = {}) {
    const cleanUrl = url.replace(/\/+$/, '');
    const companyName = brand.companyName || 'Our Company';

    const prompt = `You are a professional B2B social media content creator. Write a compelling corporate social media post for the topic: "${topic}".
Respond ONLY with a valid JSON object matching this exact schema:
{
  "headline": "A punchy, professional title (6-10 words)",
  "description": "A clear, professional explanation (40-65 words) without fabricated statistics",
  "keyPoints": [
    "First actionable key takeaway",
    "Second actionable key takeaway",
    "Third actionable key takeaway"
  ],
  "cta": "Engaging call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}
Do not include any conversational filler, markdown codeblocks or quotes outside the JSON.`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for local model

      const res = await fetch(`${cleanUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          prompt: prompt,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.response || '';
      
      // Parse JSON from response
      let parsed;
      try {
        parsed = JSON.parse(rawText.trim());
      } catch (parseErr) {
        // Attempt to extract JSON substring if wrapped
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('Could not parse JSON response from Ollama');
        }
      }

      const keyPoints = Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
        ? parsed.keyPoints.slice(0, 3)
        : ["Streamline operational workflows", "Improve execution velocity", "Accelerate long-term business outcomes"];

      const hashtags = Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0
        ? parsed.hashtags.slice(0, 5)
        : ["#Innovation", "#BusinessGrowth", "#Tech", "#Strategy", "#FutureOfWork"];

      const headline = parsed.headline || `The Strategic Impact of ${topic}`;
      const description = parsed.description || `Discover how focusing on ${topic} drives efficiency, elevates quality, and unlocks sustainable business performance for modern enterprises.`;
      const cta = parsed.cta || (brand.defaultCta || "Connect With Our Specialists Today.");

      const caption = `${headline}

${description}

Key Takeaways:
${keyPoints.map(kp => `✓ ${kp}`).join('\n')}

💬 ${cta}

${hashtags.join(' ')}

—
Follow ${companyName} for more insights.`;

      return {
        success: true,
        data: {
          topic,
          formattedTopic: topic,
          categoryName: 'AI & Innovation',
          headline,
          description,
          keyPoints,
          cta,
          hashtags,
          caption,
          source: 'ollama' // transparent
        }
      };
    } catch (err) {
      console.warn('Ollama generation failed:', err);
      return { success: false, error: err.message };
    }
  }
};
