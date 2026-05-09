import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * 解析简历文件，提取文本内容
 */
export async function parseResumeFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();

  // PDF 文件
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    try {
      const data = await pdfParse(buffer);
      return cleanText(data.text);
    } catch (error) {
      console.error('PDF parse error:', error);
      throw new Error('PDF 解析失败，请尝试转换为文本格式');
    }
  }

  // Word 文件
  if (
    ext === 'docx' ||
    ext === 'doc' ||
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return cleanText(result.value);
    } catch (error) {
      console.error('Word parse error:', error);
      throw new Error('Word 解析失败，请尝试转换为文本格式');
    }
  }

  // 纯文本文件
  if (mimetype === 'text/plain' || ext === 'txt') {
    return cleanText(buffer.toString('utf-8'));
  }

  throw new Error('不支持的文件格式，请上传 PDF、Word 或 TXT 文件');
}

/**
 * 清理文本：去除多余空白、统一换行
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

/**
 * 生成预览文本（前 30% 或前 500 字）
 */
export function generatePreview(text: string, ratio: number = 0.3, maxChars: number = 800): string {
  const previewLength = Math.min(
    Math.floor(text.length * ratio),
    maxChars
  );
  
  // 尽量在句子结尾截断
  let cutIndex = previewLength;
  const nextPeriod = text.indexOf('。', previewLength);
  const nextNewline = text.indexOf('\n', previewLength);
  
  if (nextPeriod !== -1 && nextPeriod < previewLength + 50) {
    cutIndex = nextPeriod + 1;
  } else if (nextNewline !== -1 && nextNewline < previewLength + 30) {
    cutIndex = nextNewline;
  }
  
  return text.substring(0, cutIndex).trim();
}
