const AvmComp={
 template:`
 <div class="page">
  <div class="page-title">🎥 环视 · 泊车辅助</div>
  <div class="avm-wrap">
    <div class="avm-main">
      <span class="lab">360° 全景 · 合成俯视</span>
      <div style="font-size:60px">🚙</div>
      <div class="avm-radial"></div>
      <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;color:var(--acc);font-size:13px">
        视角：{{viewName}} · 点击侧栏切换</div>
    </div>
    <div class="avm-side">
      <div class="box" :class="{on:view==='car'}" @click="view='car'"><i>🚙</i>俯视合成</div>
      <div class="box" :class="{on:view==='front'}" @click="view='front'"><i>⬆️</i>前视</div>
      <div class="box" :class="{on:view==='rear'}" @click="view='rear'"><i>⬇️</i>后视 · 倒车</div>
      <div class="box" :class="{on:park}" @click="park=!park;toast(park?'泊车辅助已开启':'已关闭泊车辅助')"><i>🅿️</i>泊车辅助 {{park?'ON':'OFF'}}</div>
    </div>
  </div>
 </div>`,
 inject:['s'],
 data(){return{view:'car'}},
 computed:{
  viewName(){
    return {car:'360° 全景俯视',front:'前视摄像头',rear:'后视 · 倒车影像'}[this.view]
  },
  gear(){return this.s.gear.value},
  park:{get(){return this.s.park.value},set(v){this.s.park.value=v}}
 },
 watch:{view(n){if(n==='rear'&&this.gear!=='R')this.s.toast('提示：切到 R 挡后自动启用倒车影像')}},
 methods:{toast(m){this.s.toast(m)}}
}
