# نيورا (Neura) - مساعد ذكاء اصطناعي مجاني

شات ذكاء اصطناعي: الواجهة على GitHub Pages، والمفتاح مخبي في Cloudflare Worker.

## الخطوات

### 1) مفتاح Gemini
- ادخل https://aistudio.google.com واعمل API key مجاني.

### 2) الـ Worker (بيخبي المفتاح)
1. اعمل حساب مجاني على https://dash.cloudflare.com
2. Workers & Pages ← Create ← Create Worker ← سمّيه (مثلا `my-ai`) ← Deploy.
3. دوس Edit code، امسح الكود، والصق محتوى `worker.js`، وبعدين Deploy.
4. Settings ← Variables and Secrets ← Add:
   - `GEMINI_API_KEY` (نوع Secret) = مفتاحك
   - `ALLOWED_ORIGIN` = `https://USERNAME.github.io` (اسم حسابك على GitHub). ده بيمنع مواقع تانية تستخدم الـ Worker.
5. انسخ رابط الـ Worker (شكله `https://my-ai.xxx.workers.dev`).

### 3) الواجهة
1. افتح `index.html` وغيّر سطر `WORKER_URL` برابط الـ Worker.
2. اعمل ريبو على GitHub وارفع `index.html` (و README).
3. Settings ← Pages ← Source: `main` / root ← Save.
4. موقعك هيبقى على `https://USERNAME.github.io/REPO/`

## ملاحظات
- الطبقة المجانية من Gemini ليها حد للطلبات في الدقيقة واليوم، ولو الناس زادت ممكن توصل للحد.
- الصور بتتعمل بـ Pollinations.ai (مجاني من غير مفتاح)، وGemini بيحسّن الوصف الأول.
- لو عايز موديل تاني، ضيف متغير `MODEL` في Cloudflare (مثلا `gemini-2.5-flash-lite` أخف وحدوده أعلى).
- المفتاح عمره ما بيتحط في GitHub، فآمن.
تم
