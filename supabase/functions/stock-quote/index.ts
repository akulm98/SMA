const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface UpstoxQuoteResponse {
  status: string;
  data: {
    [symbol: string]: {
      ohlc: {
        open: number;
        high: number;
        low: number;
        close: number;
      };
      ltp: number;
      prev_close_price: number;
      volume: number;
    };
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symbol } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Note: In a real application, you would need to:
    // 1. Set up proper authentication with Upstox API
    // 2. Store your API key securely in environment variables
    // 3. Handle OAuth flow if required
    
    // For demo purposes, we'll return mock data
    // Replace this with actual Upstox API call:
    // const upstoxUrl = `https://api.upstox.com/v2/market-quote/ohlc?symbol=${symbol}`;
    // const response = await fetch(upstoxUrl, {
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('UPSTOX_ACCESS_TOKEN')}`,
    //     'Accept': 'application/json'
    //   }
    // });

    // Mock data for demonstration - replace with actual API call
    const mockData = {
      companyName: symbol === 'RELIANCE' ? 'Reliance Industries Ltd.' :
                   symbol === 'TCS' ? 'Tata Consultancy Services Ltd.' :
                   symbol === 'INFY' ? 'Infosys Ltd.' :
                   symbol === 'HDFCBANK' ? 'HDFC Bank Ltd.' :
                   symbol === 'ICICIBANK' ? 'ICICI Bank Ltd.' :
                   `${symbol} Ltd.`,
      ltp: Math.random() * 1000 + 100,
      open: Math.random() * 1000 + 100,
      high: Math.random() * 1000 + 150,
      low: Math.random() * 1000 + 50,
      previousClose: Math.random() * 1000 + 100,
      volume: Math.floor(Math.random() * 1000000) + 10000,
    };

    // Calculate change and change percentage
    const change = mockData.ltp - mockData.previousClose;
    const changePercent = (change / mockData.previousClose) * 100;

    const responseData = {
      ...mockData,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error fetching stock data:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});