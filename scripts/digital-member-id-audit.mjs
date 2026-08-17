import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const testPhoto = await readFile(new URL('../public/nurselink-registration-hero.png', import.meta.url));
const viewports=[{name:'desktop',width:1440,height:1000},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844}];
const browser=await chromium.launch({headless:true});const results=[];
for(const viewport of viewports){const context=await browser.newContext({viewport});
await context.route('**/api.amsertech.com/api/me',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{name:'LBS Resma'}})}));
await context.route('**/api.amsertech.com/api/membership/onboarding',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{membership:{member_number:'NL-2026-000006',standing:'active',approved_at:'2026-08-17T00:00:00Z'}}})}));
await context.route('**/api.amsertech.com/api/profile-photo',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{profile_photo_url:'https://api.amsertech.com/api/profile-photo/image?v=audit'}})}));
await context.route('**/api.amsertech.com/api/profile-photo/image**',r=>r.fulfill({status:200,contentType:'image/png',body:testPhoto}));
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.goto('http://127.0.0.1:4173/nurselink-digital-id.html',{waitUntil:'networkidle'});await page.waitForSelector('#identityContent:not([hidden])');const metrics=await page.evaluate(()=>({name:document.querySelector('#memberName')?.textContent,number:document.querySelector('#memberNumber')?.textContent,photoLoaded:document.querySelector('#memberPhoto')?.naturalWidth>0,photoPrivate:document.querySelector('#memberPhoto')?.src.startsWith('blob:'),overflow:document.documentElement.scrollWidth>innerWidth+1}));results.push({viewport:viewport.name,errors,...metrics});await context.close()}
await browser.close();const failed=results.filter(x=>x.errors.length||x.name!=='LBS Resma'||x.number!=='NL-2026-000006'||!x.photoLoaded||!x.photoPrivate||x.overflow);console.log(JSON.stringify({results,failed:failed.length},null,2));process.exit(failed.length?1:0);
