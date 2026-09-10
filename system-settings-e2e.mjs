import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=http.createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}const file=path.join(process.cwd(),req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(d);});}).listen(8773,'127.0.0.1');
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9233','--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'settings-test-')),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;
try{
let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch('http://127.0.0.1:9233/json')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const k=++id;pending.set(k,{resolve,reject});ws.send(JSON.stringify({id:k,method,params}));});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const click=q=>run(`document.querySelector(${JSON.stringify(q)}).click()`);
const action=a=>click(`[data-settings-action="${a}"]`);
const category=c=>click(`[data-settings-category="${c}"]`);
const slider=(c,v)=>run(`(()=>{const e=document.querySelector('[data-setting="${c}"]');e.value=${v};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
await send('Runtime.enable');await send('Log.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8773/#system-settings'});
for(let i=0;i<100;i++){if(await run('typeof systemSettingsState!=="undefined" && document.readyState==="complete"'))break;await new Promise(r=>setTimeout(r,50));}
assert.equal(await run('systemSettingsState.view'),'intro');assert.equal(await run('systemSettingsTasks.length'),8);
await action('begin');await click('[data-settings-dock="Safari"]');assert.equal(await run('systemSettingsState.completed.length'),0);
for(let i=0;i<8;i++){
assert.equal(await run('systemSettingsState.task'),i);await action('hint');assert.equal(await run('systemSettingsState.hintVisible'),true);
if(i===0)await click('[data-settings-dock="System Settings"]');
if(i===1){await category('Sound');assert.equal(await run('systemSettingsState.completed.length'),1);await category('Display');}
if(i===2){await slider('brightness',64);assert.equal(await run('systemSettingsState.completed.length'),2);await slider('brightness',65);}
if(i===3){await category('Sound');await category('Display');assert.equal(await run('document.querySelector("[data-setting=brightness]").value'),'65');await category('Sound');}
if(i===4){await slider('outputVolume',44);await run('document.querySelector("[data-setting=outputVolume]").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});assert.equal(await run('systemSettingsState.outputVolume'),45);assert.equal(await run('document.activeElement.dataset.setting'),'outputVolume');}
if(i===5)await category('Trackpad');
if(i===6){await slider('trackingSpeed',74);assert.equal(await run('systemSettingsState.completed.length'),6);const p=await run('(()=>{const r=document.querySelector("[data-setting=trackingSpeed]").getBoundingClientRect();return {x:r.x+r.width*.85,y:r.y+r.height/2};})()');await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
if(i===7){await category('Keyboard');assert.equal(await run('systemSettingsState.completed.length'),7);await slider('keyRepeat',74);assert.equal(await run('systemSettingsState.completed.length'),7);await slider('keyRepeat',75);}
assert.equal(await run('systemSettingsState.completed.length'),i+1);assert.equal(await run('document.querySelector("#system-settings-course [role=progressbar]").getAttribute("aria-valuenow")'),String(i+1));
assert.ok(await run('document.querySelector("[data-settings-action=next]").getBoundingClientRect().bottom<=innerHeight'));
if(i===7){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('system-settings-desktop-test.png',Buffer.from(shot.data,'base64'));}
await action('next');
}
assert.equal(await run('systemSettingsState.view'),'complete');assert.equal(await run('systemSettingsState.incorrect'),2);await action('retry');
assert.deepEqual(await run('[systemSettingsState.task,systemSettingsState.completed.length,systemSettingsState.incorrect,systemSettingsState.activeCategory,systemSettingsState.open,systemSettingsState.brightness,systemSettingsState.outputVolume,systemSettingsState.trackingSpeed,systemSettingsState.keyRepeat,systemSettingsState.hints.length,systemSettingsState.hintVisible,systemSettingsState.keyboardVisited]'),[0,0,0,'Appearance',false,40,25,40,40,0,false,false]);
await run('showDigitalCourse("macos-essentials")');await click('[data-digital-section="system-settings"]');assert.equal(await run('systemSettingsState.view'),'intro');await run('history.back()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('location.hash'),'#macos-essentials');await run('history.forward()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'system-settings');
for(const route of ['file-organization','file-type-detective','local-vs-cloud','file-operations']){await run(`showDigitalPlaceholder('${route}')`);assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'digital-placeholder');}
await run('showMacNavigation()');await click('[data-mac-action=begin]');await click('[data-mac-app=Finder]');assert.equal(await run('macState.completed'),true);
await run('showSpotlightChallenge()');await click('[data-spotlight-action=begin]');await click('[data-spotlight-action=open]');assert.equal(await run('spotlightState.open'),true);
for(const call of ['showDepartment()','showComputerParts()','showInputOutput()','showHardwareSoftware()','openModule("identify")','openModule("function")','openModule("build")','openModule("repair")'])await run(call);
await run('showSystemSettings()');await action('begin');await click('[data-settings-dock="System Settings"]');await category('Display');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');assert.ok(await run('document.documentElement.scrollWidth<=innerWidth'));assert.ok(await run('document.querySelector("[data-setting=brightness]").getBoundingClientRect().width>=100'));
const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('system-settings-mobile-test.png',Buffer.from(shot.data,'base64'));
assert.deepEqual(errors,[]);console.log('PASS: 8 tasks, hints, thresholds, mouse/keyboard, retention, reset, routing, existing module smoke checks, responsive layout, no browser errors.');
await send('Browser.close');
}finally{ws?.close();server.close();browser.kill();}
