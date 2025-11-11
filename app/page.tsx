'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Code, TrendingUp, Copy, Download, CheckCircle, Lightbulb, AlertCircle, Loader, RefreshCw, BarChart3, Clock, Target, Database, Activity, Globe, LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// ============================================================================
// POWER QUERY OPTIMIZER v2.1 - COMPLETE EDITION
// ============================================================================
// Created by: Franklyne Andrew
// LinkedIn: https://www.linkedin.com/in/andrew-f-junior-b2529a146/
// Expertise: Power BI | DAX | M Code Optimization | Power Platform
// 
// Version: 2.1 (Complete Edition)
// Latest prompt: v2.1 with 26 mandatory patterns
// 
// Key Features:
// - 26 Mandatory Performance Patterns
// - Advanced semantic preservation
// - Professional-grade optimizations
// - Enhanced Admin Dashboard
// - Improved code formatting and readability
// - User empowerment focused
//
// © 2025 Franklyne Andrew. All rights reserved.
// ============================================================================

// ============================================================================
// TYPESCRIPT TYPE DEFINITIONS
// ============================================================================

interface UsageSession {
  timestamp: string;
  stepsReduced: number;
  patterns: string[];
  source: string;
  userRegion: string;
  userLanguage: string;
}

interface UsageData {
  totalOptimizations: number;
  sessions: UsageSession[];
  patterns: Record<string, number>;
}

interface UsageStats {
  totalOptimizations: number;
  todayCount: number;
  totalStepsReduced: number;
  topPatterns: [string, number][];
  recentSessions: UsageSession[];
  allSessions: UsageSession[];
}

interface DayData {
  date: string;
  optimizations: number;
  stepsReduced: number;
}

interface SourceStats {
  count: number;
  totalStepsReduced: number;
  patterns: Record<string, number>;
}

interface SourceBreakdown {
  source: string;
  count: number;
  percentage: string;
  avgStepsReduced: number;
  topPattern: string;
}

interface AdvancedAnalytics {
  last7Days: DayData[];
  sourceBreakdown: SourceBreakdown[];
  avgStepsReduced: number;
  hoursSaved: number;
}

interface TrackUsageMetadata {
  stepsReduced?: number;
  patterns?: string[];
  source?: string;
}

interface OptimizationMetrics {
  originalSteps: number;
  optimizedSteps: number;
  reduction: number;
  estimatedSpeedGain: string;
}

interface Improvement {
  pattern: string;
  title: string;
  description: string;
  impact: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  maintenanceNote?: string;
}

interface Warning {
  type: 'info' | 'warning' | 'critical';
  message: string;
}

interface OptimizationResult {
  optimizedCode: string;
  improvements: Improvement[];
  metrics: OptimizationMetrics;
  warnings: Warning[];
}

interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AdminDashboardProps {
  onBack: () => void;
}

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ImprovementCardProps {
  improvement: Improvement;
}

interface WarningCardProps {
  warning: Warning;
}

// ============================================================================
// LOCAL USAGE TRACKING (Personal Analytics)
// ============================================================================

function trackUsage(action: string, metadata: TrackUsageMetadata = {}): void {
  const usage: UsageData = JSON.parse(localStorage.getItem('pq_optimizer_usage') || '{"totalOptimizations": 0, "sessions": [], "patterns": {}}');
  
  if (action === 'optimize') {
    usage.totalOptimizations += 1;
    usage.sessions.push({
      timestamp: new Date().toISOString(),
      stepsReduced: metadata.stepsReduced || 0,
      patterns: metadata.patterns || [],
      source: metadata.source || 'Unknown',
      userRegion: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userLanguage: navigator.language
    });
    
    metadata.patterns?.forEach(pattern => {
      usage.patterns[pattern] = (usage.patterns[pattern] || 0) + 1;
    });
  }
  
  localStorage.setItem('pq_optimizer_usage', JSON.stringify(usage));
}

function getUsageStats(): UsageStats {
  const usage: UsageData = JSON.parse(localStorage.getItem('pq_optimizer_usage') || '{"totalOptimizations": 0, "sessions": [], "patterns": {}}');
  
  const today = new Date().toDateString();
  const todayCount = usage.sessions.filter(s => new Date(s.timestamp).toDateString() === today).length;
  
  const totalStepsReduced = usage.sessions.reduce((sum, s) => sum + (s.stepsReduced || 0), 0);
  
  return {
    totalOptimizations: usage.totalOptimizations,
    todayCount,
    totalStepsReduced,
    topPatterns: Object.entries(usage.patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) as [string, number][],
    recentSessions: usage.sessions.slice(-10).reverse(),
    allSessions: usage.sessions
  };
}

