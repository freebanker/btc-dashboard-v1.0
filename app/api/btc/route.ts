import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export const revalidate=0;
async function getJson(url:string){const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error("upstream"); return r.json();}
export async function GET(){
 try{
  const [binance,okx]=await Promise.all([
   getJson("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"),
   getJson("https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT")
  ]);
  const bPrice=Number(binance?.lastPrice), o=okx?.data?.[0];
  if(!Number.isFinite(bPrice)||bPrice<=0) throw new Error("invalid price");
  return NextResponse.json({
   price:bPrice,change24h:Number(binance.priceChangePercent),volume24h:Number(binance.quoteVolume),
   high24h:Number(binance.highPrice),low24h:Number(binance.lowPrice),
   okx:{price:Number(o?.last||0),bid:Number(o?.bidPx||0),ask:Number(o?.askPx||0)},updatedAt:Date.now()
  },{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(e){return NextResponse.json({error:"BTC market feed unavailable",updatedAt:Date.now()},{status:503});}
}