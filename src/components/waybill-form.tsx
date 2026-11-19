"use client";

import { useActionState } from "react";
import { Field, selectClassName } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWaybill } from "@/lib/actions";
import { STATUSES } from "@/lib/statuses";
import type { ActionState, Waybill } from "@/lib/types";

const initialState: ActionState = {};

export function WaybillForm({
  waybill,
  submitLabel,
}: {
  waybill?: Waybill;
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState(saveWaybill, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="grid gap-4">
      {waybill ? <input type="hidden" name="id" value={waybill.id} /> : null}
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="运单号" htmlFor="trackingNumber" required error={errors.trackingNumber}>
          <Input
            id="trackingNumber"
            name="trackingNumber"
            required
            minLength={4}
            maxLength={32}
            defaultValue={waybill?.trackingNumber ?? ""}
            placeholder="例如 JR202611170099"
            autoComplete="off"
            aria-invalid={Boolean(errors.trackingNumber)}
            className="h-9 bg-white font-mono"
          />
        </Field>
        <Field
          label="当前状态"
          htmlFor="status"
          required
          error={errors.status}
          hint="手动保存会按这里的状态更新。之后新增或修改节点时，会再按时间最新的节点同步。"
        >
          <select
            id="status"
            name="status"
            required
            defaultValue={waybill?.status ?? "已揽收"}
            className={selectClassName}
            aria-invalid={Boolean(errors.status)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="起运地" htmlFor="origin" required error={errors.origin}>
          <Input
            id="origin"
            name="origin"
            required
            maxLength={80}
            defaultValue={waybill?.origin ?? ""}
            placeholder="例如 深圳宝安仓"
            aria-invalid={Boolean(errors.origin)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="目的地" htmlFor="destination" required error={errors.destination}>
          <Input
            id="destination"
            name="destination"
            required
            maxLength={80}
            defaultValue={waybill?.destination ?? ""}
            placeholder="例如 美国洛杉矶"
            aria-invalid={Boolean(errors.destination)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="客户名称" htmlFor="customerName" required error={errors.customerName}>
          <Input
            id="customerName"
            name="customerName"
            required
            maxLength={80}
            defaultValue={waybill?.customerName ?? ""}
            aria-invalid={Boolean(errors.customerName)}
            className="h-9 bg-white"
          />
        </Field>
        <Field
          label="联系电话"
          htmlFor="customerPhone"
          error={errors.customerPhone}
          hint="只在管理后台显示，客户查询页不展示。"
        >
          <Input
            id="customerPhone"
            name="customerPhone"
            maxLength={20}
            defaultValue={waybill?.customerPhone ?? ""}
            aria-invalid={Boolean(errors.customerPhone)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="货物名称" htmlFor="cargoName" required error={errors.cargoName}>
          <Input
            id="cargoName"
            name="cargoName"
            required
            maxLength={80}
            defaultValue={waybill?.cargoName ?? ""}
            aria-invalid={Boolean(errors.cargoName)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="预计到达" htmlFor="eta" error={errors.eta} hint="可以先留空，确认船期或航班后再补。">
          <Input
            id="eta"
            name="eta"
            type="datetime-local"
            defaultValue={waybill?.eta ?? ""}
            aria-invalid={Boolean(errors.eta)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="件数" htmlFor="pieces" required error={errors.pieces}>
          <Input
            id="pieces"
            name="pieces"
            type="number"
            required
            min={1}
            max={99999}
            step={1}
            defaultValue={waybill?.pieces ?? 1}
            aria-invalid={Boolean(errors.pieces)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="重量（kg）" htmlFor="weightKg" required error={errors.weightKg}>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            required
            min={0}
            max={100000}
            step="0.01"
            defaultValue={waybill?.weightKg ?? ""}
            aria-invalid={Boolean(errors.weightKg)}
            className="h-9 bg-white"
          />
        </Field>
      </div>
      <Field label="备注" htmlFor="remark" error={errors.remark}>
        <Textarea
          id="remark"
          name="remark"
          maxLength={500}
          defaultValue={waybill?.remark ?? ""}
          placeholder="柜号、航班、查验或其他需要客户看到的说明"
          aria-invalid={Boolean(errors.remark)}
          className="min-h-20 bg-white"
        />
      </Field>
      <div>
        <Button type="submit" disabled={pending} className="h-10 px-5">
          {pending ? "保存中…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
