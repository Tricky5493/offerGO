/**
 * OfferGO Cloudflare Worker
 * DeepSeek API 代理层 + 简历文件解析
 * 部署：wrangler deploy worker.js --name offergo-api
 */

const DEEPSEEK_API_KEY = 'sk-0c430c775e454448b08b72bdf39fe319';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// CORS 头
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 内存缓存（生产环境建议用 KV 或 R2）
const resumeCache = new Map();

/**
 * 清理过期缓存（在请求处理时检查）
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [id, data] of resumeCache.entries()) {
    if (now - data.createdAt > 60 * 60 * 1000) {
      resumeCache.delete(id);
    }
  }
}

/**
 * 清理文本
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

/**
 * 生成预览文本（前 30%）
 */
function generatePreview(text, ratio = 0.3, maxChars = 800) {
  const previewLength = Math.min(Math.floor(text.length * ratio), maxChars);
  let cutIndex = previewLength;
  
  // 尽量在句子结尾截断
  const nextPeriod = text.indexOf('。', previewLength);
  const nextNewline = text.indexOf('\n', previewLength);
  
  if (nextPeriod !== -1 && nextPeriod < previewLength + 50) {
    cutIndex = nextPeriod + 1;
  } else if (nextNewline !== -1 && nextNewline < previewLength + 30) {
    cutIndex = nextNewline;
  }
  
  return text.substring(0, cutIndex).trim();
}

/**
 * Base64 解码（用于接收上传的文件）
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 简历文件解析（简化的文本提取）
 * 生产环境建议用专门的解析服务
 */
async function parseResumeFile(content, filename) {
  const ext = filename.toLowerCase().split('.').pop();
  
  // 纯文本直接返回
  if (ext === 'txt' || content.startsWith('姓名') || content.startsWith('#') || /^[A-Za-z0-9\u4e00-\u9fa5]/.test(content)) {
    // 简单判断是否为纯文本
    return cleanText(content);
  }
  
  // 如果是乱码或无法识别的格式，返回原始内容
  // 生产环境应该调用专门的 PDF/Word 解析服务
  return cleanText(content);
}

/**
 * 简历分析 Prompt
 */
function buildAnalyzePrompt(resumeText, jobDirection = 'backend') {
  const companies = [
    { name: '字节跳动', code: 'bytedance', traits: '看重高并发、用户增长、数据驱动、AB测试、快速迭代' },
    { name: '阿里巴巴', code: 'alibaba', traits: '看重结果导向、数据驱动、技术深度、业务理解、创新能力' },
    { name: '腾讯', code: 'tencent', traits: '看重产品思维、用户导向、技术栈广度、团队协作、学习能力' },
    { name: '美团', code: 'meituan', traits: '看重执行力、技术落地、业务价值，成本意识、规模化经验' },
    { name: '京东', code: 'jd', traits: '看重技术沉淀、供应链理解、系统稳定性、结果交付、抗压能力' },
    { name: '百度', code: 'baidu', traits: '看重技术深度、算法能力、创新思维、方法论沉淀、搜索/AI相关' }
  ];

  return [
    {
      role: 'system',
      content: `你是一个资深的大厂 ATS 简历分析师。你的任务是分析简历并输出 JSON 格式的评分报告。

评分规则（各厂权重不同）：
- 关键词覆盖率（权重因厂而异）：简历中的关键词与目标公司 JD 高频词的匹配程度
- 量化指标密度（权重因厂而异）：工作描述中使用数据/数字量化的程度
- 技能匹配度（权重因厂而异）：技能与目标公司技术栈的匹配程度
- 格式友好度（权重 10%）：简历格式是否 ATS 友好（无表格/无特殊符号/时间线清晰）

评分维度权重矩阵：
- 字节跳动：关键词 40%，量化 25%，技能 25%，格式 10%
- 阿里巴巴：关键词 35%，量化 30%，技能 25%，格式 10%
- 腾讯：关键词 35%，量化 25%，技能 30%，格式 10%
- 美团：关键词 30%，量化 30%，技能 25%，格式 15%
- 京东：关键词 35%，量化 25%，技能 30%，格式 10%
- 百度：关键词 30%，量化 25%，技能 30%，格式 15%

你必须严格按照以下 JSON Schema 输出，不能包含任何额外文本：`
    },
    {
      role: 'user',
      content: `请分析以下简历，岗位方向：${jobDirection || '后端开发'}

各公司特点：
${companies.map(c => `- ${c.name}（${c.code}）：${c.traits}`).join('\n')}

简历内容：
---
${resumeText}
---

请输出 JSON（严格格式，不加 markdown 代码块标记）：
{
  "parsed": {
    "name": "姓名",
    "summary": "一句话简介",
    "skills": ["技能1", "技能2"],
    "experience_years": 0
  },
  "company_scores": [
    {
      "company": "bytedance",
      "company_name": "字节跳动",
      "total_score": 0-100,
      "keyword_score": 0-100,
      "quant_score": 0-100,
      "skill_score": 0-100,
      "format_score": 0-100,
      "matched_keywords": ["关键词1"],
      "missing_keywords": ["缺失词1"],
      "coverage_rate": 0-100,
      "level": "high/mid/low"
    }
  ],
  "avg_score": 0,
  "problems": [
    {
      "type": "keyword/quant/format",
      "severity": "high/mid/low",
      "title": "问题标题",
      "detail": "详细说明",
      "score_loss": 0
    }
  ],
  "assessment": "综合评价"
}`
    }
  ];
}

