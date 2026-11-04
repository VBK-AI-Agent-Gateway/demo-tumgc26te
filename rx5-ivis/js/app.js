// ---- 全局共享状态 ----
const S=Vue.reactive({
 page:'home',
 gear:'P',speed:0,ev:76,fuel:61,
 playing:false,prog:0,music:{t:'起航',ar:'_generator · 电子'},
 navDest:'',navEta:'',routeOn:false,navNext:'直行',navDist:3.4,navEta2:12,cfx:48,cfy:52,
 acRef:{on:true,temp:23,fan:3,circ:'内',ac:true,auto:false,fd:false,rd:false},
 seatHeat:0,vol:60,
 lightsRef:{on:true,toggle(){this.on=!this.on;T(this.on?'近光已开启':'灯已关闭')}},
 locksRef:{locked:true,toggle(){this.locked=!this.locked;T(this.locked?'全车已闭锁':'已解锁，下车注意安全')}},
 mirrorRef:{unfold:true,toggle(){this.unfold=!this.unfold;T(this.unfold?'后视镜已展开':'后视镜已折叠')}},
 roofRef:{open:false,toggle(){this.open=!this.open;T(this.open?'天窗已开启（注意车速>80km/h自动关闭）':'天窗已关闭')}},
 mode:'舒适',showRev:false,park:false,
 theme:'dark',brightRef:80,wifi:{on:true},bt:{on:true,device:'Pixel 7a'},ver:'5.0.1',
 voice:{show:false,listening:false,heard:''},toast:{show:false,msg:''}
});
function T(m){S.toast={show:true,msg:m};clearTimeout(window._tt);window._tt=setTimeout(()=>S.toast.show=false,2000)}
const App={
 data(){return{S,pages:{home:'page-home',nav:'page-nav',ac:'page-ac',media:'page-media',vehicle:'page-vehicle',voice:'page-voice',avm:'page-avm',settings:'page-settings'}}},
 computed:{
   page:{get(){return this.S.page.value},set(v){this.S.page.value=v;window.scrollTo(0,0)}},
   sys()  {return this.S},
   systime(){const d=new Date();const p=n=>String(n).padStart(2,'0');return p(d.getHours())+':'+p(d.getMinutes())},
   theme(){return this.S.theme.value},
   wifi(){return this.S.wifi.value},bt(){return this.S.bt.value},
   ac(){return this.S.acRef.value},
   voice(){return this.S.voice.value},toast(){return this.S.toast.value},
   gear:{get(){return this.S.gear.value},set(v){this.S.gear.value=v;
     if(v==='D'){this.S.speed=Math.max(this.S.speed,30);T('行车中 · 娱乐受限，导航优先')}
     if(v==='P'){this.S.speed=0;T('P 挡驻车 · 娱乐解锁')}}},
   speed(){return this.S.speed.value},ev(){return this.S.ev.value},fuel(){return this.S.fuel.value}
 },
 methods:{
   toggleTheme(){this.S.theme.value=this.S.theme.value==='dark'?'light':'dark'},
   applyBright(v){document.body.style.filter='brightness('+(0.5+v/100*0.6)+')'},
   toast(m){T(m)},
   startRoute(p){this.S.navDest.value=p.n;this.S.routeOn.value=true;this.S.navEta2.value=12;this.S.navDist.value=3.4;this.S.navNext.value='前方 500 米右转'},
   openVoice(h){this.S.voice.value={show:true,listening:true,heard:h};this._vh=setTimeout(()=>this.S.voice.value.show=false,2400)},
   execVoice(c){
     this.S.voice.value={show:true,listening:false,heard:c.c};
     const map={'打开空调':()=>{this.S.acRef.value.on=true;T('空调已打开')},
       '关闭空调':()=>{this.S.acRef.value.on=false;T('空调已关闭')},
       '导航去公司':()=>{this.S.page.value='nav';startRoute(window.POIS[0])},
       '播放音乐':()=>{this.S.page.value='media';this.S.playing.value=true;T('开始播放')},
       '打开天窗':()=>{this.S.roofRef.value.open=true;T('天窗已开启')},
       '打开360全景':()=>{this.S.page.value='avm';T('打开360全景')},
       '调到二十三度':()=>{this.S.acRef.value.temp=23;T('温度已调至 23°C')},
       '打开座椅加热':()=>{this.S.seatHeat.value=2;T('座椅加热 2 档')},
       '切换节能模式':()=>{this.S.mode.value='节能';T('已切换 节能 模式')}
     };
     (map[c.c]||(()=>T('没听懂 · 已为你搜索')))();
     clearTimeout(this._vh);this._vh=setTimeout(()=>this.S.voice.value.show=false,1600)
   }
 },
 provide(){return{s:this.S}},
 created(){
   setInterval(()=>{if(S.playing.value){S.prog.value=(S.prog.value+1)%100}},950);
   if(S.gear.value==='D'&&S.routeOn.value===false){}
 },
 mounted(){
   document.documentElement.setAttribute('data-theme',this.theme);
   this.applyBright(this.S.brightRef.value);
   const ARG=(window.__QUERY__(new URLSearchParams(location.search)));
   if(ARG&&ARG.gear){this.S.gear.value=ARG}
 }
}
Vue.createApp(App)
 .component('page-home',HomeComp)
 .component('page-nav',NavComp)
 .component('page-ac',AcComp)
 .component('page-media',MediaComp)
 .component('page-vehicle',VehicleComp)
 .component('page-voice',VoiceComp)
 .component('page-avm',AvmComp)
 .component('page-settings',SettingsComp)
 .mount('#app');
