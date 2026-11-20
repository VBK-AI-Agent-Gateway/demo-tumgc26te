const NavComp={
 template:`
 <div class="page" style="padding:0">
  <div class="navmap">
    <div class="roads">
      <div class="ro major" style="top:20%;left:0;width:100%;height:16px"></div>
      <div class="ro major" style="top:56%;left:0;width:100%;height:20px"></div>
      <div class="ro major" style="top:80%;left:0;width:100%;height:14px"></div>
      <div class="ro" style="left:20%;top:0;width:14px;height:100%"></div>
      <div class="ro" style="left:48%;top:0;width:18px;height:100%"></div>
      <div class="ro" style="left:78%;top:0;width:12px;height:100%"></div>
      <div class="ro" style="top:36%;left:30%;width:26%;height:10px;transform:rotate(8deg)"></div>
      <div class="ro" style="top:66%;left:60%;width:30%;height:10px;transform:rotate(-12deg)"></div>
    </div>
    <div class="car" :style="{left:cfx+'%',top:cfy+'%'}"></div>
    <div class="navbanner" v-if="routeOn">{{nextCmd}} · {{distLeft}}km · {{etaLeft}} 分钟</div>
    <div class="navhead">
      <div class="navsearch">
        🔍<input v-model="kw" @keyup.enter="searchGo" placeholder="搜索目的地 / 充电站 / 加油站">
        <span class="mic" @click="callVoice" title="可见即可说">🎙️</span>
      </div>
    </div>
    <div class="nav-tips">
      <div class="nav-tip" @click="setDest(POIS[0])"><span class="acc">3.4km</span><b>公司 · 陆家嘴软件园</b><br>12 min</div>
      <div class="nav-tip" @click="setDest(POIS[3])"><span class="acc">1.8km</span><b>充电站 · 特来电</b><br>快充 ×6</div>
      <div class="nav-tip" @click="setDest(POIS[4])"><span class="acc">4.6km</span><b>加油站 · 中石化</b><br>92# / 95#</div>
    </div>
    <div class="lane" v-if="routeOn"><span class="straight on"></span><span class="left"></span><span class="right"></span><span class="straight"></span></div>
    <transition name="pop"><div v-if="tip" class="toast" style="top:auto;bottom:88px">{{tip}}</div></transition>
  </div>
 </div>`,
 inject:['s'],
 data(){return{kw:'',tip:''}},
 computed:{
  POIS(){return window.POIS},
  routeOn(){return this.s.routeOn.value},nextCmd(){return this.s.navNext.value},
  distLeft(){return this.s.navDist.value},etaLeft(){return this.s.navEta2.value},
  cfx(){return this.s.cfx.value},cfy(){return this.s.cfy.value}
 },
 methods:{
  setDest(p){this.s.startRoute(p);this.tip='已规划路线 · '+p.n;setTimeout(()=>this.tip='',1800)},
  searchGo(){if(!this.kw.trim())return;this.setDest({n:this.kw,d:'已在地图范围内'});this.kw=''},
  callVoice(){this.s.openVoice('导航去'+(this.kw||'公司'))}
 }
}
