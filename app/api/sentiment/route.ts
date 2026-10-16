import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const get=(u:string)=>fetch(u,{cache:"no-store"}).then(r=>r.json());
export async function GET(){
 try{
  const [fg,bin]=await Promise.all([
   get("https://api.alternative.me/fng/?limit=1"),
   get("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30")
  ]);
  const closes=(bin||[]).map((x:any)=>Number(x[4]));
  const ret=closes.length>1?(closes.at(-1)/closes[0]-1)*100:0;
  return NextResponse.json({fearGreed:Number(fg?.data?.[0]?.value||0),fearGreedLabel:fg?.data?.[0]?.value_classification||"Unknown",days30Return:ret,updatedAt:Date.now()});
 }catch{return NextResponse.json({error:"macro unavailable"})}
}