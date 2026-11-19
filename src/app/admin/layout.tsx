export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
        演示环境：管理后台没有登录校验，打开即可修改运单。仅供本地试用，请不要录入真实客户的证件、详细地址等敏感信息。
      </div>
      {children}
    </div>
  );
}
