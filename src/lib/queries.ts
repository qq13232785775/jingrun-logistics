import "server-only";

import { connection } from "next/server";
import {
  findWaybillById,
  findWaybillByTracking,
  findWaybillsByTrackingNumbers,
  listWaybillRows,
} from "@/lib/db";
import { SEED_WAYBILLS } from "@/lib/samples";
import type { WaybillFilters } from "@/lib/types";

export async function getWaybillByTracking(trackingNumber: string) {
  await connection();
  return findWaybillByTracking(trackingNumber);
}

export async function getWaybillById(id: number) {
  await connection();
  return findWaybillById(id);
}

export async function listWaybills(filters: WaybillFilters) {
  await connection();
  return listWaybillRows(filters);
}

export async function getSampleBoard() {
  await connection();
  const live = findWaybillsByTrackingNumbers(
    SEED_WAYBILLS.map((item) => item.trackingNumber),
  );
  const byNumber = new Map(live.map((item) => [item.trackingNumber, item]));
  return SEED_WAYBILLS.map((seed) => {
    const current = byNumber.get(seed.trackingNumber);
    const latest = seed.nodes[seed.nodes.length - 1];
    return {
      trackingNumber: seed.trackingNumber,
      origin: current?.origin ?? seed.origin,
      destination: current?.destination ?? seed.destination,
      cargoName: current?.cargoName ?? seed.cargoName,
      status: current?.status ?? latest?.status ?? "已揽收",
      eta: current?.eta ?? seed.eta,
      missing: !current,
    };
  });
}
