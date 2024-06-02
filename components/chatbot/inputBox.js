import React, { forwardRef, useImperativeHandle } from "react";
import { FaPaperPlane, FaTrashCan } from "react-icons/fa6";
import { useRouter } from "next/router";
import LoadingDots from "../animation/loadingDots";
import LottieAnimation from "../animation/lottie-animation";
import documentlottie from "../../public/document-loading.json";

const MAX_INPUT_LENGTH = 6000;

const Instruction = [
  {
    title: "Casual Conversation",
    text: "Tell me a random fun fact about the Roman Empire.",
  },
  {
    title: "Chat with your Documents",
    text: "From my files, [your custom query]",
  },
  {
    title: "Retrieve Specific Documents",
    text: "Find me documents related to [Your Specific Detail]",
  },
  {
    title: "On-the-Spot Info Fetch",
    text: "What is the weather today in Irvine, CA?",
  },
];

function InputBoxComponent({
  messageLength,
  isSendChatLoading,
  isGetChatLoading,
  isClearChatLoading,
  handleClick,
  handleRefresh,
}, ref) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current.focus();
    },
    getValue: () => {
      return inputText;
    },
    setValue: (val) => {
      setInputText(val)
    }
  }));

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
      } else {
        event.preventDefault();
        handleClick();
      }
    }
  };

  const { docId } = router.query;

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleHandleInstruction = (itemText) => () => {
    setInputText(itemText);
  };

  return (
    <div className="">
      <div
        className="w-full opacity-bottom-0 bottom-0 px-4 items-center flex-col"
      >
        <div className="w-full mt-auto mb-0 flex opacity-bottom-0 bottom-0 px-4 items-center flex-col">
          {messageLength === 0 && !isGetChatLoading && !docId ? (
            //Instruction

            <div className="mb-5 relative w-full">
              <div className=" grid grid-cols-2 gap-4 align-center mt-10 justify-center max-w-5xl  m-auto">
                {Instruction.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-xl border-gray-300 p-5 text-xs hover:bg-gray-200"
                    onClick={handleHandleInstruction(item.text)}
                  >
                    <div className="font-bold text-gray-700">{item.title}</div>
                    <div className="text-gray-400">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isGetChatLoading ? (
            //Scroll to bottom button
            <></>
          ) : (
            //document loading animation
            <LottieAnimation
              animationData={documentlottie}
              width={300}
              height={300}
              className="mb-5"
            />
          )}

          <div className="mx-4 mb-5 flex flex-col w-full @sm:pb-5 max-w-5xl m-auto">
            <div className="border rounded-lg ">
              <div className="">
                <textarea
                  ref={textareaRef}
                  rows="1"
                  style={{
                    "maxHeight?": "400px",
                    height: "56px",
                  }}
                  className="block w-full text-gray-900 placeholder:text-gray-400 text-base font-normal resize-none outline-none px-4 py-4 rounded-t-lg focus:outline-none border-none bg-white z-5"
                  placeholder={
                    isSendChatLoading
                      ? "Wait a second...."
                      : "Type your message..."
                  }
                  value={inputText}
                  maxLength={MAX_INPUT_LENGTH}
                  disabled={isSendChatLoading}
                  onChange={handleInputChange}
                  onKeyDown={handleEnter}
                />
              </div>
              <div className="flex gap-2 justify-between p-2.5 bg-white border-b rounded-b-lg">
                <div className="flex-shrink-0 h-full px-2 py-1">
                  <button
                    disabled={isClearChatLoading}
                    className="transition-all duration-200 relative font-semibold shadow-sm rounded-md px-3 py-1.5 text-sm bg-blue-600 text-white ring-blue-600 active:ring-0 ring-0 hover:ring-0 outline-none hover:outline-none focus:outline-none border-0 h-full opacity-75"
                    onClick={handleRefresh}
                  >
                    <FaTrashCan className="text-xl mx-1" />
                  </button>
                </div>

                <div className="flex-shrink-0 h-full px-2 py-1 flex">
                  <div className="flex items-center gap-2 mr-2">
                    <span className="ml-auto text-xs text-gray-500 transition-[color] duration-150 ease-in-out">
                      {inputText.length} / {MAX_INPUT_LENGTH}
                    </span>
                  </div>
                  <button
                    disabled={isSendChatLoading}
                    className={
                      "transition-all duration-200 relative font-semibold rounded-md px-3 py-1.5 text-sm text-white ring-blue-600 active:ring-0 ring-0 hover:ring-0 outline-none hover:outline-none focus:outline-none border-0 h-full opacity-75" +
                      (isSendChatLoading
                        ? " opacity-40 text-white "
                        : " bg-blue-600 text-white")
                    }
                    onClick={handleClick}
                  >
                    {isSendChatLoading ? (
                      <LoadingDots className="text-black px-1 py-2" />
                    ) : (
                      <FaPaperPlane className="text-xl" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(InputBoxComponent);
// "flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full
