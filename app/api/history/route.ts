import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const r=await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily",{cache:"no-store"});
  const j=await r.json(); const prices=j.prices||[];
  const start=Number(prices[0]?.[1]||0),end=Number(prices.at(-1)?.[1]||0);
  return NextResponse.json({exchangeNetflowProxy:null,btc7dChange:start?(end/start-1)*100:null,history:prices.map((x:any)=>({t:x[0],p:x[1]})),provider:"CoinGecko",note:"Exchange netflow and whale flows require a dedicated on-chain provider; no fabricated values."});
 }catch{return NextResponse.json({error:"market history unavailable"})}
}