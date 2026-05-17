import { Search, Bell, Settings, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 flex items-center justify-between px-10 bg-bg-light shrink-0">
      <div className="flex items-center bg-gray-200 rounded-md py-2 px-4 w-125 gap-3">
        <Search className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Nhập tìm kiếm ..."
          className="border-none bg-transparent outline-none text-[14px] w-full text-gray-900 placeholder:text-gray-500 font-sans"
        />
      </div>
      <div className="flex gap-4">
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Bell size={20} />
        </button>
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Settings size={20} />
        </button>
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
