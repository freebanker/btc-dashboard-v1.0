import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
const json=(url:string)=>fetch(url,{cache:"no-store"}).then(r=>r.json());
export async function GET(){
 try{
  const [fund,oi,binPos,okxPos]=await Promise.all([
   json("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT"),
   json("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT"),
   json("https://fapi.binance.com/fapi/v1/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1"),
   json("https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP")
  ]);
  const fr=Number(fund.lastFundingRate||0)*100;
  const oiUsd=Number(oi.openInterest||0)*Number(fund.markPrice||0);
  const ratio=Number(binPos?.[0]?.longShortRatio||0);
  const okxRate=Number(okxPos?.data?.[0]?.fundingRate||0)*100;
  return NextResponse.json({fundingRate:fr,okxFundingRate:okxRate,openInterest:oiUsd,longShortRatio:ratio,longPct:ratio>0?ratio/(1+ratio)*100:0,shortPct:ratio>0?100-ratio/(1+ratio)*100:0,updatedAt:Date.now()});
 }catch(e){return NextResponse.json({error:"derivatives unavailable",updatedAt:Date.now()},{status:200})}
}