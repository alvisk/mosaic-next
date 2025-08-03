import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  analysis?: {
    confidence: number;
    sources: string[];
    technical_indicators: Record<string, string | number>;
    valuation_models: Record<string, number>;
    risk_metrics: Record<string, string>;
    recommendation: {
      action: 'BUY' | 'SELL' | 'HOLD';
      target_price: number;
      stop_loss: number;
      confidence: number;
    };
  };
  conversation_id: string;
}

// Mock responses for different types of queries
const mockResponses = {
  bitcoin: {
    response: "Based on my comprehensive analysis using multiple valuation models and current market data, Bitcoin appears to be fairly valued at current levels with a target range of $38K-$52K. The technical indicators suggest continued bullish momentum, while on-chain metrics show healthy network activity.",
    analysis: {
      confidence: 78,
      sources: ['CoinGecko API', 'DeFiPulse', 'On-chain Analytics', 'TradingView'],
      technical_indicators: {
        RSI: 65.2,
        MACD: 'Bullish',
        'Support Level': '$42,000',
        'Resistance Level': '$46,000',
        'Volume Trend': 'Increasing'
      },
      valuation_models: {
        'Stock-to-Flow': 52400,
        'NVT Ratio': 48200,
        "Metcalfe's Law": 45800,
        'Rainbow Chart': 44500
      },
      risk_metrics: {
        Volatility: 'Medium (65%)',
        Liquidity: 'Low Risk (85%)',
        Regulatory: 'Medium (55%)',
        'Market Sentiment': 'Bullish (72%)'
      },
      recommendation: {
        action: 'BUY' as const,
        target_price: 52000,
        stop_loss: 40000,
        confidence: 78
      }
    }
  },
  ethereum: {
    response: "Ethereum shows strong fundamentals with the transition to Proof of Stake and growing DeFi ecosystem. Current price levels suggest potential upside with key resistance at $2,800. The merge has reduced energy consumption by 99.95% and created deflationary pressure.",
    analysis: {
      confidence: 82,
      sources: ['Etherscan', 'DeFiPulse', 'Ethereum Foundation', 'L2Beat'],
      technical_indicators: {
        RSI: 58.7,
        MACD: 'Neutral',
        'Support Level': '$2,200',
        'Resistance Level': '$2,800',
        'Staking APR': '4.2%'
      },
      valuation_models: {
        'P/E Ratio': 2650,
        'NVT Ratio': 2580,
        'TVL Model': 2720,
        'Burn Rate Model': 2890
      },
      risk_metrics: {
        Volatility: 'High (78%)',
        Liquidity: 'Low Risk (88%)',
        Regulatory: 'Low Risk (25%)',
        'Smart Contract Risk': 'Medium (45%)'
      },
      recommendation: {
        action: 'BUY' as const,
        target_price: 2800,
        stop_loss: 2100,
        confidence: 82
      }
    }
  },
  market: {
    response: "The overall crypto market is showing signs of consolidation with increasing institutional adoption. Key metrics suggest we're in a healthy accumulation phase with strong on-chain fundamentals supporting higher prices in the medium term.",
    analysis: {
      confidence: 74,
      sources: ['CoinMarketCap', 'CoinGecko', 'Glassnode', 'IntoTheBlock'],
      technical_indicators: {
        'Fear & Greed Index': 67,
        'Market Cap': '$1.2T',
        'Dominance BTC': '42.5%',
        'Dominance ETH': '18.3%',
        'Active Addresses': '950K'
      },
      valuation_models: {
        'Total Market Cap': 1200000000000,
        'Realized Cap': 950000000000,
        'MVRV Ratio': 1.26,
        'NVT Ratio': 45.2
      },
      risk_metrics: {
        Volatility: 'Medium (62%)',
        Liquidity: 'Medium Risk (58%)',
        Regulatory: 'Medium (52%)',
        'Institutional Flow': 'Positive (78%)'
      },
      recommendation: {
        action: 'HOLD' as const,
        target_price: 45000,
        stop_loss: 38000,
        confidence: 74
      }
    }
  }
};

// Detect query type based on message content
function detectQueryType(message: string): keyof typeof mockResponses | 'general' {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    return 'bitcoin';
  } else if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
    return 'ethereum';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('crypto')) {
    return 'market';
  }

  return 'general';
}

// Generate a general response for queries that don't match specific patterns
function generateGeneralResponse(_message: string): ChatResponse {
  const responses = [
    "I can help you analyze various cryptocurrencies and market conditions. Try asking about Bitcoin, Ethereum, or general market trends for detailed analysis.",
    "For comprehensive crypto analysis, please specify which cryptocurrency or market aspect you'd like me to examine. I can provide technical analysis, valuation models, and risk assessments.",
    "I specialize in cryptocurrency valuation and market analysis. What specific crypto asset or market trend would you like me to analyze?"
  ];

  const selectedResponse = responses[Math.floor(Math.random() * responses.length)]!;

  return {
    success: true,
    response: selectedResponse,
    conversation_id: generateConversationId()
  };
}

function generateConversationId(): string {
  return 'conv_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { message, conversation_id } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const queryType = detectQueryType(message);

    if (queryType === 'general') {
      return NextResponse.json(generateGeneralResponse(message));
    }

    const mockResponse = mockResponses[queryType];

    const response: ChatResponse = {
      success: true,
      response: mockResponse.response,
      analysis: mockResponse.analysis,
      conversation_id: conversation_id ?? generateConversationId()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Chat API is running. Use POST method to send messages.',
    endpoints: {
      chat: 'POST /api/chat',
      market_data: 'GET /api/market-data'
    }
  });
}
