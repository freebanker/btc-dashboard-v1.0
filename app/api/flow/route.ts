import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const [btc,stable]=await Promise.all([
   fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30",{cache:"no-store"}).then(r=>r.json()),
   fetch("https://api.coingecko.com/api/v3/global",{cache:"no-store"}).then(r=>r.json())
  ]);
  const c=(btc||[]).map((x:any)=>Number(x[4])); const last=c.at(-1)||0; const prev=c.at(-2)||last;
  return NextResponse.json({btc7d:last/(c.at(-8)||last)-1,btc30d:last/(c[0]||last)-1,totalCryptoMcap:Number(stable?.data?.total_market_cap?.usd||0),btcDominance:Number(stable?.data?.market_cap_percentage?.btc||0),updatedAt:Date.now()});
 }catch{return NextResponse.json({error:"flow unavailable"})}
}