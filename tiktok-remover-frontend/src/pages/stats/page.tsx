import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import './stats.css';

interface OverviewStats {
  total_sessions: number;
  unique_users: number;
  unique_countries: number;
  unique_ips: number;
  avg_reposts_found: number;
  avg_reposts_removed: number;
  completed_sessions: number;
  error_sessions: number;
  success_rate: number;
}

interface CountryDistribution {
  country: string;
  user_count: number;
}

interface DailySession {
  date: string;
  unique_ip_count: number;
  unique_tiktok_username_count: number;
  total_session_count: number;
}

interface RepostsStats {
  date: string;
  avg_total_reposts_found: number;
  avg_reposts_removed: number;
  min_total_reposts_found: number;
  max_total_reposts_found: number;
  min_reposts_removed: number;
  max_reposts_removed: number;
  total_sessions: number;
  sessions_with_reposts: number;
}

interface ErrorStats {
  date: string;
  error_message: string;
  error_count: number;
}

interface FeedbackTrendItem {
  date: string;
  feedback_count: number;
  avg_rating: number;
}

interface FeedbackStats {
  ratingDistribution: Array<{
    rating_score: number;
    count: number;
  }>;
  feedbackTrend: Array<FeedbackTrendItem>;
  feedbackTexts: Array<{
    id: number;
    rating_score: number;
    feedback_text: string;
    created_at: string;
    country: string;
    text_length: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7300'];

const StatsPage: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [countryDistribution, setCountryDistribution] = useState<CountryDistribution[]>([]);
  const [dailySessions, setDailySessions] = useState<DailySession[]>([]);
  const [repostsStats, setRepostsStats] = useState<RepostsStats[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.tiktokrepostremover.com';

      const [
        overviewRes,
        countryRes,
        dailyRes,
        repostsRes,
        errorRes,
        feedbackRes
      ] = await Promise.all([
        fetch(`${baseUrl}/stats/overview`),
        fetch(`${baseUrl}/stats/country-distribution`),
        fetch(`${baseUrl}/stats/daily-sessions`),
        fetch(`${baseUrl}/stats/reposts-stats`),
        fetch(`${baseUrl}/stats/error-stats`),
        fetch(`${baseUrl}/stats/feedback-stats`)
      ]);

      if (!overviewRes.ok || !countryRes.ok || !dailyRes.ok || !repostsRes.ok || !errorRes.ok || !feedbackRes.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const [overviewData, countryData, dailyData, repostsData, errorData, feedbackData] = await Promise.all([
        overviewRes.json(),
        countryRes.json(),
        dailyRes.json(),
        repostsRes.json(),
        errorRes.json(),
        feedbackRes.json()
      ]);

      setOverview(overviewData.data);
      setCountryDistribution(countryData.data);
      setDailySessions(dailyData.data.sort((a: DailySession, b: DailySession) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setRepostsStats(repostsData.data.sort((a: RepostsStats, b: RepostsStats) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setErrorStats(errorData.data.sort((a: ErrorStats, b: ErrorStats) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setFeedbackStats({
        ...feedbackData.data,
        feedbackTrend: feedbackData.data.feedbackTrend.sort((a: FeedbackTrendItem, b: FeedbackTrendItem) => new Date(a.date).getTime() - new Date(b.date).getTime())
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Statistics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 stats-container">
      <h1 className="text-3xl font-bold mb-8 stats-title">Statistics Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 overview-grid">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overview-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold card-value">{overview?.total_sessions?.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white overview-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold card-value">{overview?.unique_users?.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white overview-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold card-value">{overview?.success_rate?.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white overview-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold card-value">{overview?.unique_countries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Tabs */}
      <Tabs defaultValue="daily" className="space-y-6 stats-tabs">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="daily">Daily Sessions</TabsTrigger>
          <TabsTrigger value="country">Countries</TabsTrigger>
          <TabsTrigger value="reposts">Reposts</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4 tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stats-grid">
            <Card>
              <CardHeader>
                <CardTitle>Daily Session Trends</CardTitle>
                <CardDescription>Unique IPs, Users, and Total Sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySessions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="unique_ip_count" stackId="1" stroke="#8884d8" fill="#8884d8" name="Unique IPs" />
                    <Area type="monotone" dataKey="unique_tiktok_username_count" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Unique Users" />
                    <Area type="monotone" dataKey="total_session_count" stackId="1" stroke="#ffc658" fill="#ffc658" name="Total Sessions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Session Comparison</CardTitle>
                <CardDescription>Bar chart comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySessions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="unique_ip_count" fill="#8884d8" name="Unique IPs" />
                    <Bar dataKey="unique_tiktok_username_count" fill="#82ca9d" name="Unique Users" />
                    <Bar dataKey="total_session_count" fill="#ffc658" name="Total Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="country" className="space-y-4 tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stats-grid">
            <Card>
              <CardHeader>
                <CardTitle>Country Distribution</CardTitle>
                <CardDescription>Top 10 countries by user count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={countryDistribution.slice(0, 10)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ country, user_count }) => `${country}: ${user_count}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="user_count"
                    >
                      {countryDistribution.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>User count by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 country-list">
                  {countryDistribution.slice(0, 10).map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg country-item">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{country.country}</span>
                      </div>
                                              <Badge variant="secondary" className="stats-badge">{country.user_count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reposts" className="space-y-4 tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stats-grid">
            <Card>
              <CardHeader>
                <CardTitle>Reposts Statistics</CardTitle>
                <CardDescription>Average and range of reposts found/removed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={repostsStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avg_total_reposts_found" stroke="#8884d8" name="Avg Found" strokeWidth={2} />
                    <Line type="monotone" dataKey="avg_reposts_removed" stroke="#82ca9d" name="Avg Removed" strokeWidth={2} />
                    <Line type="monotone" dataKey="max_total_reposts_found" stroke="#ffc658" name="Max Found" strokeWidth={1} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="max_reposts_removed" stroke="#ff7300" name="Max Removed" strokeWidth={1} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
                <CardDescription>Total sessions and sessions with reposts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={repostsStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_sessions" fill="#8884d8" name="Total Sessions" />
                    <Bar dataKey="sessions_with_reposts" fill="#82ca9d" name="Sessions with Reposts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4 tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>Error messages and their frequency (Last 3 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                  {errorStats.length === 0 ? (
                    <div className="text-center py-8 empty-state">
                      <div className="text-6xl mb-4 empty-icon">🎉</div>
                      <p className="text-muted-foreground text-lg empty-text">No errors recorded in the last 3 days!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {errorStats.map((error, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-red-50 error-card">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="destructive">{error.error_count} occurrences</Badge>
                          <span className="text-sm text-gray-500">{error.date}</span>
                        </div>
                                                  <p className="text-sm text-gray-700 font-medium error-message">{error.error_message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 tab-content">
          {feedbackStats && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stats-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>User ratings breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={feedbackStats.ratingDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ rating_score, count }) => `${rating_score}★: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {feedbackStats.ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Trend</CardTitle>
                    <CardDescription>Daily feedback count and average rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={feedbackStats.feedbackTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="feedback_count" stroke="#8884d8" name="Feedback Count" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="avg_rating" stroke="#82ca9d" name="Avg Rating" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Feedback Details</CardTitle>
                  <CardDescription>Recent feedback texts (length &gt; 20 characters)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackStats.feedbackTexts && feedbackStats.feedbackTexts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedbackStats.feedbackTexts.map((feedback, index) => (
                          <div key={feedback.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow feedback-card">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2">
                                <span className="text-yellow-500 text-lg">{'★'.repeat(feedback.rating_score)}</span>
                                <span className="text-gray-300">{'★'.repeat(5 - feedback.rating_score)}</span>
                                <Badge variant="outline" className="text-xs stats-badge">{feedback.country || 'Unknown'}</Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed feedback-content">
                              {feedback.feedback_text}
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center feedback-meta">
                              <span>Length: {feedback.text_length} characters</span>
                              <span>ID: #{feedback.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 empty-state">
                        <div className="text-6xl mb-4 empty-icon">📝</div>
                        <p className="text-muted-foreground text-lg empty-text">No detailed feedback available.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage; 