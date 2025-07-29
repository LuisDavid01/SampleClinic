import { Suspense } from "react";
import ChatSelect from "../ChatSelect";
const ChatWithSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatSelect />
    </Suspense>
  );
};

export default ChatWithSuspense;
