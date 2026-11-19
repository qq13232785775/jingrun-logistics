import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchTracking } from "@/lib/actions";

export function TrackingSearch({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action={searchTracking} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="tracking-no">
        运单号
      </label>
      <Input
        id="tracking-no"
        name="no"
        required
        minLength={4}
        maxLength={32}
        autoComplete="off"
        spellCheck={false}
        defaultValue={defaultValue}
        placeholder="请输入运单号，例如 JR202611120018"
        className="h-11 bg-white md:text-base"
      />
      <Button type="submit" className="h-11 px-6 sm:w-28">
        查询
      </Button>
    </form>
  );
}
