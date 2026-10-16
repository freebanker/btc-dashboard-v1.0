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
  const longPct=ratio>0?ratio/(1+ratio)*100:50; const shortPct=100-longPct;
 const fundingScore=fr>0.03?35:fr>0.01?55:fr>-0.01?70:fr>-0.03?60:40;
 const oiScore=oiUsd>0?70:50; const crowd=longPct>58&&fr>0.01?"LONG CROWDED":shortPct>58&&fr<-0.01?"SHORT CROWDED": "LEVERAGE HEALTHY";
 const risk=crowd==="LONG CROWDED"?"HIGH":crowd==="SHORT CROWDED"?"HIGH":"NORMAL";
 const derivativesScore=Math.round(fundingScore*.5+oiScore*.2+(100-Math.abs(longPct-50)*2)*.3);
 return NextResponse.json({fundingRate:fr,okxFundingRate:okxRate,openInterest:oiUsd,longShortRatio:ratio,longPct,shortPct,crowd,risk,derivativesScore,updatedAt:Date.now()});
 }catch(e){return NextResponse.json({error:"derivatives unavailable",updatedAt:Date.now()},{status:200})}
}