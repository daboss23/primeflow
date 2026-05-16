module.exports=[86447,e=>e.a(async(t,a)=>{try{let t=await e.y("@anthropic-ai/sdk-8a97726827ff28fc");e.n(t),a()}catch(e){a(e)}},!0),76177,e=>e.a(async(t,a)=>{try{var r=e.i(86447),n=t([r]);[r]=n.then?(await n)():n;let o=new r.default({apiKey:process.env.ANTHROPIC_API_KEY}),s={abandoned_cart:`
CUSTOMER STATE: Abandoned Cart
PSYCHOLOGY: This person showed direct purchase intent. They wanted it. Something stopped them — distraction, doubt, price hesitation, or just life getting in the way. They are warm. The window is short.
COPYWRITING APPROACH:
- Reference the specific product they left behind
- Create gentle urgency without fake scarcity ("still available" not "only 2 left!")
- Remove friction — give them a direct path back
- Use social proof if relevant (others love this product)
- Keep it short — one clear CTA back to their cart
- Do NOT offer a discount unless brand rules allow it
- Tone: warm, direct, helpful — like a friend who noticed they forgot something
WHAT NEVER WORKS: Generic "you left something behind" with no product reference. Aggressive countdown timers. Multiple CTAs.`,failed_payment:`
CUSTOMER STATE: Failed Payment
PSYCHOLOGY: This person tried to buy or renew. The failure was technical, not intentional. They are not a lost customer — they are a stuck customer. They may not even know the payment failed. Urgency is real but tone must be helpful not alarming.
COPYWRITING APPROACH:
- Lead with helpfulness, not alarm
- Be specific about what failed if known (renewal, order, subscription)
- Make the fix dead simple — one tap, one link
- For high-LTV customers, elevate the tone significantly
- For subscribers, acknowledge their loyalty
- Urgency is appropriate here — access or order is genuinely at risk
- Tone: calm, helpful, practical — like a trusted brand that has their back
WHAT NEVER WORKS: Alarming subject lines. Blame. Complicated instructions. Cold transactional language.`,dormant_buyer:`
CUSTOMER STATE: Dormant Buyer
PSYCHOLOGY: This person bought before. They had a good enough experience to purchase. Then life moved on. They haven't forgotten the brand — they've just drifted. The goal is a warm re-entry, not a hard sell. They need a reason to remember why they liked this brand.
COPYWRITING APPROACH:
- Reference their last purchase specifically — show you remember them
- No pressure, no guilt, no "we miss you" clich\xe9s
- Give them something new to be curious about — new product, new formula, seasonal angle
- Or simply remind them of something they loved
- Make the re-entry feel natural, not desperate
- Tone: warm, personal, low pressure — like catching up with someone you haven't seen in a while
WHAT NEVER WORKS: "We miss you" subject lines. Guilt. Aggressive discounting as the first move. Generic catalogue email dressed up as personal.`,repeat_at_risk:`
CUSTOMER STATE: Repeat Buyer at Risk / VIP Going Quiet
PSYCHOLOGY: This is your most valuable customer type. They have a history with the brand. Multiple purchases. Real loyalty. And now something has shifted — engagement fading, purchase cadence breaking. This requires the most elevated, personal approach of any state. They deserve more than an automated email.
COPYWRITING APPROACH:
- Acknowledge their history without being sycophantic
- Elevated, personal tone — this is not a mass email
- For very high LTV customers, consider a direct personal check-in from a founder or team member
- Reference their specific purchase history where possible
- Offer something meaningful — early access, personal recommendation, genuine care
- This is not the place for discounts as a first move — it cheapens the relationship
- Tone: premium, personal, genuine — like a brand that actually notices and values them
WHAT NEVER WORKS: Generic win-back copy sent to VIPs. Discount as the opening move. Anything that feels automated or mass-produced.`,replenishment:`
CUSTOMER STATE: Replenishment Opportunity
PSYCHOLOGY: This person bought a consumable product and is likely running low or has already run out. The timing is everything. Hit this window right and conversion is near-certain because they already want what you sell. Miss it and they go elsewhere or forget.
COPYWRITING APPROACH:
- Lead with the specific product and timing ("running low on your X?")
- Make reordering completely frictionless — one tap
- Acknowledge their purchase cadence if relevant ("you usually reorder around now")
- Optional: mention any new variants, bundles, or subscription savings
- Keep it short — this customer doesn't need convincing, they need convenience
- Tone: helpful, timely, convenient — like a brand that pays attention
WHAT NEVER WORKS: Long emails. Multiple products. Anything that adds friction to what should be a simple reorder.`,engaged_unconverted:`
CUSTOMER STATE: Engaged But Never Converted
PSYCHOLOGY: This person is interested. They open emails, click links, browse products. Something is stopping the first purchase — price hesitation, comparison shopping, decision paralysis, trust gap, or just needing the right nudge at the right moment. The intent is there. The job is to remove the barrier.
COPYWRITING APPROACH:
- Acknowledge their interest without being creepy about it
- Address the most likely friction point for your category (quality? price? fit? ingredients?)
- Social proof is powerful here — reviews, results, community
- Make the first purchase feel low-risk — easy returns, guarantee, starter size
- One product, one CTA — don't overwhelm someone already in decision mode
- Tone: reassuring, confident, helpful — like a knowledgeable friend removing doubt
WHAT NEVER WORKS: Sending a catalogue to someone who can't decide. Hard sell. Ignoring the obvious hesitation.`,healthy:`
CUSTOMER STATE: Healthy / Active
PSYCHOLOGY: This customer is in a good place. No intervention needed. If messaging is appropriate, it should feel like a reward for their loyalty, not a recovery attempt.
COPYWRITING APPROACH:
- Keep it light and positive
- Loyalty recognition, early access, or a simple thank you
- No urgency, no alarm, no recovery framing
- Tone: appreciative, warm, brand-affirming`};async function i(e,t,a,r={}){var n;let l,d,c,u,h,p,m,f,g,y,w=(n=t.state,l=r.brand_name??"this brand",d=r.brand_industry?` in the ${r.brand_industry} space`:"",u=(c={casual:"friendly, warm, and conversational — like a knowledgeable friend",professional:"clear, confident, and professional — respectful without being stiff",luxury:"elevated, refined, and exclusive — never pushy, always tasteful",bold:"direct, punchy, and energetic — short sentences, strong verbs, no fluff",playful:"fun, light, and human — personality without sacrificing clarity",empathetic:"warm, understanding, and genuinely helpful — customer first in every sentence"})[r.brand_tone??"professional"]??c.professional,h=s[n]??s.healthy,p=`You are an expert ecommerce retention copywriter. You write one-to-one recovery messages for ${l}${d}.

BRAND TONE: ${u}
`,r.brand_voice_description&&(p+=`
BRAND VOICE: ${r.brand_voice_description}`),r.brand_signoff&&(p+=`
SIGN OFF: Always end with "${r.brand_signoff}"`),r.brand_avoid&&(p+=`
NEVER USE: ${r.brand_avoid}`),p+=`

${h}`,r.brand_example_good&&(p+=`

EXACT TONE EXAMPLE — write like this:
"${r.brand_example_good}"`),r.brand_example_bad&&(p+=`

NEVER write like this:
"${r.brand_example_bad}"`),p+=`

UNIVERSAL RULES — always apply:
- Write like a real human, not a marketing bot
- Be specific — reference the customer's actual purchase history and signals
- No fake intimacy ("Hope this finds you well", "As a valued customer", "We miss you")
- No fake urgency unless the situation genuinely calls for it
- Email body under 130 words
- SMS under 155 characters
- One clear call to action — never two
- Never use ALL CAPS for emphasis
- No hashtags or emojis in email
- One subtle emoji maximum in SMS if it fits the brand tone`),v=(m=e.last_purchase_at?Math.floor((Date.now()-new Date(e.last_purchase_at).getTime())/864e5):null,f=e.total_spend>=500,g=e.average_order_value>=150,y=`
CUSTOMER PROFILE:
- Name: ${e.first_name??"Customer"} ${e.last_name??""}
- Total orders: ${e.total_orders}
- Total lifetime spend: $${e.total_spend.toFixed(2)}${f?" (VIP)":""}
- Average order value: $${e.average_order_value.toFixed(2)}${g?" (high value)":""}
- Last purchase: ${null!==m?`${m} days ago`:"Never purchased"}
- Last product: ${e.last_product_name??"Unknown"}
- Email open rate: ${null!==e.email_open_rate?Math.round((e.email_open_rate??0)*100)+"%":"Unknown"}
- SMS engaged: ${e.sms_engaged?"Yes":"No"}

INTELLIGENCE:
- State: ${t.state}
- Health score: ${t.health_score}/100
- Opportunity score: ${t.opportunity_score}/100
- Why they were flagged: ${t.reason_code}
- Recommended action: ${t.suggested_action}
`.trim(),"email"===a?`${y}

TASK: Write a personalised retention email for this specific customer using the copywriting framework above.

Format exactly as:
Subject: [subject line — specific, not generic, under 50 characters]

[email body — under 130 words, one CTA at the end, sign off as instructed]`:`${y}

TASK: Write a personalised SMS for this specific customer using the copywriting framework above.
Under 155 characters. Direct, personal, one clear action. Write ONLY the SMS text — nothing else.`),b=(await o.messages.create({model:"claude-sonnet-4-20250514",max_tokens:600,system:w,messages:[{role:"user",content:v}]})).content.filter(e=>"text"===e.type).map(e=>e.text).join("").trim();if("email"===a){let e,t,a,r,n,{subject:i,body:o}=(a=(t=(e=b.trim().split("\n")).find(e=>e.toLowerCase().startsWith("subject:")))?t.replace(/^subject:\s*/i,"").trim():null,r=t?e.indexOf(t)+1:0,n=e.slice(r).join("\n").trim().replace(/^\n+/,""),{subject:a,body:n});return{draft_text:o,subject_line:i,prompt_version:"v3"}}return{draft_text:b,subject_line:null,prompt_version:"v3"}}e.s(["generateDraft",0,i]),a()}catch(e){a(e)}},!1),2980,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(44070),i=e.i(76177),o=t([i]);async function s(e){try{let{customer_id:t,channel:a}=await e.json();if(!t||!a)return r.NextResponse.json({error:"customer_id and channel required"},{status:400});let{data:o,error:s}=await n.supabaseAdmin.from("customers").select("*").eq("id",t).single();if(s)throw Error("Customer not found");let{data:l,error:d}=await n.supabaseAdmin.from("customer_health").select("*").eq("customer_id",t).order("scored_at",{ascending:!1}).limit(1).single();if(d)throw Error("No health record found — run scoring first");let{data:c}=await n.supabaseAdmin.from("integrations").select("brand_name, brand_tone, brand_voice_description, brand_signoff, brand_avoid, brand_example_good, brand_example_bad, brand_industry").limit(1).single(),{draft_text:u,subject_line:h,prompt_version:p}=await (0,i.generateDraft)(o,l,a,c??{}),{data:m,error:f}=await n.supabaseAdmin.from("outreach_drafts").insert({customer_id:t,health_id:l.id,channel:a,draft_text:u,subject_line:h,prompt_version:p,status:"generated",generated_at:new Date().toISOString()}).select().single();if(f)throw f;return r.NextResponse.json({draft:m})}catch(e){return console.error("[draft POST]",e),r.NextResponse.json({error:String(e)},{status:500})}}async function l(e){try{let{draft_id:t,status:a,approved_by:i}=await e.json(),o={status:a};"approved"===a&&(o.approved_at=new Date().toISOString()),"sent"===a&&(o.sent_at=new Date().toISOString()),i&&(o.approved_by=i);let{data:s,error:l}=await n.supabaseAdmin.from("outreach_drafts").update(o).eq("id",t).select().single();if(l)throw l;return r.NextResponse.json({draft:s})}catch(e){return console.error("[draft PATCH]",e),r.NextResponse.json({error:String(e)},{status:500})}}async function d(e){let t=e.nextUrl.searchParams.get("customer_id");if(!t)return r.NextResponse.json({error:"customer_id required"},{status:400});let{data:a,error:i}=await n.supabaseAdmin.from("outreach_drafts").select("*").eq("customer_id",t).order("generated_at",{ascending:!1}).limit(10);return i?r.NextResponse.json({error:String(i)},{status:500}):r.NextResponse.json({drafts:a})}[i]=o.then?(await o)():o,e.s(["GET",0,d,"PATCH",0,l,"POST",0,s]),a()}catch(e){a(e)}},!1),80527,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),o=e.i(59756),s=e.i(61916),l=e.i(74677),d=e.i(69741),c=e.i(16795),u=e.i(87718),h=e.i(95169),p=e.i(47587),m=e.i(66012),f=e.i(70101),g=e.i(26937),y=e.i(10372),w=e.i(93695);e.i(52474);var v=e.i(220),b=e.i(2980),R=t([b]);[b]=R.then?(await R)():R;let _=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/draft/route",pathname:"/api/draft",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/draft/route.ts",nextConfigOutput:"",userland:b,...{}}),{workAsyncStorage:A,workUnitAsyncStorage:E,serverHooks:C}=_;async function T(e,t,a){a.requestMeta&&(0,o.setRequestMeta)(e,a.requestMeta),_.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/draft/route";r=r.replace(/\/index$/,"")||"/";let i=await _.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:b,params:R,nextConfig:T,parsedUrl:A,isDraftMode:E,prerenderManifest:C,routerServerContext:O,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,resolvedPathname:P,clientReferenceManifest:k,serverActionsManifest:x}=i,I=(0,d.normalizeAppPath)(r),H=!!(C.dynamicRoutes[I]||C.routes[P]),$=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,A,!1):t.end("This page could not be found"),null);if(H&&!E){let e=!!C.routes[P],t=C.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(T.adapterPath)return await $();throw new w.NoFallbackError}}let M=null;!H||_.isDev||E||(M=P,M="/index"===M?"/":M);let U=!0===_.isDev||!H,j=H&&!U;x&&k&&(0,l.setManifestsSingleton)({page:r,clientReferenceManifest:k,serverActionsManifest:x});let L=e.method||"GET",W=(0,s.getTracer)(),q=W.getActiveScopeSpan(),D=!!(null==O?void 0:O.isWrappedByNextServer),G=!!(0,o.getRequestMeta)(e,"minimalMode"),Y=(0,o.getRequestMeta)(e,"incrementalCache")||await _.getIncrementalCache(e,T,C,G);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let K={params:R,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!T.experimental.authInterrupts},cacheComponents:!!T.cacheComponents,supportsDynamicResponse:U,incrementalCache:Y,cacheLifeProfiles:T.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>_.onRequestError(e,t,r,n,O)},sharedContext:{buildId:b}},F=new c.NodeNextRequest(e),V=new c.NodeNextResponse(t),B=u.NextRequestAdapter.fromNodeNextRequest(F,(0,u.signalFromNodeResponse)(t));try{let i,o=async e=>_.handle(B,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=W.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==h.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${L} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${L} ${r}`)}),l=async i=>{var s,l;let d=async({previousCacheEntry:n})=>{try{if(!G&&S&&N&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await o(i);e.fetchMetrics=K.renderOpts.fetchMetrics;let s=K.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let l=K.renderOpts.collectedTags;if(!H)return await (0,m.sendResponse)(F,V,r,K.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[y.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await _.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:S})},!1,O),t}},c=await _.handleResponse({req:e,nextConfig:T,cacheKey:M,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:G});if(!H)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});G||t.setHeader("x-nextjs-cache",S?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return G&&H||u.delete(y.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,g.getCacheControlHeader)(c.cacheControl)),await (0,m.sendResponse)(F,V,new Response(c.value.body,{headers:u,status:c.value.status||200})),null};D&&q?await l(q):(i=W.getActiveScopeSpan(),await W.withPropagatedContext(e.headers,()=>W.trace(h.BaseServerSpan.handleRequest,{spanName:`${L} ${r}`,kind:s.SpanKind.SERVER,attributes:{"http.method":L,"http.target":e.url}},l),void 0,!D))}catch(t){if(t instanceof w.NoFallbackError||await _.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:S})},!1,O),H)throw t;return await (0,m.sendResponse)(F,V,new Response(null,{status:500})),null}}e.s(["handler",0,T,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:E})},"routeModule",0,_,"serverHooks",0,C,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,E]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__12ceup_._.js.map