"use client";

import FloatingChat from "@/components/Chat";
import SupportChat from "@/components/ChatSoporte";
import { useCheckRole } from "@/utils/clientRoles";

const ChatSelectClient = () => {
  const isAdmin = useCheckRole("admin");
  
  return <>{isAdmin ? <SupportChat /> : <FloatingChat />}</>;
};

export default ChatSelectClient;
