const MediaComp={
 template:`
 <div class="page">
  <div class="page-title">🎵 多媒体</div>
  <div v-if="gear==='D'" class="media-warning">🚸 行车中（D 挡）已限制视频播放 · 音乐不受限，P 挡可解锁全部娱乐</div>
  <div class="media-wrap">
    <div class="media-list">
      <div class="rolesw">
        <div class="chip" :class="{on:src==='在线音乐'}" @click="src='在线音乐'">🎧 在线音乐</div>
        <div class="chip" :class="{on:src==='本地音频'}" @click="src='本地音频'">💾 本地音频</div>
        <div class="chip" :class="{on:src==='蓝牙电话'}" @click="src='蓝牙电话'">📵 蓝牙电话</div>
      </div>
      <template v-if="src!=='蓝牙电话'">
        <div v-for="(m,i) in MUSIC" :key="i" class="ml-item" :class="{on:i===idx}" @click="pick(i)">
          <div class="co">{{src==='在线音乐'?'🎧':'💾'}}</div>
          <div><div class="ti">{{m.t}}</div><div class="ar">{{m.ar}}</div></div>
          <div class="ln">{{Math.floor(m.len/60)}}:{{String(m.len%60).padStart(2,'0')}}</div>
        </div>
      </template>
      <template v-else>
        <div class="ml-item" @click="s.toast('已拨打 138****5678')"><div class="co">📞</div><div><div class="ti">最近通话 · 张三</div><div class="ar">昨天 14:02 · 8 分钟</div></div><div class="ln">→ 拨打</div></div>
        <div class="ml-item" @click="s.toast('已拨打 139****1234')"><div class="co">📞</div><div><div class="ti">最近通话 · 李四（工作）</div><div class="ar">周一 09:18 · 4 分钟</div></div><div class="ln">→ 拨打</div></div>
        <div class="ml-item" @click="s.toast('已拨打 400 客服')"><div class="co">🆘</div><div><div class="ti">道路救援 400-920-2020</div><div class="ar">荣威专属服务</div></div><div class="ln">→ 拨打</div></div>
      </template>
    </div>
    <div class="player">
      <div class="bigcover">🎧</div>
      <div>
        <div style="font-size:17px;font-weight:700">{{cur.t||'未播放'}}</div>
        <div style="color:var(--tx2);font-size:12px;margin-top:2px">{{cur.ar||'点选左侧曲目开始'}}</div>
        <div style="display:flex;gap:12px;margin-top:12px;align-items:center;justify-content:center;font-size:22px">
          <span style="cursor:pointer" @click="prev">⏮</span>
          <span style="cursor:pointer;font-size:32px" @click="toggle">{{playing?'⏸':'▶️'}}</span>
          <span style="cursor:pointer" @click="next">⏭</span>
        </div>
      </div>
      <div class="volcard">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--tx2);margin-bottom:8px"><span>🔊 音量</span><b style="color:var(--tx)">{{vol}}%</b></div>
        <input type="range" min="0" max="100" v-model.number="vol">
      </div>
      <button class="btn-full" style="width:100%;padding:12px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--tx);cursor:pointer;font-size:14px" @click="btCall">
        📵 转蓝牙电话 · 不离开音乐</button>
    </div>
  </div>
 </div>`,
 inject:['s'],
 data(){return{idx:0,src:'在线音乐'}},
 computed:{
   MUSIC(){return window.MUSIC},
   gear(){return this.s.gear.value},
   vol:{get(){return this.s.vol.value},set(v){this.s.vol.value=v}},
   cur(){return this.MUSIC[this.idx]||{}},
   playing:{get(){return this.s.playing.value},set(v){this.s.playing.value=v}},
   prog(){return this.s.prog.value}
 },
 methods:{
  pick(i){this.idx=i;this.playing=true;this.s.music.value=this.MUSIC[i];this.s.toast('播放 '+this.MUSIC[i].t)},
  toggle(){this.playing=!this.playing;if(this.playing)this.s.music.value=this.cur},
  prev(){this.pick((this.idx+this.MUSIC.length-1)%this.MUSIC.length)},
  next(){this.pick((this.idx+1)%this.MUSIC.length)},
  btCall(){this.s.page.value='media';this.s.toast('切到蓝牙电话 · 音乐已暂停');this.playing=false;this.src='蓝牙电话'}
 }
}
