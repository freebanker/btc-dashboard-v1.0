import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const num=(s:string)=>{const t=s.replace(/,/g,"").trim(); if(!t||t==="-"||t==="—") return null; const neg=/^\(.*\)$/.test(t); const v=Number(t.replace(/[()]/g,"")); return Number.isFinite(v)?(neg?-v:v):null};
export async function GET(){
 try{
  const r=await fetch("https://farside.co.uk/btc/",{cache:"no-store",headers:{"user-agent":"Mozilla/5.0"}});
  if(!r.ok) throw new Error("Farside HTTP "+r.status);
  const html=await r.text();
  const rows=[...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>x[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").trim()));
  const data=rows.filter(x=>/^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(x[0]||"")).map(x=>({date:x[0],total:num(x.at(-1)||"")}));
  const latest=data.at(-1)||null;
  const valid=data.filter(x=>x.total!==null);
  const last7=valid.slice(-7).reduce((a,x)=>a+(x.total||0),0);
  return NextResponse.json({source:"Farside Investors",latest,sevenDayNetFlow:last7,days:valid.slice(-7),updatedAt:Date.now()});
 }catch(e){return NextResponse.json({source:"Farside Investors",error:"ETF flow feed unavailable",updatedAt:Date.now()},{status:200})}
}