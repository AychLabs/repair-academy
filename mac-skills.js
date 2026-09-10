'use strict';

// Stable IDs allow renaming without changing navigation or assessment identity.
// Only pure graphics/escaping and read-only category definitions are shared.
const macSkillsMissions = [
  ['GO TO DOWNLOADS', 'Open the Downloads folder.', 'Think about where you normally browse files on a Mac.', 'Finder gives you quick access to common locations such as Downloads and Documents.'],
  ['FIND YOUR CLASS NOTES', 'Locate and open: Week 3 Notes', 'You learned two different ways to find files.', 'There is often more than one efficient way to locate a file on a Mac.'],
  ['ORGANIZE YOUR VIEW', 'Show the Computer Class folder in List View.', 'Finder has controls that change how items are displayed.', 'Finder views change how files are displayed without changing the files themselves.'],
  ['OPEN CALCULATOR', 'Open Calculator quickly.', 'There is more than one way to launch an app.', 'The Dock and Spotlight are both useful ways to launch applications.'],
  ['BACK TO FINDER', 'Leave Calculator running and switch back to Finder.', 'Look at which applications are already running.', 'You can switch between running applications without quitting them.'],
  ['ADJUST YOUR SCREEN', 'Set display brightness to about 60%.', 'Mac configuration options are grouped in one application.', 'Display controls are found in System Settings.'],
  ['SPEED UP THE TRACKPAD', 'Set Trackpad tracking speed to a fast setting.', 'Look for the settings category related to the trackpad.', 'System Settings groups controls by category so you can quickly find related options.'],
  ['FIX THE FILENAME', 'In the Computer Class folder, rename Mac Practice to: Mac Practice Completed', 'Finder provides commands for selected files and folders.', 'Clear filenames make files and folders easier to recognize and organize.'],
  ['TAKE A SCREENSHOT', 'Take a screenshot of the simulated Mac screen.', 'The real Mac shortcut is Shift + Command + 3.', 'On a real Mac, Shift + Command + 3 captures the entire screen.'],
  ['PREPARE FOR CLASS', 'Your teacher asks you to complete all four goals below.', 'Break the mission into the four checklist goals.', 'You combined file navigation, applications, and settings to prepare for class.']
];
const macSkillsApps = [['Finder','☻'],['Safari','◈'],['Notes','▤'],['Calculator','+'],['System Settings','⚙']];
const macSkillsGoalLabels = ['Find Mac Skills Checklist.pdf', 'Open the file', 'Set brightness to about 70%', 'Return to Finder'];
const macSkillsApp = document.querySelector('#mac-skills-app');
let macSkillsChallengeState;
function resetMacSkills(view = 'training') {
  macSkillsChallengeState = {
    view, missionIndex:0, completed:[], assists:0, hintVisible:false,
    finderLocation:'documents', finderView:'icon', selectedItem:null,
    runningApps:[], activeApp:'Finder', visibleApps:[], menu:null,
    spotlightOpen:false, query:'', searchIndex:0, preview:null, renameId:null, message:'',
    systemSettingsCategory:'Appearance', brightness:40, outputVolume:25, trackingSpeed:40, keyRepeat:40,
    screenshotCreated:false, finalMissionGoals:[false,false,false,false], calculatorText:'0',
    files:[
      ['desktop','Desktop','folder',null], ['documents','Documents','folder',null],
      ['downloads','Downloads','folder',null], ['applications','Applications','folder',null],
      ['class','Computer Class','folder','documents'], ['notes','Week 3 Notes','document','class'],
      ['practice','Mac Practice','folder','class'], ['checklist','Mac Skills Checklist.pdf','document','class'],
      ['guide','Setup_Guide.pdf','document','downloads'], ['image','Class_Image.png','document','downloads'],
      ...macSkillsApps.filter(([name])=>name!=='Finder').map(([name])=>['app-'+name,name,'application','applications'])
    ].map(([id,name,type,parent])=>({id,name,type,parent}))
  };
}
resetMacSkills('intro');
const mscEscape = value => spotlightEscape(value);
const mscButton = (action,label,primary=false) => `<button type="button" class="${primary?'primary':'secondary'}-button" data-msc-action="${action}">${label}</button>`;
function showMacSkillsChallenge(updateHistory=true) {
  activeDigitalCourseId='macos-essentials';
  document.title='Mac Skills Challenge | Repair Academy';
  if(updateHistory) history.pushState({screen:'mac-skills-challenge'},'', '#mac-skills-challenge');
  resetMacSkills('intro');
  macSkillsApp.innerHTML=`<section class="mac-intro tech-corners"><div class="training-badge" aria-hidden="true">04</div><p class="section-kicker">SECTION 04</p><h1 id="mac-skills-title">MAC SKILLS CHALLENGE</h1><p class="training-subtitle">Week 3 Capstone</p><p class="intro-instruction">Put your Mac skills to the test. Complete real tasks using Finder, Spotlight, the Dock, Menu Bar, and System Settings.</p><div class="mac-task-count"><strong>10</strong><span>SKILLS MISSIONS</span></div><p>YOU'VE TRAINED FOR THIS.</p><div class="intro-actions">${mscButton('begin','BEGIN CHALLENGE',true)}${mscButton('course','RETURN TO macOS ESSENTIALS')}</div></section>`;
  showScreen('mac-skills-challenge');
}
function mscItem(id){return macSkillsChallengeState.files.find(item=>item.id===id);}
function mscResults(){const s=macSkillsChallengeState;return s.query.trim()?s.files.filter(item=>item.name.toLowerCase().includes(s.query.trim().toLowerCase())).slice(0,8):[];}
function mscActivate(name){const s=macSkillsChallengeState;if(!s.runningApps.includes(name))s.runningApps.push(name);if(!s.visibleApps.includes(name))s.visibleApps.push(name);s.activeApp=name;s.menu=null;}
function mscLocate(id){const s=macSkillsChallengeState;mscActivate('Finder');s.finderLocation=id;s.selectedItem=null;s.renameId=null;}
function mscOpen(id){
  const s=macSkillsChallengeState,item=mscItem(id);if(!item)return;
  s.spotlightOpen=false;s.menu=null;
  if(item.type==='folder')mscLocate(id);
  else if(item.type==='application')mscActivate(item.name);
  else {s.preview=id;mscActivate('Preview');}
  mscCheck('open',id);
}
// Evidence comes from actual actions in the current mission. Earlier exploration
// cannot pre-complete the final checklist; Return requires all three prior goals.
function mscCheck(event,id) {
  const s=macSkillsChallengeState,m=s.missionIndex;
  if(s.completed.includes(m))return;
  const finder=s.activeApp==='Finder'&&s.visibleApps.includes('Finder');
  if(m===9){
    const g=s.finalMissionGoals;
    if((event==='select'||event==='open')&&id==='checklist')g[0]=true;
    if(event==='open'&&id==='checklist')g[1]=true;
    if(event==='setting'&&id==='brightness'&&s.systemSettingsCategory==='Display')g[2]=s.brightness>=65&&s.brightness<=75;
    if(g[0]&&g[1]&&g[2]&&finder&&(event==='activate'||event==='open'||event==='location'))g[3]=true;
  }
  const correct=[
    finder&&s.finderLocation==='downloads',
    event==='open'&&id==='notes',
    finder&&s.finderLocation==='class'&&s.finderView==='list',
    s.activeApp==='Calculator'&&s.visibleApps.includes('Calculator'),
    finder&&s.runningApps.includes('Calculator'),
    event==='setting'&&id==='brightness'&&s.systemSettingsCategory==='Display'&&s.brightness>=55&&s.brightness<=65,
    event==='setting'&&id==='trackingSpeed'&&s.systemSettingsCategory==='Trackpad'&&s.trackingSpeed>=75,
    event==='rename'&&id==='practice'&&mscItem('practice').name==='Mac Practice Completed',
    event==='screenshot',s.finalMissionGoals.every(Boolean)
  ][m];
  if(correct){s.completed.push(m);s.message='';s.menu=null;}
}
function mscWindow(name,body,classes=''){
  const s=macSkillsChallengeState;
  return `<section class="mac-window ${classes} ${s.activeApp===name?'is-active':''}" aria-label="${mscEscape(name)} window"><header class="mac-window-title"><button type="button" data-msc-close="${name}" aria-label="Close ${name} window">×</button><strong>${mscEscape(name)}</strong></header>${body}</section>`;
}
function mscFinder(){
  const s=macSkillsChallengeState;
  return mscWindow('Finder',`<div class="mac-finder-toolbar"><button type="button" data-msc-location="${mscItem(s.finderLocation).parent||'documents'}" aria-label="Enclosing folder">↑</button><strong>${mscEscape(mscItem(s.finderLocation).name)}</strong><span class="mac-view-controls" aria-label="Finder views">${['icon','list'].map(view=>`<button type="button" data-msc-view="${view}" aria-pressed="${s.finderView===view}" class="${s.finderView===view?'is-selected':''}">${view==='list'?'List':'Icons'}</button>`).join('')}</span></div><div class="mac-finder-body"><nav class="mac-sidebar" aria-label="Finder Sidebar"><strong>Favorites</strong>${['desktop','documents','downloads','applications'].map(id=>`<button type="button" data-msc-location="${id}" class="${s.finderLocation===id?'is-selected':''}" aria-current="${s.finderLocation===id?'page':'false'}">${mscItem(id).name}</button>`).join('')}</nav><div class="mac-content mac-${s.finderView}-view" aria-label="Folder contents">${s.files.filter(item=>item.parent===s.finderLocation).map(item=>`<button type="button" class="mac-file mac-${item.type}" data-msc-item="${item.id}" aria-pressed="${s.selectedItem===item.id}" title="Select; double-click or press Enter to open"><span aria-hidden="true">${item.type==='application'?'▧':''}</span><b>${mscEscape(item.name)}</b>${s.finderView==='list'?`<small>${item.type}</small>`:''}</button>`).join('')||'<p class="mac-empty">No items</p>'}</div></div>`,'mac-finder');
}
function mscSettings(){
  const s=macSkillsChallengeState,control=settingsControls[s.systemSettingsCategory];
  const panel=control?`<div class="settings-group"><p>${control[4]}</p><div class="settings-control-label"><label for="msc-setting">${control[1]}</label><output id="msc-setting-value" for="msc-setting">${s[control[0]]}%</output></div><input id="msc-setting" data-msc-setting="${control[0]}" type="range" min="0" max="100" value="${s[control[0]]}" aria-valuetext="${s[control[0]]} percent"><div class="settings-scale"><span>${control[2]}</span><span>${control[3]}</span></div></div>`:'<div class="settings-group">Choose a category to explore its controls.</div>';
  return mscWindow('System Settings',`<div class="settings-window-body"><nav class="settings-sidebar" aria-label="Settings categories">${settingsCategories.map(category=>`<button type="button" data-msc-category="${category}" aria-current="${s.systemSettingsCategory===category?'page':'false'}">${category}</button>`).join('')}</nav><div class="settings-panel"><h2>${s.systemSettingsCategory}</h2>${panel}<p class="settings-simulation-note">Practice Mac · Changes apply only to this simulation.</p></div></div>`,'settings-window');
}
function mscPreview(){
  const s=macSkillsChallengeState,item=mscItem(s.preview);
  return mscWindow('Preview',`<div class="msc-document">${item?`<h2>${mscEscape(item.name)}</h2>${item.id==='checklist'?'<strong>MAC SKILLS CHECKLIST</strong><p>✓ Finder</p><p>✓ Spotlight</p><p>✓ System Settings</p><p>✓ File Navigation</p>':item.id==='notes'?'<p>WEEK 3 — MAC ESSENTIALS</p><p>Find your class materials, switch between applications, and prepare your Mac for learning.</p>':'<p>Simulated file preview</p>'}`:'<p>No document open.</p>'}</div>`,'msc-preview');
}
function mscRenderDesktop(){
  const s=macSkillsChallengeState,host=macSkillsApp.querySelector('#msc-desktop');
  const focused=document.activeElement;const focusId=focused?.id;const focusData=focused?.dataset?Object.entries(focused.dataset).find(([key])=>key.startsWith('msc')):null;
  host.innerHTML=`<div class="mac-menu-bar"><button type="button" class="mac-app-menu" data-msc-action="app-menu" aria-expanded="${s.menu==='app'}">${s.activeApp}</button><button type="button" class="mac-app-menu" data-msc-action="file-menu" aria-expanded="${s.menu==='file'}">File</button><span class="mac-menu-items" aria-hidden="true">Edit &nbsp; View ${s.activeApp==='Finder'?'&nbsp; Go':''} &nbsp; Window &nbsp; Help</span><span class="mac-status-items"></span><button type="button" class="spotlight-menu-search" data-msc-action="search" aria-label="Open Spotlight">⌕ Search</button>${s.menu?`<div class="mac-app-menu-popover">${s.menu==='file'&&s.activeApp==='Finder'?`<button type="button" data-msc-action="open-selected" ${!s.selectedItem?'disabled':''}>Open</button><button type="button" data-msc-action="rename" ${!s.selectedItem?'disabled':''}>Rename…</button>`:s.menu==='app'&&s.activeApp!=='Finder'?`<button type="button" data-msc-action="quit">Quit ${s.activeApp}</button>`:'<span>No commands needed here.</span>'}</div>`:''}</div><div class="mac-wallpaper"><div class="msc-desktop-files">${s.files.filter(item=>item.parent==='desktop').map(item=>`<button type="button" class="mac-file mac-document" data-msc-open="${item.id}"><span aria-hidden="true"></span><b>${mscEscape(item.name)}</b></button>`).join('')}</div>${s.visibleApps.map(name=>name==='Finder'?mscFinder():name==='System Settings'?mscSettings():name==='Preview'?mscPreview():name==='Calculator'?mscWindow(name,`<div class="mac-calc-display">${mscEscape(s.calculatorText)}</div><div class="mac-calc-keys">${['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(key=>`<button type="button" data-msc-calc="${key}">${key}</button>`).join('')}</div>`,'mac-calculator'):mscWindow(name,`<div class="msc-document"><h2>${name}</h2><p>Practice application is open.</p></div>`)).join('')}</div><nav class="mac-dock" aria-label="Simulated Dock">${macSkillsApps.map(([name,glyph])=>`<button type="button" class="mac-dock-app mac-icon-${name.toLowerCase().replaceAll(' ','-')} ${s.activeApp===name?'is-active':''}" data-msc-app="${name}" aria-label="${name}${s.runningApps.includes(name)?', running':''}"><span aria-hidden="true">${glyph}</span><small>${name}</small>${s.runningApps.includes(name)?'<i aria-hidden="true"></i>':''}</button>`).join('')}</nav><section class="spotlight-panel" aria-label="Spotlight search" ${s.spotlightOpen?'':'hidden'}><div class="spotlight-search-row"><label class="spotlight-sr-only" for="msc-search">Search apps, files, and folders</label><input id="msc-search" type="search" placeholder="Spotlight Search" autocomplete="off" value="${mscEscape(s.query)}"><button type="button" data-msc-action="close-search" aria-label="Close Spotlight">Esc</button></div><div id="msc-search-results"></div><div class="spotlight-key-help">REAL MAC SHORTCUT: ⌘ Space · ↑ ↓ Select · Enter Open</div></section>${s.renameId?`<form class="msc-rename" role="dialog" aria-modal="true" aria-label="Rename item"><label for="msc-name">Rename ${mscEscape(mscItem(s.renameId).name)}</label><input id="msc-name" maxlength="120" value="${mscEscape(mscItem(s.renameId).name)}" aria-describedby="msc-rename-error"><p id="msc-rename-error" role="alert"></p><button type="submit">Confirm</button><button type="button" data-msc-action="cancel-rename">Cancel</button></form>`:''}`;
  mscRenderSearch();
  if(focusId)host.querySelector('#'+focusId)?.focus({preventScroll:true});
  else if(focusData)Array.from(host.querySelectorAll('button')).find(button=>button.dataset[focusData[0]]===focusData[1])?.focus({preventScroll:true});
}
function mscRenderSearch(){
  const s=macSkillsChallengeState,results=mscResults(),host=macSkillsApp.querySelector('#msc-search-results');if(!host)return;
  host.innerHTML=results.map((item,index)=>`<button type="button" class="spotlight-result ${index===s.searchIndex?'is-selected':''}" data-msc-result="${item.id}">${spotlightIcon(item)}<span><strong>${mscEscape(item.name)}</strong><small>${item.type} · ${mscEscape(mscItem(item.parent)?.name||'Home')}</small></span></button>`).join('')||`<p class="spotlight-empty">${s.query.trim()?'No results':'Type to search your Mac.'}</p>`;
}
function mscStatus(){
  const s=macSkillsChallengeState,done=s.completed.includes(s.missionIndex),task=macSkillsMissions[s.missionIndex];
  macSkillsApp.querySelector('#msc-assists').textContent='ASSISTS: '+s.assists;
  const progress=macSkillsApp.querySelector('[role=progressbar]');progress.setAttribute('aria-valuenow',s.completed.length);progress.firstElementChild.style.width=s.completed.length*10+'%';
  const feedback=macSkillsApp.querySelector('#msc-feedback');feedback.classList.toggle('is-complete',done);
  const status=done?`<strong>${s.missionIndex===9?'FINAL MISSION COMPLETE':'MISSION COMPLETE'}</strong><p>${task[3]}</p>`:mscEscape(s.message||'Complete the mission in the practice Mac.');
  if(macSkillsApp.querySelector('#msc-status').innerHTML!==status)macSkillsApp.querySelector('#msc-status').innerHTML=status;
  const next=macSkillsApp.querySelector('#msc-next');if(done&&!next.children.length)next.innerHTML=mscButton('next',s.missionIndex===9?'FINISH CHALLENGE':'NEXT MISSION',true);
  const goals=macSkillsApp.querySelector('#msc-goals');if(goals)goals.innerHTML=macSkillsGoalLabels.map((label,i)=>`<li>${s.finalMissionGoals[i]?'☑':'□'} ${label}<span class="spotlight-sr-only">${s.finalMissionGoals[i]?' complete':' incomplete'}</span></li>`).join('');
}
function mscRenderTraining(){
  const s=macSkillsChallengeState,task=macSkillsMissions[s.missionIndex];
  macSkillsApp.innerHTML=`<section class="mac-training"><div class="mac-task-header"><div><p class="section-kicker">${s.missionIndex===9?'FINAL MISSION':'MISSION '+String(s.missionIndex+1).padStart(2,'0')}</p><h1 id="mac-skills-title" tabindex="-1">${task[0]}</h1><p id="msc-instruction">${task[1]}</p></div><div class="mac-progress-copy"><strong>MISSION ${s.missionIndex+1} / 10</strong><span id="msc-assists"></span></div></div>${s.missionIndex===9?'<ul id="msc-goals" class="msc-checklist" aria-live="polite"></ul>':''}<div class="progress-track mac-progress" role="progressbar" aria-label="Missions completed" aria-valuemin="0" aria-valuemax="10" aria-valuenow="0"><span></span></div><div class="mac-help-row"><button type="button" class="secondary-button" data-msc-action="hint" aria-expanded="false" aria-controls="msc-hint">HINT</button><p id="msc-hint" class="mac-hint" hidden>${task[2]}</p>${s.missionIndex===8?`${mscButton('screenshot','TAKE SCREENSHOT')}<span class="msc-shortcut">REAL MAC SHORTCUT: ⇧ + ⌘ + 3</span>`:'<span class="msc-shortcut">REAL MAC SHORTCUT: ⌘ Space · Spotlight</span>'}</div><div id="msc-desktop" class="mac-desktop" aria-describedby="msc-instruction"></div><div id="msc-feedback" class="mac-feedback"><div id="msc-status" role="status" aria-live="polite"></div><div id="msc-next"></div></div></section>`;
  mscRenderDesktop();mscStatus();
}
function mscComplete(){
  const s=macSkillsChallengeState;s.view='complete';
  const rating=s.assists===0?'MAC MASTER':s.assists<=2?'MAC PRO':s.assists<=4?'MAC READY':'TRAINING COMPLETE';
  macSkillsApp.innerHTML=`<section class="mac-complete tech-corners"><div class="completion-mark" aria-hidden="true">✓</div><p class="section-kicker">macOS ESSENTIALS COMPLETE</p><h1 id="mac-skills-title" tabindex="-1">MAC SKILLS CHALLENGE</h1><div class="result-score"><strong>10 / 10</strong><span>MISSIONS COMPLETE</span></div><p class="series-complete">WEEK 3 TRAINING COMPLETE</p><p>You demonstrated skills using Finder, Spotlight, applications, System Settings, file renaming, and screenshots.</p><strong>${rating}</strong><p>ASSISTS USED: ${s.assists}</p><div class="results-actions">${mscButton('retry','RETRY CHALLENGE',true)}${mscButton('course','RETURN TO macOS ESSENTIALS')}${mscButton('digital','DIGITAL SKILLS')}</div></section>`;
  macSkillsApp.querySelector('h1').focus();
}
function mscRenameCancel(){macSkillsChallengeState.renameId=null;mscRenderDesktop();macSkillsApp.querySelector('[data-msc-action="file-menu"]').focus();}
macSkillsApp.addEventListener('submit',event=>{
  if(!event.target.matches('.msc-rename'))return;event.preventDefault();
  const s=macSkillsChallengeState,name=macSkillsApp.querySelector('#msc-name').value.trim();
  if(!name){macSkillsApp.querySelector('#msc-rename-error').textContent='FILENAME CANNOT BE EMPTY';macSkillsApp.querySelector('#msc-name').focus();return;}
  const id=s.renameId;mscItem(id).name=name;s.renameId=null;
  if(s.missionIndex===7&&(id!=='practice'||name!=='Mac Practice Completed'))s.message='NOT QUITE — CHECK THE REQUIRED NAME';
  mscCheck('rename',id);mscRenderDesktop();mscStatus();macSkillsApp.querySelector(`[data-msc-item="${id}"]`)?.focus();
});
macSkillsApp.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;if(b.type==='submit'&&b.closest('.msc-rename'))return;const d=b.dataset,s=macSkillsChallengeState,a=d.mscAction;
  if(a==='course'){showDigitalCourse('macos-essentials');return;}
  if(a==='digital'){showDigitalSkills();return;}
  if(a==='begin'||a==='retry'){resetMacSkills();mscRenderTraining();macSkillsApp.querySelector('h1').focus();return;}
  if(s.view!=='training')return;
  if(s.renameId&&a!=='cancel-rename'&&!b.closest('.msc-rename'))return;
  if(a==='hint'){s.assists++;s.hintVisible=true;macSkillsApp.querySelector('#msc-hint').hidden=false;b.setAttribute('aria-expanded','true');mscStatus();return;}
  if(a==='next'&&s.completed.includes(s.missionIndex)){
    if(s.missionIndex===9){mscComplete();return;}
    s.missionIndex++;s.hintVisible=false;s.message='';s.menu=null;s.spotlightOpen=false;s.renameId=null;
    mscRenderTraining();macSkillsApp.querySelector('h1').focus();return;
  }
  if(a==='cancel-rename'){mscRenameCancel();return;}
  if(a==='search'){s.spotlightOpen=true;s.menu=null;mscRenderDesktop();macSkillsApp.querySelector('#msc-search').focus();return;}
  if(a==='close-search'){s.spotlightOpen=false;mscRenderDesktop();macSkillsApp.querySelector('[data-msc-action="search"]').focus();return;}
  if(a==='file-menu'||a==='app-menu'){const menu=a==='file-menu'?'file':'app';s.menu=s.menu===menu?null:menu;}
  if(a==='open-selected'&&s.selectedItem)mscOpen(s.selectedItem);
  if(a==='rename'&&s.selectedItem){s.renameId=s.selectedItem;s.menu=null;mscRenderDesktop();macSkillsApp.querySelector('#msc-name').focus();macSkillsApp.querySelector('#msc-name').select();return;}
  if(a==='quit'){s.runningApps=s.runningApps.filter(name=>name!==s.activeApp);s.visibleApps=s.visibleApps.filter(name=>name!==s.activeApp);s.activeApp='Finder';s.menu=null;}
  if(d.mscClose){s.visibleApps=s.visibleApps.filter(name=>name!==d.mscClose);s.activeApp=s.visibleApps.at(-1)||'Finder';s.menu=null;}
  if(d.mscApp){mscActivate(d.mscApp);mscCheck('activate',d.mscApp);}
  if(d.mscLocation){mscLocate(d.mscLocation);mscCheck('location',d.mscLocation);}
  if(d.mscView){s.finderView=d.mscView;mscActivate('Finder');mscCheck('view');}
  if(d.mscItem){
    s.selectedItem=d.mscItem;mscActivate('Finder');mscCheck('select',d.mscItem);
    // Preserve the node for native double-click opening.
    macSkillsApp.querySelectorAll('[data-msc-item]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.mscItem===s.selectedItem)));
    macSkillsApp.querySelector('[data-msc-action="app-menu"]').textContent='Finder';
    macSkillsApp.querySelectorAll('.mac-window').forEach(win=>win.classList.toggle('is-active',win.classList.contains('mac-finder')));
    macSkillsApp.querySelectorAll('.mac-dock-app').forEach(button=>button.classList.toggle('is-active',button.dataset.mscApp==='Finder'));mscStatus();return;
  }
  if(d.mscOpen||d.mscResult)mscOpen(d.mscOpen||d.mscResult);
  if(d.mscCategory){s.systemSettingsCategory=d.mscCategory;mscActivate('System Settings');}
  if(d.mscCalc){
    const key=d.mscCalc;if(key==='AC')s.calculatorText='0';else if(key==='±')s.calculatorText=String(-Number(s.calculatorText)||0);else if(key==='%')s.calculatorText=String(Number(s.calculatorText)/100||0);else if(key==='='){const result=parseSpotlightCalculation(s.calculatorText.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-'));s.calculatorText=result?result.name:s.calculatorText;}else s.calculatorText=(s.calculatorText==='0'?'':s.calculatorText).concat(key).slice(0,22);
  }
  if(a==='screenshot'){
    // Synthetic metadata only: no capture API, filesystem, download or permission.
    if(!s.screenshotCreated){const now=new Date(),pad=n=>String(n).padStart(2,'0');s.files.push({id:'screenshot',type:'document',parent:'desktop',name:`Screenshot ${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} at ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.png`});s.screenshotCreated=true;}
    mscCheck('screenshot');
  }
  mscRenderDesktop();mscStatus();
  if(d.mscOpen||d.mscResult||d.mscClose)macSkillsApp.querySelector('[data-msc-action="file-menu"]').focus();
  if(a==='screenshot'){const flash=document.createElement('div');flash.className='msc-flash';flash.setAttribute('aria-hidden','true');macSkillsApp.querySelector('#msc-desktop').append(flash);setTimeout(()=>flash.remove(),500);}
});
macSkillsApp.addEventListener('dblclick',event=>{const id=event.target.closest('[data-msc-item]')?.dataset.mscItem;if(id&&!macSkillsChallengeState.renameId){mscOpen(id);mscRenderDesktop();mscStatus();}});
macSkillsApp.addEventListener('input',event=>{
  const s=macSkillsChallengeState;
  if(event.target.id==='msc-search'){s.query=event.target.value;s.searchIndex=0;mscRenderSearch();return;}
  const id=event.target.dataset.mscSetting;if(!id)return;
  s[id]=Number(event.target.value);event.target.setAttribute('aria-valuetext',s[id]+' percent');macSkillsApp.querySelector('#msc-setting-value').textContent=s[id]+'%';
  // Do not replace the range node during dragging or keyboard adjustment.
  mscCheck('setting',id);mscStatus();
});
macSkillsApp.addEventListener('keydown',event=>{
  const s=macSkillsChallengeState;if(s.view!=='training')return;
  if(s.renameId){ if(event.key==='Enter'&&event.target.id==='msc-name'){event.preventDefault();event.target.form.requestSubmit();return;}
    if(event.key==='Escape'){event.preventDefault();mscRenameCancel();}
    if(event.key==='Tab'){const nodes=[...macSkillsApp.querySelectorAll('.msc-rename input,.msc-rename button')];if(event.shiftKey&&event.target===nodes[0]){event.preventDefault();nodes.at(-1).focus();}else if(!event.shiftKey&&event.target===nodes.at(-1)){event.preventDefault();nodes[0].focus();}}
    return;
  }
  if(event.key==='Escape'){s.spotlightOpen=false;s.menu=null;mscRenderDesktop();macSkillsApp.querySelector('[data-msc-action="search"]').focus();return;}
  if(event.target.id==='msc-search'){
    const results=mscResults();
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();s.searchIndex=(s.searchIndex+(event.key==='ArrowDown'?1:-1)+results.length)%Math.max(results.length,1);mscRenderSearch();}
    if(event.key==='Enter'&&results[s.searchIndex]){event.preventDefault();mscOpen(results[s.searchIndex].id);mscRenderDesktop();mscStatus();macSkillsApp.querySelector('[data-msc-action="search"]').focus();}
  }
  if(event.key==='Enter'&&event.target.dataset.mscItem){event.preventDefault();mscOpen(event.target.dataset.mscItem);mscRenderDesktop();mscStatus();macSkillsApp.querySelector('[data-msc-action="file-menu"]').focus();}
});
