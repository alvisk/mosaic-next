import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface ChatRequest {
  message: string;
  session_id?: string;
}

// Types based on message.json structure
export interface MessageProperties {
  text_color: string;
  background_color: string;
  edited: boolean;
  source: {
    id: string;
    display_name: string;
    source: string;
  };
  icon: string;
  allow_markdown: boolean;
  positive_feedback: null | boolean;
  state: 'complete' | 'in-progress' | 'pending';
  targets: unknown[];
}

export interface MessageData {
  timestamp: string;
  sender: 'Machine' | 'User';
  sender_name: string;
  session_id: string;
  text: string;
  files: string[];
  error: boolean;
  edit: boolean;
  properties: MessageProperties;
  category: 'message';
  content_blocks: unknown[];
  id: string;
  flow_id: string;
  duration: null | number;
}

export interface MessageResult {
  text_key: string;
  data: MessageData;
  default_value: string;
  text: string;
  sender: 'Machine' | 'User';
  sender_name: string;
  files: string[];
  session_id: string;
  timestamp: string;
  flow_id: string;
  error: boolean;
  edit: boolean;
  properties: MessageProperties;
  category: 'message';
  content_blocks: unknown[];
  duration: null | number;
}

export interface ChatOutputResult {
  results: {
    message: MessageResult;
  };
  artifacts: {
    message: string;
    sender: 'Machine' | 'User';
    sender_name: string;
    files: string[];
    type: 'object';
  };
  outputs: {
    message: {
      message: string;
      type: 'text';
    };
  };
  logs: {
    message: unknown[];
  };
  messages: Array<{
    message: string;
    sender: 'Machine' | 'User';
    sender_name: string;
    session_id: string;
    stream_url: null | string;
    component_id: string;
    files: string[];
    type: 'text';
  }>;
  timedelta: null | number;
  duration: null | number;
  component_display_name: string;
component_id: string;
  used_frozen_result: boolean;
}

export interface ChatResponse {
  session_id: string;
  outputs: Array<{
    inputs: {
      input_value: string;
    };
    outputs: ChatOutputResult[];
  }>;
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

// Helper function to create a message in the message.json format
function createMessageOutput(
  text: string,
  sessionId: string,
  inputValue: string,
  source: { id: string; display_name: string; source: string },
  componentId: string
): ChatResponse {
  const messageId = generateMessageId();
  const timestamp = getCurrentTimestamp();
  const isoTimestamp = getISOTimestamp();

  const messageData: MessageData = {
    timestamp,
    sender: 'Machine',
    sender_name: 'AI',
    session_id: sessionId,
    text,
    files: [],
    error: false,
    edit: false,
    properties: {
      text_color: '',
      background_color: '',
      edited: false,
      source,
      icon: source.display_name === 'Anthropic' ? 'Anthropic' : 'code',
      allow_markdown: false,
      positive_feedback: null,
      state: 'complete',
      targets: []
    },
    category: 'message',
    content_blocks: [],
    id: messageId,
    flow_id: sessionId,
    duration: null
  };

  const outputResult: ChatOutputResult = {
    results: {
      message: {
        text_key: 'text',
        data: messageData,
        default_value: '',
        text,
        sender: 'Machine',
        sender_name: 'AI',
        files: [],
        session_id: sessionId,
        timestamp: isoTimestamp,
        flow_id: sessionId,
        error: false,
        edit: false,
        properties: messageData.properties,
        category: 'message',
        content_blocks: [],
        duration: null
      }
    },
    artifacts: {
      message: text,
      sender: 'Machine',
      sender_name: 'AI',
      files: [],
      type: 'object'
    },
    outputs: {
      message: {
        message: text,
        type: 'text'
      }
    },
    logs: {
      message: []
    },
    messages: text ? [{
      message: text,
      sender: 'Machine',
      sender_name: 'AI',
      session_id: sessionId,
      stream_url: null,
      component_id: componentId,
      files: [],
      type: 'text'
    }] : [],
    timedelta: null,
    duration: null,
    component_display_name: 'Chat Output',
    component_id: componentId,
    used_frozen_result: false
  };

  return {
    session_id: sessionId,
    outputs: [{
      inputs: {
        input_value: inputValue
      },
      outputs: [outputResult]
    }]
  };
}

// Generate a general response for queries that don't match specific patterns
function generateGeneralResponse(message: string, sessionId: string): ChatResponse {
  const responses = [
    "I can help you analyze various cryptocurrencies and market conditions. Try asking about Bitcoin, Ethereum, or general market trends for detailed analysis.",
    "For comprehensive crypto analysis, please specify which cryptocurrency or market aspect you'd like me to examine. I can provide technical analysis, valuation models, and risk assessments.",
    "I specialize in cryptocurrency valuation and market analysis. What specific crypto asset or market trend would you like me to analyze?"
  ];

  const selectedResponse = responses[Math.floor(Math.random() * responses.length)]!;

  return createMessageOutput(
    selectedResponse,
    sessionId,
    message,
    {
      id: 'CustomComponent-' + Math.random().toString(36).substr(2, 5),
      display_name: 'Custom Component',
      source: 'Custom Component'
    },
    'ChatOutput-' + Math.random().toString(36).substr(2, 5)
  );
}

function generateSessionId(): string {
  // Generate UUID-like session ID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateMessageId(): string {
  return generateSessionId(); // Using same UUID format for message IDs
}

function getCurrentTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, -5) + ' UTC';
}

function getISOTimestamp(): string {
  return new Date().toISOString();
}

// Generate crypto analysis response with formatted JSON
function generateCryptoAnalysisResponse(
  queryType: keyof typeof mockResponses,
  message: string,
  sessionId: string
): ChatResponse {
  const mockResponse = mockResponses[queryType];

  // Format the response with analysis data as JSON (similar to message.json)
  const formattedResponse = `\`\`\`json
{
  "value": "${mockResponse.response}",
  "analysis": ${JSON.stringify(mockResponse.analysis, null, 2)}
}
\`\`\``;

  return createMessageOutput(
    formattedResponse,
    sessionId,
    message,
    {
      id: 'AnthropicModel-' + Math.random().toString(36).substr(2, 5),
      display_name: 'Anthropic',
      source: 'claude-3-7-sonnet-latest'
    },
    'ChatOutput-' + Math.random().toString(36).substr(2, 5)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { message, session_id } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Use provided session_id or generate a new one
    const sessionId = session_id ?? generateSessionId();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const queryType = detectQueryType(message);

    if (queryType === 'general') {
      return NextResponse.json(generateGeneralResponse(message, sessionId));
    }

    // Generate crypto analysis response in message.json format
    return NextResponse.json(generateCryptoAnalysisResponse(queryType, message, sessionId));

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
