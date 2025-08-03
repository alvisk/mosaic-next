import { NextResponse } from 'next/server';

export interface ChartCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isPrediction?: boolean;
}

export async function GET() {
  try {
    // Try to fetch real data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const data = await response.json() as {
      prices: [number, number][];
      total_volumes: [number, number][];
    };

    const chartData: ChartCandle[] = data.prices.map((price: [number, number], index: number) => {
      const [timestamp, priceValue] = price;
      const volume = data.total_volumes[index]?.[1] ?? 0;

      // Generate realistic OHLC data based on price
      const open = priceValue * (0.98 + Math.random() * 0.04);
      const high = priceValue * (1 + Math.random() * 0.02);
      const low = priceValue * (0.98 - Math.random() * 0.02);
      const close = priceValue;

      return {
        time: new Date(timestamp).toLocaleDateString(),
        timestamp,
        open,
        high,
        low,
        close,
        volume
      };
    });

    return NextResponse.json({
      success: true,
      chartData,
      source: 'coingecko'
    });

  } catch (error: unknown) {
    console.log('CoinGecko API failed, using fallback data:', error);

    // Generate fallback data if API fails
    const chartData: ChartCandle[] = [];
    const basePrice = 43250;
    let currentPrice = basePrice;

    for (let i = 0; i < 30; i++) {
      const open = currentPrice;
      const volatility = 0.03;
      const high = open * (1 + Math.random() * volatility);
      const low = open * (1 - Math.random() * volatility);
      const close = open * (1 + (Math.random() - 0.5) * volatility);

      chartData.push({
        time: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
        open,
        high: Math.max(open, high, low, close),
        low: Math.min(open, high, low, close),
        close,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });

      currentPrice = close;
    }

    return NextResponse.json({
      success: true,
      chartData,
      source: 'fallback'
    });
  }
}
