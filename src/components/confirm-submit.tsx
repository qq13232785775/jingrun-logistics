"use client";

import { Button } from "@/components/ui/button";

export function ConfirmSubmit({
  action,
  message,
  label,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  label: string;
  hidden: Record<string, string | number>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Button type="submit" variant="destructive" className="h-9">
        {label}
      </Button>
    </form>
  );
}