// ============================================================================
// ENHANCED ANALYTICS CALCULATIONS
// ============================================================================

function getAdvancedAnalytics(sessions: UsageSession[]): AdvancedAnalytics {
  const last7Days: DayData[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayData = sessions.filter(s => {
      const sessionDate = new Date(s.timestamp);
      return sessionDate.toDateString() === date.toDateString();
    });
    
    last7Days.push({
      date: dateStr,
      optimizations: dayData.length,
      stepsReduced: dayData.reduce((sum, s) => sum + (s.stepsReduced || 0), 0)
    });
  }
  
  const sourceStats: Record<string, SourceStats> = {};
  sessions.forEach(session => {
    const source = session.source || 'Unknown';
    if (!sourceStats[source]) {
      sourceStats[source] = { count: 0, totalStepsReduced: 0, patterns: {} };
    }
    sourceStats[source].count += 1;
    sourceStats[source].totalStepsReduced += session.stepsReduced || 0;
    
    session.patterns?.forEach(pattern => {
      sourceStats[source].patterns[pattern] = (sourceStats[source].patterns[pattern] || 0) + 1;
    });
  });
  
  const sourceBreakdown: SourceBreakdown[] = Object.entries(sourceStats)
    .map(([source, stats]) => {
      const topPattern = Object.entries(stats.patterns).sort((a, b) => b[1] - a[1])[0];
      return {
        source,
        count: stats.count,
        percentage: sessions.length > 0 ? ((stats.count / sessions.length) * 100).toFixed(0) : '0',
        avgStepsReduced: stats.count > 0 ? Math.round(stats.totalStepsReduced / stats.count) : 0,
        topPattern: topPattern ? topPattern[0] : 'N/A'
      };
    })
    .sort((a, b) => b.count - a.count);
  
  const avgStepsReduced = sessions.length > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + (s.stepsReduced || 0), 0) / sessions.length)
    : 0;
  
  const totalTimeSaved = sessions.reduce((sum, s) => sum + (s.stepsReduced || 0), 0) * 30;
  const hoursSaved = Math.round(totalTimeSaved / 3600);
  
  return { last7Days, sourceBreakdown, avgStepsReduced, hoursSaved };
}

// ============================================================================
// DETECT DATA SOURCE FROM M CODE
// ============================================================================

function detectSource(code: string | null | undefined): string {
  if (!code) return 'Unknown';
  if (code.includes('SharePoint.')) return 'SharePoint';
  if (code.includes('Sql.Database') || code.includes('Sql.')) return 'SQL Server';
  if (code.includes('Excel.')) return 'Excel';
  if (code.includes('Web.Contents')) return 'Web API';
  if (code.includes('OData.Feed')) return 'OData';
  if (code.includes('Json.Document')) return 'JSON';
  if (code.includes('Csv.Document')) return 'CSV';
  if (code.includes('AzureDataExplorer.')) return 'Azure Data Explorer';
  return 'Other';
}

// ============================================================================
// GEMINI-POWERED OPTIMIZER v2.1
// ============================================================================

