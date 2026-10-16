import { NextResponse } from "next/server";
export async function GET() {
  const [binance, okx] = await Promise.all([
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT",{cache:"no-store"}).then(r=>r.json()),
    fetch("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT",{cache:"no-store"}).then(r=>r.json())
  ]);
  const bPrice=Number(binance.lastPrice), o=okx.data?.[0];
  return NextResponse.json({
    price:bPrice, change24h:Number(binance.priceChangePercent), volume24h:Number(binance.quoteVolume),
    high24h:Number(binance.highPrice), low24h:Number(binance.lowPrice),
    okx:{price:Number(o?.last||0),bid:Number(o?.bidPx||0),ask:Number(o?.askPx||0)},
    updatedAt:Date.now()
  });
}