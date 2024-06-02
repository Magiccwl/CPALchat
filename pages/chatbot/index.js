import Controller from "../../components/chatbot/controller";
import withLayout from "../../components/withLayout";

function Chat() {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <Controller/>
    </div>
  );
}

export default withLayout(Chat, "chatbot");
