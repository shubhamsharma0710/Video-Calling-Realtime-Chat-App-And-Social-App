import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
  
  // Check if we are on the chat page
  const isChatPage = location.pathname?.startsWith("/chat");

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center backdrop-blur-lg bg-opacity-90">
      <div className="w-full px-4 sm:px-6 lg:px-8"> 
        <div className="flex items-center justify-between w-full">
          
          {/* ✅ LOGO: Always visible on Chat Page, or visible on Mobile for other pages */}
          <div className={`flex items-center gap-3 ${!isChatPage ? "lg:hidden" : "flex"}`}>
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <img
                  src="/setu-logo.png"
                  alt="Setu Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Setu
              </span>
            </Link>
          </div>

          {/* Spacer to keep right-side icons aligned when logo is hidden on Desktop Home */}
          {!isChatPage && <div className="hidden lg:block"></div>}

          {/* RIGHT SIDE: ICONS & PROFILE */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/notifications">
              <button className="btn btn-ghost btn-circle btn-sm sm:btn-md">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar hidden sm:block">
              <div className="w-9 rounded-full ring ring-primary/20">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="User Avatar"
                />
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle btn-sm sm:btn-md text-error"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;