/**
 * 简历优化 Prompt
 */
function buildOptimizePrompt(resumeText, targetCompanies, jobDirection = 'backend') {
  return [
    {
      role: 'system',
      content: `你是一个资深的大厂简历优化专家。你的任务是根据目标公司的 ATS 规则，优化简历内容，提升其 ATS 匹配分数。

优化原则：
1. 在不虚构经历的前提下，调整关键词和表述方式
2. 增加量化数据驱动的描述（使用数字、百分比、规模等）
3. 按目标公司偏好重排技能顺序
4. 确保优化后的简历仍然真实可信
5. 输出 JSON 格式，不能包含任何额外文本`
    },
    {
      role: 'user',
      content: `请优化以下简历，目标公司：${targetCompanies.join('、')}，岗位方向：${jobDirection || '后端开发'}

简历内容：
---
${resumeText}
---

请输出 JSON（严格格式，不加 markdown 代码块标记）：
{
  "optimized_text": "优化后的完整简历文本（包含高亮标签，使用<span class='hi-key'>被替换的词</span>和<span class='hi-add'>新增的内容</span>包裹）",
  "original_preview": "原始简历的前30%内容，用于预览对比",
  "optimized_preview": "优化后简历的前30%内容，用于预览对比",
  "changes_summary": {
    "keywords_added": 新增关键词数量,
    "quant_metrics_added": 新增量化指标数量,
    "keyword_density_before": "优化前关键词密度",
    "keyword_density_after": "优化后关键词密度",
    "skills_reordered": true/false
  },
  "estimated_before_score": 优化前预估分,
  "estimated_after_score": 优化后预估分,
  "key_changes": ["改动1", "改动2"]
}`
    }
  ];
}

/**
 * 调用 DeepSeek API
 */
async function callDeepSeek(messages, temperature = 0.1) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: temperature,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API 错误 (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // 尝试解析 JSON
  try {
    return JSON.parse(content);
  } catch (e) {
    // 如果直接解析失败，尝试提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析 AI 返回的 JSON');
  }
}

/**
 * 处理上传请求
 */
