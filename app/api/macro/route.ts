import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const get=(symbol:string)=>fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(symbol)+"?range=5d&interval=1d",{cache:"no-store"}).then(r=>r.ok?r.json():null);
export async function GET(){
 const symbols:any={dxy:"DX-Y.NYB",us10y:"^TNX",wti:"CL=F"};
 const out:any={source:"Yahoo Finance public chart API",dxy:null,us10y:null,wti:null,updatedAt:Date.now()};
 try{for(const k of Object.keys(symbols)){const j=await get(symbols[k]); const q=j?.chart?.result?.[0]; const p=q?.indicators?.quote?.[0]?.close?.filter((x:any)=>typeof x==="number"); out[k]=p?.at(-1)??null;}}catch{}
 return NextResponse.json(out);
}