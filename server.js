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
  {id:'gps-clevis',name:'Throttle Clevis',category:'controls',store:'GoPowerSports',price:3.30,note:'Linkage component; verify geometry against your installed handlebar throttle.',url:'https://www.gopowersports.com/throttle-clevis/',img:'https://www.gopowersports.com/_astro/8cacbfa0144c29706f6f948468cd37440df9deef.5OO_xowM_Z2rDqzG.webp'},
  {id:'gps-speedometer',name:'150 XRX Speedometer',category:'gauges',store:'GoPowerSports',price:53.90,note:'Customization/gauge option. This specific unit is listed for the TrailMaster 150 XRX; mounting and wiring are not confirmed for your kart.',url:'https://www.gopowersports.com/150-xrx-speedometer/',fit:'verify'}, 
  {id:'gps-headlight',name:'Mini Bike Headlight, MB200-2 / Hurricane 200X',category:'lighting',store:'GoPowerSports',price:42.85,note:'Headlight customization option. Listed for MB200-2, Hurricane 200X and Coleman CT200U-EX; mounting and electrical compatibility with your kart are not confirmed.',url:'https://www.gopowersports.com/headlight-mb200-2-hurricane-200x/',fit:'verify'},
  {id:'gps-thumb-throttle',name:'Billet Thumb Throttle Kit, 7/8"',category:'controls',store:'GoPowerSports',price:0,note:'Premium 7/8-inch handlebar thumb-throttle option. Price is shown by the store; verify cable throw and carburetor linkage before ordering.',url:'https://www.gopowersports.com/billet-thumb-throttle-kit-7-8/',fit:'verify'},
  {id:'gps-twist-throttle',name:'Mini Bike Throttle Twist Grip 7/8"',category:'controls',store:'GoPowerSports',price:49.95,note:'7/8-inch twist-throttle option. This product does not include a throttle cable; verify cable end and travel.',url:'https://www.gopowersports.com/mini-bike-throttle-twist-grip-7-8/',fit:'verify'},
  {id:'gps-18-seat',name:'18.5" Mini Bike Seat',category:'seating',store:'GoPowerSports',price:84.95,note:'Available in thin drag or cruiser style. Listed for the Rascal GT frame; use as a customization reference and verify mounting holes.',url:'https://www.gopowersports.com/mini-bike-seat-18-5/',fit:'verify'},
  {id:'gps-20-seat',name:'20" Mini Bike Seat, Storm 200',category:'seating',store:'GoPowerSports',price:22.95,note:'Listed for TrailMaster Storm 200; product has three bottom mounting holes and is a possible comfort/customization option.',url:'https://www.gopowersports.com/mini-bike-seat-storm-200/',fit:'verify'},
  {id:'gps-billet-pegs',name:'Foldable Billet Foot Pegs, Smooth Knurl',category:'chassis',store:'GoPowerSports',price:24.95,note:'Universal-style customization option for applications using the supplied mounting hardware. Verify frame mounting location.',url:'https://www.gopowersports.com/billet-foot-pegs-foldable-smooth-knurl/',fit:'verify'},
  {id:'gps-kill-switch',name:'Engine Kill Switch, 7/8" Handlebar',category:'controls',store:'GoPowerSports',price:7.95,note:'7/8-inch handlebar-mounted engine stop switch. Listed for Mega Moto 80/105 and many minibikes; verify your wiring before installation.',url:'https://www.gopowersports.com/mega-mini-bike-engine-stop-switch/',fit:'verify'},
  {id:'gps-handlebars',name:'Mini Bike Handlebars, TrailMaster MB200-2 / Hurricane 200X',category:'controls',store:'GoPowerSports',price:21.95,note:'Handlebar customization option. Listed for several mini bike frames; verify width, clamp diameter and steering geometry.',url:'https://www.gopowersports.com/mini-bike-handlebars-trailmaster-mb200-2-hurricane-200x/',fit:'verify'},
  {id:'gps-fenders',name:'Front / Rear Fender, MB200-2',category:'chassis',store:'GoPowerSports',price:40.65,note:'Front/rear fender customization option. Listed for TrailMaster MB200-2; mounting is not confirmed for your kart.',url:'https://www.gopowersports.com/front-rear-fender-mb200-2/',fit:'verify'},
  {id:'gps-gas-tank',name:'Generic Motorcycle-Style Gas Tank',category:'fuel',store:'GoPowerSports',price:109.95,note:'Generic motorcycle-style tank for custom builds. Verify mounting, fuel-valve location, capacity and clearance before ordering.',url:'https://www.gopowersports.com/gas-tank-generic-motorcycle-style/',fit:'verify'},
  {id:'gps-tav-cover',name:'Clear Plastic Torque Converter Cover, 30 Series',category:'drivetrain',store:'GoPowerSports',price:32.95,note:'Cosmetic/protective customization option for 30 Series torque-converter setups; verify your installed drive system.',url:'https://www.gopowersports.com/clear-plastic-torque-converter-cover-30-series/',fit:'verify'},
  {id:'gps-kickstand',name:'Mini Bike Kick Stand 10.5"',category:'chassis',store:'GoPowerSports',price:10.95,note:'Replacement/custom kickstand option listed for several TrailMaster/Hurricane mini bikes. Verify mounting tab location and stand length.',url:'https://www.gopowersports.com/mini-bike-kick-stand-10-5/',fit:'verify'},
  {id:'gps-chain-guard',name:'Mini Bike Chain Guard',category:'drivetrain',store:'GoPowerSports',price:32.95,note:'Universal/customization-oriented chain guard option. Verify chain size, frame clearance and mounting points.',url:'https://www.gopowersports.com/mini-bike-chain-guard/',fit:'verify'},
  {id:'gps-brake-kit',name:'Rear Hydraulic Brake Kit, MB200-2 / Hurricane 200X',category:'brakes',store:'GoPowerSports',price:87.95,note:'Hydraulic brake upgrade option listed for specific mini bike frames. Do not treat as direct fit for your kart without checking caliper, rotor and mount dimensions.',url:'https://www.gopowersports.com/rear-hydraulic-brake-kit-mb200-2-hurricane-200x/',fit:'verify'},
  {id:'gps-juggaverter',name:'Jugg-A-Verter Super 30 Series Torque Converter Kit',category:'drivetrain',store:'GoPowerSports',price:189.95,note:'Custom drivetrain option. Verify frame clearance, engine mounting pattern, driven/driving pulley alignment and belt size before considering.',url:'https://www.gopowersports.com/jugg-a-verter-super-30-series-torque-converter-kit/',fit:'verify'},
  {id:'gps-145-rear-wheel',name:'145x70-6 V-Tread Mini Bike Rear Steel Wheel Assembly',category:'wheels',store:'GoPowerSports',price:69.95,note:'Wheel/tire customization option. Verify axle diameter, hub spacing, bearing size, sprocket and brake-disc alignment before ordering.',url:'https://www.gopowersports.com/145x70-6-v-tread-mini-bike-rear-steel-wheel-assembly/',fit:'verify'},
  {id:'gps-trials-tire',name:'4.00-10" Front/Rear Trials Tire IRC-191',category:'wheels',store:'GoPowerSports',price:60.45,note:'Tire customization option. Verify wheel diameter, width, clearance and intended use before ordering.',url:'https://www.gopowersports.com/4.00-10-front-rear-tire-trials-irc-191/',fit:'verify'},

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
      const amazonConfigured = Boolean(process.env.AMAZON_CREATOR_CLIENT_ID && process.env.AMAZON_CREATOR_CLIENT_SECRET && process.env.AMAZON_PARTNER_TAG);
      if(q && amazonConfigured) parts=parts.concat(await searchAmazon(q));
      else if(!q && amazonConfigured) {
        for (const term of ['VM22 carburetor Predator 224 225','Predator 224 performance parts','Predator 224 flywheel connecting rod']) parts=parts.concat(await searchAmazon(term));
      } else parts=parts.concat(fallbackAmazon('VM22 carburetor Predator 224 225'));
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

