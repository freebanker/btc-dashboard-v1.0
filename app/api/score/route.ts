import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const [fg,global]=await Promise.all([
   fetch("https://api.alternative.me/fng/?limit=1",{cache:"no-store"}).then(r=>r.json()),
   fetch("https://api.coingecko.com/api/v3/global",{cache:"no-store"}).then(r=>r.json())
  ]);
  const btc=Number(global?.data?.market_cap_percentage?.btc||0);
  const fear=Number(fg?.data?.[0]?.value||50);
  const dominance=Math.min(100,btc*1.5); const score=Math.round((fear*.25)+dominance*.2+65*.2+70*.2+75*.15);
  const signal=score>=80?"ADD ON BREAKOUT":score>=68?"HOLD / WATCH":score>=55?"WAIT FOR PULLBACK":"RISK OFF";
  return NextResponse.json({score,signal,components:{sentiment:fear,dominance,derivatives:65,liquidity:70,macro:75},updatedAt:Date.now()});
 }catch{return NextResponse.json({score:50,signal:"WAIT FOR PULLBACK",components:{sentiment:50,dominance:50,derivatives:50,liquidity:50,macro:50}})}
}