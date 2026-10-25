/* ============ 标准OA协同办公系统 ============ */
const DB_KEY = 'oa_db_v1';
const SESSION_KEY = 'oa_session_v1';

const USERS = [
  { username:'admin',     name:'系统管理员', dept:'信息中心', role:'admin',  title:'管理员' },
  { username:'zhangsan',  name:'张三',       dept:'市场部',   role:'manager',title:'部门经理' },
  { username:'lisi',      name:'李四',       dept:'研发部',   role:'staff',  title:'普通员工' },
];

function defaultDB(){
  const today = new Date();
  const d = (n)=>{ const x=new Date(today); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
  return {
    leaves: [
      { id:'LV2024001', user:'李四', dept:'研发部', type:'年假', start:d(-2), end:d(-1), days:2, reason:'回家探亲', status:'approved', approver:'张三', applyAt:d(-3) },
      { id:'LV2024002', user:'张三', dept:'市场部', type:'事假', start:d(3), end:d(3), days:1, reason:'办理个人事务', status:'pending', approver:'管理员', applyAt:d(-1) },
      { id:'LV2024003', user:'李四', dept:'研发部', type:'病假', start:d(5), end:d(6), days:2, reason:'感冒发烧需休息', status:'pending', approver:'张三', applyAt:d(0) },
    ],
    travels: [
      { id:'TR2024001', user:'张三', dept:'市场部', dest:'上海', start:d(-10), end:d(-7), days:4, who:'王五', reason:'客户拜访', budget:5200, status:'approved', applyAt:d(-12) },
      { id:'TR2024002', user:'李四', dept:'研发部', dest:'深圳', start:d(7), end:d(9), days:3, who:'', reason:'技术交流会', budget:3800, status:'pending', applyAt:d(-2) },
    ],
    expenses: [
      { id:'EX2024001', user:'张三', dept:'市场部', cat:'交通费', date:d(-5), amount:386,  detail:'高铁票(往返)', status:'approved', applyAt:d(-5) },
      { id:'EX2024002', user:'李四', dept:'研发部', cat:'办公用品', date:d(-3), amount:1299, detail:'机械键盘 x2', status:'paid', applyAt:d(-3) },
      { id:'EX2024003', user:'李四', dept:'研发部', cat:'差旅费', date:d(-1), amount:2450, detail:'北京出差住宿3晚', status:'pending', applyAt:d(-1) },
      { id:'EX2024004', user:'张三', dept:'市场部', cat:'业务招待', date:d(0), amount:860, detail:'客户午餐', status:'rejected', applyAt:d(-2) },
    ],
    purchases: [
      { id:'PU2024001', user:'李四', dept:'研发部', item:'开发用显示器 27寸', qty:2, unitPrice:1599, reason:'研发工位扩容', status:'pending', applyAt:d(-2) },
      { id:'PU2024002', user:'张三', dept:'市场部', item:'展会宣传物料', qty:1, unitPrice:4200, reason:'下月行业展会', status:'approved', applyAt:d(-6) },
    ],
    attendances: genAttendance(),
    notices: [
      { id:1, title:'关于2024年度年假安排的通知', body:'各位同事：根据公司考勤管理制度，本年度年假请于12月31日前休完，逾期不再顺延。各部门请合理安排工作与休假。', from:'人力资源部', date:d(-4), top:true },
      { id:2, title:'办公网络系统升级维护公告', body:'信息中心将于本周六22:00-次日06:00进行核心网络升级，期间OA系统可能短暂不可用，请提前保存工作内容。', from:'信息中心', date:d(-2), top:false },
      { id:3, title:'第三季度优秀员工评选结果公示', body:'经部门推荐与评审委员会评定，第三季度优秀员工名单已产生，公示期3天，如有异议请反馈至人力资源部。', from:'人力资源部', date:d(-1), top:false },
      { id:4, title:'会议室预定系统使用说明', body:'即日起会议室统一通过OA-办公用品之外的"日程"模块预定，请各部门按流程使用，避免冲突。', from:'行政部', date:d(0), top:false },
    ],
    nextId: { leave:4, travel:3, expense:5, purchase:3, notice:5 },
  };
}

function genAttendance(){
  const list = [];
  const names = [['张三','市场部'],['李四','研发部'],['王五','市场部'],['赵六','研发部']];
  const today = new Date();
  for(let i=0;i<10;i++){
    const day = new Date(today); day.setDate(day.getDate()-i);
    if(day.getDay()===0||day.getDay()===6) continue;
    names.forEach(([n,dpt])=>{
      const r = Math.random();
      let status='正常', inT='09:0'+Math.floor(Math.random()*10), outT='18:0'+Math.floor(Math.random()*9);
      if(r<0.08){ status='迟到'; inT='09:2'+Math.floor(Math.random()*9); }
      else if(r<0.14){ status='请假'; inT='--'; outT='--'; }
      else if(r<0.18){ status='出差'; inT='--'; outT='--'; }
      list.push({ date:day.toISOString().slice(0,10), user:n, dept:dpt, in:inT, out:outT, status });
    });
  }
  return list;
}

let DB = load();
function load(){
  try{ const raw = localStorage.getItem(DB_KEY); if(raw) return JSON.parse(raw); }catch(e){}
  const d = defaultDB(); localStorage.setItem(DB_KEY, JSON.stringify(d)); return d;
}
function save(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

let ME = null;

/* ============ 登录 ============ */
function doLogin(){
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if(!u || !p){ alert('请输入账号和密码'); return; }
  const found = USERS.find(x=>x.username===u);
  if(!found){ alert('账号不存在, 请使用演示账号: admin / zhangsan / lisi'); return; }
  ME = found;
  sessionStorage.setItem(SESSION_KEY, u);
  showMain();
}
function logout(){
  ME=null; sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
}
function showMain(){
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');
  document.getElementById('userChip').textContent = `${ME.name} · ${ME.title} · ${ME.dept}`;
  renderMenu();
  nav('dashboard');
}

/* ============ 菜单与路由 ============ */
const MENUS = [
  { key:'dashboard',   icon:'📊', label:'工作台' },
  { key:'attendance',  icon:'🕐', label:'考勤管理' },
  { key:'leave',       icon:'🏖️', label:'请假申请' },
  { key:'travel',      icon:'✈️', label:'出差管理' },
  { key:'expense',     icon:'💰', label:'报销管理' },
  { key:'purchase',    icon:'🛒', label:'办公用品' },
  { key:'approval',    icon:'✅', label:'审批中心' },
  { key:'notice',      icon:'📢', label:'公告通知' },
  { key:'contacts',    icon:'📇', label:'通讯录' },
  { key:'system',      icon:'⚙️', label:'系统管理' },
];
function renderMenu(){
  document.getElementById('menu').innerHTML = MENUS.map(m=>
    `<a data-k="${m.key}" onclick="nav('${m.key}')"><b>${m.icon}</b><span>${m.label}</span></a>`).join('');
}
function nav(key){
  document.querySelectorAll('.sider nav a').forEach(a=>a.classList.toggle('active', a.dataset.k===key));
  const el = document.getElementById('view');
  el.innerHTML = VIEWS[key] ? VIEWS[key]() : '<div class="card"><div class="empty">模块建设中</div></div>';
  window.scrollTo(0,0);
}

/* ============ 工具 ============ */
function statusTag(s){
  const m = { pending:['待审批','tag-orange'], approved:['已通过','tag-green'], rejected:['已驳回','tag-red'],
              paid:['已付款','tag-blue'], normal:['正常','tag-green'], late:['迟到','tag-orange'],
              leave:['请假','tag-blue'], trip:['出差','tag-gray'] };
  const [t,c] = m[s] || [s,'tag-gray'];
  return `<span class="${c}">${t}</span>`;
}
function genId(prefix, n){ return prefix + '2024' + String(n).padStart(3,'0'); }
function today(){ return new Date().toISOString().slice(0,10); }
function daysBetween(a,b){ return Math.max(1, Math.round((new Date(b)-new Date(a))/86400000)+1); }
function canApprove(){ return ME.role==='admin' || ME.role==='manager'; }
function isMine(r){ return r.user===ME.name; }
function money(n){ return '¥ ' + Number(n).toLocaleString('zh-CN'); }

function openModal(html){
  closeModal();
  const mask = document.createElement('div');
  mask.className='modal-mask'; mask.id='modalMask';
  mask.innerHTML = `<div class="modal">${html}</div>`;
  mask.addEventListener('click', e=>{ if(e.target===mask) closeModal(); });
  document.body.appendChild(mask);
}
function closeModal(){ const m=document.getElementById('modalMask'); if(m) m.remove(); }

/* ============ 视图 ============ */
const VIEWS = {};

VIEWS.dashboard = ()=>{
  const pend = pendingForMe();
  const myLeaves = DB.leaves.filter(isMine);
  const myExp = DB.expenses.filter(isMine);
  const expSum = myExp.filter(x=>x.status!=='rejected').reduce((s,x)=>s+Number(x.amount),0);
  const att = DB.attendances.filter(a=>a.user===ME.name);
  const lateN = att.filter(a=>a.status==='迟到').length;
  const now = new Date();
  const greet = now.getHours()<12?'上午好':now.getHours()<18?'下午好':'晚上好';
  const pendAll = [...DB.leaves,...DB.travels,...DB.expenses,...DB.purchases].filter(x=>x.status==='pending');
  return `
  <div class="welcome">
    <h2>${greet}, ${ME.name} 欢迎回来 👋</h2>
    <p>${now.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'})} ｜ 今天也要高效办公哦</p>
  </div>
  <div class="grid-cards">
    <div class="stat"><div class="ico">📥</div><div><div class="num">${pend.length}</div><div class="lbl">待我审批</div></div></div>
    <div class="stat"><div class="ico">🗓️</div><div><div class="num">${myLeaves.length}</div><div class="lbl">我的请假单</div></div></div>
    <div class="stat"><div class="ico">💳</div><div><div class="num">${money(expSum)}</div><div class="lbl">我的累计报销</div></div></div>
    <div class="stat"><div class="ico">⏰</div><div><div class="num">${lateN}</div><div class="lbl">本月迟到次数</div></div></div>
  </div>
  <div class="card">
    <h2>待办事项</h2>
    ${pendAll.length===0?'<div class="empty">暂无待办, 一切顺利 🎉</div>':
      pendAll.slice(0,6).map(x=>{
        const type = 'leaves' in x && x.type ? '请假' : x.dest?'出差':x.cat?'报销':'采购';
        const map = { '请假':'leave','出差':'travel','报销':'expense','采购':'purchase' };
        return `<div class="todo-item">
          <div>📌 <b>[${type}]</b> ${x.user} · ${x.reason||x.item||x.detail} <span class="muted">${x.applyAt}</span></div>
          <button class="btn-sm" onclick="nav('${canApprove()?'approval':map[type]}')">处理</button>
        </div>`;
      }).join('')}
  </div>
  <div class="card">
    <h2>最新公告</h2>
    ${DB.notices.slice().reverse().slice(0,3).map(n=>`
      <div class="todo-item">
        <div>${n.top?'⭐ ':''}${n.title} <span class="muted">${n.date} · ${n.from}</span></div>
        <button class="btn-sm btn-gray" onclick="nav('notice')">查看</button>
      </div>`).join('')}
  </div>`;
};

function pendingForMe(){
  const all = [
    ...DB.leaves.map(x=>({...x,cat_t:'leave'})),
    ...DB.travels.map(x=>({...x,cat_t:'travel'})),
    ...DB.expenses.map(x=>({...x,cat_t:'expense'})),
    ...DB.purchases.map(x=>({...x,cat_t:'purchase'})),
  ].filter(x=>x.status==='pending');
  if(ME.role==='admin') return all;
  if(ME.role==='manager') return all.filter(x=>x.dept===ME.dept && x.user!==ME.name);
  return [];
}

/* 考勤 */
VIEWS.attendance = ()=>{
  let list = DB.attendances;
  if(ME.role!=='admin') list = list.filter(a=>a.user===ME.name);
  const month = today().slice(0,7);
  const mlist = list.filter(a=>a.date.startsWith(month));
  const normal = mlist.filter(a=>a.status==='正常').length;
  const late = mlist.filter(a=>a.status==='迟到').length;
  const lv = mlist.filter(a=>a.status==='请假').length;
  return `
  <div class="grid-cards">
    <div class="stat"><div class="ico">📗</div><div><div class="num">${normal}</div><div class="lbl">正常出勤(本月)</div></div></div>
    <div class="stat"><div class="ico">📙</div><div><div class="num">${late}</div><div class="lbl">迟到次数</div></div></div>
    <div class="stat"><div class="ico">📘</div><div><div class="num">${lv}</div><div class="lbl">请假天数</div></div></div>
    <div class="stat"><div class="ico">📈</div><div><div class="num">${mlist.length?Math.round(normal/mlist.length*100):0}%</div><div class="lbl">出勤率</div></div></div>
  </div>
  <div class="card">
    <h2>考勤记录</h2>
    <table>
      <thead><tr><th>日期</th>${ME.role==='admin'?'<th>姓名</th><th>部门</th>':''}<th>上班</th><th>下班</th><th>状态</th></tr></thead>
      <tbody>${list.slice(0,30).map(a=>`<tr>
        <td>${a.date}</td>
        ${ME.role==='admin'?`<td>${a.user}</td><td>${a.dept}</td>`:''}
        <td>${a.in}</td><td>${a.out}</td><td>${statusTag({正常:'normal',迟到:'late',请假:'leave',出差:'trip'}[a.status]||a.status)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
};

/* 请假 */
VIEWS.leave = ()=>{
  const mine = DB.leaves.filter(isMine);
  const showAll = ME.role!=='staff';
  const list = showAll ? DB.leaves : mine;
  return `
  <div class="card">
    <div class="toolbar">
      <h2 style="margin:0">请假申请</h2>
      <button class="btn-sm" onclick="openLeave()">+ 提交请假单</button>
    </div>
    <table>
      <thead><tr><th>单号</th>${showAll?'<th>申请人</th>':''}<th>类型</th><th>起止日期</th><th>天数</th><th>事由</th><th>审批人</th><th>状态</th></tr></thead>
      <tbody>${list.length?list.map(l=>`<tr>
        <td>${l.id}</td>${showAll?`<td>${l.user}</td>`:''}
        <td>${l.type}</td><td>${l.start} ~ ${l.end}</td><td>${l.days}</td>
        <td>${l.reason}</td><td>${l.approver}</td><td>${statusTag(l.status)}</td>
      </tr>`).join(''):'<tr><td colspan="8" class="empty">暂无记录</td></tr>'}</tbody>
    </table>
  </div>`;
};
function openLeave(){
  openModal(`<h3>提交请假申请</h3>
    <div class="form-row">
      <div class="form-col"><label>请假类型</label>
        <select id="lvType"><option>年假</option><option>事假</option><option>病假</option><option>调休</option><option>婚假</option><option>产假</option></select></div>
      <div class="form-col"><label>开始日期</label><input type="date" id="lvStart" value="${today()}"></div>
      <div class="form-col"><label>结束日期</label><input type="date" id="lvEnd" value="${today()}"></div>
    </div>
    <div class="form-row"><div class="form-col"><label>请假事由</label>
      <textarea id="lvReason" rows="3" placeholder="请说明请假原因..."></textarea></div></div>
    <div class="modal-footer">
      <button class="btn-sm btn-gray" onclick="closeModal()">取消</button>
      <button class="btn-sm" onclick="submitLeave()">提交申请</button>
    </div>`);
}
function submitLeave(){
  const s=document.getElementById('lvStart').value, e=document.getElementById('lvEnd').value, r=document.getElementById('lvReason').value.trim();
  if(!s||!e) return alert('请选择起止日期');
  if(new Date(e)<new Date(s)) return alert('结束日期不能早于开始日期');
  if(!r) return alert('请填写请假事由');
  DB.leaves.push({ id:genId('LV',DB.nextId.leave++), user:ME.name, dept:ME.dept,
    type:document.getElementById('lvType').value, start:s, end:e, days:daysBetween(s,e),
    reason:r, status:'pending', approver: ME.role==='staff'?(USERS.find(u=>u.username==='zhangsan').name):'管理员', applyAt:today() });
  save(); closeModal(); nav('leave'); alert('请假单已提交, 等待审批 ✅');
}

/* 出差 */
VIEWS.travel = ()=>{
  const list = ME.role==='staff' ? DB.travels.filter(isMine) : DB.travels;
  return `
  <div class="card">
    <div class="toolbar">
      <h2 style="margin:0">出差管理</h2>
      <button class="btn-sm" onclick="openTravel()">+ 提交出差申请</button>
    </div>
    <table>
      <thead><tr><th>单号</th>${ME.role!=='staff'?'<th>申请人</th>':''}<th>目的地</th><th>起止日期</th><th>天数</th><th>同行人</th><th>预算</th><th>事由</th><th>状态</th></tr></thead>
      <tbody>${list.length?list.map(t=>`<tr>
        <td>${t.id}</td>${ME.role!=='staff'?`<td>${t.user}</td>`:''}
        <td>${t.dest}</td><td>${t.start} ~ ${t.end}</td><td>${t.days}</td>
        <td>${t.who||'-'}</td><td>${money(t.budget)}</td><td>${t.reason}</td><td>${statusTag(t.status)}</td>
      </tr>`).join(''):'<tr><td colspan="9" class="empty">暂无记录</td></tr>'}</tbody>
    </table>
  </div>`;
};
function openTravel(){
  openModal(`<h3>提交出差申请</h3>
    <div class="form-row">
      <div class="form-col"><label>出差目的地</label><input type="text" id="trDest" placeholder="如: 上海"></div>
      <div class="form-col"><label>同行人</label><input type="text" id="trWho" placeholder="选填"></div>
    </div>
    <div class="form-row">
      <div class="form-col"><label>开始日期</label><input type="date" id="trStart" value="${today()}"></div>
      <div class="form-col"><label>结束日期</label><input type="date" id="trEnd" value="${today()}"></div>
      <div class="form-col"><label>预算(元)</label><input type="number" id="trBudget" placeholder="3000"></div>
    </div>
    <div class="form-row"><div class="form-col"><label>出差事由</label>
      <textarea id="trReason" rows="3" placeholder="出差目的与工作安排..."></textarea></div></div>
    <div class="modal-footer">
      <button class="btn-sm btn-gray" onclick="closeModal()">取消</button>
      <button class="btn-sm" onclick="submitTravel()">提交申请</button>
    </div>`);
}
function submitTravel(){
  const d=document.getElementById('trDest').value.trim(), s=document.getElementById('trStart').value, e=document.getElementById('trEnd').value;
  const b=document.getElementById('trBudget').value, r=document.getElementById('trReason').value.trim();
  if(!d) return alert('请填写出差目的地');
  if(new Date(e)<new Date(s)) return alert('结束日期不能早于开始日期');
  if(!r) return alert('请填写出差事由');
  DB.travels.push({ id:genId('TR',DB.nextId.travel++), user:ME.name, dept:ME.dept, dest:d, start:s, end:e,
    days:daysBetween(s,e), who:document.getElementById('trWho').value.trim(), reason:r,
    budget:Number(b)||0, status:'pending', approver:'管理员', applyAt:today() });
  save(); closeModal(); nav('travel'); alert('出差申请已提交 ✅');
}

/* 报销 */
VIEWS.expense = ()=>{
  const list = ME.role==='staff' ? DB.expenses.filter(isMine) : DB.expenses;
  const sum = list.filter(x=>x.status!=='rejected').reduce((s,x)=>s+Number(x.amount),0);
  return `
  <div class="card">
    <div class="toolbar">
      <h2 style="margin:0">报销管理 ｜ 合计 ${money(sum)}</h2>
      <button class="btn-sm" onclick="openExpense()">+ 提交报销单</button>
    </div>
    <table>
      <thead><tr><th>单号</th>${ME.role!=='staff'?'<th>申请人</th>':''}<th>类别</th><th>发生日期</th><th>金额</th><th>说明</th><th>状态</th></tr></thead>
      <tbody>${list.length?list.map(x=>`<tr>
        <td>${x.id}</td>${ME.role!=='staff'?`<td>${x.user}</td>`:''}
        <td>${x.cat}</td><td>${x.date}</td><td><b>${money(x.amount)}</b></td>
        <td>${x.detail}</td><td>${statusTag(x.status)}</td>
      </tr>`).join(''):'<tr><td colspan="7" class="empty">暂无记录</td></tr>'}</tbody>
    </table>
  </div>`;
};
function openExpense(){
  openModal(`<h3>提交报销申请</h3>
    <div class="form-row">
      <div class="form-col"><label>费用类别</label>
        <select id="exCat"><option>交通费</option><option>住宿费</option><option>差旅费</option><option>办公用品</option><option>业务招待</option><option>通讯费</option><option>其他</option></select></div>
      <div class="form-col"><label>发生日期</label><input type="date" id="exDate" value="${today()}"></div>
      <div class="form-col"><label>金额(元)</label><input type="number" id="exAmount" placeholder="0.00"></div>
    </div>
    <div class="form-row"><div class="form-col"><label>费用说明</label>
      <textarea id="exDetail" rows="3" placeholder="费用明细与用途..."></textarea></div></div>
    <div class="modal-footer">
      <button class="btn-sm btn-gray" onclick="closeModal()">取消</button>
      <button class="btn-sm" onclick="submitExpense()">提交申请</button>
    </div>`);
}
function submitExpense(){
  const a=document.getElementById('exAmount').value, d=document.getElementById('exDetail').value.trim();
  if(!a||Number(a)<=0) return alert('请填写有效金额');
  if(!d) return alert('请填写费用说明');
  DB.expenses.push({ id:genId('EX',DB.nextId.expense++), user:ME.name, dept:ME.dept,
    cat:document.getElementById('exCat').value, date:document.getElementById('exDate').value,
    amount:Number(a), detail:d, status:'pending', approver:'管理员', applyAt:today() });
  save(); closeModal(); nav('expense'); alert('报销单已提交, 等待审批 ✅');
}

/* 办公用品/采购 */
VIEWS.purchase = ()=>{
  const list = ME.role==='staff' ? DB.purchases.filter(isMine) : DB.purchases;
  return `
  <div class="card">
    <div class="toolbar">
      <h2 style="margin:0">办公用品领用/采购</h2>
      <button class="btn-sm" onclick="openPurchase()">+ 提交采购申请</button>
    </div>
    <table>
      <thead><tr><th>单号</th>${ME.role!=='staff'?'<th>申请人</th>':''}<th>物品</th><th>数量</th><th>单价</th><th>合计</th><th>用途</th><th>状态</th></tr></thead>
      <tbody>${list.length?list.map(x=>`<tr>
        <td>${x.id}</td>${ME.role!=='staff'?`<td>${x.user}</td>`:''}
        <td>${x.item}</td><td>${x.qty}</td><td>${money(x.unitPrice)}</td>
        <td><b>${money(x.qty*x.unitPrice)}</b></td><td>${x.reason}</td><td>${statusTag(x.status)}</td>
      </tr>`).join(''):'<tr><td colspan="8" class="empty">暂无记录</td></tr>'}</tbody>
    </table>
  </div>`;
};
function openPurchase(){
  openModal(`<h3>提交采购申请</h3>
    <div class="form-row">
      <div class="form-col"><label>物品名称</label><input type="text" id="puItem" placeholder="如: A4打印纸"></div>
      <div class="form-col"><label>数量</label><input type="number" id="puQty" value="1" min="1"></div>
      <div class="form-col"><label>预估单价(元)</label><input type="number" id="puPrice" placeholder="0.00"></div>
    </div>
    <div class="form-row"><div class="form-col"><label>用途说明</label>
      <textarea id="puReason" rows="3" placeholder="采购用途..."></textarea></div></div>
    <div class="modal-footer">
      <button class="btn-sm btn-gray" onclick="closeModal()">取消</button>
      <button class="btn-sm" onclick="submitPurchase()">提交申请</button>
    </div>`);
}
function submitPurchase(){
  const it=document.getElementById('puItem').value.trim(), q=document.getElementById('puQty').value,
        p=document.getElementById('puPrice').value, r=document.getElementById('puReason').value.trim();
  if(!it) return alert('请填写物品名称');
  if(!q||Number(q)<1) return alert('请填写有效数量');
  if(!r) return alert('请填写用途说明');
  DB.purchases.push({ id:genId('PU',DB.nextId.purchase++), user:ME.name, dept:ME.dept, item:it,
    qty:Number(q), unitPrice:Number(p)||0, reason:r, status:'pending', approver:'管理员', applyAt:today() });
  save(); closeModal(); nav('purchase'); alert('采购申请已提交 ✅');
}

/* 审批中心 */
VIEWS.approval = ()=>{
  if(!canApprove()){
    return `<div class="card"><h2>审批中心</h2>
      <div class="empty">您当前角色为「${ME.title}」, 无审批权限<br>请联系管理员或部门经理开通</div></div>`;
  }
  const pend = pendingForMe();
  const all = [
    ...DB.leaves.map(x=>({t:'请假',x,map:'leave'})),
    ...DB.travels.map(x=>({t:'出差',x,map:'travel'})),
    ...DB.expenses.map(x=>({t:'报销',x,map:'expense'})),
    ...DB.purchases.map(x=>({t:'采购',x,map:'purchase'})),
  ];
  const done = all.filter(o=>o.x.status!=='pending');
  return `
  <div class="grid-cards">
    <div class="stat"><div class="ico">📥</div><div><div class="num">${pend.length}</div><div class="lbl">待我审批</div></div></div>
    <div class="stat"><div class="ico">✅</div><div><div class="num">${all.filter(o=>o.x.status==='approved').length}</div><div class="lbl">累计通过</div></div></div>
    <div class="stat"><div class="ico">❌</div><div><div class="num">${all.filter(o=>o.x.status==='rejected').length}</div><div class="lbl">累计驳回</div></div></div>
  </div>
  <div class="card">
    <h2>待审批列表</h2>
    ${pend.length===0?'<div class="empty">没有待审批的单据 🎉</div>':`
    <table>
      <thead><tr><th>类型</th><th>单号</th><th>申请人</th><th>部门</th><th>内容</th><th>申请日期</th><th>操作</th></tr></thead>
      <tbody>${pend.map(p=>{
        const label = p.cat_t==='leave'?`${p.type} ${p.start}~${p.end}(${p.days}天)`
          : p.cat_t==='travel'?`${p.dest} ${p.start}~${p.end}`
          : p.cat_t==='expense'?`${p.cat} ${money(p.amount)}`
          : `${p.item} x${p.qty}`;
        const tname = {leave:'请假',travel:'出差',expense:'报销',purchase:'采购'}[p.cat_t];
        const map = p.cat_t;
        return `<tr>
          <td><span class="flow-step">${tname}</span></td>
          <td>${p.id}</td><td>${p.user}</td><td>${p.dept}</td>
          <td>${label} ｜ ${p.reason||p.detail||''}</td><td>${p.applyAt}</td>
          <td>
            <button class="btn-sm btn-green" onclick="approve('${p.cat_t}','${p.id}')">通过</button>
            <button class="btn-sm btn-red" onclick="reject('${p.cat_t}','${p.id}')">驳回</button>
          </td></tr>`;
      }).join('')}</tbody></table>`}
  </div>
  <div class="card">
    <h2>历史审批</h2>
    ${done.length===0?'<div class="empty">暂无历史</div>':`
    <table>
      <thead><tr><th>类型</th><th>单号</th><th>申请人</th><th>内容</th><th>结果</th></tr></thead>
      <tbody>${done.reverse().map(o=>{
        const label = o.t==='请假'?`${o.x.type}(${o.x.days}天)` : o.t==='出差'?o.x.dest : o.t==='报销'?money(o.x.amount) : o.x.item;
        return `<tr><td>${o.t}</td><td>${o.x.id}</td><td>${o.x.user}</td><td>${label}</td><td>${statusTag(o.x.status)}</td></tr>`;
      }).join('')}</tbody></table>`}
  </div>`;
};
function arrOf(t){ return {leave:DB.leaves, travel:DB.travels, expense:DB.expenses, purchase:DB.purchases}[t]; }
function approve(t,id){
  const it = arrOf(t).find(x=>x.id===id);
  if(it){ it.status='approved'; it.approver=ME.name; save(); }
  nav('approval'); alert(`${id} 审批已通过 ✅`);
}
function reject(t,id){
  const reason = prompt('请输入驳回原因:', '不符合当前审批要求');
  if(reason===null) return;
  const it = arrOf(t).find(x=>x.id===id);
  if(it){ it.status='rejected'; it.approver=ME.name; it.rejectReason=reason; save(); }
  nav('approval'); alert(`${id} 已驳回 ❌`);
}

/* 公告 */
VIEWS.notice = ()=>{
  const list = DB.notices.slice().reverse();
  return `
  <div class="card">
    <div class="toolbar">
      <h2 style="margin:0">公告通知</h2>
      ${ME.role!=='staff'?'<button class="btn-sm" onclick="openNotice()">+ 发布公告</button>':''}
    </div>
    <table>
      <thead><tr><th style="width:60px">置顶</th><th>标题</th><th style="width:130px">发布部门</th><th style="width:110px">日期</th><th style="width:70px">操作</th></tr></thead>
      <tbody>${list.map(n=>`<tr>
        <td>${n.top?'⭐':'—'}</td>
        <td><b>${n.title}</b></td>
        <td>${n.from}</td><td>${n.date}</td>
        <td><button class="btn-sm btn-gray" onclick="viewNotice(${n.id})">查看</button></td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
};
function viewNotice(id){
  const n = DB.notices.find(x=>x.id===id); if(!n) return;
  openModal(`<h3>${n.top?'⭐ ':''}${n.title}</h3>
    <p class="muted" style="margin-bottom:14px">发布部门: ${n.from} ｜ 发布时间: ${n.date}</p>
    <div style="line-height:1.9;color:#444">${n.body}</div>
    <div class="modal-footer"><button class="btn-sm" onclick="closeModal()">知道了</button></div>`);
}
function openNotice(){
  openModal(`<h3>发布新公告</h3>
    <div class="form-row"><div class="form-col"><label>公告标题</label>
      <input type="text" id="ntTitle" placeholder="公告标题"></div></div>
    <div class="form-row">
      <div class="form-col"><label>发布部门</label><input type="text" id="ntFrom" value="${ME.dept}"></div>
      <div class="form-col"><label>是否置顶</label><select id="ntTop"><option value="0">否</option><option value="1">是</option></select></div>
    </div>
    <div class="form-row"><div class="form-col"><label>公告内容</label>
      <textarea id="ntBody" rows="5" placeholder="公告正文..."></textarea></div></div>
    <div class="modal-footer">
      <button class="btn-sm btn-gray" onclick="closeModal()">取消</button>
      <button class="btn-sm" onclick="submitNotice()">发布公告</button>
    </div>`);
}
function submitNotice(){
  const t=document.getElementById('ntTitle').value.trim(), b=document.getElementById('ntBody').value.trim();
  if(!t) return alert('请填写公告标题');
  if(!b) return alert('请填写公告内容');
  DB.notices.push({ id:DB.nextId.notice++, title:t, body:b,
    from:document.getElementById('ntFrom').value.trim()||ME.dept,
    date:today(), top:document.getElementById('ntTop').value==='1' });
  save(); closeModal(); nav('notice'); alert('公告发布成功 📢');
}

/* 通讯录 */
VIEWS.contacts = ()=>{
  const extra = [
    {name:'王五',dept:'市场部',title:'市场专员',phone:'138****2041',email:'wangwu@corp.com'},
    {name:'赵六',dept:'研发部',title:'高级工程师',phone:'139****7788',email:'zhaoliu@corp.com'},
    {name:'孙七',dept:'财务部',title:'会计',phone:'137****3355',email:'sunqi@corp.com'},
    {name:'周八',dept:'人力资源部',title:'HRBP',phone:'136****9900',email:'zhouba@corp.com'},
    {name:'吴九',dept:'行政部',title:'行政专员',phone:'135****1234',email:'wujiu@corp.com'},
  ];
  const list = [...USERS.map(u=>({name:u.name,dept:u.dept,title:u.title,phone:'138****0000',email:u.username+'@corp.com'})), ...extra];
  return `
  <div class="card">
    <h2>公司通讯录</h2>
    <table>
      <thead><tr><th>姓名</th><th>部门</th><th>职务</th><th>手机</th><th>邮箱</th></tr></thead>
      <tbody>${list.map(c=>`<tr>
        <td><b>${c.name}</b></td><td>${c.dept}</td><td>${c.title}</td>
        <td>${c.phone}</td><td>${c.email}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
};

/* 系统管理 */
VIEWS.system = ()=>{
  const isAdmin = ME.role==='admin';
  const stats = [
    ['请假单', DB.leaves.length],['出差单', DB.travels.length],['报销单', DB.expenses.length],
    ['采购单', DB.purchases.length],['公告', DB.notices.length],['考勤记录', DB.attendances.length],
  ];
  return `
  <div class="card">
    <h2>账号与权限</h2>
    <table>
      <thead><tr><th>账号</th><th>姓名</th><th>部门</th><th>角色</th><th>权限说明</th></tr></thead>
      <tbody>${USERS.map(u=>`<tr>
        <td><code>${u.username}</code></td><td>${u.name}</td><td>${u.dept}</td>
        <td>${u.title}</td>
        <td>${u.role==='admin'?'全部模块 + 全量审批 + 发布公告 + 系统管理':
             u.role==='manager'?'本部门审批 + 全部业务模块 + 发布公告':
             '个人业务申请 + 查看本人数据'}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="card">
    <h2>数据概览</h2>
    <div class="grid-cards">${stats.map(s=>`
      <div class="stat"><div class="ico">🗄️</div><div><div class="num">${s[1]}</div><div class="lbl">${s[0]}</div></div></div>`).join('')}
    </div>
  </div>
  <div class="card">
    <h2>系统维护</h2>
    <p class="muted" style="margin-bottom:14px">数据保存在浏览器 localStorage, 重置后恢复演示初始数据。</p>
    <button class="btn-sm btn-red" onclick="resetData()" ${isAdmin?'':'disabled'}>重置全部数据</button>
    ${isAdmin?'':'<span class="muted" style="margin-left:10px">仅管理员可操作</span>'}
  </div>`;
};
function resetData(){
  if(!confirm('确定重置所有数据为初始演示状态?')) return;
  localStorage.removeItem(DB_KEY);
  DB = load(); nav('system'); alert('数据已重置 ✅');
}

/* ============ 启动 ============ */
function tick(){
  const el = document.getElementById('clock');
  if(el) el.textContent = new Date().toLocaleString('zh-CN',{hour12:false});
}
setInterval(tick,1000);
window.addEventListener('DOMContentLoaded', ()=>{
  tick();
  const u = sessionStorage.getItem(SESSION_KEY);
  if(u){ const f = USERS.find(x=>x.username===u); if(f){ ME=f; showMain(); } }
});