export type LogisticsNode = {
  id: number;
  waybillId: number;
  eventTime: string;
  location: string;
  status: string;
  note: string;
};

export type Waybill = {
  id: number;
  trackingNumber: string;
  origin: string;
  destination: string;
  customerName: string;
  customerPhone: string;
  cargoName: string;
  pieces: number;
  weightKg: number;
  status: string;
  eta: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
};

export type WaybillDetail = Waybill & {
  nodes: LogisticsNode[];
};

export type WaybillInput = {
  trackingNumber: string;
  origin: string;
  destination: string;
  customerName: string;
  customerPhone: string;
  cargoName: string;
  pieces: number;
  weightKg: number;
  status: string;
  eta: string;
  remark: string;
};

export type NodeInput = {
  eventTime: string;
  location: string;
  status: string;
  note: string;
};

export type ActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export type WaybillFilters = {
  q: string;
  status: string;
};
