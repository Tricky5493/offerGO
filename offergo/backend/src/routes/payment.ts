import { Router } from 'express';
import { SKU_CONFIG } from '../../../shared/types';
import type { PaymentRequest, PaymentResponse } from '../../../shared/types';

const router = Router();

/**
 * POST /api/payment/create
 * 创建支付订单
 */
router.post('/create', async (req, res) => {
  try {
    const { resumeId, sku, amount }: PaymentRequest = req.body;
    
    if (!resumeId || !sku) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证 SKU
    if (!SKU_CONFIG[sku]) {
      return res.status(400).json({ error: '无效的 SKU' });
    }
    
    // TODO: 接入微信支付
    // 1. 生成订单号
    // 2. 调用微信统一下单接口
    // 3. 返回支付参数
    
    const mockOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response: PaymentResponse = {
      orderId: mockOrderId,
      status: 'pending',
      // paymentUrl: 'https://...', // 微信支付跳转链接
    };
    
    res.json(response);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

/**
 * POST /api/payment/notify
 * 微信支付回调
 */
router.post('/notify', async (req, res) => {
  // TODO: 处理微信支付回调
  // 1. 验证签名
  // 2. 更新订单状态
  // 3. 解锁用户下载权限
  
  res.send('SUCCESS');
});

/**
 * GET /api/payment/status/:orderId
 * 查询订单状态
 */
router.get('/status/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  // TODO: 查询数据库获取真实状态
  
  res.json({
    orderId,
    status: 'pending', // pending | success | failed
  });
});

export { router as paymentRouter };