async function optimizeWithGemini(powerQueryCode: string): Promise<OptimizationResult> {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ powerQueryCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to optimize');
    }

    const result = await response.json();
    return result as OptimizationResult;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to optimize: ${error.message}`);
    }
    throw new Error('Failed to optimize. Please try again.');
  }
}

// ============================================================================
// ADMIN DASHBOARD COMPONENT (ENHANCED)
// ============================================================================

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'overview' | 'insights' | 'trends' | 'sessions'>('overview');
  const stats = getUsageStats();
  const analytics = getAdvancedAnalytics(stats.allSessions);
  const topIssue = stats.topPatterns?.[0];
  const topIssuePercentage = topIssue 
    ? ((topIssue[1] / (stats.totalOptimizations || 1)) * 100).toFixed(0) 
    : 0;

  const exportAnalytics = () => {
    const csvContent = [
      ['Power Query Optimizer - Personal Analytics Report', ''],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Summary Statistics', ''],
      ['Total Optimizations', stats.totalOptimizations],
      ['Today', stats.todayCount],
      ['Total Steps Reduced', stats.totalStepsReduced],
      ['Average Steps Reduced', analytics.avgStepsReduced],
      ['Estimated Time Saved (hours)', analytics.hoursSaved],
      [''],
      ['Top Patterns', 'Usage Count'],
      ...(stats.topPatterns || []).map(([pattern, count]) => [pattern, count]),
      [''],
      ['7-Day Summary', ''],
      ...(analytics.last7Days || []).map(d => [d.date, d.optimizations, d.stepsReduced])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pq-optimizer-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      localStorage.removeItem('pq_optimizer_usage');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Personal usage insights & training opportunities</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportAnalytics}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={onBack}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 border-b">
            {([
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'insights', label: 'Insights', icon: Lightbulb },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'sessions', label: 'Sessions', icon: Activity }
            ] as TabConfig[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as 'overview' | 'insights' | 'trends' | 'sessions')}
                className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                  activeView === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'overview' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.totalOptimizations}</div>
                <div className="text-blue-100 text-sm font-medium">Total Optimizations</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.todayCount}</div>
                <div className="text-green-100 text-sm font-medium">Today</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.totalStepsReduced}</div>
                <div className="text-purple-100 text-sm font-medium">Steps Eliminated</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                <div className="text-4xl font-bold mb-2">{analytics.hoursSaved}h</div>
                <div className="text-orange-100 text-sm font-medium">Time Saved</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Key Training Opportunity</h3>
                  {topIssue ? (
                    <>
                      <p className="text-xl mb-3">
                        <strong>{topIssuePercentage}%</strong> of queries have: <strong>{topIssue[0]}</strong>
                      </p>
                      <p className="text-indigo-100">
                        This pattern affects {topIssue[1]} out of {stats.totalOptimizations} queries. Create training materials focused on this optimization.
                      </p>
                    </>
                  ) : (
                    <p className="text-indigo-100">No data yet - run some optimizations to see insights</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Optimization Impact
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{(stats.allSessions || []).filter(s => (s.stepsReduced || 0) >= 5).length}</div>
                  <div className="text-sm text-gray-700">High Impact (5+ steps)</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{analytics.avgStepsReduced}</div>
                  <div className="text-sm text-gray-700">Avg Steps Reduced</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(stats.allSessions || []).length > 0 
                      ? Math.round(((stats.allSessions || []).filter(s => (s.stepsReduced || 0) > 0).length / (stats.allSessions || []).length) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-700">Success Rate</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'insights' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Top Optimization Patterns
              </h3>
              <div className="space-y-3">
                {stats.topPatterns && stats.topPatterns.length > 0 ? stats.topPatterns.map(([pattern, count], idx) => {
                  const totalPatternOccurrences = stats.topPatterns.reduce((sum, [, c]) => sum + c, 0);
                  const percentage = totalPatternOccurrences > 0 
                    ? ((count / totalPatternOccurrences) * 100).toFixed(0)
                    : 0;
                  return (
                    <div key={idx} className="relative">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between ml-3">
                          <span className="font-semibold text-gray-900">{pattern}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{count} times</span>
                            <span className="text-lg font-bold text-orange-600 w-12 text-right">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 flex-shrink-0"></div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-gray-500 py-8">No pattern data yet</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-indigo-600" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {stats.topPatterns && stats.topPatterns.slice(0, 3).map(([pattern, count], idx) => (
                  <div key={idx} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-indigo-900 mb-1">{pattern}</div>
                        <p className="text-sm text-indigo-700">
                          Create targeted training on this pattern - it's been detected {count} times in your optimizations.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === 'trends' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                7-Day Activity Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.last7Days}>
                  <defs>
                    <linearGradient id="colorOptimizations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="optimizations" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorOptimizations)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Steps Reduced Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stepsReduced" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeView === 'sessions' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Sessions
            </h3>
            
            {stats.recentSessions && stats.recentSessions.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.recentSessions.map((session, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{session.source}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-gray-700">
                        <strong>{session.stepsReduced}</strong> steps reduced
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {session.patterns?.slice(0, 2).map((p, pidx) => (
                          <span key={pidx} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">
                            {p.split(':')[0]}
                          </span>
                        ))}
                        {session.patterns && session.patterns.length > 2 && (
                          <span className="text-gray-600 text-xs px-2">+{session.patterns.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No sessions yet</div>
            )}
            
            <div className="mt-6 pt-4 border-t flex gap-2">
              <button 
                onClick={clearAllData}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const styles = {
    critical: 'bg-red-100 text-red-700 border border-red-300',
    high: 'bg-orange-100 text-orange-700 border border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border border-blue-300'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[severity] || styles.low}`}>
      {severity.toUpperCase()}
    </span>
  );
};

