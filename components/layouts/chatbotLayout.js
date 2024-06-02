import ResponsiveNavbar from "../navigation/responsiveNavbar";
import { useState } from "react";
import ChatDrawer from "../navigation/chatDrawer";
import { RiExpandRightLine } from "react-icons/ri";
import { GoSidebarExpand } from "react-icons/go";

function ChatbotLayout({ children }) {
  const [chatListOpen, setChatListOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col h-screen lg:flex-row">
        <div>
          <ResponsiveNavbar setChatListOpen={setChatListOpen} />
        </div>

        <div className="w-full overflow-y-auto bg-white">
          <div className="flex-grow ">{children}</div>
        </div>
        <div className="lg:flex-row border-l">
          <div className="mt-2 p-2 text-left">
            <button
              onClick={() => setChatListOpen(!chatListOpen)}
              className="mr-4 text-lg"
            >
              {chatListOpen ? (
                <RiExpandRightLine className="text-2xl" />
              ) : (
                <GoSidebarExpand className="text-2xl" />
              )}
            </button>
          </div>
          {chatListOpen && (
            <div className=" min-w-[30vh] max-w-[30vh] border-l max-h-[90vh] overflow-y-auto ">
              <ChatDrawer />
              {/* Close Button */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatbotLayout;
