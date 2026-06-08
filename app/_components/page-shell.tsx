import Image from "next/image";
import Sidebar from "./sidebar";
import { C } from "./theme";

// App shell: faint texture background, shared sidebar, scrollable main area.
export default function PageShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.pageBg, color: C.cream }}>
      <Image src="/1.png" alt="" fill priority className="object-cover object-center" style={{ opacity: 0.035 }} />
      <Sidebar active={active} />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-7 py-5">{children}</main>
    </div>
  );
}
