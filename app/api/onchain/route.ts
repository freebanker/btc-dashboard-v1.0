import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const metric=(path:string)=>fetch("https://api.glassnode.com/v1/metrics/"+path+"?a=BTC&i=24h",{headers:{"XApiKey":process.env.GLASSNODE_API_KEY||""},cache:"no-store"}).then(r=>r.ok?r.json():null);
export async function GET(){
 const out:any={configured:!!process.env.GLASSNODE_API_KEY,source:"Glassnode",mvrv:null,sopr:null,exchangeReserve:null,exchangeNetflow:null,stablecoinSupply:null};
 try{
  const stable=await fetch("https://stablecoins.llama.fi/stablecoincharts/all?stablecoin=0",{cache:"no-store"}).catch(()=>null);
  if(stable?.ok){const j=await stable.json(); const a=j?.peggedUSD?.at?.(-1)?.totalCirculatingUSD?.peggedUSD; out.stablecoinSupply=typeof a==="number"?a:null;}
 }catch{}
 if(!process.env.GLASSNODE_API_KEY) return NextResponse.json(out);
 try{
  const [mvrv,sopr,reserve,netflow]=await Promise.all([
   metric("market/mvrv"),metric("indicators/sopr"),metric("distribution/balance_exchanges"),metric("transactions/transfers_volume_exchanges_net")
  ]);
  const last=(x:any[])=>x?.at(-1)?.v??null;
  out.mvrv=last(mvrv); out.sopr=last(sopr); out.exchangeReserve=last(reserve); out.exchangeNetflow=last(netflow);
 }catch{out.error="partial on-chain feed unavailable"}
 return NextResponse.json(out);
}