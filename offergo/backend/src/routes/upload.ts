import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { parseResumeFile, generatePreview } from '../services/fileParser';
import type { ResumeUploadResponse } from '../../../shared/types';

const router = Router();

// 内存存储（生产环境建议用云存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const allowedExts = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 PDF、Word、TXT 格式'));
    }
  },
});

// 内存缓存（生产环境用 Redis 或数据库）
const resumeCache = new Map<string, { text: string; filename: string; createdAt: number }>();

// 清理过期缓存（1小时后过期）
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of resumeCache.entries()) {
    if (now - data.createdAt > 60 * 60 * 1000) {
      resumeCache.delete(id);
    }
  }
}, 10 * 60 * 1000); // 每10分钟清理一次

/**
 * POST /api/upload
 * 上传简历文件，解析文本
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传简历文件' });
    }

    const { buffer, originalname, mimetype } = req.file;
    
    // 解析文件
    const text = await parseResumeFile(buffer, originalname, mimetype);
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: '简历内容太短或无法识别，请检查文件' });
    }

    // 生成唯一ID
    const resumeId = uuidv4();
    
    // 生成预览文本
    const previewText = generatePreview(text, 0.3, 800);
    
    // 缓存到内存
    resumeCache.set(resumeId, {
      text,
      filename: originalname,
      createdAt: Date.now(),
    });

    const response: ResumeUploadResponse = {
      id: resumeId,
      originalText: text,
      previewText,
      filename: originalname,
    };

    res.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '文件处理失败' 
    });
  }
});

/**
 * GET /api/upload/:id
 * 获取已上传的简历内容
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = resumeCache.get(id);
  
  if (!data) {
    return res.status(404).json({ error: '简历已过期或不存在' });
  }
  
  res.json({
    id,
    text: data.text,
    filename: data.filename,
  });
});

export { router as uploadRouter, resumeCache };
