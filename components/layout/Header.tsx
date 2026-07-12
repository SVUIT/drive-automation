import { Search, Bell, Settings, User, Menu } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 bg-bg-light shrink-0 border-b lg:border-none border-gray-200">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center bg-gray-200 rounded-md py-2 px-4 w-full max-w-[500px] gap-3">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Nhập tìm kiếm ..."
            className="border-none bg-transparent outline-none text-[14px] w-full text-gray-900 placeholder:text-gray-500 font-sans"
          />
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 ml-4">
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-8 h-8 lg:w-10 lg:h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Bell size={20} />
        </button>
        <button className="hidden sm:flex bg-transparent border-none cursor-pointer text-gray-500 items-center justify-center rounded-full w-8 h-8 lg:w-10 lg:h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <Settings size={20} />
        </button>
        <button className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center rounded-full w-8 h-8 lg:w-10 lg:h-10 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
