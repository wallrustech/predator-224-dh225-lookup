const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

const GOPWER = [
  {id:'gps-vm22-am',name:'Aftermarket VM22 Performance Carburetor Kit',category:'carburetion',store:'GoPowerSports',price:108.95,note:'Listed for Predator 212 Hemi/non-Hemi and Tillotson 196/212/225 applications.',url:'https://www.gopowersports.com/aftermarket-vm22-carburetor-kit/',img:'https://www.gopowersports.com/_astro/94c03bc1a8c333c090563d6d1b3230ffa6bce365.CAaHqyuV_2d0niP.webp'},
  {id:'gps-vm22-oem',name:'Genuine Mikuni VM22 Carburetor Kit',category:'carburetion',store:'GoPowerSports',price:159.95,note:'Listed for Tillotson 196/212/225 and compatible clone applications.',url:'https://www.gopowersports.com/genuine-mikuni-vm22-carburetor-kit/',img:'https://www.gopowersports.com/_astro/33d5d98db098a030d004ec6d257ce6efabf2c869.BOmQj38H_Z1ixDPy.webp'},
  {id:'gps-curved-manifold',name:'Tillotson Curved Inlet Manifold Assembly',category:'intake',store:'GoPowerSports',price:68.99,note:'Listed for 196, 212, 224 and 225 engines with aftermarket VM22/Tillotson slide carburetors.',url:'https://www.gopowersports.com/tillotson-inlet-manifold-assembly-curved/',img:'https://www.gopowersports.com/_astro/53b54dc131146b4045bfa6da832bb9566d1b18e9.DjANqsK0_yvFHS.webp'},
  {id:'gps-pulse-manifold',name:'Mikuni VM22 Manifold with Pulse Fitting',category:'intake',store:'GoPowerSports',price:32.95,note:'VM22 intake hardware; verify your current manifold and pulse-port requirements.',url:'https://www.gopowersports.com/manifold-for-mikuni-vm22-with-pulse-fitting/',img:'https://www.gopowersports.com/_astro/411e46874ef1a4f1420a7dd519998230277e0eaf.B2rly4dS_2n6SOj.webp'},
  {id:'gps-stage2',name:'Predator 223/224 Stage 2 Performance Kit',category:'performance',store:'GoPowerSports',price:294.95,note:'Listed specifically for the non-Hemi Predator 224; some parts may require clearancing.',url:'https://www.gopowersports.com/stage-2-predator-223-224-performance-kits/',img:'https://www.gopowersports.com/_astro/794fff041e4d10ece025ad0cb730f54b9f97ca58.DIijQ6fW_Z1IUooi.webp'},
  {id:'gps-sidecover',name:'GPS Racing Billet Side Cover',category:'performance',store:'GoPowerSports',price:149.95,note:'Explicitly listed for Predator 224 Non-Hemi.',url:'https://www.gopowersports.com/gps-racing-billet-side-cover-tillotson-clone-predator-212-hemi-predator-224-non-hemi/',img:'https://www.gopowersports.com/_astro/31ac4376647195098ec194a3679c8519c5c5cc76.BuupkwjQ_1SQ6zU.webp'},
  {id:'gps-arc-sidecover',name:'ARC Tri-Bearing Billet Side Cover',category:'performance',store:'GoPowerSports',price:149.95,note:'Explicitly listed for Predator 224 Non-Hemi; does not work with an OEM bolt-on starter.',url:'https://www.gopowersports.com/arc-tri-bearing-billet-side-cover-honda-gx200-clone-predator-212-hemi/',img:'https://www.gopowersports.com/_astro/05a3b75f0828973c12c423a5caa88fedc1c8851f.CrA8XhhI_2jjTnh.webp'},
  {id:'gps-flywheel-key',name:'Honda OEM-Style Flywheel Key',category:'service',store:'GoPowerSports',price:5.45,note:'Listed for Tillotson, Predator, clone and Honda OEM applications.',url:'https://www.gopowersports.com/flywheel-key-for-tillotson-predator-and-clone-honda-oem/',img:'https://www.gopowersports.com/_astro/977ebf1eadeda84aa870135d9d4b0ea00dee793a.C8qHc-qT_Z1pGhjQ.webp'},
  {id:'gps-tach',name:'Digital Tachometer',category:'service',store:'GoPowerSports',price:39.95,note:'Useful for checking RPM on a modified governor-spring-removed setup.',url:'https://www.gopowersports.com/digital-tachometer/'},
  {id:'gps-clevis',name:'Throttle Clevis',category:'controls',store:'GoPowerSports',price:3.30,note:'Linkage component; verify geometry against your installed handlebar throttle.',url:'https://www.gopowersports.com/throttle-clevis/',img:'https://www.gopowersports.com/_astro/8cacbfa0144c29706f6f948468cd37440df9deef.5OO_xowM_Z2rDqzG.webp'}
];

