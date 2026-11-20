const AcComp={
 template:`
 <div class="page">
  <div class="page-title">❄️ 空调控制 <span style="margin-left:auto;font-size:13px;color:var(--tx2)">{{ac.on?'运行中':'已关闭'}}</span></div>
  <div class="ac-wrap">
    <div class="ac-left">
      <div class="tempdial">
        <div class="dial" :style="{'--deg':dialDeg,'--warm':warm}">
          <div class="t">{{ac.temp}}<small>°C</small></div>
        </div>
        <div class="acbtns">
          <div class="rbtn" @click="temp(1)">＋</div>
          <div class="rbtn" @click="ac.on=!ac.on" :class="{on:ac.on}">⏻</div>
          <div class="rbtn" @click="temp(-1)">－</div>
        </div>
      </div>
      <div class="fanslider">
        <div class="lbl"><span>风量</span><b>{{ac.fan}} 档</b></div>
        <input type="range" min="0" max="7" v-model.number="ac.fan">
      </div>
    </div>
    <div class="ac-right" style="flex:1;display:flex;flex-direction:column;gap:14px">
      <div class="ac-toggles" style="grid-template-columns:repeat(2,1fr)">
        <div class="atog" :class="{on:ac.circ==='内'}" @click="ac.circ='内'"><i>🔄</i>内循环</div>
        <div class="atog" :class="{on:ac.circ==='外'}" @click="ac.circ='外'"><i>🌐</i>外循环</div>
        <div class="atog" :class="{on:ac.ac}" @click="ac.ac=!ac.ac"><i>❄️</i>A/C 制冷</div>
        <div class="atog" :class="{on:ac.auto}" @click="ac.auto=!ac.auto"><i>🤖</i>AUTO</div>
        <div class="atog" :class="{on:ac.fd}" @click="ac.fd=!ac.ac.fd"><i>🪟</i>前除雾</div>
        <div class="atog" :class="{on:ac.rd}" @click="ac.rd=!ac.rd"><i>🪞</i>后除雾</div>
      </div>
      <div style="background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px">
        <div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600">🔥 座椅加热
          <span style="margin-left:auto;font-size:12px;color:var(--tx2)">{{shi==='off'?'关闭':shi+' 档'}}</span></div>
        <div style="display:flex;gap:10px;margin-top:10px">
          <div class="rbtn" style="width:auto;padding:0 20px;font-size:13px" :class="{on:shi==='off'}" @click="shi='off'">关</div>
          <div class="rbtn" style="width:auto;padding:0 20px;font-size:13px" :class="{on:shi===1}" @click="shi=1">1档</div>
          <div class="rbtn" style="width:auto;padding:0 20px;font-size:13px" :class="{on:shi===2}" @click="shi=2">2档</div>
          <div class="rbtn" style="width:auto;padding:0 20px;font-size:13px" :class="{on:shi===3}" @click="shi=3">3档</div>
        </div>
      </div>
    </div>
  </div>
 </div>`,
 inject:['s'],
 computed:{
  ac(){return this.s.acRef.value},
  dialDeg(){return (this.ac.temp-16)/14*100},
  warm(){return this.ac.temp>22?'#ff8a4d':'#5aa4ff'},
  shi:{get(){return this.s.seatHeat.value},set(v){this.s.seatHeat.value=v}}
 },
 methods:{temp(d){const v=Math.min(30,Math.max(16,this.ac.temp+d));this.ac.temp=v;this.s.toast(v+'°C')},
  _(){return}}
}