const imageCache = new Map();

async function getCurrentProductImage(part) {
  const cached = imageCache.get(part.id);
  if (cached && cached.expires > Date.now()) return cached;

  let imageUrl = '';
  try {
    const page = await fetch(part.url, {headers:{'User-Agent':'Mozilla/5.0 Predator224Lookup/2.0'}});
    if (page.ok) {
      const html = await page.text();
      const m1 = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      const m2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
      imageUrl = (m1?.[1] || m2?.[1] || '').replace(/&amp;/g,'&');
      if (imageUrl.startsWith('//')) imageUrl = 'https:'+imageUrl;
      if (imageUrl.startsWith('/')) imageUrl = new URL(imageUrl, part.url).href;
    }
  } catch (e) {
    console.error('Product image lookup failed:', part.id, e.message);
  }

  if (!imageUrl) imageUrl = part.img || '';
  if (!imageUrl) return null;

  try {
    const image = await fetch(imageUrl, {headers:{'User-Agent':'Mozilla/5.0 Predator224Lookup/2.0'}});
    if (!image.ok) throw new Error('image '+image.status);
    const body = Buffer.from(await image.arrayBuffer());
    const result = {
      body,
      type: image.headers.get('content-type') || 'image/jpeg',
      expires: Date.now()+6*60*60*1000
    };
    imageCache.set(part.id, result);
    return result;
  } catch (e) {
    console.error('Product image fetch failed:', part.id, e.message);
    return null;
  }
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
    if(url.pathname==='/api/providers') return send(res,200,{providers:{GoPowerSports:{enabled:true,mode:'verified-catalog'},Amazon:{enabled:true,mode:(process.env.AMAZON_CREATOR_CLIENT_ID&&process.env.AMAZON_CREATOR_CLIENT_SECRET&&process.env.AMAZON_PARTNER_TAG)?'creators-api':'search-fallback'}}});
    if(url.pathname==='/api/part-image') {
      const id=url.searchParams.get('id')||'';
      const part=GOPWER.find(p=>p.id===id);
      if(!part) return send(res,404,'Image not found','text/plain');
      let image=null;
      if(part.store==='GoPowerSports' && part.url) image=await getCurrentProductImage(part);
      else if(part.img) {
        try {
          const u=new URL(part.img);
          const allowed=['www.gopowersports.com','gopowersports.com','images-na.ssl-images-amazon.com','m.media-amazon.com','images.amazon.com'];
          if(!allowed.includes(u.hostname)) return send(res,403,'Image host not allowed','text/plain');
          const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 Predator224Lookup/2.0'}});
          if(r.ok) image={body:Buffer.from(await r.arrayBuffer()),type:r.headers.get('content-type')||'image/jpeg'};
        } catch(e) { console.error('Image proxy failed:',id,e.message); }
      }
      if(!image) return send(res,404,'Image unavailable','text/plain');
      res.writeHead(200,{'Content-Type':image.type,'Cache-Control':'public, max-age=21600'});
      return res.end(image.body);
    }
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