const ImprovementCard: React.FC<ImprovementCardProps> = ({ improvement }) => (
  <div className={`border-l-4 p-5 rounded-lg bg-white shadow-sm ${
    improvement.severity === 'critical' ? 'border-red-500' :
    improvement.severity === 'high' ? 'border-orange-500' :
    improvement.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
  }`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-bold text-gray-900">{improvement.pattern}: {improvement.title}</h4>
          <SeverityBadge severity={improvement.severity} />
        </div>
        <p className="text-gray-600 text-sm mb-2">{improvement.description}</p>
      </div>
    </div>
    <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
      <div className="text-xs text-gray-600 mb-1">Performance Impact</div>
      <div className="font-bold text-green-700">{improvement.impact}</div>
    </div>
    {improvement.maintenanceNote && (
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-blue-900 mb-1">Maintenance Tip</div>
            <div className="text-sm text-blue-800">{improvement.maintenanceNote}</div>
          </div>
        </div>
      </div>
    )}
  </div>
);

const WarningCard: React.FC<WarningCardProps> = ({ warning }) => {
  const styles = {
    critical: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800'
  };

  const icons = {
    critical: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <Lightbulb className="w-5 h-5 text-blue-600" />
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[warning.type]}`}>
      <div className="flex items-start gap-3">
        {icons[warning.type]}
        <div className="text-sm">{warning.message}</div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const PowerQueryOptimizer: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'improvements' | 'warnings'>('summary');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Power Query Optimizer v2.1 by Franklyne Andrew';
    
    console.log(
      '%c⚡ Power Query Optimizer v2.1 (Complete Edition)',
      'font-size: 20px; font-weight: bold; color: #6366f1; text-shadow: 2px 2px 4px rgba(99, 102, 241, 0.3);'
    );
    console.log(
      '%cCreated by Franklyne Andrew',
      'font-size: 14px; color: #4f46e5; font-weight: bold;'
    );
    console.log(
      '%cPower Platform Expert | M Code Specialist',
      'font-size: 12px; color: #6b7280;'
    );
    console.log(
      '%cConnect: https://www.linkedin.com/in/andrew-f-junior-b2529a146/',
      'font-size: 11px; color: #0077b5; text-decoration: underline;'
    );
    console.log(
      '%c© 2025 All Rights Reserved',
      'font-size: 10px; color: #9ca3af; font-style: italic;'
    );
  }, []);

  const sampleCode = `let
    Source = Excel.CurrentWorkbook(){[Name="Sales"]}[Content],
    #"Replaced Value1" = Table.ReplaceValue(Source,"Enterprise","Desktop",Replacer.ReplaceValue,{"Edition"}),
    #"Replaced Value2" = Table.ReplaceValue(#"Replaced Value1","Professional","Desktop",Replacer.ReplaceValue,{"Edition"}),
    #"Replaced Value3" = Table.ReplaceValue(#"Replaced Value2","Education","Desktop",Replacer.ReplaceValue,{"Edition"}),
    #"Replaced Value4" = Table.ReplaceValue(#"Replaced Value3","Core","Desktop",Replacer.ReplaceValue,{"Edition"}),
    #"Sorted Rows" = Table.Sort(#"Replaced Value4",{{"OrderDate", Order.Ascending}}),
    #"Filtered Rows" = Table.SelectRows(#"Sorted Rows", each [Status] <> "Cancelled" and [Status] <> "Deleted"),
    #"Changed Type1" = Table.TransformColumnTypes(#"Filtered Rows",{{"Amount", type number}}),
    #"Changed Type2" = Table.TransformColumnTypes(#"Changed Type1",{{"Date", type date}}),
    #"Removed Columns" = Table.RemoveColumns(#"Changed Type2",{"TempCol1", "TempCol2"})
in
    #"Removed Columns"`;

  const analyzeCode = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const optimizationResult = await optimizeWithGemini(inputCode);
      setResult(optimizationResult);
      setActiveTab('summary');
      
      const detectedSource = detectSource(inputCode);
      trackUsage('optimize', {
        stepsReduced: (optimizationResult.metrics?.originalSteps || 0) - (optimizationResult.metrics?.optimizedSteps || 0),
        patterns: optimizationResult.improvements?.map(i => i.pattern) || [],
        source: detectedSource
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = (): void => {
    setInputCode('');
    setResult(null);
    setError(null);
  };

  const copyCode = async (): Promise<void> => {
    if (result?.optimizedCode) {
      await navigator.clipboard.writeText(result.optimizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCode = (): void => {
    if (result?.optimizedCode) {
      const header = `// ============================================================================
// Power Query Optimizer - Optimized M Code
// ============================================================================
// Created by: Franklyne Andrew
// LinkedIn: https://www.linkedin.com/in/andrew-f-junior-b2529a146/
// 
// Version: 2.1 - Complete Edition
// Optimizer: 26 Mandatory Performance Patterns
// 
// This code has been automatically optimized for:
// ✓ Better performance
// ✓ Reduced memory usage
// ✓ Improved maintainability
// ✓ Query folding optimization
//
// Generated: ${new Date().toLocaleString()}
// Original Steps: ${result.metrics?.originalSteps || 'N/A'}
// Optimized Steps: ${result.metrics?.optimizedSteps || 'N/A'}
// Performance Gain: ${result.metrics?.estimatedSpeedGain || 'N/A'}
// ============================================================================
// IMPORTANT: Always test optimized code in a development environment first!
// ============================================================================

`;
      const fullContent = header + result.optimizedCode;
      const blob = new Blob([fullContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-query.pq';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(!showAdmin);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdmin]);

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Power Query Optimizer</h1>
                <p className="text-gray-600 text-sm mt-1">AI-powered • Professional-grade • Production-ready</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-indigo-600 font-semibold">by Franklyne Andrew</span>
                  <span className="text-xs text-gray-400">•</span>
                  <a 
                    href="https://www.linkedin.com/in/andrew-f-junior-b2529a146/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect
                  </a>
                  <span className="text-xs text-gray-400">•</span>
                  <button
                    onClick={() => setShowAdmin(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setInputCode(sampleCode)} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-2">
                <Code className="w-4 h-4" />
                Load Example
              </button>
              <button onClick={() => setShowHelp(!showHelp)} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Lightbulb className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                  <h2 className="text-xl md:text-2xl font-bold">How to Use Power Query Optimizer</h2>
                </div>
                <button onClick={() => setShowHelp(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">1</span>
                  <span>Paste Your M Code</span>
                </h3>
                <p className="text-sm md:text-base text-gray-700 ml-9 md:ml-10">Copy your Power Query code from Advanced Editor and paste it into the left text area.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">2</span>
                  <span>Click Optimize</span>
                </h3>
                <p className="text-sm md:text-base text-gray-700 ml-9 md:ml-10">Click the "Optimize" button and wait for AI analysis (10-30 seconds).</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">3</span>
                  <span>Review Results</span>
                </h3>
                <p className="text-sm md:text-base text-gray-700 ml-9 md:ml-10">Check the Summary tab for performance gains, Improvements tab for detailed changes, and Warnings tab for any issues.</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">4</span>
                  <span>Test Before Using</span>
                </h3>
                <div className="ml-9 md:ml-10 bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded">
                  <p className="text-sm md:text-base text-gray-700 font-medium mb-2">⚠️ Always test optimized code:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-gray-700">
                    <li>Run with your actual data</li>
                    <li>Verify row counts match</li>
                    <li>Check a few calculations</li>
                    <li>Compare before/after results</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">✓</span>
                  <span>Copy & Use</span>
                </h3>
                <p className="text-sm md:text-base text-gray-700 ml-9 md:ml-10">Use the "Copy" or "Download" buttons to save your optimized code, then paste it into Power Query Advanced Editor.</p>
              </div>

              <div className="border-t pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Common Optimizations</h3>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700"><strong>Multiple Replacements:</strong> Combines repeated value replacements into one operation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700"><strong>Early Column Selection:</strong> Removes unused columns at the source for faster processing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700"><strong>Filter Before Sort:</strong> Reduces data before sorting for better performance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                    <span className="text-gray-700"><strong>Consolidated Types:</strong> Groups type conversions together for efficiency</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-3 md:p-4 border border-indigo-200">
                <p className="text-xs md:text-sm text-indigo-800">
                  <strong>Pro Tip:</strong> Use "Load Example" to see how the optimizer works with sample code before using your own queries.
                </p>
              </div>

              <div className="border-t pt-4 md:pt-6">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 md:p-6 text-white">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="bg-white/20 p-2 md:p-3 rounded-lg flex-shrink-0">
                      <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold mb-2">About the Creator</h3>
                      <p className="text-sm md:text-base text-indigo-100 mb-3">
                        <strong className="text-white text-base md:text-lg">Franklyne Andrew</strong> is a seasoned Power Platform developer with deep expertise in Power BI, Power Automate, and Power Apps. Specializing in DAX, SQL, M code optimization, and advanced data modeling.
                      </p>
                      <a 
                        href="https://www.linkedin.com/in/andrew-f-junior-b2529a146/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-indigo-900 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm mt-2"
                      >
                        Connect on LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Your M Code
              </h2>
              <div className="flex gap-2">
                {inputCode && (
                  <button onClick={clearAll} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Clear
                  </button>
                )}
                <button onClick={analyzeCode} disabled={!inputCode || loading} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md">
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Optimize
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <textarea value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Paste your Power Query M code here..." className="w-full h-[500px] p-4 font-mono text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" spellCheck={false} />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Optimized Code
              </h2>
              <div className="flex gap-2">
                <button onClick={copyCode} disabled={!result} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-50 flex items-center gap-2 font-medium">
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadCode} disabled={!result} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-50 flex items-center gap-2 font-medium">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
            
            <textarea value={result?.optimizedCode || ''} readOnly placeholder="Optimized code will appear here..." className="w-full h-[500px] p-4 font-mono text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded-xl resize-none" spellCheck={false} />
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex border-b mb-6">
              <button onClick={() => setActiveTab('summary')} className={`px-6 py-3 font-medium ${activeTab === 'summary' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}>Summary</button>
              <button onClick={() => setActiveTab('improvements')} className={`px-6 py-3 font-medium ${activeTab === 'improvements' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}>Improvements ({result.improvements?.length || 0})</button>
              {result.warnings?.length > 0 && (
                <button onClick={() => setActiveTab('warnings')} className={`px-6 py-3 font-medium ${activeTab === 'warnings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}>Warnings ({result.warnings.length})</button>
              )}
            </div>

            {activeTab === 'summary' && (
              <div>
                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-900 text-lg mb-2">✅ Optimization Complete!</h3>
                      <p className="text-gray-700 mb-3">Before using in production:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                        <li>Test with your data</li>
                        <li>Verify row counts match</li>
                        <li>Check a few calculations</li>
                      </ol>
                      <p className="text-sm text-gray-600 mt-3 italic">This is standard practice for any code optimization.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">{result.metrics?.originalSteps || 0} → {result.metrics?.optimizedSteps || 0}</div>
                    <div className="text-sm text-gray-600">Query Steps</div>
                    <div className="text-xs text-green-600 font-bold mt-1">{result.metrics?.reduction || 0}% reduction</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{result.metrics?.estimatedSpeedGain || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Speed Improvement</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{result.improvements?.length || 0}</div>
                    <div className="text-sm text-gray-600">Patterns Applied</div>
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <p className="text-sm text-indigo-800"><strong>Ready to use:</strong> Copy and paste into Power Query Advanced Editor.</p>
                </div>
              </div>
            )}

            {activeTab === 'improvements' && (
              <div className="space-y-4">
                {result.improvements?.length > 0 ? result.improvements.map((imp, idx) => <ImprovementCard key={idx} improvement={imp} />) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Improvements Needed</h3>
                    <p className="text-gray-600">Your code is well-optimized!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'warnings' && result.warnings?.length > 0 && (
              <div className="space-y-4">
                {result.warnings.map((warning, idx) => <WarningCard key={idx} warning={warning} />)}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white py-6 mt-12 border-t-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg">Power Query Optimizer v2.1</div>
                <div className="text-xs text-indigo-200">Complete Edition - 26 Mandatory Patterns</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center md:text-right">
                <div className="text-xs text-indigo-300 mb-1">Crafted with precision by</div>
                <div className="font-bold text-white text-lg">Franklyne Andrew</div>
                <div className="text-xs text-indigo-200">Power Platform Expert • M Code Specialist</div>
              </div>
              
              <a 
                href="https://www.linkedin.com/in/andrew-f-junior-b2529a146/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-lg border border-white/20 hover:border-white/40 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <span>© 2025 Franklyne Andrew. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>v2.1 (Complete Edition)</span>
              <span>•</span>
              <span>Built with React & Gemini AI</span>
              <span>•</span>
              <span className="text-yellow-300">⚡ Enterprise-Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PowerQueryOptimizer;
