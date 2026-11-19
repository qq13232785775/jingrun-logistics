"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteNode as deleteNodeRecord,
  deleteWaybill as deleteWaybillRecord,
  findWaybillById,
  insertNode,
  insertWaybill,
  isUniqueViolation,
  updateNode as saveNode,
  updateWaybill,
} from "@/lib/db";
import { isStatus } from "@/lib/statuses";
import type { ActionState, NodeInput, WaybillInput } from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeDateTime(value: string) {
  if (!value) return "";
  const matched = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::\d{2})?$/.exec(value);
  return matched?.[1] ?? null;
}

function publish(paths: string[]) {
  for (const path of paths) revalidatePath(path);
  refresh();
}

function readWaybillInput(formData: FormData): {
  data?: WaybillInput;
  state?: ActionState;
} {
  const trackingNumber = text(formData, "trackingNumber").toUpperCase();
  const origin = text(formData, "origin");
  const destination = text(formData, "destination");
  const customerName = text(formData, "customerName");
  const customerPhone = text(formData, "customerPhone");
  const cargoName = text(formData, "cargoName");
  const piecesRaw = text(formData, "pieces");
  const weightRaw = text(formData, "weightKg");
  const status = text(formData, "status");
  const etaRaw = text(formData, "eta");
  const eta = normalizeDateTime(etaRaw);
  const remark = text(formData, "remark");
  const fieldErrors: NonNullable<ActionState["fieldErrors"]> = {};

  if (!/^[A-Z0-9][A-Z0-9-]{3,31}$/.test(trackingNumber)) {
    fieldErrors.trackingNumber = "运单号需为 4 到 32 位字母、数字或连字符。";
  }
  if (!origin || origin.length > 80) fieldErrors.origin = "请填写起运地，80 字以内。";
  if (!destination || destination.length > 80) {
    fieldErrors.destination = "请填写目的地，80 字以内。";
  }
  if (!customerName || customerName.length > 80) {
    fieldErrors.customerName = "请填写客户名称，80 字以内。";
  }
  if (customerPhone && !/^[0-9+\-\s]{6,20}$/.test(customerPhone)) {
    fieldErrors.customerPhone = "联系电话只保留数字、空格、加号或连字符。";
  }
  if (!cargoName || cargoName.length > 80) {
    fieldErrors.cargoName = "请填写货物名称，80 字以内。";
  }

  const pieces = Number(piecesRaw);
  if (!piecesRaw || !Number.isInteger(pieces) || pieces < 1 || pieces > 99999) {
    fieldErrors.pieces = "件数需为 1 到 99999 的整数。";
  }

  const weightKg = Number(weightRaw);
  if (
    !weightRaw ||
    !Number.isFinite(weightKg) ||
    weightKg < 0 ||
    weightKg > 100000
  ) {
    fieldErrors.weightKg = "重量需为 0 到 100000 之间的数字，单位千克。";
  }

  if (!isStatus(status)) fieldErrors.status = "请选择有效状态。";
  if (eta === null) fieldErrors.eta = "预计到达时间格式不正确。";
  if (remark.length > 500) fieldErrors.remark = "备注请控制在 500 字以内。";

  if (Object.keys(fieldErrors).length > 0) {
    return { state: { error: "请先修正标出的字段。", fieldErrors } };
  }

  return {
    data: {
      trackingNumber,
      origin,
      destination,
      customerName,
      customerPhone,
      cargoName,
      pieces,
      weightKg: Math.round(weightKg * 100) / 100,
      status,
      eta: eta ?? "",
      remark,
    },
  };
}

