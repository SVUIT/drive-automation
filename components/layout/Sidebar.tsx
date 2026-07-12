"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Clock, CheckCircle2, X } from "lucide-react";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-sidebar-bg h-screen border-r border-gray-200 flex flex-col shrink-0">
      <div className="py-8 px-6 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">Docs Transfer</h1>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:bg-gray-200 p-1 rounded-md">
          <X size={20} />
        </button>
      </div>
      <nav className="px-3">
        <ul className="flex flex-col gap-2 list-none">
          <li>
            <Link
              href="/raw-uploads"
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-[15px] transition-all duration-200 ${
                pathname === "/raw-uploads"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FileUp
                className={
                  pathname === "/raw-uploads"
                    ? "text-brand-blue"
                    : "text-inherit"
                }
                size={20}
              />
              <span>Raw uploads</span>
            </Link>
          </li>
          <li>
            <Link
              href="/pending-approval"
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-[15px] transition-all duration-200 ${
                pathname === "/pending-approval"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Clock
                className={
                  pathname === "/pending-approval"
                    ? "text-brand-blue"
                    : "text-inherit"
                }
                size={20}
              />
              <span>Pending approval</span>
            </Link>
          </li>
          <li>
            <Link
              href="/approved-files"
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-[15px] transition-all duration-200 ${
                pathname === "/approved-files"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <CheckCircle2
                className={
                  pathname === "/approved-files"
                    ? "text-brand-blue"
                    : "text-inherit"
                }
                size={20}
              />
              <span>Approved files</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
