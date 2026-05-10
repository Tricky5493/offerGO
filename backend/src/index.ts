import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { uploadRouter } from './routes/upload';
import { analyzeRouter } from './routes/analyze';
import { optimizeRouter } from './routes/optimize';
import { paymentRouter } from './routes/payment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 路由
app.use('/api/upload', uploadRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/optimize', optimizeRouter);
app.use('/api/payment', paymentRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 OfferGO API Server running on port ${PORT}`);
});
