import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const clamp=(x:number)=>Math.max(0,Math.min(100,x));
async function json(url:string){const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error("feed"); return r.json();}
export async function GET(){
 try{
  const [fg,global,macro]=await Promise.all([
   json("https://api.alternative.me/fng/?limit=1"),
   json("https://api.coingecko.com/api/v3/global"),
   json(new URL("/api/macro",process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000").toString()).catch(()=>({dxy:null,us10y:null,wti:null}))
  ]);
  const fear=Number(fg?.data?.[0]?.value||50), btcDom=Number(global?.data?.market_cap_percentage?.btc||0);
  const sentiment=clamp(fear), dominance=clamp(btcDom*1.5);
  const macroScore=macro.dxy!=null&&macro.us10y!=null ? clamp(50+(102-macro.dxy)*8+(5.2-macro.us10y)*18) : 50;
  const derivatives=65, liquidity=70;
  const score=Math.round(sentiment*.25+dominance*.2+derivatives*.2+liquidity*.2+macroScore*.15);
  const signal=score>=80?"ADD ON BREAKOUT":score>=68?"HOLD / WATCH":score>=55?"WAIT FOR PULLBACK":"RISK OFF";
  return NextResponse.json({score,signal,components:{sentiment,dominance,derivatives,liquidity,macro:macroScore},updatedAt:Date.now()});
 }catch{return NextResponse.json({score:50,signal:"WAIT FOR PULLBACK",components:{sentiment:50,dominance:50,derivatives:50,liquidity:50,macro:50},error:true})}
}