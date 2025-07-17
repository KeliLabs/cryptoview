'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, AlertCircle, CheckCircle, Clock, Eye, EyeOff, Zap } from 'lucide-react';
import JsonDisplay from '@/components/utils/jsondisplay';

interface DebugData {
  timestamp: string;
  status: 'success' | 'error' | 'loading';
  data: unknown;
  error?: string;
  duration?: number;
}

interface DataDebuggerProps {
  title?: string;
  endpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  method?: 'GET' | 'POST';
  refreshEndpoint?: string;
  postData?: Record<string, unknown>;
}

export default function DataDebugger({ 
  title = 'Data Debugger',
  endpoint = '/api/cryptocurrencies',
  autoRefresh = false,
  refreshInterval = 30000,
  method = 'GET',
  refreshEndpoint,
  postData
}: DataDebuggerProps) {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && postData) {
        fetchOptions.body = JSON.stringify(postData);
      }

      const response = await fetch(endpoint, fetchOptions);
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      setDebugData({
        timestamp: new Date().toISOString(),
        status: response.ok ? 'success' : 'error',
        data,
        duration,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      setDebugData({
        timestamp: new Date().toISOString(),
        status: 'error',
        data: null,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, method, postData]);

  const triggerRefresh = useCallback(async () => {
    if (!refreshEndpoint) return;
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch(refreshEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // After successful refresh, fetch the latest data
        await fetchData();
      } else {
        throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setDebugData(prev => prev ? {
        ...prev,
        error: error instanceof Error ? error.message : 'Refresh failed'
      } : null);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEndpoint, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval, fetchData]);

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-4 w-4 animate-spin" />;
    if (!debugData) return <Database className="h-4 w-4" />;
    
    switch (debugData.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Loading...</Badge>;
    if (!debugData) return <Badge variant="secondary">No Data</Badge>;
    
    switch (debugData.status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {refreshEndpoint && (
              <Button
                variant="outline"
                size="sm"
                onClick={triggerRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-2"
              >
                <Zap className={`h-4 w-4 ${isRefreshing ? 'animate-pulse' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={autoRefreshEnabled ? 'bg-blue-50 border-blue-200' : ''}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
              Auto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Fetch
            </Button>
          </div>
        </div>
        <CardDescription>
          <span className="space-y-1 block">
            <span className="block">
              Endpoint: <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{method} {endpoint}</code>
            </span>
            {refreshEndpoint && (
              <span className="block">
                Refresh: <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">POST {refreshEndpoint}</code>
              </span>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {debugData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-sm text-gray-600">
                {new Date(debugData.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Response Time</div>
              <div className="text-sm text-gray-600">
                {debugData.duration ? `${debugData.duration}ms` : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Data Size</div>
              <div className="text-sm text-gray-600">
                {debugData.data ? `${JSON.stringify(debugData.data).length} chars` : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {debugData?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <div className="font-medium">Error</div>
            </div>
            <div className="text-sm text-red-600 mt-1">{debugData.error}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Response Data</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showJson ? 'Hide' : 'Show'} JSON
            </Button>
          </div>
          
          {showJson && debugData?.data && (
            <div className="max-h-96 overflow-auto bg-gray-50 p-3 rounded-md">
              <JsonDisplay jsonData={debugData.data} />
            </div>
          )}
        </div>

        {debugData?.data && !showJson && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">
              Data loaded successfully. Click &quot;Show JSON&quot; to view the raw response.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
