import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const server = http.createServer((req,res) => {
  if(req.url === '/favicon.ico'){res.writeHead(204).end();return;}
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root)) {res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type', file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(data);});
}).listen(8766,'127.0.0.1');
const tabs = await (await fetch('http://127.0.0.1:9226/json')).json();
const ws = new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=0;const pending=new Map(), errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text + " " + m.params.entry.url);});
function send(method,params={}){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const click=selector=>run('document.querySelector('+JSON.stringify(selector)+').click()');
const action=name=>click('[data-spotlight-action="'+name+'"]');
const query=value=>run('(()=>{const input=document.querySelector("#spotlight-input");input.value='+JSON.stringify(value)+';input.dispatchEvent(new Event("input",{bubbles:true}));})()');
const key=async (key,code=key,modifiers=0)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,modifiers});};
try{
await send('Runtime.enable');await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8766/#spotlight-challenge'});
for(let i=0;i<100;i++){if(await run('typeof spotlightState!=="undefined" && document.readyState==="complete"'))break;await new Promise(r=>setTimeout(r,50));}
assert.equal(await run('spotlightState.view'),'intro');
await action('begin');assert.equal(await run('spotlightState.open'),false);
await key(' ','Space',4);assert.equal(await run('spotlightState.open'),true);
assert.equal(await run('document.activeElement.id'),'spotlight-input');
await query('CALC');assert.equal(await run('spotlightState.results[0].name'),'Calculator');
await key('Escape');assert.equal(await run('spotlightState.open'),false);
await action('open');assert.equal(await run('document.querySelector("#spotlight-input").value'),'CALC');
await query('zzzz');assert.equal(await run('spotlightState.results.length'),0);assert.equal(await run('spotlightState.incorrect'),0);
await query('notes');await key('Enter');assert.equal(await run('spotlightState.incorrect'),1);assert.equal(await run('spotlightState.open'),true);
const queries=['calc','week 3','computer','48 × 6','define hardware','parts review','documents','system sett'];
for(let i=0;i<8;i++){
assert.equal(await run('spotlightState.task'),i);
await action('hint');assert.equal(await run('spotlightState.hintVisible'),true);
if(!await run('spotlightState.open'))await action('open');
await query(queries[i]);
if(i===3)assert.equal(await run('spotlightState.results[0].name'),'288');
if(i===4)assert.equal(await run('spotlightState.results[0].subtitle'),'The physical parts of a computer that you can see or touch.');
if(i===6)assert.ok(await run('spotlightState.results.some(x=>x.type==="document") && spotlightState.results.some(x=>x.type==="folder")'));
const target=await run('spotlightState.results.findIndex(item=>item.id===spotlightTasks[spotlightState.task].target)');
assert.ok(target>=0);
await key('ArrowDown');await key('ArrowUp');
for(let j=0;j<target;j++)await key('ArrowDown');
assert.equal(await run('document.querySelector("[aria-selected=true]").id'),'spotlight-result-'+target);
if(i===0){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('spotlight-search-test.png',Buffer.from(shot.data,'base64'));}
await key('Enter');
assert.equal(await run('spotlightState.completed.length'),i+1);
assert.equal(await run('spotlightState.open'),false);
assert.equal(await run('document.querySelector("#spotlight-course [role=progressbar]").getAttribute("aria-valuenow")'),String(i+1));
assert.ok(await run('document.querySelector("[data-spotlight-action=next]").getBoundingClientRect().bottom <= innerHeight'));
await action('next');
}
assert.equal(await run('spotlightState.view'),'complete');
await action('retry');
assert.deepEqual(await run('[spotlightState.task,spotlightState.incorrect,spotlightState.completed.length,spotlightState.query,spotlightState.results.length,spotlightState.selected,spotlightState.open,spotlightState.opened,spotlightState.hints.length,spotlightState.hintVisible,spotlightState.taughtShortcut]'),[0,0,0,'',0,-1,false,null,0,false,false]);
for(const expr of ['48*6','48 * 6','48x6','48 × 6'])assert.equal(await run('parseSpotlightCalculation('+JSON.stringify(expr)+').value'),288);
for(const expr of ['alert(1)','2**3','1/0','48*6;alert(1)'])assert.equal(await run('parseSpotlightCalculation('+JSON.stringify(expr)+')'),null);
for(const [expr,value] of [['2+3',5],['2-3',-1],['8÷2',4],['-2*3',-6]])assert.equal(await run('parseSpotlightCalculation('+JSON.stringify(expr)+').value'),value);
await run('showDigitalCourse("macos-essentials")');await click('[data-digital-section="spotlight-challenge"]');
assert.equal(await run('spotlightState.view'),'intro');
await run('history.back()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('location.hash'),'#macos-essentials');
await run('history.forward()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'spotlight-challenge');
for(const route of ['system-settings','mac-skills-challenge','file-organization','file-type-detective','local-vs-cloud','file-operations']){
await run('showDigitalPlaceholder('+JSON.stringify(route)+')');assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'digital-placeholder');
}
await run('showMacNavigation()');await click('[data-mac-action="begin"]');await click('[data-mac-app="Finder"]');assert.equal(await run('macState.completed'),true);
for(const call of ['showDepartment()','showComputerParts()','showInputOutput()','showHardwareSoftware()','openModule("identify")','openModule("function")','openModule("build")','openModule("repair")'])await run(call);
await run('showSpotlightChallenge()');await action('begin');await action('open');await query('documents');
const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('spotlight-results-test.png',Buffer.from(shot.data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:600,height:768,deviceScaleFactor:1,mobile:false});
assert.ok(await run('document.querySelector("#spotlight-panel").getBoundingClientRect().right <= innerWidth'));
assert.deepEqual(errors,[]);
console.log('PASS: eight tasks, hints, shortcut, fallback/focus, partial/case search, math safety, definitions, wrong recovery, no results, arrow/Enter, Escape/reopen, progress, completion/reset, Back/Forward, six placeholders, Mac Navigation smoke, Computer Systems routes, responsive bounds; no console errors.');
} finally {await send('Browser.close').catch(()=>{});ws.close();server.close();}
