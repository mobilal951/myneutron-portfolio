"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Users,
  Bot,
  Loader2,
  AlertCircle,
  TrendingUp,
  Search,
  Clock,
  Hash,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Minus,
  Lightbulb,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Mail,
  CreditCard,
  User,
} from "lucide-react";

interface ChatStats {
  summary: {
    totalChats: number;
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    avgMessagesPerChat: number;
    responseRate: number;
  };
  healthScore: {
    score: number;
    label: string;
    color: string;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
  };
  issues: {
    totalChatsWithIssues: number;
    percentage: number;
    breakdown: Array<{ issue: string; count: number; percentage: number }>;
  };
  insights: string[];
  activity: {
    messagesPerDay: Array<{ date: string; count: number }>;
    chatsPerDay: Array<{ date: string; count: number }>;
  };
  topKeywords: Array<{ word: string; count: number }>;
  recentQueries: Array<{
    id: string;
    chatId: string;
    query: string;
    createdAt: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    hasIssues: boolean;
  }>;
  chatSummaries: Array<{
    chatId: string;
    messageCount: number;
    userMessages: number;
    botMessages: number;
    firstQuery: string;
    lastActivity: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    issues: string[];
    preview: string;
  }>;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

function SentimentIcon({ sentiment }: { sentiment: 'positive' | 'negative' | 'neutral' }) {
  if (sentiment === 'positive') return <ThumbsUp className="h-3 w-3 text-green-500" />;
  if (sentiment === 'negative') return <ThumbsDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-400" />;
}

function HealthScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const colorClasses = {
    green: 'text-green-500 bg-green-100 border-green-200',
    blue: 'text-blue-500 bg-blue-100 border-blue-200',
    yellow: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    red: 'text-red-500 bg-red-100 border-red-200',
  };
  const bgColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'yellow' ? '#eab308' : '#ef4444'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.51} 251`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        {label}
      </span>
    </div>
  );
}

export default function AIAssistantPage() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  const prevDateRange = useRef(dateRange);

  // Filter and drill-down state
  const [selectedIssueFilter, setSelectedIssueFilter] = useState<string | null>(null);
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ role: string; text: string; createdAt: string }>>>({});

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const response = await fetch(`/api/db/chat-stats?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    initialFetchDone.current = true;
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) return;

    const prevFrom = prevDateRange.current?.from?.getTime();
    const prevTo = prevDateRange.current?.to?.getTime();
    const newFrom = dateRange?.from?.getTime();
    const newTo = dateRange?.to?.getTime();

    if (prevFrom !== newFrom || prevTo !== newTo) {
      prevDateRange.current = dateRange;
      if (dateRange?.from && dateRange?.to) {
        fetchData(true);
      }
    }
  }, [dateRange]);

  // Fetch full chat messages for a conversation
  const fetchChatMessages = async (chatId: string) => {
    if (chatMessages[chatId]) return; // Already fetched

    try {
      const response = await fetch(`/api/db/chat-messages?chatId=${chatId}`);
      const result = await response.json();
      if (response.ok) {
        setChatMessages(prev => ({ ...prev, [chatId]: result.messages }));
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  // Handle expanding a conversation
  const handleExpandChat = (chatId: string) => {
    if (expandedChatId === chatId) {
      setExpandedChatId(null);
    } else {
      setExpandedChatId(chatId);
      fetchChatMessages(chatId);
    }
  };

  // Filter conversations based on selected filters
  const getFilteredConversations = () => {
    if (!data) return [];
    let filtered = data.chatSummaries;

    if (selectedIssueFilter) {
      filtered = filtered.filter(chat => chat.issues.includes(selectedIssueFilter));
    }

    if (selectedSentimentFilter) {
      filtered = filtered.filter(chat => chat.sentiment === selectedSentimentFilter);
    }

    return filtered;
  };

  const filteredConversations = getFilteredConversations();
  const activeFilters = selectedIssueFilter || selectedSentimentFilter;

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="AI Assistant Analytics" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="AI Assistant Analytics" />
        <div className="flex-1 p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Failed to load data"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, healthScore, sentiment, issues, insights, topKeywords, recentQueries, chatSummaries, activity } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="AI Assistant Analytics" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">

        {/* Health Score & Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health Score */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Chat Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <HealthScoreGauge
                score={healthScore.score}
                label={healthScore.label}
                color={healthScore.color}
              />
            </CardContent>
          </Card>

          {/* Sentiment Breakdown - Clickable */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                User Sentiment
                <span className="text-xs text-muted-foreground ml-2">Click to filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <button
                onClick={() => {
                  if (selectedSentimentFilter === 'positive') {
                    setSelectedSentimentFilter(null);
                  } else {
                    setSelectedSentimentFilter('positive');
                    setSelectedIssueFilter(null);
                  }
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  selectedSentimentFilter === 'positive' ? 'bg-green-100 ring-2 ring-green-300' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Positive</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${sentiment.positivePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {sentiment.positive} ({sentiment.positivePercentage}%)
                </span>
              </button>
              <button
                onClick={() => {
                  if (selectedSentimentFilter === 'neutral') {
                    setSelectedSentimentFilter(null);
                  } else {
                    setSelectedSentimentFilter('neutral');
                    setSelectedIssueFilter(null);
                  }
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  selectedSentimentFilter === 'neutral' ? 'bg-gray-200 ring-2 ring-gray-400' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Minus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Neutral</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${100 - sentiment.positivePercentage - sentiment.negativePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {sentiment.neutral} ({100 - sentiment.positivePercentage - sentiment.negativePercentage}%)
                </span>
              </button>
              <button
                onClick={() => {
                  if (selectedSentimentFilter === 'negative') {
                    setSelectedSentimentFilter(null);
                  } else {
                    setSelectedSentimentFilter('negative');
                    setSelectedIssueFilter(null);
                  }
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  selectedSentimentFilter === 'negative' ? 'bg-red-100 ring-2 ring-red-300' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Negative</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${sentiment.negativePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {sentiment.negative} ({sentiment.negativePercentage}%)
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Chats</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(summary.totalChats)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Messages</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.totalMessages)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">User Messages</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(summary.userMessages)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-indigo-500" />
                <span className="text-xs text-muted-foreground">Bot Responses</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{formatNumber(summary.assistantMessages)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-teal-500" />
                <span className="text-xs text-muted-foreground">Avg/Chat</span>
              </div>
              <p className="text-2xl font-bold text-teal-600">{summary.avgMessagesPerChat}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Response Rate</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{summary.responseRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Issues Section - Clickable Filters */}
        {issues.breakdown.length > 0 && (
          <Card className="bg-white border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Detected Issues ({issues.totalChatsWithIssues} chats - {issues.percentage}%)
                <span className="text-xs text-muted-foreground ml-2">Click to filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {issues.breakdown.map((issue, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedIssueFilter === issue.issue) {
                        setSelectedIssueFilter(null);
                      } else {
                        setSelectedIssueFilter(issue.issue);
                        setSelectedSentimentFilter(null);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                      selectedIssueFilter === issue.issue
                        ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                        : 'bg-orange-50 hover:bg-orange-100 text-gray-700'
                    }`}
                  >
                    <span className="text-sm text-left">{issue.issue}</span>
                    <span className={`text-sm font-medium ${selectedIssueFilter === issue.issue ? 'text-white' : 'text-orange-600'}`}>
                      {issue.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Keywords */}
        {topKeywords.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                What Users Are Asking About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topKeywords.map((kw, idx) => (
                  <div
                    key={kw.word}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                      idx < 5
                        ? "bg-blue-100 text-blue-700"
                        : idx < 10
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{kw.word}</span>
                    <span className="text-xs opacity-70 bg-white/50 px-1.5 py-0.5 rounded">
                      {kw.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Conversations with Analysis - Filterable & Expandable */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                {activeFilters ? 'Filtered Conversations' : 'Recent Conversations'}
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredConversations.length} {activeFilters ? 'matching' : 'total'})
                </span>
              </div>
              {activeFilters && (
                <button
                  onClick={() => {
                    setSelectedIssueFilter(null);
                    setSelectedSentimentFilter(null);
                  }}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  Clear Filter
                </button>
              )}
            </CardTitle>
            {activeFilters && (
              <div className="flex items-center gap-2 mt-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtering by:</span>
                {selectedIssueFilter && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {selectedIssueFilter}
                  </span>
                )}
                {selectedSentimentFilter && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedSentimentFilter === 'negative' ? 'bg-red-100 text-red-700' :
                    selectedSentimentFilter === 'positive' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedSentimentFilter} sentiment
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[800px] overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((chat) => (
                  <div
                    key={chat.chatId}
                    className={`rounded-lg border transition-all ${
                      chat.issues.length > 0
                        ? 'bg-orange-50 border-orange-200'
                        : chat.sentiment === 'positive'
                        ? 'bg-green-50 border-green-200'
                        : chat.sentiment === 'negative'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Chat Summary Header - Clickable */}
                    <button
                      onClick={() => handleExpandChat(chat.chatId)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium line-clamp-2">
                            {chat.firstQuery || "No user message"}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {chat.messageCount} msgs
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {chat.userMessages} user / {chat.botMessages} bot
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(chat.lastActivity)}
                            </span>
                            <span className="flex items-center gap-1">
                              <SentimentIcon sentiment={chat.sentiment} />
                              {chat.sentiment}
                            </span>
                          </div>
                          {chat.issues.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {chat.issues.map((issue, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                  {issue}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {expandedChatId === chat.chatId ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Chat Messages */}
                    {expandedChatId === chat.chatId && (
                      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        {/* User Info if available */}
                        {chatMessages[chat.chatId] && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Chat Details</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                ID: {chat.chatId.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Full Conversation */}
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground font-medium">Full Conversation:</p>
                          {chatMessages[chat.chatId] ? (
                            chatMessages[chat.chatId].map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  msg.role === 'user'
                                    ? 'bg-blue-50 border border-blue-100 ml-0 mr-8'
                                    : 'bg-gray-50 border border-gray-100 ml-8 mr-0'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {msg.role === 'user' ? (
                                    <User className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <Bot className="h-3 w-3 text-gray-500" />
                                  )}
                                  <span className="text-xs font-medium">
                                    {msg.role === 'user' ? 'User' : 'Assistant'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                              <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {activeFilters ? 'No conversations match the selected filter' : 'No conversations in this date range'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Chart */}
        {activity.messagesPerDay.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {(() => {
                  const maxCount = Math.max(...activity.messagesPerDay.map(d => d.count), 1);
                  const chartHeight = 140;
                  const barMaxHeight = 120;
                  // Calculate nice scale values
                  const scaleSteps = [0, Math.round(maxCount / 2), maxCount];

                  return (
                    <div className="flex min-w-[600px]">
                      {/* Y-axis scale */}
                      <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground" style={{ height: `${chartHeight}px` }}>
                        <span>{maxCount}</span>
                        <span>{Math.round(maxCount / 2)}</span>
                        <span>0</span>
                      </div>

                      {/* Chart area */}
                      <div className="flex-1">
                        <div className="flex items-end gap-1 border-l border-b border-gray-200" style={{ height: `${chartHeight}px` }}>
                          {activity.messagesPerDay.map((day) => {
                            const heightPx = Math.max((day.count / maxCount) * barMaxHeight, 4);
                            return (
                              <div
                                key={day.date}
                                className="flex-1 flex flex-col items-center justify-end gap-0.5"
                              >
                                {/* Data label - always show if there's data */}
                                {day.count > 0 && (
                                  <span className="text-[9px] text-gray-600 font-medium leading-none">
                                    {day.count}
                                  </span>
                                )}
                                <div
                                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer min-w-[4px]"
                                  style={{ height: `${heightPx}px` }}
                                  title={`${formatDate(day.date)}: ${day.count} messages`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>{formatDate(activity.messagesPerDay[0].date)}</span>
                          {activity.messagesPerDay.length > 7 && (
                            <span>{formatDate(activity.messagesPerDay[Math.floor(activity.messagesPerDay.length / 2)].date)}</span>
                          )}
                          <span>{formatDate(activity.messagesPerDay[activity.messagesPerDay.length - 1].date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
