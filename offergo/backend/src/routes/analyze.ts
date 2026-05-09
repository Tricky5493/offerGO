import { Router } from 'express';
import { resumeCache } from './upload';
import { COMPANY_CONFIG } from '../../../shared/types';
import type { ATSAnalysisResponse, CompanyScore } from '../../../shared/types';

const router = Router();

/**
 * POST /api/analyze
 * ATS 评分分析
 */
router.post('/', async (req, res) => {
  try {
    const { resumeId, jobDirection } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ error: '缺少 resumeId' });
    }
    
    const resumeData = resumeCache.get(resumeId);
    if (!resumeData) {
      return res.status(404).json({ error: '简历已过期或不存在' });
    }
    
    const text = resumeData.text;
    
    // 计算各厂评分
    const companyScores: CompanyScore[] = Object.entries(COMPANY_CONFIG).map(([key, config]) => {
      const matched: string[] = [];
      const missing: string[] = [];
      
      config.keywords.forEach(kw => {
        if (text.toLowerCase().includes(kw.toLowerCase())) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });
      
      // 计算分数：基础分 + 关键词匹配分
      const baseScore = 35;
      const keywordScore = Math.min(40, matched.length * 6);
      const formatScore = checkFormatScore(text);
      const totalScore = Math.min(95, baseScore + keywordScore + formatScore);
      
      return {
        company: key,
        companyName: config.name,
        score: totalScore,
        keywords: config.keywords,
        matchedKeywords: matched,
        missingKeywords: missing,
      };
    });
    
    // 计算总分（各厂平均分）
    const overallScore = Math.round(
      companyScores.reduce((sum, cs) => sum + cs.score, 0) / companyScores.length
    );
    
    // 生成问题和建议
    const problems = generateProblems(text, companyScores);
    const suggestions = generateSuggestions(text, companyScores);
    
    const response: ATSAnalysisResponse = {
      resumeId,
      overallScore,
      companyScores,
      problems,
      suggestions,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: '分析失败' });
  }
});

/**
 * 检查格式分数
 */
function checkFormatScore(text: string): number {
  let score = 10;
  
  // 检查是否有联系方式
  if (!/\d{11}|\w+@\w+\.\w+/.test(text)) score -= 3;
  
  // 检查是否有分段
  if (!text.includes('\n\n')) score -= 2;
  
  // 检查长度
  if (text.length < 200) score -= 3;
  
  // 检查是否有技能关键词
  const skillWords = ['Java', 'Python', 'JavaScript', 'React', 'Vue', 'Spring', 'MySQL'];
  const hasSkill = skillWords.some(w => text.includes(w));
  if (!hasSkill) score -= 2;
  
  return Math.max(0, score);
}

/**
 * 生成问题列表
 */
function generateProblems(text: string, scores: CompanyScore[]): string[] {
  const problems: string[] = [];
  
  // 关键词覆盖率低
  const lowKeywordCompany = scores.find(s => s.matchedKeywords.length < 3);
  if (lowKeywordCompany) {
    problems.push(`${lowKeywordCompany.companyName}关键词覆盖率偏低，仅匹配 ${lowKeywordCompany.matchedKeywords.length}/${lowKeywordCompany.keywords.length} 个`);
  }
  
  // 缺少量化指标
  if (!/\d+%|\d+万|\d+亿|\d+ms|\d+s|QPS|TPS|DAU|MAU/.test(text)) {
    problems.push('缺少量化指标（如用户数、QPS、性能提升百分比等）');
  }
  
  // 被动词汇过多
  const passiveWords = ['参与', '协助', '配合', '负责部分'];
  const passiveCount = passiveWords.reduce((sum, w) => {
    const matches = text.match(new RegExp(w, 'g'));
    return sum + (matches ? matches.length : 0);
  }, 0);
  if (passiveCount > 3) {
    problems.push(`被动词汇出现 ${passiveCount} 次，建议改用主导性词汇`);
  }
  
  // 技能栈不够突出
  if (!/技能|技术栈|Tech Stack|Skills/i.test(text)) {
    problems.push('技能栈板块不够突出，建议单独列出核心技能');
  }
  
  return problems.length > 0 ? problems : ['简历整体不错，建议进一步优化细节'];
}

/**
 * 生成建议列表
 */
function generateSuggestions(text: string, scores: CompanyScore[]): string[] {
  const suggestions: string[] = [];
  
  // 建议补充的关键词（取匹配最少的厂的前3个缺失词）
  const weakestCompany = scores.sort((a, b) => a.matchedKeywords.length - b.matchedKeywords.length)[0];
  if (weakestCompany && weakestCompany.missingKeywords.length > 0) {
    const topMissing = weakestCompany.missingKeywords.slice(0, 3).join('、');
    suggestions.push(`针对${weakestCompany.companyName}，建议补充：${topMissing}`);
  }
  
  // 建议添加量化
  suggestions.push('在项目描述中添加具体数据，如"支撑日活 100 万用户"、"接口响应时间从 200ms 优化到 50ms"');
  
  // 建议优化词汇
  suggestions.push('将"参与"改为"主导"、"协助"改为"独立负责"，突出个人贡献');
  
  return suggestions;
}

export { router as analyzeRouter };
