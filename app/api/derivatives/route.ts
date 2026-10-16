import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
const json=(url:string)=>fetch(url,{cache:"no-store"}).then(r=>r.json());
const sumLiquidations=async()=>{try{const [b,o]=await Promise.all([
 json("https://fapi.binance.com/fapi/v1/allForceOrders?symbol=BTCUSDT&limit=100"),
 json("https://www.okx.com/api/v5/public/liquidation-orders?instType=SWAP&uly=BTC-USDT&state=filled&limit=100")
 ]); let bl=0,bs=0; for(const x of (b||[])){const v=Number(x.origQty||0)*Number(x.price||0); if(x.side==="SELL") bl+=v; else if(x.side==="BUY") bs+=v;} let ol=0,os=0; for(const x of (o?.data||[])){const v=Number(x.sz||0)*Number(x.bkPx||x.avgPx||0); if(x.side==="sell") ol+=v; else if(x.side==="buy") os+=v;} return {longLiquidations:bl+ol,shortLiquidations:bs+os};}catch{return {longLiquidations:null,shortLiquidations:null};}};
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
 const liq=await sumLiquidations();
 const liqImbalance=liq.longLiquidations!=null&&liq.shortLiquidations!=null ? liq.longLiquidations/(Math.max(1,liq.shortLiquidations)) : 1;
 const fundingScore=fr>0.03?35:fr>0.01?55:fr>-0.01?70:fr>-0.03?60:40;
 const oiScore=oiUsd>0?70:50; const crowd=longPct>58&&fr>0.01?"LONG CROWDED":shortPct>58&&fr<-0.01?"SHORT CROWDED": "LEVERAGE HEALTHY";
 const risk=crowd==="LONG CROWDED"?"HIGH":crowd==="SHORT CROWDED"?"HIGH":"NORMAL";
 const derivativesScore=Math.round(fundingScore*.5+oiScore*.2+(100-Math.abs(longPct-50)*2)*.3);
 const liquidationScore=liq.longLiquidations!=null ? Math.max(0,Math.min(100,70-(liqImbalance-1)*20)) : 50;
 const finalScore=Math.round(derivativesScore*.75+liquidationScore*.25);
 return NextResponse.json({fundingRate:fr,okxFundingRate:okxRate,openInterest:oiUsd,longShortRatio:ratio,longPct,shortPct,crowd,risk,derivativesScore:finalScore,longLiquidations:liq.longLiquidations,shortLiquidations:liq.shortLiquidations,updatedAt:Date.now()});
 }catch(e){return NextResponse.json({error:"derivatives unavailable",updatedAt:Date.now()},{status:200})}
}