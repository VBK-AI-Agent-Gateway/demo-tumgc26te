const HomeComp={
 template:`
 <div class="home">
   <div class="card car3d">
     <h3><b>荣威 RX5</b> <span style="font-size:12px">· 旗舰智驾版</span>
       <span :style="readyTo?'color:var(--acc)':'color:var(--ok)'" style="margin-left:auto;font-size:12px">
         {{readyTo?'⚡ 通电就绪':'🟢 P 挡驻车'}}</span></h3>
     <div class="stage3d"><div class="body3d"><span class="lights"></span><div class="wheel l"></div><div class="wheel r"></div></div></div>
     <div class="hud">
       <div class="g spd"><div class="v">{{spd}}<small>km/h</small></div><div class="l">车速</div></div>
       <div class="g ev"><div class="v">{{ev}}<small>%</small></div><div class="l">电量</div></div>
       <div class="g fuel"><div class="v">{{fuel}}<small>%</small></div><div class="l">油量</div></div>
     </div>
   </div>
   <div class="right">
     <div class="card navcard" :class="{d:gear==='D'}" @click="go('nav')">
       <div class="mini-map"><div class="route"></div></div>
       <div class="addr">🧭 {{navDest||'导航 · 去哪里'}}</div>
       <div class="meta">{{navEta||'输入目的地或点下方快捷目的地'}}</div>
       <div class="hint" v-if="gear==='D'">D 挡 · 导航优先展示</div>
     </div>
   </div>
   <div class="card musiccard" @click="go('media')">
     <div class="cover">🎵</div>
     <div class="mi">
       <div class="tt">{{music.t}}</div><div class="ar">{{music.ar}}</div>
       <div class="bar"><i :style="{width:prog+'%'}"></i></div>
     </div>
     <div class="eq">{{playing?'🔊':'⏸'}}</div>
   </div>
   <div class="card apps">
     <div class="app" @click="go('ac')"><i>❄️</i><br><span>空调</span></div>
     <div class="app" @click="go('vehicle')"><i>🚗</i><br><span>车辆</span></div>
     <div class="app" @click="go('avm')"><i>🎥</i><br><span>360</span></div>
     <div class="app" @click="go('voice')"><i>🎙️</i><br><span>语音</span></div>
     <div class="app" @click="go('settings')"><i>⚙️</i><br><span>设置</span></div>
     <div class="app" @click="go('media')"><i>📞</i><br><span>电话</span></div>
   </div>
 </div>`,
 inject:['s'],
 computed:{
   gear(){return this.s.gear.value}, spd(){return this.s.speed.value},
   ev(){return this.s.ev.value}, fuel(){return this.s.fuel.value},
   music(){return this.s.music.value}, playing(){return this.s.playing.value},
   prog(){return this.s.prog.value}, readyTo(){return this.s.readyTo.value},
   navDest(){return this.s.navDest.value}, navEta(){return this.s.navEta.value}
 },
 methods:{go(p){this.s.page.value=p}}
}
