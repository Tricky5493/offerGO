// 共享类型定义

export interface ResumeUploadRequest {
  file: Buffer;
  filename: string;
  mimetype: string;
}

export interface ResumeUploadResponse {
  id: string;
  originalText: string;
  previewText: string; // 前 30% 内容用于预览
  filename: string;
}

export interface ATSAnalysisRequest {
  resumeId: string;
  jobDirection: string; // backend | frontend | product | data | etc.
}

export interface CompanyScore {
  company: string;
  companyName: string;
  score: number;
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface ATSAnalysisResponse {
  resumeId: string;
  overallScore: number;
  companyScores: CompanyScore[];
  problems: string[];
  suggestions: string[];
}

export interface ResumeOptimizeRequest {
  resumeId: string;
  targetCompanies: string[]; // ['bytedance', 'tencent', ...]
  jobDirection: string;
}

export interface ChangeSummary {
  keywordsAdded: number;
  quantMetricsAdded: number;
  keywordDensityBefore?: string;
  keywordDensityAfter?: string;
  skillsReordered: boolean;
  keyChanges: string[];
}

export interface ResumeOptimizeResponse {
  resumeId: string;
  originalText: string;
  originalPreview: string;
  optimizedText: string;
  optimizedPreview: string; // 部分预览，付费前可见
  changesSummary: ChangeSummary;
  targetCompanies: string[];
}

export interface PaymentRequest {
  resumeId: string;
  sku: 'single' | 'pack3' | 'yearly';
  amount: number;
}

export interface PaymentResponse {
  orderId: string;
  paymentUrl?: string; // 微信支付跳转链接
  status: 'pending' | 'success' | 'failed';
}

// 大厂配置
export const COMPANY_CONFIG: Record<string, { name: string; keywords: string[]; weights: Record<string, number> }> = {
  bytedance: {
    name: '字节跳动',
    keywords: ['高并发', '分布式', '微服务', 'Golang', '推荐系统', 'A/B测试', '数据驱动'],
    weights: { tech: 0.4, project: 0.35, education: 0.15, format: 0.1 }
  },
  alibaba: {
    name: '阿里巴巴',
    keywords: ['Java', 'Spring', '中间件', '电商', '高可用', '大促', '稳定性'],
    weights: { tech: 0.35, project: 0.4, education: 0.15, format: 0.1 }
  },
  tencent: {
    name: '腾讯',
    keywords: ['C++', '游戏', '社交', '海量用户', '性能优化', '微信生态'],
    weights: { tech: 0.35, project: 0.35, education: 0.2, format: 0.1 }
  },
  meituan: {
    name: '美团',
    keywords: ['O2O', '本地生活', '供应链', '算法', '运筹优化', '实时系统'],
    weights: { tech: 0.35, project: 0.4, education: 0.15, format: 0.1 }
  },
  jd: {
    name: '京东',
    keywords: ['供应链', '物流', '零售', '大数据', '库存', '预测'],
    weights: { tech: 0.3, project: 0.45, education: 0.15, format: 0.1 }
  },
  baidu: {
    name: '百度',
    keywords: ['AI', '机器学习', 'NLP', '搜索', '推荐', '深度学习'],
    weights: { tech: 0.45, project: 0.3, education: 0.15, format: 0.1 }
  }
};

// SKU 配置
export const SKU_CONFIG = {
  single: { name: '单厂 AI 优化', price: 990, desc: '单次优化 + PDF下载' },
  pack3: { name: '3次特惠包', price: 1990, desc: '¥6.63/次 · 可分次使用' },
  yearly: { name: '年度会员', price: 4990, desc: '6大厂 · 全年无限次优化' }
};
