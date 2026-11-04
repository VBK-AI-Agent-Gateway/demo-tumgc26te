// 全局模拟数据（车机内所有模块共享）
const MUSIC=[
 {t:'起航',ar:'_generator · 电子',len:222,tone:' Ambient'},
 {t:'海浪之城',ar:'Zhou Tian · 流行',len:196},
 {t:'川流不息',ar:'HUA · 国潮电子',len:251},
 {t:'机电时代',ar:'Liu Hai · Synth',len:189},
 {t:'白日梦蓝',ar:'Chen Yi · 摇滚',len:234},
 {t:'远山',ar:'Miao · 民谣',len:263}
];
const POIS=[
 {n:'公司 · 陆家嘴软件园',d:'12 min · 3.4 km'},
 {n:'公司 · 张江高科',d:'18 min · 6.2 km'},
 {n:'家 · 浦东世纪公园',d:'25 min · 9.8 km'},
 {n:'充电站 · 特来电（张江店）',d:'8 min · 1.8 km · 快充 ×6'},
 {n:'加油站 · 中石化（金桥站）',d:'11 min · 4.6 km'}
];
const VCMD=[
 {c:'打开空调',go:'ac'},
 {c:'关闭空调',go:'ac'},
 {c:'导航去公司',go:'nav'},
 {c:'播放音乐',go:'media'},
 {c:'打开天窗',go:'vehicle'},
 {c:'打开360全景',go:'avm'},
 {c:'调到二十三度',go:'ac'},
 {c:'打开座椅加热',go:'ac'},
 {c:'切换节能模式',go:'vehicle'}
];