function readNodeInput(formData: FormData): { data?: NodeInput; state?: ActionState } {
  const eventTime = normalizeDateTime(text(formData, "eventTime"));
  const location = text(formData, "location");
  const status = text(formData, "status");
  const note = text(formData, "note");
  const fieldErrors: NonNullable<ActionState["fieldErrors"]> = {};

  if (!eventTime) fieldErrors.eventTime = "请填写节点时间。";
  if (!location || location.length > 80) fieldErrors.location = "请填写地点，80 字以内。";
  if (!isStatus(status)) fieldErrors.status = "请选择有效状态。";
  if (!note || note.length > 200) fieldErrors.note = "请填写 200 字以内的说明。";

  if (!eventTime || Object.keys(fieldErrors).length > 0) {
    return { state: { error: "请先修正标出的字段。", fieldErrors } };
  }

  return { data: { eventTime, location, status, note } };
}

function idFrom(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export async function searchTracking(formData: FormData) {
  const trackingNumber = text(formData, "no").toUpperCase();
  if (!trackingNumber) redirect("/");
  redirect(`/track/${encodeURIComponent(trackingNumber)}`);
}

export async function saveWaybill(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = readWaybillInput(formData);
  if (!parsed.data) return parsed.state ?? { error: "保存失败。" };

  const id = idFrom(formData, "id");
  const previous = id ? findWaybillById(id) : null;
  if (id && !previous) return { error: "运单不存在或已删除。" };

  let savedId = id ?? 0;
  try {
    savedId = id ? id : insertWaybill(parsed.data);
    if (id) updateWaybill(id, parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: "运单号已存在。",
        fieldErrors: { trackingNumber: "这个运单号已经用过了。" },
      };
    }
    throw error;
  }

  publish([
    "/",
    "/admin",
    `/admin/waybills/${savedId}`,
    `/track/${parsed.data.trackingNumber}`,
    ...(previous && previous.trackingNumber !== parsed.data.trackingNumber
      ? [`/track/${previous.trackingNumber}`]
      : []),
  ]);
  redirect(`/admin/waybills/${savedId}?notice=saved`);
}

export async function removeWaybill(formData: FormData) {
  const id = idFrom(formData, "id");
  if (!id) redirect("/admin");
  const existing = findWaybillById(id);
  if (!existing) redirect("/admin");
  deleteWaybillRecord(id);
  publish(["/", "/admin", `/admin/waybills/${id}`, `/track/${existing.trackingNumber}`]);
  redirect("/admin?notice=deleted");
}

export async function addNode(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const waybillId = idFrom(formData, "waybillId");
  if (!waybillId || !findWaybillById(waybillId)) {
    return { error: "运单不存在或已删除。" };
  }
  const parsed = readNodeInput(formData);
  if (!parsed.data) return parsed.state ?? { error: "添加失败。" };

  insertNode(waybillId, parsed.data);
  const waybill = findWaybillById(waybillId);
  publish([
    "/",
    "/admin",
    `/admin/waybills/${waybillId}`,
    ...(waybill ? [`/track/${waybill.trackingNumber}`] : []),
  ]);
  redirect(`/admin/waybills/${waybillId}?notice=node`);
}

export async function editNode(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nodeId = idFrom(formData, "nodeId");
  if (!nodeId) return { error: "节点不存在或已删除。" };
  const parsed = readNodeInput(formData);
  if (!parsed.data) return parsed.state ?? { error: "保存失败。" };

  const waybillId = saveNode(nodeId, parsed.data);
  if (!waybillId) return { error: "节点不存在或已删除。" };
  const waybill = findWaybillById(waybillId);
  publish([
    "/",
    "/admin",
    `/admin/waybills/${waybillId}`,
    ...(waybill ? [`/track/${waybill.trackingNumber}`] : []),
  ]);
  redirect(`/admin/waybills/${waybillId}?notice=node`);
}

export async function removeNode(formData: FormData) {
  const nodeId = idFrom(formData, "nodeId");
  if (!nodeId) redirect("/admin");
  const waybillId = deleteNodeRecord(nodeId);
  if (!waybillId) redirect("/admin");
  const waybill = findWaybillById(waybillId);
  publish([
    "/",
    "/admin",
    `/admin/waybills/${waybillId}`,
    ...(waybill ? [`/track/${waybill.trackingNumber}`] : []),
  ]);
  redirect(`/admin/waybills/${waybillId}?notice=node`);
}
