const VehicleComp={
 template:`
 <div class="page">
  <div class="page-title">🚙 车辆设置 <span style="margin-left:auto;font-size:13px;color:var(--tx2)">档位 {{gear}}</span></div>
  <div class="scroll">
    <div class="v-grid">
      <div class="v-cell" :class="{on:lights.on}" @click="lights.toggle()"><i>💡</i><b>车灯</b><span>{{lights.on?'已开启（近光）':'已关闭'}}</span></div>
      <div class="v-cell" :class="{on:locks.locked}" @click="locks.toggle()"><i>🔒</i><b>门锁</b><span>{{locks.locked?'已锁':'解锁'}}</span></div>
      <div class="v-cell" :class="{on:mirror.unfold}" @click="mirror.toggle()"><i>🪞</i><b>后视镜</b><span>{{mirror.unfold?'已展开':'已折叠'}}</span></div>
      <div class="v-cell" :class="{on:roof.open}" @click="roof.toggle()"><i>🌅</i><b>天窗</b><span>{{roof.open?'已开启':'已关闭'}}</span></div>
      <div class="v-cell" v-for="m in MODES" :key="m.k" :class="{on:mode===m.k}" @click="setMode(m.k)"><i>{{m.i}}</i><b>{{m.n}}</b><span>{{m.d}}</span></div>
    </div>
    <div class="v-hint">🛡️ 驾驶模式影响动力响应/动能回收/转向手感；行车中禁止切换至洗车模式。</div>
    <div class="reverse">
      <span>🚙 后备视角</span>
      <div style="font-size:13px;color:var(--tx2)">{{gear==='R'||showRev?'倒车影像已激活 · 建议车速 0-10 km/h':'切到 R 挡或点击下方按钮开启'}}</div>
      <div class="grid3"></div>
      <div class="lines"></div>
      <div class="avm-radial" style="position:static;width:60%;margin:8px auto 0;transform:none"></div>
    </div>
    <div style="display:flex;gap:10px">
      <div class="rbtn" style="width:auto;flex:1;padding:12px" @click="showRev=true;toast('已打开倒车影像模拟')">▶ 打开倒车影像模拟</div>
      <div class="rbtn" style="width:auto;flex:1;padding:12px" @click="showRev=false;toast('已关闭')">■ 关闭</div>
    </div>
  </div>
 </div>`,
 inject:['s'],
 computed:{
  gear(){return this.s.gear.value},
  lights(){return this.s.lightsRef.value},locks(){return this.s.locksRef.value},
  mirror(){return this.s.mirrorRef.value},roof(){return this.s.roofRef.value},
  mode(){return this.s.mode.value},MODES(){return window.MODES||MODES},
  showRev:{get(){return this.s.showRev.value},set(v){this.s.showRev.value=v}}
 },
 methods:{
  setMode(k){this.s.mode.value=k;this.s.toast('已切换 · '+k);},
  toast(m){this.s.toast(m)}
 }
}
