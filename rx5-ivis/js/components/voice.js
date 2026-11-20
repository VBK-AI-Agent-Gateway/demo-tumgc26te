const VoiceComp={
 template:`
 <div class="voicepage">
   <div class="big" @click="wake">
     <i>{{listening?'🔴':'🎙️'}}</i><span>{{listening?'聆听中…':'点我 or 说「你好荣威」'}}</span>
   </div>
   <div style="font-size:15px;color:var(--tx2)">支持连续对话 · 30秒免唤醒 · 可见即可说</div>
   <div class="cmdlist">
     <div class="cmdb" v-for="c in VC" :key="c.c" @click="run(c)">{{c.c}}</div>
   </div>
   <div style="font-size:12px;color:var(--tx2);margin-top:auto">唤醒词：你好斑马 / 你好荣威 ｜ 退出：退出/闭嘴/取消</div>
 </div>`,
 inject:['s'],
 computed:{
  listening(){return this.s.voice.value.listening},
  VC(){return window.VCMD||VCMD}
 },
 methods:{
  wake(){this.s.openVoice('')},
  run(c){this.s.execVoice({c:c.c})}
 }
}
