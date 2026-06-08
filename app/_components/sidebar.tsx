import Image from "next/image";
import Link from "next/link";
import { C, HEAD, NAV } from "./theme";

// Shared left navigation. `active` is the label of the current page.
export default function Sidebar({ active }: { active: string }) {
  return (
    <aside
      className="relative z-10 flex h-full flex-col"
      style={{ width: 268, borderRight: `1px solid ${C.border}`, background: "rgba(15,11,8,0.85)" }}
    >
      <div className="flex items-center justify-center px-2 pt-4 pb-3">
        <Image src="/logo-mark.png" alt="InControl" width={224} height={65} priority className="object-contain" />
      </div>

      <p className="px-5 pb-2" style={{ fontFamily: HEAD, fontSize: "0.6rem", letterSpacing: "0.28em", color: C.faint }}>
        SYSTEMS
      </p>

      <nav className="flex flex-col">
        {NAV.map((item) => {
          const isActive = item.label === active;
          const style: React.CSSProperties = {
            fontFamily: HEAD,
            fontSize: "0.74rem",
            letterSpacing: "0.12em",
            color: isActive ? C.cream : item.enabled ? C.muted : C.faint,
            background: isActive ? "rgba(181,144,90,0.14)" : "transparent",
            borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
          };
          const className = "px-5 py-3 text-left transition-colors";

          // Active page or not-yet-built page → non-link.
          if (isActive || !item.enabled) {
            return (
              <div key={item.label} className={className} style={style}>
                {item.label}
              </div>
            );
          }
          return (
            <Link key={item.label} href={item.href} className={className} style={style}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex w-full justify-center px-2 pb-5">
        <Image src="/signature-mark.png" alt="Signature" width={196} height={54} className="object-contain" style={{ opacity: 0.55 }} />
      </div>
    </aside>
  );
}
