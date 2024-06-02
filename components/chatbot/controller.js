import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ChatController from "./chatController.js";
import InputBoxComponent from "./inputBox.js";
import moment from "moment";
import useChatInfoStore from "../../stores/chatStore.js";
import { useSessionStorage } from "../../hooks/useSessionStorage.js";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";

import {
  getSourceStatusAPI,
  getDisplayRelevantFileAPI,
  getRelevantFileAPI,
  getChatMessageAPI,
  getChatTitleAPI,
  getClearChatHistoryAPI
} from '../../api/chatbot/api.js'

function Controller() {
  const [isSendChatLoading, setIsSendChatLoading] = useState(false);
  const [isGetChatLoading, setIsGetChatLoading] = useState(false);
  const [isClearChatLoading, setIsClearChatLoading] = useState(false);
  const [fileObject, setFileObject] = useState();
  const setStreamingResponse = useChatInfoStore((state) => state.setStreamingResponse);
  const chatArray = useChatInfoStore((state) => state.chatArray);
  const setChatArray = useChatInfoStore((state) => state.setChatArray);
  const addChatArray = useChatInfoStore((state) => state.addChatArray);
  const popChatArray = useChatInfoStore((state) => state.popChatArray);
  const getCurrentChatId = useChatInfoStore((state) => state.getCurrentChatId);
  const setCurrentChatId = useChatInfoStore((state) => state.setCurrentChatId);
  const [savedChatId, setSavedChatId] = useSessionStorage("current_chatId", "");
  const [accessToken, setAccessToken] = useSessionStorage("accessToken", "");
  const [currentClient, setCurrentClient] = useLocalStorage("client", "");
  const router = useRouter();
  const chatId = router.query.id;

  const inputBoxRef = useRef(null);

  useEffect(() => {
    if (savedChatId !== chatId && chatId) {
      //when you switch to another chat

      setChatArray([]);
      getChatMessages(chatId);
      setSavedChatId(chatId);
      setStreamingResponse("")
    }

    if (savedChatId === chatId && chatArray.length === 0 && chatId) {
      //when you refresh the page
      getChatMessages(chatId);
    }
  }, [chatId, savedChatId]);

  const sendMessageClick = async () => {
    const currentInputText = inputBoxRef.current.getValue();
    if (!currentInputText) {
      return;
    }
    let chatId = router.query.id;
    setIsSendChatLoading(true);
    setStreamingResponse("");
    inputBoxRef.current.setValue("");

    if (!chatId) {
      chatId = await setNewChatId();
      setCurrentChatId(chatId);
    }

    if (chatId) {
      sendMessageGivenChatId(currentInputText, chatId);
    }
  };

  const sendMessageGivenChatId = async (messageText, chatId) => {
    let clientId = currentClient.uuid;
    const sendTime = moment().format("h:mm");
    const myMessage = { sender: "human", message: messageText, time: sendTime };
    addChatArray(myMessage);

    // Not sure if the context needs to be included here.
    // const encodeURIInputText = encodeURIComponent([...chatArray, myMessage]);
    const encodeURIInputText = encodeURIComponent([myMessage]);

    try {
      const response = await fetch(
        `/api/chain/${chatId}/${clientId}/?message=${encodeURIInputText}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.body)
        throw Error("ReadableStream not yet supported in this browser.");
      const reader = response.body.getReader();

      let accumulatedResponse = "";

      reader.read().then(async function process({ done, value }) {
        if (done) {
          const sourceStatus = await getSourceStatusAPI(chatId);
          
          const fileData = await getRelevantFile(
            chatId,
            messageText,
            accumulatedResponse,
            sourceStatus == "Document_Display"
          );
          
          const finalBotMessage = {
            sender: "ai",
            message: accumulatedResponse,
            time: sendTime,
            relevant_files: fileData,
            source: sourceStatus,
          };

          // The chatId has already changed before the fetch completed when the user switched to another chat.
          if (chatId !== getCurrentChatId()) {
            return;
          }

          getChatTitleAPI(chatId);
          addChatArray(finalBotMessage);
          setIsSendChatLoading(false);

          setStreamingResponse("");
          return;
        }

        let decodedValue = new TextDecoder("utf-8").decode(value);
        // // Check for "disp:" only if not already detected
        // console.log("this is devoded value", decodedValue);
        // if (!isDispDetected && decodedValue.startsWith("disp: ")) {
        //   let dispValues = decodedValue.split("disp: ")[1];
        //   dispValues = dispValues.replace(/\n\n$/, "");
        //   accumulatedResponse = accumulatedResponse + dispValues;
        //   isDispDetected = true;
        //   return reader.read().then(process); // Skip further processing for this chunk and continue reading
        // }
        let processedValues = decodedValue.split("data: ");

        for (let val of processedValues) {
          if (val.endsWith("\n\n")) {
            val = val.slice(0, -2); // Remove the ending newline characters
          }
          accumulatedResponse = accumulatedResponse + val;
        }

        // The chatId has already changed before the fetch completed when the user switched to another chat.
        if (chatId === getCurrentChatId()) {
          setStreamingResponse(accumulatedResponse);
        }

        return reader.read().then(process); // Continue processing the stream
      });
    } catch (error) {
      // The chatId has already changed before the fetch completed when the user switched to another chat.
      if (chatId !== getCurrentChatId()) {
        return;
      }
      popChatArray();
      setStreamingResponse("");
      const errorMessage = {
        sender: "ai",
        message: "Sorry, something went wrong. Please try again.",
        time: sendTime,
      };
      addChatArray(errorMessage); // Add error message to chat array
    }
  };

  async function getRelevantFile(chatId, inputText, aiResponse, isDisplay = true) {
    const body = {
      chat_id: chatId,
      client_id: currentClient.uuid,
      human_message: inputText,
      ai_message: aiResponse,
    };
    try {
      const request = isDisplay ? getDisplayRelevantFileAPI : getRelevantFileAPI;
      const response = await request(body)
      if (response.status === 200) {
        const releventFile = response.data;
        setFileObject(releventFile);
        return releventFile;
      }
    } catch (error) {
      return setFileObject({
        file_id: -1,
        file_name: "No relevant file found",
      });
    }
  }

  async function getChatMessages(chatId) {
    setIsGetChatLoading(true);
    try {
      const messages = await getChatMessageAPI(chatId);
      setChatArray(messages);
    } catch (error) {
      console.error("Error getting new chat ID", error);
      return [];
    } finally {
      setIsGetChatLoading(false);
    }
  }

  async function setNewChatId() {
    //when first time open the chatbot
    try {
      const chatId = (await postCreateNewChatAPI()).chat_id;
      sessionStorage.setItem("current_chatId", chatId);
      router.push(`/chatbot/${chatId}`, undefined, { shallow: true });

      return chatId;
    } catch (error) {
      console.error("Error getting new chat ID", error);
    }
  }

  const handleRefresh = async () => {
    setIsClearChatLoading(true)
    try {
      const response = await getClearChatHistoryAPI();

      if (response.status === 200) {
        toast("Successfully clear history");
        setChatArray([]);
      } else {
        toast("failed to clear history");
      }
    } finally {
      setIsClearChatLoading(false)
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 overflow-auto">
        <ChatController
          isSendChatLoading={isSendChatLoading}
          isGetChatLoading={isGetChatLoading}
          messages={chatArray}
        />
      </div>
      <div className="flex-shrink-0">
        <InputBoxComponent
          ref={inputBoxRef}
          messageLength={chatArray.length}
          isSendChatLoading={isSendChatLoading}
          isGetChatLoading={isGetChatLoading}
          isClearChatLoading={isClearChatLoading}
          handleClick={sendMessageClick}
          handleRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}

export default Controller;
