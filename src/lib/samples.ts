export type SeedNode = {
  eventTime: string;
  location: string;
  status: string;
  note: string;
};

export type SeedWaybill = {
  trackingNumber: string;
  origin: string;
  destination: string;
  customerName: string;
  customerPhone: string;
  cargoName: string;
  pieces: number;
  weightKg: number;
  eta: string;
  remark: string;
  nodes: SeedNode[];
};

export const SEED_WAYBILLS: SeedWaybill[] = [
  {
    trackingNumber: "JR202611120018",
    origin: "深圳宝安仓",
    destination: "美国洛杉矶",
    customerName: "杭州星澜电商",
    customerPhone: "13800001120",
    cargoName: "家居收纳套装",
    pieces: 48,
    weightKg: 86.4,
    eta: "2026-11-26T18:00",
    remark: "海运整柜，柜号 COSU8842107。",
    nodes: [
      {
        eventTime: "2026-11-12T09:20",
        location: "深圳宝安仓",
        status: "已揽收",
        note: "仓库已收货，件数与预报一致。",
      },
      {
        eventTime: "2026-11-12T16:40",
        location: "深圳宝安仓",
        status: "已出库",
        note: "已装柜，柜号 COSU8842107。",
      },
      {
        eventTime: "2026-11-13T11:05",
        location: "深圳盐田港",
        status: "已出库",
        note: "货柜已进港，等待装船。",
      },
      {
        eventTime: "2026-11-14T02:30",
        location: "深圳盐田港",
        status: "国际运输中",
        note: "已装船离港，船名 EVER GOLDEN，航次 118E。",
      },
    ],
  },
  {
    trackingNumber: "JR202611080044",
    origin: "义乌国际陆港",
    destination: "德国汉堡",
    customerName: "义乌禾木日用",
    customerPhone: "13700008044",
    cargoName: "厨房小家电",
    pieces: 120,
    weightKg: 310.5,
    eta: "2026-11-21T12:00",
    remark: "中欧班列，班列号 X8008。",
    nodes: [
      {
        eventTime: "2026-11-08T10:15",
        location: "义乌国际陆港",
        status: "已揽收",
        note: "已完成过机与称重。",
      },
      {
        eventTime: "2026-11-08T18:40",
        location: "义乌国际陆港",
        status: "已出库",
        note: "已装上铁路班列，班列号 X8008。",
      },
      {
        eventTime: "2026-11-15T06:20",
        location: "德国汉堡港",
        status: "已到港",
        note: "班列抵港，等待提货。",
      },
      {
        eventTime: "2026-11-16T14:05",
        location: "汉堡海关",
        status: "清关中",
        note: "已提交清关资料，等待放行。",
      },
    ],
  },
  {
    trackingNumber: "JR202610150073",
    origin: "广州白云仓",
    destination: "日本东京",
    customerName: "广州南风服饰",
    customerPhone: "13600001507",
    cargoName: "秋季女装",
    pieces: 36,
    weightKg: 214,
    eta: "2026-10-22T16:00",
    remark: "",
    nodes: [
      {
        eventTime: "2026-10-15T08:50",
        location: "广州白云仓",
        status: "已揽收",
        note: "仓库收货完成。",
      },
      {
        eventTime: "2026-10-15T21:10",
        location: "广州白云国际机场",
        status: "已出库",
        note: "航班 CZ3089 已起飞。",
      },
      {
        eventTime: "2026-10-16T09:40",
        location: "东京成田机场",
        status: "已到港",
        note: "航班抵达。",
      },
      {
        eventTime: "2026-10-16T15:20",
        location: "东京成田机场",
        status: "清关完成",
        note: "海关已放行。",
      },
      {
        eventTime: "2026-10-17T11:00",
        location: "东京都江东区",
        status: "派送中",
        note: "当地快递已取件。",
      },
      {
        eventTime: "2026-10-17T16:35",
        location: "东京都江东区",
        status: "已签收",
        note: "收件人已签收。",
      },
    ],
  },
  {
    trackingNumber: "JR202611150106",
    origin: "宁波北仑仓",
    destination: "荷兰鹿特丹",
    customerName: "宁波海禾工贸",
    customerPhone: "13500001510",
    cargoName: "户外露营装备",
    pieces: 64,
    weightKg: 402.8,
    eta: "2026-11-22T10:00",
    remark: "海运整柜，柜号 MSCU4419082。",
    nodes: [
      {
        eventTime: "2026-11-15T09:00",
        location: "宁波北仑仓",
        status: "已揽收",
        note: "已入库并打托。",
      },
      {
        eventTime: "2026-11-15T17:30",
        location: "宁波北仑港",
        status: "已出库",
        note: "货柜进港，柜号 MSCU4419082。",
      },
      {
        eventTime: "2026-11-16T23:10",
        location: "宁波北仑港",
        status: "国际运输中",
        note: "已装船离港，船名 MSC IRINA，航次 246W。",
      },
      {
        eventTime: "2026-11-17T08:40",
        location: "鹿特丹港",
        status: "已到港",
        note: "船舶靠泊，等待卸船。",
      },
    ],
  },
  {
    trackingNumber: "JR202611100091",
    origin: "上海浦东仓",
    destination: "澳大利亚悉尼",
    customerName: "上海澄麦科技",
    customerPhone: "13900001009",
    cargoName: "消费电子配件",
    pieces: 22,
    weightKg: 58.6,
    eta: "2026-11-18T15:00",
    remark: "",
    nodes: [
      {
        eventTime: "2026-11-10T13:25",
        location: "上海浦东仓",
        status: "已揽收",
        note: "已核对序列号清单。",
      },
      {
        eventTime: "2026-11-11T01:10",
        location: "上海浦东国际机场",
        status: "已出库",
        note: "航班 MU735 已起飞。",
      },
      {
        eventTime: "2026-11-12T07:50",
        location: "悉尼机场",
        status: "已到港",
        note: "航班抵达。",
      },
      {
        eventTime: "2026-11-13T16:00",
        location: "悉尼机场",
        status: "清关完成",
        note: "海关放行，无待补税费。",
      },
      {
        eventTime: "2026-11-17T09:15",
        location: "新南威尔士州",
        status: "派送中",
        note: "当地快递员已取件，预计今日送达。",
      },
    ],
  },
  {
    trackingNumber: "JR202611010027",
    origin: "东莞沙田仓",
    destination: "英国伦敦",
    customerName: "东莞岚川家居",
    customerPhone: "13400001002",
    cargoName: "灯具",
    pieces: 80,
    weightKg: 560,
    eta: "2026-11-19T18:00",
    remark: "目的港查验，预计延误 2 至 3 个工作日。",
    nodes: [
      {
        eventTime: "2026-11-01T11:00",
        location: "东莞沙田仓",
        status: "已揽收",
        note: "仓库收货，外箱完好。",
      },
      {
        eventTime: "2026-11-02T08:40",
        location: "深圳盐田港",
        status: "已出库",
        note: "已装柜离仓，柜号 OOLU7721450。",
      },
      {
        eventTime: "2026-11-03T19:20",
        location: "深圳盐田港",
        status: "国际运输中",
        note: "已装船离港，船名 COSCO SHIPPING SOLAR。",
      },
      {
        eventTime: "2026-11-15T06:00",
        location: "英国费利克斯托港",
        status: "已到港",
        note: "船舶靠泊。",
      },
      {
        eventTime: "2026-11-16T10:30",
        location: "费利克斯托海关",
        status: "异常",
        note: "海关抽查，货物暂扣待查验，预计延误 2 至 3 个工作日。",
      },
    ],
  },
];
