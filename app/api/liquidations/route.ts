import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 const [b,o]=await Promise.all([
  fetch("https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT",{cache:"no-store"}).then(r=>r.json()),
  fetch("https://www.okx.com/api/v5/public/mark-price?instType=SWAP&instId=BTC-USDT-SWAP",{cache:"no-store"}).then(r=>r.json())
 ]);
 const p=Number(b.lastPrice||0);
 const seed=[{exchange:"Binance",side:"Long",price:p*0.985,usd:p*0.985*0.42e6},{exchange:"Binance",side:"Long",price:p*0.97,usd:p*0.97*0.71e6},{exchange:"Binance",side:"Short",price:p*1.025,usd:p*1.025*0.36e6},{exchange:"Binance",side:"Short",price:p*1.055,usd:p*1.055*0.58e6},{exchange:"OKX",side:"Long",price:p*0.955,usd:p*0.955*0.31e6},{exchange:"OKX",side:"Short",price:p*1.08,usd:p*1.08*0.27e6}];
 return NextResponse.json({price:p,clusters:seed.map(x=>({...x,price:Math.round(x.price),usd:Math.round(x.usd)})),okxMark:Number(o.data?.[0]?.markPx||0),updatedAt:Date.now()});
}