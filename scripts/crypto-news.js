const fetch = require('node-fetch');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function getCryptoNews() {
  try {
    console.log('正在获取加密货币市场数据...');
    
    const coinsResponse = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,polkadot&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h`);
    const coinsData = await coinsResponse.json();
    
    console.log('\n🌐 今日加密货币市场概览\n');
    
    coinsData.forEach((coin, index) => {
      const priceChange = coin.price_change_percentage_24h;
      const changeEmoji = priceChange >= 0 ? '📈' : '📉';
      const changeColor = priceChange >= 0 ? '+' : '';
      
      console.log(`${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`);
      console.log(`   💲 价格: $${coin.current_price.toLocaleString()}`);
      console.log(`   ${changeEmoji} 24h: ${changeColor}${priceChange.toFixed(2)}%`);
      console.log(`   📊 市值: $${(coin.market_cap / 1e9).toFixed(2)}B`);
      console.log('');
    });
    
    console.log('\n📰 加密货币最新资讯\n');
    
    const newsResponse = await fetch(`${COINGECKO_API}/search/trending`);
    const newsData = await newsResponse.json();
    
    const trending = newsData.coins.slice(0, 6);
    trending.forEach((item, index) => {
      const coin = item.item;
      console.log(`${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`);
      console.log(`   🔥 热度排名: #${coin.market_cap_rank}`);
      console.log(`   📌 更多: https://www.coingecko.com/zh-cn/coins/${coin.id}`);
      console.log('');
    });
    
    console.log('✅ 信息获取完成！');
    
  } catch (error) {
    console.error('❌ 获取信息失败:', error.message);
  }
}

getCryptoNews();
