import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface Agent {
  id: number;
  name: string;
  status: string;
  progress: number;
  data?: Record<string, unknown>;
}

export interface AgentFlowStep {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  agent: string;
  data: {
    sources?: string[];
    metrics?: string[];
    indicators?: string[];
    patterns?: string[];
    models?: string[];
    range?: string[];
    confidence?: string;
    completion: number;
  };
}

// Mock agent configurations
const agentConfigs = {
  market_analysis: [
    { id: 1, name: 'Market Analyst', status: 'Analyzing price trends...', progress: 0 },
    { id: 2, name: 'Data Researcher', status: 'Gathering market data...', progress: 0 },
    { id: 3, name: 'Valuation Expert', status: 'Computing valuations...', progress: 0 }
  ],
  technical_analysis: [
    { id: 1, name: 'Technical Analyst', status: 'Analyzing chart patterns...', progress: 0 },
    { id: 2, name: 'Momentum Trader', status: 'Checking momentum indicators...', progress: 0 },
    { id: 3, name: 'Risk Manager', status: 'Assessing risk metrics...', progress: 0 }
  ],
  fundamental_analysis: [
    { id: 1, name: 'Fundamental Analyst', status: 'Evaluating network metrics...', progress: 0 },
    { id: 2, name: 'On-chain Analyst', status: 'Analyzing blockchain data...', progress: 0 },
    { id: 3, name: 'Macro Economist', status: 'Assessing macro factors...', progress: 0 }
  ]
};

// Mock flow steps
const flowSteps: AgentFlowStep[] = [
  {
    id: 1,
    title: 'Data Collection',
    status: 'pending',
    agent: 'Data Researcher',
    data: {
      sources: ['CoinGecko API', 'DeFiPulse', 'On-chain Analytics', 'TradingView'],
      metrics: ['Price: $43,250', 'Volume: $18.2B', 'Market Cap: $850B', '24h Change: +2.4%'],
      completion: 0
    }
  },
  {
    id: 2,
    title: 'Technical Analysis',
    status: 'pending',
    agent: 'Market Analyst',
    data: {
      indicators: ['RSI: 65.2', 'MACD: Bullish', 'Support: $42K', 'Resistance: $46K'],
      patterns: ['Ascending Triangle', 'Volume Confirmation', 'Bullish Divergence'],
      completion: 0
    }
  },
  {
    id: 3,
    title: 'Fundamental Analysis',
    status: 'pending',
    agent: 'Valuation Expert',
    data: {
      metrics: ['NVT Ratio: 45.2', 'MVRV: 2.1', 'Active Addresses: 1.2M', 'Hash Rate: 450 EH/s'],
      models: ['Stock-to-Flow', 'Metcalfe\'s Law', 'NVT Model', 'Rainbow Chart'],
      completion: 0
    }
  },
  {
    id: 4,
    title: 'Final Valuation',
    status: 'pending',
    agent: 'Valuation Expert',
    data: {
      range: ['Conservative: $38K', 'Base: $45K', 'Optimistic: $52K'],
      confidence: '78%',
      completion: 0
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { action, type } = await request.json() as { action: string; type: string };

    if (action === 'start') {
      const agents = agentConfigs[type as keyof typeof agentConfigs] || agentConfigs.market_analysis;

      return NextResponse.json({
        success: true,
        agents: agents.map(agent => ({ ...agent })),
        flow: flowSteps.map(step => ({ ...step, data: { ...step.data } }))
      });
    }

    if (action === 'progress') {
      // Simulate random progress updates
      const updatedAgents = agentConfigs.market_analysis.map(agent => ({
        ...agent,
        progress: Math.min(agent.progress + Math.random() * 15, 100)
      }));

      const updatedFlow = flowSteps.map((step, _index) => {
        const shouldUpdate = Math.random() > 0.3; // 70% chance to update
        const progressIncrement = shouldUpdate ? Math.random() * 20 : 0;

        return {
          ...step,
          data: {
            ...step.data,
            completion: Math.min(step.data.completion + progressIncrement, 100)
          },
          status: step.data.completion >= 100 ? 'completed' as const :
                  step.data.completion > 0 ? 'in-progress' as const : 'pending' as const
        };
      });

      return NextResponse.json({
        success: true,
        agents: updatedAgents,
        flow: updatedFlow
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Agents API is running',
    available_types: Object.keys(agentConfigs),
    actions: ['start', 'progress'],
    example: {
      start: 'POST /api/agents { "action": "start", "type": "market_analysis" }',
      progress: 'POST /api/agents { "action": "progress" }'
    }
  });
}
