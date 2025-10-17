
import FloatingChat from "@/components/Chat";
import SupportChat from "@/components/ChatSoporte";
import { checkRoles } from "@/utils/roles";

const ChatSelectClient = async () => {
	const isSupport = await checkRoles(["recepcionista", "admin"])

	return <>{isSupport ? <SupportChat /> : <FloatingChat />}</>;
};

export default ChatSelectClient;