async function handleUpload(request) {
  try {
    const { content, filename } = await request.json();
    
    if (!content) {
      return new Response(JSON.stringify({
        error: '缺少文件内容'
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }
    
    // 解析文件内容
    const text = await parseResumeFile(content, filename || 'resume.txt');
    
    if (!text || text.trim().length < 50) {
      return new Response(JSON.stringify({
        error: '简历内容太短或无法识别，请检查文件格式'
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }
    
    // 生成唯一 ID
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 生成预览
    const previewText = generatePreview(text, 0.3, 800);
    
    // 缓存
    resumeCache.set(resumeId, {
      text,
      filename: filename || 'resume.txt',
      createdAt: Date.now()
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: resumeId,
        originalText: text,
        previewText: previewText,
        filename: filename || 'resume.txt'
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}

/**
 * 处理分析请求
 */
async function handleAnalyze(request) {
  const { resumeText, jobDirection, resumeId } = await request.json();
  
  // 如果有 resumeId，从缓存获取
  let text = resumeText;
  if (resumeId && resumeCache.has(resumeId)) {
    text = resumeCache.get(resumeId).text;
  }
  
  if (!text || text.trim().length < 50) {
    return new Response(JSON.stringify({
      error: '简历内容不足，请提供更完整的简历文本（至少50字）'
    }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const messages = buildAnalyzePrompt(text, jobDirection);
    const result = await callDeepSeek(messages);
    
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}

/**
 * 处理优化请求
 */
async function handleOptimize(request) {
  const { resumeText, targetCompanies, jobDirection, resumeId } = await request.json();
  
  // 如果有 resumeId，从缓存获取
  let text = resumeText;
  if (resumeId && resumeCache.has(resumeId)) {
    text = resumeCache.get(resumeId).text;
  }
  
  if (!text || text.trim().length < 50) {
    return new Response(JSON.stringify({
      error: '简历内容不足'
    }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  if (!targetCompanies || targetCompanies.length === 0) {
    return new Response(JSON.stringify({
      error: '请选择至少一个目标公司'
    }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  try {
    const messages = buildOptimizePrompt(text, targetCompanies, jobDirection);
    const result = await callDeepSeek(messages, 0.3);
    
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}

// 订单缓存（生产环境建议用 KV）
const orderCache = new Map();

/**
 * 处理创建订单请求
 */
async function handleCreateOrder(request) {
  try {
    const { resumeId, sku, amount } = await request.json();
    
    if (!resumeId || !sku) {
      return new Response(JSON.stringify({
        error: '缺少必要参数'
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }
    
    const mockOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    orderCache.set(mockOrderId, {
      resumeId,
      sku,
      amount,
      status: 'pending',
      createdAt: Date.now()
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        orderId: mockOrderId,
        status: 'pending',
        paymentUrl: `https://offergo-api.babel5493.workers.dev/payment/simulate?orderId=${mockOrderId}`
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
}

/**
 * 模拟支付成功回调（开发阶段使用）
 */
async function handleSimulatePayment(request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  
  if (!orderId || !orderCache.has(orderId)) {
    return new Response(JSON.stringify({
      error: '订单不存在'
    }), { status: 404, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  
  const order = orderCache.get(orderId);
  order.status = 'success';
  order.paidAt = Date.now();
  
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>支付成功 - OfferGO</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #F7F8FC; }
        .card { background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 360px; }
        .icon { width: 64px; height: 64px; background: #0F9D58; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .icon svg { width: 36px; height: 36px; color: white; }
        h1 { color: #1F2329; margin: 0 0 12px; font-size: 24px; }
        p { color: #4E5566; margin: 0 0 24px; line-height: 1.6; }
        .btn { background: #1F4CCC; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">
          <svg viewBox="0 0 36 36" fill="none"><path d="M8 18L14 24L28 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h1>支付成功</h1>
        <p>感谢您的信任，完整优化简历已解锁</p>
        <a href="javascript:void(0);" class="btn" onclick="window.opener && window.opener.postMessage && window.opener.postMessage({ type: 'PAYMENT_SUCCESS', orderId: '${orderId}' }, '*'); window.close();">返回查看结果</a>
      </div>
      <script>
        setTimeout(function() {
          window.opener && window.opener.postMessage && window.opener.postMessage({ type: 'PAYMENT_SUCCESS', orderId: '${orderId}' }, '*');
          window.close();
        }, 2000);
      </script>
    </body>
    </html>
  `, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

/**
 * 处理支付状态查询
 */
async function handlePaymentStatus(request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  
  if (!orderId) {
    return new Response(JSON.stringify({
      error: '缺少订单号'
    }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  
  const order = orderCache.get(orderId);
  
  if (!order) {
    return new Response(JSON.stringify({
      orderId,
      status: 'not_found'
    }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      orderId,
      status: order.status,
      resumeId: order.resumeId,
      sku: order.sku
    }
  }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}

/**
 * 主入口
 */
export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // 定期清理过期缓存
    cleanExpiredCache();

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response;
      
      if (path === '/api/upload' && request.method === 'POST') {
        response = await handleUpload(request);
      } else if (path === '/api/analyze' && request.method === 'POST') {
        response = await handleAnalyze(request);
      } else if (path === '/api/optimize' && request.method === 'POST') {
        response = await handleOptimize(request);
      } else if (path === '/api/payment/create' && request.method === 'POST') {
        response = await handleCreateOrder(request);
      } else if (path === '/api/payment/status' && request.method === 'GET') {
        response = await handlePaymentStatus(request);
      } else if (path === '/payment/simulate' && request.method === 'GET') {
        response = await handleSimulatePayment(request);
      } else if (path === '/api/health') {
        response = new Response(JSON.stringify({ status: 'ok', version: '1.1' }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      } else {
        response = new Response(JSON.stringify({ error: 'Not Found', path }), {
          status: 404, headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }

      // 添加 CORS 头
      const newHeaders = new Headers(response.headers);
      Object.entries(CORS).forEach(([k, v]) => newHeaders.set(k, v));
      
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS }
      });
    }
  }
};
