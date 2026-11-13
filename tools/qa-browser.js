'use strict';
// Browser QA only: CHALK's offline game, EULA, personal data and authored plays remain unchanged.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const checks=[],errors=[],remote=[];
 function check(name,ok,detail=''){
   checks.push({name,ok:!!ok});
   console.log((ok?'PASS ':'FAIL ')+name+(detail?' — '+detail:''));
 }
 check('one offline HTML distribution',/<html lang="en-GB">/.test(html)&&!/<script[^>]+\bsrc\s*=/.test(html));
 check('EULA remains in source',html.includes('LICENCE_HTML')&&html.includes('LICENCE_VERSION'));
 check('32-play library retained',html.includes('const PLAYS = ['));
 const browser=await chromium.launch({headless:true});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await ctx.route(/^https?:\/\//,route=>{remote.push(route.request().url());return route.abort();});
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(path.join(root,'index.html')).href+'?debug';
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.CHALK,{timeout:15000});
  check('debug-only test entry point opens',await page.title()==='CHALK · Tactical Board');
  const self=await page.evaluate(()=>window.CHALK.selfTest());
  const fails=self.filter(line=>line.startsWith('FAIL'));
  check('all built-in invariants and sanitisation tests',self.length>=20&&fails.length===0,'checks='+self.length+', failures='+fails.join(' | ').slice(0,250));
  const initial=await page.evaluate(()=>({
   boards:window.CHALK.boardList.length,
   tokens:window.CHALK.board.tokens.length,
   phases:window.CHALK.board.frames.length,
   valid:!!window.CHALK.sanitiseBoard(JSON.parse(JSON.stringify(window.CHALK.board)))
  }));
  check('editable board loads with tokens and phases',initial.boards>=1&&initial.tokens>0&&initial.phases>=1&&initial.valid,JSON.stringify(initial));
  const saved=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('chalk')));
  check('local CHALK storage established',saved.length>0,'keys='+saved.length);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>!!window.CHALK,{timeout:15000});
  const restored=await page.evaluate(()=>({
   boards:window.CHALK.boardList.length,tokens:window.CHALK.board.tokens.length,
   phases:window.CHALK.board.frames.length,
   valid:!!window.CHALK.sanitiseBoard(JSON.parse(JSON.stringify(window.CHALK.board)))
  }));
  check('boards survive a browser reload',restored.boards===initial.boards&&restored.tokens===initial.tokens&&restored.phases===initial.phases&&restored.valid,JSON.stringify(restored));
  for(const viewport of [{width:320,height:700},{width:390,height:844},{width:768,height:1024},{width:1280,height:800}]){
   await page.setViewportSize(viewport);
   await page.waitForTimeout(120);
   const d=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
   check(viewport.width+'px no document-wide horizontal overflow',d.width<=d.viewport+3,JSON.stringify(d));
  }
  check('no unhandled JavaScript errors',errors.length===0,errors.slice(0,3).join(' | '));
  check('no external network requests',remote.length===0,remote.slice(0,3).join(' | '));
  await ctx.close();
 }finally{await browser.close();}
 const failed=checks.filter(c=>!c.ok);
 console.log('RESULT:',checks.length-failed.length+'/'+checks.length,'QA checks passed');
 if(failed.length)process.exitCode=1;
})().catch(e=>{console.error('QA ERROR:',e.stack||e);process.exitCode=1});
