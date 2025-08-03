'use client';

import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Image from 'next/image';

// Types
interface Message {
  type: 'user' | 'assistant';
  content: string;
  showChart?: boolean;
}

interface Agent {
  id: number;
  name: string;
  status: string;
  progress: number;
}

interface FlowStepData {
  sources?: string[];
  metrics?: string[];
  indicators?: string[];
  patterns?: string[];
  models?: string[];
  range?: string[];
  confidence?: string;
  completion: number;
}

interface FlowStep {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  agent: string;
  data: FlowStepData;
}

interface ChartCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isPrediction?: boolean;
}

interface RelatedTopic {
  icon: string;
  title: string;
  count: number;
}

export default function ChatInterface() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { type: 'assistant', content: 'Hello! How can I help you with crypto valuations today?' }
  ]);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [agentFlow, setAgentFlow] = useState<FlowStep[]>([]);
  const [_showChart, _setShowChart] = useState(false);
  const [_chartData, _setChartData] = useState<ChartCandle[]>([]);
  const [predictionData, setPredictionData] = useState<ChartCandle[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [_timeframe, _setTimeframe] = useState('1D');
  const [realTimeData, setRealTimeData] = useState<ChartCandle[]>([]);
  const [relatedTopics, _setRelatedTopics] = useState<RelatedTopic[]>([
    { icon: '⚡', title: 'Market Analysis', count: 12 },
    { icon: '🔥', title: 'Token Economics', count: 8 },
    { icon: '🚀', title: 'Price Predictions', count: 15 }
  ]);

  const handleChatSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages([...messages, { type: 'user', content: chatInput }]);
      setChatInput('');

      // Simulate AI agents working
      const agents: Agent[] = [
        { id: 1, name: 'Market Analyst', status: 'Analyzing price trends...', progress: 0 },
        { id: 2, name: 'Data Researcher', status: 'Gathering market data...', progress: 0 },
        { id: 3, name: 'Valuation Expert', status: 'Computing valuations...', progress: 0 }
      ];
      setActiveAgents(agents);

      // Initialize flow with fake data
      const flowSteps: FlowStep[] = [
        {
          id: 1,
          title: 'Data Collection',
          status: 'in-progress',
          agent: 'Data Researcher',
          data: {
            sources: ['CoinGecko API', 'DeFiPulse', 'On-chain Analytics'],
            metrics: ['Price: $43,250', 'Volume: $18.2B', 'Market Cap: $850B'],
            completion: 0
          }
        },
        {
          id: 2,
          title: 'Technical Analysis',
          status: 'pending',
          agent: 'Market Analyst',
          data: {
            indicators: ['RSI: 65.2', 'MACD: Bullish', 'Support: $42K'],
            patterns: ['Ascending Triangle', 'Volume Confirmation'],
            completion: 0
          }
        },
        {
          id: 3,
          title: 'Fundamental Analysis',
          status: 'pending',
          agent: 'Valuation Expert',
          data: {
            metrics: ['NVT Ratio: 45.2', 'MVRV: 2.1', 'Active Addresses: 1.2M'],
                                          models: ['Stock-to-Flow', 'Metcalfe&apos;s Law', 'NVT Model'],
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
            confidence: '75%',
            completion: 0
          }
        }
      ];
      setAgentFlow(flowSteps);

      // Simulate flow progression with smoother timing
      let currentStep = 0;
      const progressFlow = () => {
        if (currentStep < flowSteps.length) {
          // Update current step to in-progress with delay
          setTimeout(() => {
            setAgentFlow(prev => prev.map(step =>
              step.id === currentStep + 1
                ? { ...step, status: 'in-progress' }
                : step
            ));
          }, 200);

          // Simulate progress for current step with smoother increments
          let progress = 0;
          const stepInterval = setInterval(() => {
            progress += 5; // Smaller increments for smoother progress
            setAgentFlow(prev => prev.map(step =>
              step.id === currentStep + 1
                ? { ...step, data: { ...step.data, completion: Math.min(progress, 100) } }
                : step
            ));

            if (progress >= 100) {
              clearInterval(stepInterval);
              // Smoother transition to completed
              setTimeout(() => {
                setAgentFlow(prev => prev.map(step =>
                  step.id === currentStep + 1
                    ? { ...step, status: 'completed' }
                    : step
                ));
                currentStep++;
                setTimeout(progressFlow, 800); // Longer pause between steps
              }, 300);
            }
          }, 80); // Faster updates for smoother progress
        } else {
          // All steps completed, show chart
          setTimeout(() => {
            setActiveAgents([]);
            setTimeout(() => {
              setAgentFlow([]);
              // Generate and show chart
              generateChartData();
              _setShowChart(true);
            }, 500);
          }, 1500);
        }
      };

      // Start flow progression
      void setTimeout(progressFlow, 500);

      // Simulate progress for active agents with smoother progression
      agents.forEach((agent, index) => {
        const interval = setInterval(() => {
          setActiveAgents(prev => prev.map(a =>
            a.id === agent.id
              ? { ...a, progress: Math.min(a.progress + 3, 100) } // Smaller increments
              : a
          ));
        }, 100); // Faster updates

        setTimeout(() => {
          clearInterval(interval);
          // Smooth fade out of agents
          setTimeout(() => {
            setActiveAgents(prev => prev.filter(a => a.id !== agent.id));
          }, 200);
        }, 3000 + index * 400); // Longer duration, smoother stagger
      });

      // Simulate assistant response with chart
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: 'Based on my comprehensive analysis using multiple valuation models and current market data, Bitcoin appears to be fairly valued at current levels with a target range of $38K-$52K. The technical indicators suggest continued bullish momentum, while on-chain metrics show healthy network activity.',
          showChart: true
        }]);
        generateChartData();
      }, 8000);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      // Simulate real-time data from CoinGecko API
      const response = await fetch('/api/market-data');
      const data = await response.json() as { chartData: ChartCandle[] };

      setRealTimeData(data.chartData);
      generatePredictions(data.chartData);
    } catch (_error: unknown) {
      console.log('Using fallback data');
      generateFallbackData();
    }
  };

  const generateFallbackData = () => {
    const data: ChartCandle[] = [];
    const basePrice = 43250;
    let currentPrice = basePrice;

    for (let i = 0; i < 30; i++) {
      const open = currentPrice;
      const volatility = 0.03;
      const high = open * (1 + Math.random() * volatility);
      const low = open * (1 - Math.random() * volatility);
      const close = open * (1 + (Math.random() - 0.5) * volatility);

      data.push({
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

    setRealTimeData(data);
    generatePredictions(data);
  };

  const generatePredictions = (historicalData: ChartCandle[]) => {
    const predictions: ChartCandle[] = [];
    const lastCandle = historicalData[historicalData.length - 1];
    if (!lastCandle) return;
    const lastPrice = lastCandle.close;

    // Generate 7 days of predictions based on technical analysis
    for (let i = 1; i <= 7; i++) {
      const trend = Math.sin(i * 0.5) * 0.02; // Cyclical trend
      const volatility = 0.015;
      const prediction = lastPrice * (1 + trend + (Math.random() - 0.5) * volatility);

      predictions.push({
        time: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        timestamp: Date.now() + i * 24 * 60 * 60 * 1000,
        open: lastPrice,
        high: prediction * 1.02,
        low: prediction * 0.98,
        close: prediction,
        volume: Math.floor(Math.random() * 800000) + 400000,
        isPrediction: true
      });
    }

    setPredictionData(predictions);
  };

  const generateChartData = () => {
    fetchRealTimeData();
  };

  const startNewChat = () => {
    setMessages([
      { type: 'assistant', content: 'Hello! How can I help you with crypto valuations today?' }
    ]);
    _setShowChart(false);
    _setChartData([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="App chat-page">
      <header className="header">
        <Image src="/logo.png" alt="Mosaic Logo" width={100} height={35} />
      </header>
      <div className="chat-container">
        <aside className="chat-sidebar">
          <button className="new-chat-button" onClick={startNewChat}>
            <span className="plus-icon">+</span> New Chat
          </button>
          <div className="sidebar-section">
            <h3 className="section-title">Recent Chats</h3>
            <div className="chat-history">
              <div className="chat-history-item active">
                <span className="chat-icon">⚡</span>
                <span className="chat-title">BTC Valuation Model</span>
              </div>
              <div className="chat-history-item">
                <span className="chat-icon">🔥</span>
                <span className="chat-title">DeFi Protocol Analysis</span>
              </div>
              <div className="chat-history-item">
                <span className="chat-icon">🚀</span>
                <span className="chat-title">Market Risk Assessment</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Related Topics</h3>
            <div className="related-topics">
              {relatedTopics.map((topic, index) => (
                <div key={index} className="topic-item">
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-title">{topic.title}</span>
                  <span className="topic-count">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-footer">
            <Image src="/logo.png" alt="Logo" className="sidebar-logo" width={100} height={30} />
          </div>
        </aside>

        <main className="chat-main">
          {(activeAgents.length > 0 || agentFlow.length > 0) && (
            <div className="research-panel">
              {activeAgents.length > 0 && (
                <div className="agents-section">
                  <h3 className="agents-title">AI Agents Working</h3>
                  <div className="agents-list">
                    {activeAgents.map(agent => (
                      <div key={agent.id} className="agent-item">
                        <div className="agent-info">
                          <span className="agent-name">{agent.name}</span>
                          <span className="agent-status">{agent.status}</span>
                        </div>
                        <div className="agent-progress">
                          <div
                            className="agent-progress-bar"
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agentFlow.length > 0 && (
                <div className="flow-section">
                  <h3 className="flow-title">Research Flow</h3>
                  <div className="flow-container">
                    {agentFlow.map((step, index) => (
                      <div key={step.id} className="flow-step">
                        <div className={`step-indicator ${step.status}`}>
                          <span className="step-number">{step.id}</span>
                        </div>
                        <div className="step-content">
                          <div className="step-header">
                            <h4 className="step-title">{step.title}</h4>
                            <span className="step-agent">{step.agent}</span>
                          </div>
                          <div className="step-data">
                            {step.data.sources && (
                              <div className="data-group">
                                <span className="data-label">Sources:</span>
                                <div className="data-items">
                                  {step.data.sources.map((source, i) => (
                                    <span key={i} className="data-item">{source}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.metrics && (
                              <div className="data-group">
                                <span className="data-label">Metrics:</span>
                                <div className="data-items">
                                  {step.data.metrics.map((metric, i) => (
                                    <span key={i} className="data-item">{metric}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.indicators && (
                              <div className="data-group">
                                <span className="data-label">Indicators:</span>
                                <div className="data-items">
                                  {step.data.indicators.map((indicator, i) => (
                                    <span key={i} className="data-item">{indicator}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.patterns && (
                              <div className="data-group">
                                <span className="data-label">Patterns:</span>
                                <div className="data-items">
                                  {step.data.patterns.map((pattern, i) => (
                                    <span key={i} className="data-item">{pattern}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.models && (
                              <div className="data-group">
                                <span className="data-label">Models:</span>
                                <div className="data-items">
                                  {step.data.models.map((model, i) => (
                                    <span key={i} className="data-item">{model}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.range && (
                              <div className="data-group">
                                <span className="data-label">Valuation Range:</span>
                                <div className="data-items">
                                  {step.data.range.map((range, i) => (
                                    <span key={i} className="data-item">{range}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.data.confidence && (
                              <div className="data-group">
                                <span className="data-label">Confidence:</span>
                                <span className="data-item confidence">{step.data.confidence}</span>
                              </div>
                            )}
                          </div>
                          {step.status === 'in-progress' && (
                            <div className="step-progress">
                              <div
                                className="step-progress-bar"
                                style={{ width: `${step.data.completion}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {index < agentFlow.length - 1 && (
                          <div className="flow-connector" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'assistant' ? (
                    <div className="ai-avatar">
                      <div className="ai-avatar-inner">
                        <div className="ai-core"></div>
                        <div className="ai-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="user-avatar">
                      <span className="user-icon">👤</span>
                    </div>
                  )}
                </div>
                <div className="message-content">
                  {message.content}
                  {message.showChart && (
                    <div className="analysis-report">
                      <div className="report-header">
                        <div className="report-title">
                          <h3>📊 Comprehensive Analysis Report</h3>
                          <div className="report-status">
                            <span className="status-indicator"></span>
                            Analysis Complete
                          </div>
                        </div>
                        <div className="report-controls">
                          <button className="report-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                      </div>

                      <div className={`report-content ${isExpanded ? 'expanded' : ''}`}>
                        {/* Market Overview */}
                        <div className="report-section">
                          <div className="section-header">
                            <h4>⚡ Market Overview</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="market-stats">
                            <div className="stat-card">
                              <div className="stat-value">$43,250</div>
                              <div className="stat-label">Current Price</div>
                              <div className="stat-change positive">+2.4%</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-value">$18.2B</div>
                              <div className="stat-label">24h Volume</div>
                              <div className="stat-change positive">+5.1%</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-value">$850B</div>
                              <div className="stat-label">Market Cap</div>
                              <div className="stat-change positive">+1.8%</div>
                            </div>
                          </div>
                        </div>

                        {/* Technical Analysis */}
                        <div className="report-section">
                          <div className="section-header">
                            <h4>📈 Technical Analysis</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="technical-indicators">
                            <div className="indicator-item">
                              <span className="indicator-name">RSI</span>
                              <span className="indicator-value">65.2</span>
                              <div className="indicator-bar">
                                <div className="indicator-fill" style={{width: '65%'}}></div>
                              </div>
                            </div>
                            <div className="indicator-item">
                              <span className="indicator-name">MACD</span>
                              <span className="indicator-value">Bullish</span>
                              <div className="indicator-bar">
                                <div className="indicator-fill bullish" style={{width: '75%'}}></div>
                              </div>
                            </div>
                            <div className="indicator-item">
                              <span className="indicator-name">Support</span>
                              <span className="indicator-value">$42K</span>
                              <div className="indicator-bar">
                                <div className="indicator-fill" style={{width: '85%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price Chart */}
                        <div className="report-section">
                          <div className="section-header">
                            <h4>📊 Price Analysis</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="chart-container">
                            <div className="chart-header">
                              <div className="chart-title">BTC/USD Price Movement</div>
                              <div className="chart-timeframe">
                                <button className="timeframe-btn active">1D</button>
                                <button className="timeframe-btn">1W</button>
                                <button className="timeframe-btn">1M</button>
                              </div>
                            </div>
                            <div className="sleek-chart">
                              {realTimeData.map((candle, index) => {
                                const isGreen = candle.close >= candle.open;
                                const allData = [...realTimeData, ...predictionData];
                                const maxPrice = Math.max(...allData.map(d => d.high));
                                const minPrice = Math.min(...allData.map(d => d.low));
                                const priceRange = maxPrice - minPrice;

                                const normalizedY = ((candle.low - minPrice) / priceRange) * 120;
                                const normalizedHeight = ((candle.high - candle.low) / priceRange) * 120;
                                const bodyHeight = Math.abs(candle.close - candle.open) / priceRange * 120;
                                const bodyY = normalizedY + (normalizedHeight - bodyHeight) / 2;

                                return (
                                  <div key={index} className="chart-candle historical" style={{ left: `${index * 6}px` }}>
                                    <div
                                      className="candle-wick"
                                      style={{
                                        height: `${normalizedHeight}px`,
                                        top: `${normalizedY}px`,
                                        backgroundColor: isGreen ? '#00FF88' : '#FF6B6B'
                                      }}
                                    />
                                    <div
                                      className="candle-body"
                                      style={{
                                        height: `${Math.max(bodyHeight, 2)}px`,
                                        top: `${bodyY}px`,
                                        backgroundColor: isGreen ? '#00FF88' : '#FF6B6B',
                                        boxShadow: `0 0 8px ${isGreen ? '#00FF88' : '#FF6B6B'}40`
                                      }}
                                    />
                                  </div>
                                );
                              })}

                              {predictionData.map((candle, index) => {
                                const isGreen = candle.close >= candle.open;
                                const allData = [...realTimeData, ...predictionData];
                                const maxPrice = Math.max(...allData.map(d => d.high));
                                const minPrice = Math.min(...allData.map(d => d.low));
                                const priceRange = maxPrice - minPrice;

                                const normalizedY = ((candle.low - minPrice) / priceRange) * 120;
                                const normalizedHeight = ((candle.high - candle.low) / priceRange) * 120;
                                const bodyHeight = Math.abs(candle.close - candle.open) / priceRange * 120;
                                const bodyY = normalizedY + (normalizedHeight - bodyHeight) / 2;

                                return (
                                  <div key={`pred-${index}`} className="chart-candle prediction" style={{ left: `${(realTimeData.length + index) * 6}px` }}>
                                    <div
                                      className="candle-wick prediction-wick"
                                      style={{
                                        height: `${normalizedHeight}px`,
                                        top: `${normalizedY}px`,
                                        backgroundColor: isGreen ? '#4FC3F7' : '#FF8A8A',
                                        opacity: 0.6
                                      }}
                                    />
                                    <div
                                      className="candle-body prediction-body"
                                      style={{
                                        height: `${Math.max(bodyHeight, 2)}px`,
                                        top: `${bodyY}px`,
                                        backgroundColor: isGreen ? '#4FC3F7' : '#FF8A8A',
                                        opacity: 0.8,
                                        boxShadow: `0 0 8px ${isGreen ? '#4FC3F7' : '#FF8A8A'}40`
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Valuation Models */}
                        <div className="report-section">
                          <div className="section-header">
                            <h4>💰 Valuation Models</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="valuation-models">
                            <div className="model-card">
                              <div className="model-name">Stock-to-Flow</div>
                              <div className="model-value">$52,400</div>
                              <div className="model-confidence">85% Confidence</div>
                            </div>
                            <div className="model-card">
                              <div className="model-name">NVT Ratio</div>
                              <div className="model-value">$48,200</div>
                              <div className="model-confidence">78% Confidence</div>
                            </div>
                            <div className="model-card">
                              <div className="model-name">Metcalfe's Law</div>
                              <div className="model-value">$45,800</div>
                              <div className="model-confidence">82% Confidence</div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="report-section">
                          <div className="section-header">
                            <h4>⚠️ Risk Assessment</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="risk-metrics">
                            <div className="risk-item">
                              <span className="risk-label">Volatility</span>
                              <div className="risk-bar">
                                <div className="risk-fill medium" style={{width: '65%'}}></div>
                              </div>
                              <span className="risk-value">Medium</span>
                            </div>
                            <div className="risk-item">
                              <span className="risk-label">Liquidity</span>
                              <div className="risk-bar">
                                <div className="risk-fill low" style={{width: '85%'}}></div>
                              </div>
                              <span className="risk-value">Low Risk</span>
                            </div>
                            <div className="risk-item">
                              <span className="risk-label">Regulatory</span>
                              <div className="risk-bar">
                                <div className="risk-fill medium" style={{width: '55%'}}></div>
                              </div>
                              <span className="risk-value">Medium</span>
                            </div>
                          </div>
                        </div>

                        {/* Final Recommendation */}
                        <div className="report-section final">
                          <div className="section-header">
                            <h4>🎯 Final Recommendation</h4>
                            <div className="section-indicator"></div>
                          </div>
                          <div className="recommendation">
                            <div className="rec-main">
                              <div className="rec-action">BUY</div>
                              <div className="rec-reason">Strong technical indicators with bullish momentum</div>
                            </div>
                            <div className="rec-details">
                              <div className="rec-target">Target: $52,000</div>
                              <div className="rec-stop">Stop Loss: $40,000</div>
                              <div className="rec-confidence">Confidence: 78%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <form onSubmit={handleChatSubmit} className="chat-input-form">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crypto valuations..."
                className="chat-input"
                rows={1}
              />
              <button type="submit" className="chat-submit-button">
                <Image src="/mosaic.png" alt="Send" width={28} height={28} />
              </button>
            </form>
            <p className="chat-disclaimer">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
