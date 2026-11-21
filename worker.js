// Cloudflare Worker: وسيط بيخبي مفتاح Gemini
// Secrets/Variables المطلوبة في Cloudflare:
//   GEMINI_API_KEY  (Secret)  <- مفتاحك من Google AI Studio
//   ALLOWED_ORIGIN  (اختياري) <- مثال: https://USERNAME.github.io
//   MODEL           (اختياري) <- الافتراضي gemini-2.5-flash

const API = "https://generativelanguage.googleapis.com/v1beta/models/";

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };
    const out = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: cors });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return out({ ok: true });

    try {
      const body = await req.json();
      const model = env.MODEL || "gemini-2.5-flash";

      const callGemini = async (payload) => {
        const r = await fetch(`${API}${model}:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify(payload),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error?.message || "Gemini error");
        return j?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      };

      // توليد صورة: Gemini يحسّن الوصف بالإنجليزي، والصورة من Pollinations (مجاني)
      if (body.type === "image") {
        const prompt = String(body.prompt || "").slice(0, 500);
        const en = await callGemini({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "Turn the user's request into one detailed English image-generation prompt. Output only the prompt." }],
          },
        });
        const seed = Math.floor(Math.random() * 1e6);
        const url =
          "https://image.pollinations.ai/prompt/" +
          encodeURIComponent(en.trim()) +
          `?width=768&height=768&nologo=true&seed=${seed}`;
        return out({ url, prompt: en.trim() });
      }

      // شات عادي
      const msgs = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
      const contents = msgs.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: String(m.text).slice(0, 8000) }],
      }));
      const text = await callGemini({
        contents,
        systemInstruction: {
          parts: [{ text: "أنت مساعد ذكي ودود. رد بنفس لغة المستخدم، وإذا كتب بالعامية المصرية رد بها." }],
        },
      });
      return out({ text });
    } catch (e) {
      return out({ error: String(e.message || e) }, 500);
    }
  },
};
