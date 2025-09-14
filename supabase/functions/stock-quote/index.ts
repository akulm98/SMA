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

    // Get access token from environment variables
    const accessToken = Deno.env.get('UPSTOX_ACCESS_TOKEN');
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Upstox access token not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Make actual API call to Upstox
    const upstoxUrl = `https://api.upstox.com/v2/market-quote/ohlc?symbol=NSE_EQ%7C${symbol}`;
    
    const upstoxResponse = await fetch(upstoxUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!upstoxResponse.ok) {
      const errorText = await upstoxResponse.text();
      console.error(`Upstox API error for ${symbol}:`, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch data for ${symbol}`,
          details: errorText
        }),
        {
          status: upstoxResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const upstoxData: UpstoxQuoteResponse = await upstoxResponse.json();
    
    if (upstoxData.status !== 'success' || !upstoxData.data) {
      return new Response(
        JSON.stringify({ 
          error: `No data available for ${symbol}`,
          details: upstoxData
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Extract data for the symbol
    const symbolKey = `NSE_EQ|${symbol}`;
    const stockData = upstoxData.data[symbolKey];
    
    if (!stockData) {
      return new Response(
        JSON.stringify({ 
          error: `No data found for symbol ${symbol}`,
          availableSymbols: Object.keys(upstoxData.data)
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Calculate change and change percentage
    const change = stockData.ltp - stockData.prev_close_price;
    const changePercent = (change / stockData.prev_close_price) * 100;

    const responseData = {
      companyName: symbol, // You might want to maintain a mapping of symbols to company names
      ltp: stockData.ltp,
      open: stockData.ohlc.open,
      high: stockData.ohlc.high,
      low: stockData.ohlc.low,
      previousClose: stockData.prev_close_price,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: stockData.volume,
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