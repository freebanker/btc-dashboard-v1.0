import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const metric=(path:string)=>fetch("https://api.glassnode.com/v1/metrics/"+path+"?a=BTC&i=24h",{headers:{XApiKey:process.env.GLASSNODE_API_KEY||""},cache:"no-store"}).then(r=>r.ok?r.json():null);
export async function GET(){
 if(!process.env.GLASSNODE_API_KEY) return NextResponse.json({configured:false,source:"Glassnode",message:"GLASSNODE_API_KEY is not configured"});
 try{
  const [mvrv,sopr]=await Promise.all([metric("market/mvrv"),metric("indicators/sopr")]);
  const last=(x:any[])=>x?.at(-1)?.v??null;
  return NextResponse.json({configured:true,source:"Glassnode",mvrv:last(mvrv),sopr:last(sopr),updatedAt:Date.now()});
 }catch{return NextResponse.json({configured:true,error:"on-chain provider unavailable"})}
}