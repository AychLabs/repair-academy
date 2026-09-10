import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=http.createServer((req,res)=>{
  if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.join(process.cwd(),req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);
  fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(data);});
}).listen(8774,'127.0.0.1');
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9234','--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'mac-skills-test-')),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;
try{
  let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch('http://127.0.0.1:9234/json')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map(),errors=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const k=++id;pending.set(k,{resolve,reject});ws.send(JSON.stringify({id:k,method,params}));});
  const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const state=expression=>run('macSkillsChallengeState.'+expression);
  const click=q=>run(`document.querySelector(${JSON.stringify(q)}).click()`);
  const action=a=>click(`[data-msc-action="${a}"]`);
  const app=a=>click(`[data-msc-app="${a}"]`);
  const loc=a=>click(`[data-msc-location="${a}"]`);
  const category=a=>click(`[data-msc-category="${a}"]`);
  const key=async key=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:key==='Enter'?13:key==='Escape'?27:key==='ArrowRight'?39:key==='Tab'?9:0});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});};
  const open=async id=>{await run(`document.querySelector('[data-msc-item="${id}"]').focus()`);await key('Enter');};
  const input=(q,value)=>run(`(()=>{const e=document.querySelector(${JSON.stringify(q)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  const slider=(id,value)=>input(`[data-msc-setting="${id}"]`,value);
  const search=async(query,id)=>{await action('search');await input('#msc-search',query);await click(`[data-msc-result="${id}"]`);};
  const completed=async n=>assert.equal(await state('completed.length'),n);
  const rename=async value=>{await action('file-menu');await action('rename');await input('#msc-name',value);await run('document.querySelector("#msc-name").focus()');await key('Enter');};
  await send('Runtime.enable');await send('Log.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:8774/#mac-skills-challenge'});
  for(let i=0;i<100;i++){if(await run('typeof macSkillsChallengeState!=="undefined"&&document.readyState==="complete"'))break;await new Promise(r=>setTimeout(r,50));}
  assert.equal(await state('view'),'intro');assert.equal(await run('macSkillsMissions.length'),10);
  const isolated=await run('JSON.stringify([macState,spotlightState,systemSettingsState])');
  await action('begin');const initial=await run('JSON.stringify(macSkillsChallengeState)');
  assert.deepEqual(await state('runningApps'),[]);
  for(let mission=0;mission<10;mission++){
    assert.equal(await state('missionIndex'),mission);await action('hint');assert.equal(await state('assists'),mission+1);
    if(mission===0){await app('Finder');await completed(0);await loc('downloads');}
    if(mission===1){await loc('documents');await open('class');await open('notes');assert.equal(await state('preview'),'notes');}
    if(mission===2){await app('Finder');await completed(2);await click('[data-msc-view=list]');}
    if(mission===3)await app('Calculator');
    if(mission===4){await app('Finder');assert.ok(await state('runningApps.includes("Calculator")'));}
    if(mission===5){await app('System Settings');await category('Sound');await slider('outputVolume',60);await completed(5);await category('Display');await slider('brightness',54);await completed(5);await slider('brightness',66);await completed(5);await slider('brightness',55);}
    if(mission===6){await category('Trackpad');await slider('trackingSpeed',74);await completed(6);await run('document.querySelector("#msc-setting").focus()');await key('ArrowRight');assert.equal(await state('trackingSpeed'),75);assert.equal(await run('document.activeElement.id'),'msc-setting');}
    if(mission===7){
      await app('Finder');await click('[data-msc-item=practice]');await rename('   ');assert.match(await run('document.querySelector("#msc-rename-error").textContent'),/FILENAME CANNOT BE EMPTY/);await key('Escape');assert.equal(await state('renameId'),null);
      await rename('Almost');await completed(7);assert.match(await state('message'),/NOT QUITE/);
      await action('file-menu');await action('rename');await input('#msc-name','Cancelled');await action('cancel-rename');assert.equal(await run('mscItem("practice").name'),'Almost');
      await rename(' Mac Practice Completed ');assert.equal(await run('mscItem("practice").name'),'Mac Practice Completed');
    }
    if(mission===8){await action('screenshot');assert.equal(await state('files.filter(i=>i.parent==="desktop").length'),1);await action('screenshot');assert.equal(await state('files.filter(i=>i.parent==="desktop").length'),1);}
    if(mission===9){
      await app('Finder');assert.deepEqual(await state('finalMissionGoals'),[false,false,false,false]);
      await click('[data-msc-item=checklist]');assert.deepEqual(await state('finalMissionGoals'),[true,false,false,false]);
      await open('checklist');assert.deepEqual(await state('finalMissionGoals'),[true,true,false,false]);
      await app('Finder');await completed(9);await app('System Settings');await category('Display');await slider('brightness',64);await completed(9);await slider('brightness',75);assert.deepEqual(await state('finalMissionGoals'),[true,true,true,false]);
      await slider('brightness',76);assert.deepEqual(await state('finalMissionGoals'),[true,true,false,false]);await slider('brightness',70);
      const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('mac-skills-desktop-test.png',Buffer.from(shot.data,'base64'));
      await app('Finder');
    }
    await completed(mission+1);
    assert.ok(await run('document.querySelector("[data-msc-action=next]").getBoundingClientRect().bottom<=innerHeight'),'next button inside desktop viewport');
    assert.equal(await run('document.querySelector("#mac-skills-app [role=progressbar]").getAttribute("aria-valuenow")'),String(mission+1));
    await action('next');
  }
  assert.equal(await state('view'),'complete');assert.match(await run('document.querySelector("#mac-skills-app").textContent'),/WEEK 3 TRAINING COMPLETE/);
  assert.equal(await run('JSON.stringify([macState,spotlightState,systemSettingsState])'),isolated);
  await action('retry');assert.equal(await run('JSON.stringify(macSkillsChallengeState)'),initial);
  await app('Finder');await loc('downloads');await action('next');await search('Week 3','notes');await completed(2);await action('next');
  await app('Finder');await click('[data-msc-view=list]');await completed(2);await search('Computer Class','class');await completed(3);await action('next');await search('Calculator','app-Calculator');await completed(4);await action('next');
  await action('app-menu');await action('quit');await app('Finder');await completed(4);await app('Calculator');await app('Finder');await completed(5);
  await loc('documents');const point=await run('(()=>{const r=document.querySelector("[data-msc-item=class]").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
  for(const count of [1,2]){await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:count});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:count});}
  assert.equal(await state('finderLocation'),'class');
  await run('document.querySelector("[data-msc-app=Finder]").focus()');await key('Tab');assert.ok(await run('getComputedStyle(document.activeElement).outlineStyle!=="none"'));
  await click('#mac-skills-course [data-return-macos]');assert.equal(await run('location.hash'),'#macos-essentials');await click('[data-digital-section=mac-skills-challenge]');assert.equal(await state('view'),'intro');
  await run('history.back()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('location.hash'),'#macos-essentials');await run('history.forward()');await new Promise(r=>setTimeout(r,150));assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'mac-skills-challenge');
  for(const route of ['file-organization','file-type-detective','local-vs-cloud','file-operations']){await run(`showDigitalPlaceholder('${route}')`);assert.equal(await run('document.querySelector(".screen.is-active").dataset.screen'),'digital-placeholder');}
  await run('showMacNavigation()');await click('[data-mac-action=begin]');await click('[data-mac-app=Finder]');assert.equal(await run('macState.completed'),true);
  await run('showSpotlightChallenge()');await click('[data-spotlight-action=begin]');await click('[data-spotlight-action=open]');assert.equal(await run('spotlightState.open'),true);
  await run('showSystemSettings()');await click('[data-settings-action=begin]');await click('[data-settings-dock="System Settings"]');assert.equal(await run('systemSettingsState.completed.length'),1);
  for(const call of ['showDepartment()','showComputerParts()','showInputOutput()','showHardwareSoftware()','openModule("identify")','openModule("function")','openModule("build")','openModule("repair")'])await run(call);
  await run('showMacSkillsChallenge()');await action('begin');await app('System Settings');await category('Display');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
  await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');assert.ok(await run('document.documentElement.scrollWidth<=innerWidth'));assert.ok(await run('document.querySelector("#msc-setting").getBoundingClientRect().width>=100'));
  const mobile=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('mac-skills-mobile-test.png',Buffer.from(mobile.data,'base64'));
  assert.deepEqual(errors,[]);
  console.log('PASS: all 10 missions, alternate workflows, thresholds, rename errors/cancel/keyboard, synthetic screenshot, final checklist, hints, full reset, state isolation, mouse/keyboard, routing, legacy smoke checks, responsive layout, zero console errors.');
  await send('Browser.close');
}finally{ws?.close();server.close();browser.kill();}
