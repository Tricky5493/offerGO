var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-nQ4Ep9/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker.js
var DEEPSEEK_API_KEY = "sk-0c430c775e454448b08b72bdf39fe319";
var DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type"
};
var resumeCache = /* @__PURE__ */ new Map();
function cleanExpiredCache() {
  const now = Date.now();
  for (const [id, data] of resumeCache.entries()) {
    if (now - data.createdAt > 60 * 60 * 1e3) {
      resumeCache.delete(id);
    }
  }
}
__name(cleanExpiredCache, "cleanExpiredCache");
function cleanText(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[\t ]+/g, " ").trim();
}
__name(cleanText, "cleanText");
function generatePreview(text, ratio = 0.3, maxChars = 800) {
  const previewLength = Math.min(Math.floor(text.length * ratio), maxChars);
  let cutIndex = previewLength;
  const nextPeriod = text.indexOf("\u3002", previewLength);
  const nextNewline = text.indexOf("\n", previewLength);
  if (nextPeriod !== -1 && nextPeriod < previewLength + 50) {
    cutIndex = nextPeriod + 1;
  } else if (nextNewline !== -1 && nextNewline < previewLength + 30) {
    cutIndex = nextNewline;
  }
  return text.substring(0, cutIndex).trim();
}
__name(generatePreview, "generatePreview");
async function parseResumeFile(content, filename) {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "txt" || content.startsWith("\u59D3\u540D") || content.startsWith("#") || /^[A-Za-z0-9\u4e00-\u9fa5]/.test(content)) {
    return cleanText(content);
  }
  return cleanText(content);
}
__name(parseResumeFile, "parseResumeFile");
function buildAnalyzePrompt(resumeText, jobDirection = "backend") {
  const companies = [
    { name: "\u5B57\u8282\u8DF3\u52A8", code: "bytedance", traits: "\u770B\u91CD\u9AD8\u5E76\u53D1\u3001\u7528\u6237\u589E\u957F\u3001\u6570\u636E\u9A71\u52A8\u3001AB\u6D4B\u8BD5\u3001\u5FEB\u901F\u8FED\u4EE3" },
    { name: "\u963F\u91CC\u5DF4\u5DF4", code: "alibaba", traits: "\u770B\u91CD\u7ED3\u679C\u5BFC\u5411\u3001\u6570\u636E\u9A71\u52A8\u3001\u6280\u672F\u6DF1\u5EA6\u3001\u4E1A\u52A1\u7406\u89E3\u3001\u521B\u65B0\u80FD\u529B" },
    { name: "\u817E\u8BAF", code: "tencent", traits: "\u770B\u91CD\u4EA7\u54C1\u601D\u7EF4\u3001\u7528\u6237\u5BFC\u5411\u3001\u6280\u672F\u6808\u5E7F\u5EA6\u3001\u56E2\u961F\u534F\u4F5C\u3001\u5B66\u4E60\u80FD\u529B" },
    { name: "\u7F8E\u56E2", code: "meituan", traits: "\u770B\u91CD\u6267\u884C\u529B\u3001\u6280\u672F\u843D\u5730\u3001\u4E1A\u52A1\u4EF7\u503C\uFF0C\u6210\u672C\u610F\u8BC6\u3001\u89C4\u6A21\u5316\u7ECF\u9A8C" },
    { name: "\u4EAC\u4E1C", code: "jd", traits: "\u770B\u91CD\u6280\u672F\u6C89\u6DC0\u3001\u4F9B\u5E94\u94FE\u7406\u89E3\u3001\u7CFB\u7EDF\u7A33\u5B9A\u6027\u3001\u7ED3\u679C\u4EA4\u4ED8\u3001\u6297\u538B\u80FD\u529B" },
    { name: "\u767E\u5EA6", code: "baidu", traits: "\u770B\u91CD\u6280\u672F\u6DF1\u5EA6\u3001\u7B97\u6CD5\u80FD\u529B\u3001\u521B\u65B0\u601D\u7EF4\u3001\u65B9\u6CD5\u8BBA\u6C89\u6DC0\u3001\u641C\u7D22/AI\u76F8\u5173" }
  ];
  return [
    {
      role: "system",
      content: `\u4F60\u662F\u4E00\u4E2A\u8D44\u6DF1\u7684\u5927\u5382 ATS \u7B80\u5386\u5206\u6790\u5E08\u3002\u4F60\u7684\u4EFB\u52A1\u662F\u5206\u6790\u7B80\u5386\u5E76\u8F93\u51FA JSON \u683C\u5F0F\u7684\u8BC4\u5206\u62A5\u544A\u3002

\u8BC4\u5206\u89C4\u5219\uFF08\u5404\u5382\u6743\u91CD\u4E0D\u540C\uFF09\uFF1A
- \u5173\u952E\u8BCD\u8986\u76D6\u7387\uFF08\u6743\u91CD\u56E0\u5382\u800C\u5F02\uFF09\uFF1A\u7B80\u5386\u4E2D\u7684\u5173\u952E\u8BCD\u4E0E\u76EE\u6807\u516C\u53F8 JD \u9AD8\u9891\u8BCD\u7684\u5339\u914D\u7A0B\u5EA6
- \u91CF\u5316\u6307\u6807\u5BC6\u5EA6\uFF08\u6743\u91CD\u56E0\u5382\u800C\u5F02\uFF09\uFF1A\u5DE5\u4F5C\u63CF\u8FF0\u4E2D\u4F7F\u7528\u6570\u636E/\u6570\u5B57\u91CF\u5316\u7684\u7A0B\u5EA6
- \u6280\u80FD\u5339\u914D\u5EA6\uFF08\u6743\u91CD\u56E0\u5382\u800C\u5F02\uFF09\uFF1A\u6280\u80FD\u4E0E\u76EE\u6807\u516C\u53F8\u6280\u672F\u6808\u7684\u5339\u914D\u7A0B\u5EA6
- \u683C\u5F0F\u53CB\u597D\u5EA6\uFF08\u6743\u91CD 10%\uFF09\uFF1A\u7B80\u5386\u683C\u5F0F\u662F\u5426 ATS \u53CB\u597D\uFF08\u65E0\u8868\u683C/\u65E0\u7279\u6B8A\u7B26\u53F7/\u65F6\u95F4\u7EBF\u6E05\u6670\uFF09

\u8BC4\u5206\u7EF4\u5EA6\u6743\u91CD\u77E9\u9635\uFF1A
- \u5B57\u8282\u8DF3\u52A8\uFF1A\u5173\u952E\u8BCD 40%\uFF0C\u91CF\u5316 25%\uFF0C\u6280\u80FD 25%\uFF0C\u683C\u5F0F 10%
- \u963F\u91CC\u5DF4\u5DF4\uFF1A\u5173\u952E\u8BCD 35%\uFF0C\u91CF\u5316 30%\uFF0C\u6280\u80FD 25%\uFF0C\u683C\u5F0F 10%
- \u817E\u8BAF\uFF1A\u5173\u952E\u8BCD 35%\uFF0C\u91CF\u5316 25%\uFF0C\u6280\u80FD 30%\uFF0C\u683C\u5F0F 10%
- \u7F8E\u56E2\uFF1A\u5173\u952E\u8BCD 30%\uFF0C\u91CF\u5316 30%\uFF0C\u6280\u80FD 25%\uFF0C\u683C\u5F0F 15%
- \u4EAC\u4E1C\uFF1A\u5173\u952E\u8BCD 35%\uFF0C\u91CF\u5316 25%\uFF0C\u6280\u80FD 30%\uFF0C\u683C\u5F0F 10%
- \u767E\u5EA6\uFF1A\u5173\u952E\u8BCD 30%\uFF0C\u91CF\u5316 25%\uFF0C\u6280\u80FD 30%\uFF0C\u683C\u5F0F 15%

\u4F60\u5FC5\u987B\u4E25\u683C\u6309\u7167\u4EE5\u4E0B JSON Schema \u8F93\u51FA\uFF0C\u4E0D\u80FD\u5305\u542B\u4EFB\u4F55\u989D\u5916\u6587\u672C\uFF1A`
    },
    {
      role: "user",
      content: `\u8BF7\u5206\u6790\u4EE5\u4E0B\u7B80\u5386\uFF0C\u5C97\u4F4D\u65B9\u5411\uFF1A${jobDirection || "\u540E\u7AEF\u5F00\u53D1"}

\u5404\u516C\u53F8\u7279\u70B9\uFF1A
${companies.map((c) => `- ${c.name}\uFF08${c.code}\uFF09\uFF1A${c.traits}`).join("\n")}

\u7B80\u5386\u5185\u5BB9\uFF1A
---
${resumeText}
---

\u8BF7\u8F93\u51FA JSON\uFF08\u4E25\u683C\u683C\u5F0F\uFF0C\u4E0D\u52A0 markdown \u4EE3\u7801\u5757\u6807\u8BB0\uFF09\uFF1A
{
  "parsed": {
    "name": "\u59D3\u540D",
    "summary": "\u4E00\u53E5\u8BDD\u7B80\u4ECB",
    "skills": ["\u6280\u80FD1", "\u6280\u80FD2"],
    "experience_years": 0
  },
  "company_scores": [
    {
      "company": "bytedance",
      "company_name": "\u5B57\u8282\u8DF3\u52A8",
      "total_score": 0-100,
      "keyword_score": 0-100,
      "quant_score": 0-100,
      "skill_score": 0-100,
      "format_score": 0-100,
      "matched_keywords": ["\u5173\u952E\u8BCD1"],
      "missing_keywords": ["\u7F3A\u5931\u8BCD1"],
      "coverage_rate": 0-100,
      "level": "high/mid/low"
    }
  ],
  "avg_score": 0,
  "problems": [
    {
      "type": "keyword/quant/format",
      "severity": "high/mid/low",
      "title": "\u95EE\u9898\u6807\u9898",
      "detail": "\u8BE6\u7EC6\u8BF4\u660E",
      "score_loss": 0
    }
  ],
  "assessment": "\u7EFC\u5408\u8BC4\u4EF7"
}`
    }
  ];
}
__name(buildAnalyzePrompt, "buildAnalyzePrompt");
function buildOptimizePrompt(resumeText, targetCompanies, jobDirection = "backend") {
  return [
    {
      role: "system",
      content: `\u4F60\u662F\u4E00\u4E2A\u8D44\u6DF1\u7684\u5927\u5382\u7B80\u5386\u4F18\u5316\u4E13\u5BB6\u3002\u4F60\u7684\u4EFB\u52A1\u662F\u6839\u636E\u76EE\u6807\u516C\u53F8\u7684 ATS \u89C4\u5219\uFF0C\u4F18\u5316\u7B80\u5386\u5185\u5BB9\uFF0C\u63D0\u5347\u5176 ATS \u5339\u914D\u5206\u6570\u3002

\u4F18\u5316\u539F\u5219\uFF1A
1. \u5728\u4E0D\u865A\u6784\u7ECF\u5386\u7684\u524D\u63D0\u4E0B\uFF0C\u8C03\u6574\u5173\u952E\u8BCD\u548C\u8868\u8FF0\u65B9\u5F0F
2. \u589E\u52A0\u91CF\u5316\u6570\u636E\u9A71\u52A8\u7684\u63CF\u8FF0\uFF08\u4F7F\u7528\u6570\u5B57\u3001\u767E\u5206\u6BD4\u3001\u89C4\u6A21\u7B49\uFF09
3. \u6309\u76EE\u6807\u516C\u53F8\u504F\u597D\u91CD\u6392\u6280\u80FD\u987A\u5E8F
4. \u786E\u4FDD\u4F18\u5316\u540E\u7684\u7B80\u5386\u4ECD\u7136\u771F\u5B9E\u53EF\u4FE1
5. \u8F93\u51FA JSON \u683C\u5F0F\uFF0C\u4E0D\u80FD\u5305\u542B\u4EFB\u4F55\u989D\u5916\u6587\u672C`
    },
    {
      role: "user",
      content: `\u8BF7\u4F18\u5316\u4EE5\u4E0B\u7B80\u5386\uFF0C\u76EE\u6807\u516C\u53F8\uFF1A${targetCompanies.join("\u3001")}\uFF0C\u5C97\u4F4D\u65B9\u5411\uFF1A${jobDirection || "\u540E\u7AEF\u5F00\u53D1"}

\u7B80\u5386\u5185\u5BB9\uFF1A
---
${resumeText}
---

\u8BF7\u8F93\u51FA JSON\uFF08\u4E25\u683C\u683C\u5F0F\uFF0C\u4E0D\u52A0 markdown \u4EE3\u7801\u5757\u6807\u8BB0\uFF09\uFF1A
{
  "optimized_text": "\u4F18\u5316\u540E\u7684\u5B8C\u6574\u7B80\u5386\u6587\u672C\uFF08\u5305\u542B\u9AD8\u4EAE\u6807\u7B7E\uFF0C\u4F7F\u7528<span class='hi-key'>\u88AB\u66FF\u6362\u7684\u8BCD</span>\u548C<span class='hi-add'>\u65B0\u589E\u7684\u5185\u5BB9</span>\u5305\u88F9\uFF09",
  "original_preview": "\u539F\u59CB\u7B80\u5386\u7684\u524D30%\u5185\u5BB9\uFF0C\u7528\u4E8E\u9884\u89C8\u5BF9\u6BD4",
  "optimized_preview": "\u4F18\u5316\u540E\u7B80\u5386\u7684\u524D30%\u5185\u5BB9\uFF0C\u7528\u4E8E\u9884\u89C8\u5BF9\u6BD4",
  "changes_summary": {
    "keywords_added": \u65B0\u589E\u5173\u952E\u8BCD\u6570\u91CF,
    "quant_metrics_added": \u65B0\u589E\u91CF\u5316\u6307\u6807\u6570\u91CF,
    "keyword_density_before": "\u4F18\u5316\u524D\u5173\u952E\u8BCD\u5BC6\u5EA6",
    "keyword_density_after": "\u4F18\u5316\u540E\u5173\u952E\u8BCD\u5BC6\u5EA6",
    "skills_reordered": true/false
  },
  "estimated_before_score": \u4F18\u5316\u524D\u9884\u4F30\u5206,
  "estimated_after_score": \u4F18\u5316\u540E\u9884\u4F30\u5206,
  "key_changes": ["\u6539\u52A81", "\u6539\u52A82"]
}`
    }
  ];
}
__name(buildOptimizePrompt, "buildOptimizePrompt");
async function callDeepSeek(messages, temperature = 0.1) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API \u9519\u8BEF (${response.status}): ${error}`);
  }
  const data = await response.json();
  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("\u65E0\u6CD5\u89E3\u6790 AI \u8FD4\u56DE\u7684 JSON");
  }
}
__name(callDeepSeek, "callDeepSeek");
async function handleUpload(request) {
  try {
    const { content, filename } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({
        error: "\u7F3A\u5C11\u6587\u4EF6\u5185\u5BB9"
      }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
    }
    const text = await parseResumeFile(content, filename || "resume.txt");
    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({
        error: "\u7B80\u5386\u5185\u5BB9\u592A\u77ED\u6216\u65E0\u6CD5\u8BC6\u522B\uFF0C\u8BF7\u68C0\u67E5\u6587\u4EF6\u683C\u5F0F"
      }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
    }
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const previewText = generatePreview(text, 0.3, 800);
    resumeCache.set(resumeId, {
      text,
      filename: filename || "resume.txt",
      createdAt: Date.now()
    });
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: resumeId,
        originalText: text,
        previewText,
        filename: filename || "resume.txt"
      }
    }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { "Content-Type": "application/json", ...CORS } });
  }
}
__name(handleUpload, "handleUpload");
async function handleAnalyze(request) {
  const { resumeText, jobDirection, resumeId } = await request.json();
  let text = resumeText;
  if (resumeId && resumeCache.has(resumeId)) {
    text = resumeCache.get(resumeId).text;
  }
  if (!text || text.trim().length < 50) {
    return new Response(JSON.stringify({
      error: "\u7B80\u5386\u5185\u5BB9\u4E0D\u8DB3\uFF0C\u8BF7\u63D0\u4F9B\u66F4\u5B8C\u6574\u7684\u7B80\u5386\u6587\u672C\uFF08\u81F3\u5C1150\u5B57\uFF09"
    }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
  try {
    const messages = buildAnalyzePrompt(text, jobDirection);
    const result = await callDeepSeek(messages);
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { "Content-Type": "application/json", ...CORS } });
  }
}
__name(handleAnalyze, "handleAnalyze");
async function handleOptimize(request) {
  const { resumeText, targetCompanies, jobDirection, resumeId } = await request.json();
  let text = resumeText;
  if (resumeId && resumeCache.has(resumeId)) {
    text = resumeCache.get(resumeId).text;
  }
  if (!text || text.trim().length < 50) {
    return new Response(JSON.stringify({
      error: "\u7B80\u5386\u5185\u5BB9\u4E0D\u8DB3"
    }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
  if (!targetCompanies || targetCompanies.length === 0) {
    return new Response(JSON.stringify({
      error: "\u8BF7\u9009\u62E9\u81F3\u5C11\u4E00\u4E2A\u76EE\u6807\u516C\u53F8"
    }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
  }
  try {
    const messages = buildOptimizePrompt(text, targetCompanies, jobDirection);
    const result = await callDeepSeek(messages, 0.3);
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), { status: 200, headers: { "Content-Type": "application/json", ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { "Content-Type": "application/json", ...CORS } });
  }
}
__name(handleOptimize, "handleOptimize");
var worker_default = {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    cleanExpiredCache();
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      let response;
      if (path === "/api/upload" && request.method === "POST") {
        response = await handleUpload(request);
      } else if (path === "/api/analyze" && request.method === "POST") {
        response = await handleAnalyze(request);
      } else if (path === "/api/optimize" && request.method === "POST") {
        response = await handleOptimize(request);
      } else if (path === "/api/health") {
        response = new Response(JSON.stringify({ status: "ok", version: "1.1" }), {
          headers: { "Content-Type": "application/json", ...CORS }
        });
      } else {
        response = new Response(JSON.stringify({ error: "Not Found", path }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...CORS }
        });
      }
      const newHeaders = new Headers(response.headers);
      Object.entries(CORS).forEach(([k, v]) => newHeaders.set(k, v));
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS }
      });
    }
  }
};

// ../../../root/.nvm/versions/node/v22.22.2/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../root/.nvm/versions/node/v22.22.2/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-nQ4Ep9/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../root/.nvm/versions/node/v22.22.2/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-nQ4Ep9/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
