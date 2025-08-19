import FloatingChat from "@/components/Chat";
import SupportChat from "@/components/ChatSoporte";
import { checkRole } from "@/utils/roles";

const ChatSelect = async () => {
  const isAdmin = await checkRole("admin");
  return <>{isAdmin ? <SupportChat /> : <FloatingChat />}</>;
};

export default ChatSelect;
