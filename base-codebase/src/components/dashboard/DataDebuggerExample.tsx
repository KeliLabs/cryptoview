import DataDebugger from './DataDebugger';

export default function DataDebuggerExample() {
  return (
    <div className="space-y-6">
      {/* Basic GET endpoint debugger */}
      <DataDebugger 
        title="Cryptocurrency Data"
        endpoint="/api/cryptocurrencies"
        autoRefresh={true}
        refreshInterval={30000}
      />

      {/* POST endpoint debugger with refresh functionality */}
      <DataDebugger 
        title="Refresh Data Monitor"
        endpoint="/api/cryptocurrencies"
        method="GET"
        refreshEndpoint="/api/refresh-data"
        autoRefresh={false}
      />

      {/* Historical data debugger */}
      <DataDebugger 
        title="Historical Data"
        endpoint="/api/historical-data"
        method="GET"
        refreshEndpoint="/api/refresh-data"
        autoRefresh={false}
      />

      {/* POST endpoint with data */}
      <DataDebugger 
        title="Custom POST Request"
        endpoint="/api/refresh-data"
        method="POST"
        postData={{
          symbols: ['BTC', 'ETH'],
          forceRefresh: true
        }}
        autoRefresh={false}
      />
    </div>
  );
}
