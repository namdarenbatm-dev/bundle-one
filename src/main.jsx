import React,{useMemo,useState,useEffect,Component} from 'react';
import{createRoot}from'react-dom/client';
import{Wallet,PackageCheck,TrendingUp,ShieldCheck,Search,Download,Printer,Info,Calculator,Settings2}from'lucide-react';
import'./styles.css';
const fmt=n=>Math.round(n*100)/100 .toLocaleString('fa-IR');
const money=n=>Number(n).toLocaleString('fa-IR',{maximumFractionDigits:2});
const asset=p=>new URL('assets/'+p,document.baseURI).href;
function Splash({onDone}){
 const[step,setStep]=useState(0);
 useEffect(()=>{const t1=setTimeout(()=>setStep(1),1500),t2=setTimeout(onDone,5000);return()=>{clearTimeout(t1);clearTimeout(t2)}},[onDone]);
 return <div className="splash" role="status"><img className="splash-logo" src={asset('tosan-techno-logo.png')} alt="لوگوی توسن تکنو"/><h1 className={'splash-title'+(step?' show':'')}>باندلینگ ورژن ۶</h1><div className={'splash-sub'+(step?' show':'')}>توسن تکنو</div></div>
}
class ErrorBoundary extends Component{
 constructor(p){super(p);this.state={err:false}}
 static getDerivedStateFromError(){return{err:true}}
 render(){return this.state.err?<div className="fatal"><b>بارگذاری برنامه انجام نشد.</b><p>خطایی در اجرای برنامه رخ داد. صفحه را دوباره بارگذاری کنید.</p><button className="primary" onClick={()=>location.reload()}>بارگذاری دوباره</button></div>:this.props.children}
}
function App(){
 const [splash,setSplash]=useState(true);
 const [tab,setTab]=useState('smart'),[budget,setBudget]=useState(''),[ready,setReady]=useState(false),[showAdmin,setShowAdmin]=useState(false);
 const [cfg,setCfg]=useState({posBase:19,marketing:0,marketFloor:15,cashCost:25,cashSale:42,cashMarkup:2});
 const num=v=>Math.max(0,Number(v)||0);
 // Frozen v4 principles: broker budget is purchase capacity only; marketing is included in pre-bundle POS price.
 const model=useMemo(()=>{
  const prePos=num(cfg.posBase)+num(cfg.marketing), cashBudgetPer=num(cfg.cashSale)-num(cfg.cashCost)-num(cfg.cashMarkup), out=[];
  if(cashBudgetPer<0||prePos<0)return out;
  for(let p=1;p<=15;p++)for(let c=1;c<=8;c++){
   const available=c*cashBudgetPer, maxDiscountPer=available/p;
   const adjusted=Math.max(num(cfg.marketFloor),prePos-maxDiscountPer);
   if(adjusted>prePos)continue;
   const consumed=(prePos-adjusted)*p, remaining=available-consumed;
   if(remaining < -0.001)continue;
   const actualCash=num(cfg.cashCost)+num(cfg.cashMarkup)+(c?remaining/c:0);
   const total=p*adjusted+c*actualCash;
   if(!Number.isFinite(total)||total<=0)continue;
   out.push({p,c,per:adjusted,total,actualCash,remaining,consumed});
  }
  return out.sort((a,b)=>a.per-b.per||a.total-b.total||b.p-a.p);
 },[cfg]);
 const management=useMemo(()=>[[5,2],[4,1],[3,1]].map(([p,c])=>model.find(x=>x.p===p&&x.c===c)).filter(Boolean).sort((a,b)=>a.per-b.per),[model]);
 const smart=useMemo(()=>{if(!ready||!budget||num(budget)<=0)return {affordable:[],upsell:[]};const b=num(budget);return{affordable:model.filter(x=>x.total<=b).sort((a,b)=>a.per-b.per||a.total-b.total||b.p-a.p).slice(0,8),upsell:model.filter(x=>x.total>b).map(x=>({...x,shortfall:x.total-b})).sort((a,b)=>a.shortfall-b.shortfall||a.per-b.per||b.p-a.p).slice(0,4)}},[ready,budget,model]);
 useEffect(()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register(new URL('sw.js',document.baseURI).href,{scope:new URL('./',document.baseURI).pathname}).catch(()=>{});},[]);
 const downloadCSV=()=>{const rows=[['بخش','تعداد کارتخوان','تعداد کش‌لس','قیمت هر کارتخوان (میلیون تومان)','قیمت کل بسته (میلیون تومان)'],...management.map(x=>['بسته پیشنهادی مدیریت',x.p,x.c,x.per.toFixed(2),x.total.toFixed(2)])];const blob=new Blob(['\ufeff'+rows.map(r=>r.join(',')).join('\n')],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bundling-v6-packages.csv';a.click();URL.revokeObjectURL(a.href)};
 function Card({x,shortfall=false}){return <article className="bundle"><div className="bundle-head"><span className="tag">{x.p} کارتخوان</span><span className="tag secondary">{x.c} کش‌لس</span><span className="price">{money(x.per)} میلیون / کارتخوان</span></div><div className="bundle-total"><span>قیمت کل بسته</span><strong>{money(x.total)} <small>میلیون تومان</small></strong></div>{shortfall&&<div className="shortfall"><TrendingUp size={17}/><span>با افزایش <b>{money(x.shortfall)} میلیون تومان</b> می‌توانید این بسته را تهیه کنید.</span></div>}</article>}
 if(splash)return <Splash onDone={()=>setSplash(false)}/>;
 return <main className="app">
  <header className="top"><div className="brand"><img src={asset('tosan-techno-logo.png')} alt="لوگوی توسن تکنو"/><div><div className="eyebrow">سامانه طراحی مدل فروش</div><h1>باندلینگ ورژن ۶</h1><div className="version">توسن تکنو · نسخه آماده توسعه</div></div></div><button className="icon-btn" onClick={()=>window.print()} title="چاپ یا ذخیره PDF"><Printer/></button></header>
  <section className="intro"><div className="intro-icon"><PackageCheck/></div><div><h2>پیشنهاد بسته متناسب با بودجه</h2><p>بسته‌های معتبر را بررسی کنید و مبلغ افزایش بودجه موردنیاز برای گزینه‌های دیگر را ببینید.</p></div></section>
  <nav className="tabs"><button className={tab==='management'?'active':''} onClick={()=>setTab('management')}><PackageCheck size={17}/> بسته‌های پیشنهادی مدیریت</button><button className={tab==='smart'?'active':''} onClick={()=>setTab('smart')}><Wallet size={17}/> پیشنهاد اقتصادی هوشمند</button></nav>
  {tab==='management'&&<section className="panel"><div className="section-title"><div><h3>بسته‌های پیشنهادی مدیریت</h3><p>بسته‌های آماده بر اساس کمترین قیمت هر کارتخوان مرتب شده‌اند.</p></div><button className="subtle-btn" onClick={downloadCSV}><Download size={16}/> خروجی CSV</button></div>{management.length?<div className="cards">{management.map(x=><Card key={x.p+'-'+x.c} x={x}/>)}</div>:<div className="empty"><Info/> با ورودی‌های مالی فعلی بسته معتبری برای نمایش وجود ندارد.</div>}</section>}
  {tab==='smart'&&<section className="panel"><div className="section-title"><div><h3>پیشنهاد اقتصادی هوشمند</h3><p>بودجه خرید را وارد کنید تا بسته‌های قابل خرید و گزینه‌های نیازمند افزایش بودجه نمایش داده شوند.</p></div></div><form className="budget-form" onSubmit={e=>{e.preventDefault();setReady(true)}}><label htmlFor="budget">بودجه خرید <span>(میلیون تومان)</span></label><div className="input-row"><input id="budget" type="number" min="1" step="1" placeholder="مثلاً ۱۵۰" value={budget} onChange={e=>{setBudget(e.target.value);setReady(false)}} required/><button className="primary" type="submit"><Search size={17}/> مشاهده پیشنهادها</button></div></form>
  {ready&&<div className="results"><div className="result-heading"><h4>متناسب با بودجه شما</h4><span>{money(num(budget))} میلیون تومان</span></div>{smart.affordable.length?<><p className="hint">بسته‌های قابل خرید؛ مرتب‌شده بر اساس کمترین قیمت هر کارتخوان</p><div className="cards">{smart.affordable.map(x=><Card key={x.p+'-'+x.c} x={x}/>)}</div></>:<div className="empty"><Info/><span>با بودجه فعلی، بسته معتبری قابل خرید نیست. گزینه‌های زیر با افزایش بودجه در دسترس قرار می‌گیرند.</span></div>}{smart.upsell.length>0&&<><div className="result-heading upsell-title"><h4>با افزایش بودجه می‌توانید این بسته‌ها را هم بخرید</h4></div><div className="cards">{smart.upsell.map(x=><Card key={'u'+x.p+'-'+x.c} x={x} shortfall/>)}</div></>}</div>}</section>}
  <footer><ShieldCheck size={16}/><span>فقط بسته‌های منطبق با قواعد مالی نمایش داده می‌شوند.</span><button onClick={()=>setShowAdmin(v=>!v)} className="admin-toggle"><Settings2 size={15}/> تنظیمات مدیریت</button></footer>
  {showAdmin&&<section className="panel admin"><div className="section-title"><div><h3>تنظیمات مالی نمونه</h3><p>مقادیر نمونه برای بررسی رابط؛ پیش از انتشار، ورودی‌های واقعی را جایگزین کنید.</p></div><Calculator/></div><div className="admin-grid">{[['posBase','قیمت پایه کارتخوان'],['marketing','بودجه بازاریابی هر کارتخوان'],['marketFloor','کف قیمت رقابتی کارتخوان'],['cashCost','بهای تمام‌شده کش‌لس'],['cashSale','قیمت فروش کش‌لس'],['cashMarkup','مبلغ سود کش‌لس']].map(([k,label])=><label className="field" key={k}>{label}<div className="field-input"><input type="number" min="0" value={cfg[k]} onChange={e=>setCfg(s=>({...s,[k]:num(e.target.value)}))}/><span>میلیون تومان</span></div></label>)}</div><p className="admin-note"><Info size={16}/> موتور پیشنهاددهنده داخل این ZIP یک نمونه اجرایی اولیه است؛ پیش از استفاده عملیاتی، قواعد کامل مالی و تست‌های مرزی را در GitHub بازبینی کنید. بودجه کارگزار فقط ظرفیت خرید است، نه منبع تأمین تخفیف.</p></section>}
 </main>
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
window.__appMounted=true;
