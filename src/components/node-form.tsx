"use client";

import { useActionState } from "react";
import { Field, selectClassName } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addNode, editNode } from "@/lib/actions";
import { STATUSES } from "@/lib/statuses";
import type { ActionState, LogisticsNode } from "@/lib/types";

const initialState: ActionState = {};

export function NodeForm({
  waybillId,
  node,
  submitLabel,
  defaultTime,
}: {
  waybillId: number;
  node?: LogisticsNode;
  submitLabel: string;
  defaultTime?: string;
}) {
  const action = node ? editNode : addNode;
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const fieldPrefix = node ? `node-${node.id}` : "new-node";

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="waybillId" value={waybillId} />
      {node ? <input type="hidden" name="nodeId" value={node.id} /> : null}
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="时间" htmlFor={`${fieldPrefix}-time`} required error={errors.eventTime}>
          <Input
            id={`${fieldPrefix}-time`}
            name="eventTime"
            type="datetime-local"
            required
            defaultValue={node?.eventTime ?? defaultTime ?? ""}
            aria-invalid={Boolean(errors.eventTime)}
            className="h-9 bg-white"
          />
        </Field>
        <Field label="状态" htmlFor={`${fieldPrefix}-status`} required error={errors.status}>
          <select
            id={`${fieldPrefix}-status`}
            name="status"
            required
            defaultValue={node?.status ?? "已揽收"}
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
      </div>
      <Field label="地点" htmlFor={`${fieldPrefix}-location`} required error={errors.location}>
        <Input
          id={`${fieldPrefix}-location`}
          name="location"
          required
          maxLength={80}
          defaultValue={node?.location ?? ""}
          placeholder="例如 深圳盐田港"
          aria-invalid={Boolean(errors.location)}
          className="h-9 bg-white"
        />
      </Field>
      <Field label="说明" htmlFor={`${fieldPrefix}-note`} required error={errors.note}>
        <Textarea
          id={`${fieldPrefix}-note`}
          name="note"
          required
          maxLength={200}
          defaultValue={node?.note ?? ""}
          placeholder="简短说明这一站发生了什么"
          aria-invalid={Boolean(errors.note)}
          className="min-h-16 bg-white"
        />
      </Field>
      <div>
        <Button type="submit" disabled={pending} variant={node ? "outline" : "default"} className="h-9">
          {pending ? "提交中…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
