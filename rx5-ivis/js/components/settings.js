const SettingsComp={
 template:`
 <div class="page">
  <div class="page-title">⚙️ 系统设置</div>
  <div class="scroll">
    <div class="set-grid">
      <div class="set-item" :class="{on:bright>40}" @click="bright=bright>40?20:80"><i>💡</i><div><div class="t">屏幕亮度</div><div class="s">{{bright}}%</div></div></div>
      <div class="set-item" :class="{on:true}" @click="toggleTheme"><i>{{theme==='dark'?'🌙':'☀️'}}</i><div><div class="t">座舱主题</div><div class="s">{{theme==='dark'?'深色（行车优先）':'浅色'}}</div></div><span class="sw" style="pointer-events:none" :class="'sw'"></span></div>
      <div class="set-item" :class="{on:wifi.on}" @click="wifi.on=!wifi.on"><i>🌐</i><div><div class="t">WiFi</div><div class="s">{{wifi.on?'RONGWEI-5G':'已断开'}}</div></div><span class="sw"></span></div>
      <div class="set-item" :class="{on:bt.on}" @click="bt.on=!bt.on"><i>🔵</i><div><div class="t">蓝牙</div><div class="s">{{bt.on?bt.device:'未连接'}}</div></div><span class="sw"></span></div>
    </div>
    <div class="ota">
      <b>🔄 OTA 升级</b> · <span style="color:var(--tx2)">{{ver}}</span>
      <div style="margin-top:8px;font-size:13px;color:var(--tx2)">新一代斑马智行 5.0 · 新增 Charger 规划、AI 助手、Carlog 行车记录仪回放。</div>
      <button style="margin-top:10px;padding:9px 18px;border-radius:12px;border:none;background:var(--pri);color:#fff;font-size:13px;cursor:pointer" @click="otaBtn">{{otaState}}</button>
    </div>
    <div style="background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:8px">ℹ️ 关于本机</div>
      <div style="font-size:13px;color:var(--tx2);line-height:1.9">
       车型：荣威 RX5 · 旗舰智驾版　｜　车机系统：荣威 iVIS 2.0（本演示）<br>
       中控屏：10.4" 竖屏 1080×1920　｜　分辨率自适应<br>
       定位：193 km since 2025-04-01　｜　车架号：LSJW2677**A12345<br>
       已授权：高德地图 SDK · 斑马语音 · 声网<br>
       免责声明：本页面为演示用基于浏览器的模拟座舱，非官方固件。
      </div>
    </div>
    <div class="about">© 2025 RX5 iVIS · Mockup 仅供交互演示 · 安全驾驶提醒：行车中请优先语音交互</div>
  </div>
 </div>`,
 inject:['s'],
 data(){return{otaState:'检查更新'}},
 computed:{
  bright:{get(){return this.s.brightRef.value},set(v){this.s.brightRef.value=v}},
  theme(){return this.s.theme.value},
  wifi(){return this.s.wifi.value},bt(){return this.s.bt.value},
  ver(){return this.s.ver.value}
 },
 watch:{bright(v){this.s.applyBright(v)}},
 methods:{
  toggleTheme(){this.s.theme.value=this.s.theme.value==='dark'?'light':'dark'},
  otaBtn(){
    if(this.otaState==='检查更新'){this.otaState='已找到 5.0.2 · 下载中…';
      setTimeout(()=>this.otaState='下载完成 · 重启后生效',2200)}
    else if(this.otaState.includes('下载完成')){this.otaState='✅ 已安装 5.0.2'}
  }
 }
}