let amazonToken = null;
let amazonTokenExpires = 0;

async function getAmazonToken() {
  const id = process.env.AMAZON_CREATOR_CLIENT_ID;
  const secret = process.env.AMAZON_CREATOR_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (amazonToken && Date.now() < amazonTokenExpires) return amazonToken;
  const r = await fetch('https://api.amazon.com/auth/o2/token', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({grant_type:'client_credentials',client_id:id,client_secret:secret,scope:'creatorsapi::default'})
  });
  if (!r.ok) throw new Error('Amazon token request failed: '+r.status);
  const data = await r.json();
  amazonToken = data.access_token;
  amazonTokenExpires = Date.now() + Math.max(60,(data.expires_in||3600)-120)*1000;
  return amazonToken;
}

async function searchAmazon(keywords) {
  const token = await getAmazonToken();
  const tag = process.env.AMAZON_PARTNER_TAG;
  if (!token || !tag) return [];
  const r = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
    method:'POST',
    headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json','x-marketplace':'www.amazon.com'},
    body:JSON.stringify({
      partnerTag:tag,marketplace:'www.amazon.com',keywords,
      itemCount:10,
      resources:['images.primary.medium','itemInfo.title','itemInfo.byLineInfo','offersV2.listings.price']
    })
  });
  if (!r.ok) throw new Error('Amazon SearchItems failed: '+r.status);
  const data = await r.json();
  return (data.searchResult?.items||[]).map((item,i)=>({
    id:'amazon-'+item.asin,
    name:item.itemInfo?.title?.displayValue || 'Amazon product',
    category:'amazon',
    store:'Amazon',
    price:item.offersV2?.listings?.[0]?.price?.amount || 0,
    note:'Amazon listing returned by the official Creators API. Verify fitment before ordering.',
    url:item.detailPageURL || ('https://www.amazon.com/dp/'+item.asin),
    img:item.images?.primary?.medium?.url || '',
    source:'amazon-api'
  }));
}

function fallbackAmazon(keywords) {
  return [{
    id:'amazon-search-'+encodeURIComponent(keywords).replace(/%/g,'_'),
    name:'Amazon search: '+keywords,
    category:'amazon',
    store:'Amazon',
    price:0,
    note:'Live Amazon product data is not configured yet. This server-side search link keeps the library usable until Amazon Creators API credentials are added.',
    url:'https://www.amazon.com/s?k='+encodeURIComponent(keywords),
    source:'amazon-search'
  }];
}

async function getParts(url) {
  const q=(url.searchParams.get('q')||'').trim().toLowerCase();
  const store=(url.searchParams.get('store')||'all').toLowerCase();
  let parts=[...GOPWER];
  if (store==='amazon'||store==='all') {
    try {
      if(q) parts=parts.concat(await searchAmazon(q));
      else parts=parts.concat(fallbackAmazon('VM22 carburetor Predator 224 225'));
    } catch (e) {
      console.error(e.message);
      parts=parts.concat(fallbackAmazon(q||'VM22 carburetor Predator 224 225'));
    }
  }
  if(q) parts=parts.filter(p=>(p.name+' '+p.category+' '+p.note).toLowerCase().includes(q) || p.store.toLowerCase().includes(q));
  if(store==='gopowersports') parts=parts.filter(p=>p.store==='GoPowerSports');
  if(store==='amazon') parts=parts.filter(p=>p.store==='Amazon');
  return parts;
}

function send(res,status,data,type='application/json') {
  res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});
  res.end(type==='application/json'?JSON.stringify(data):data);
}

const server=http.createServer(async (req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/health') return send(res,200,{ok:true,service:'predator-224-parts-library',amazonConfigured:Boolean(process.env.AMAZON_CREATOR_CLIENT_ID&&process.env.AMAZON_CREATOR_CLIENT_SECRET&&process.env.AMAZON_PARTNER_TAG)});
    if(url.pathname==='/api/parts') return send(res,200,{source:'server',parts:await getParts(url)});
    if(url.pathname==='/api/providers') return send(res,200,{providers:{GoPowerSports:{enabled:true,mode:'verified-catalog'},Amazon:{enabled:true,mode:process.env.AMAZON_CREATOR_CLIENT_ID?'creators-api':'search-fallback'}}});
    let file=url.pathname==='/'?'/index.html':url.pathname;
    const safe=path.normalize(file).replace(/^([.][.][/\\])+/, '');
    const full=path.join(ROOT,safe);
    if(!full.startsWith(ROOT)||!fs.existsSync(full)||fs.statSync(full).isDirectory()) return send(res,404,'Not found','text/plain');
    const ext=path.extname(full);
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
    send(res,200,fs.readFileSync(full),types[ext]||'application/octet-stream');
  } catch(e) {
    console.error(e);
    send(res,500,{error:'Server error',message:e.message});
  }
});
server.listen(PORT,()=>console.log('Predator 224 library server listening on '+PORT));
