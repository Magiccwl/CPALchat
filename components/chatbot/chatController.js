import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FaRegComments } from "react-icons/fa6";
import {
  PiBrainDuotone,
  PiDownloadSimpleDuotone,
  PiQueueDuotone,
} from "react-icons/pi";
import "highlight.js/styles/panda-syntax-dark.css"; // choose a style of your preference
import formatDate from "../../utils/dateFormat";
import { useSessionStorage } from "../../hooks/useSessionStorage";
import firstLetterCapitalized from "../../utils/stringManimupaltion";
import extractUsername from "../../utils/usernameExtractor";
import useChatInfoStore from "../../stores/chatStore.js";
import { getDownloadDocumentAPI, getSummaryAPI } from "../../api/chatbot/api.js";
import {
  renderBasedOnResponseStatus,
  renderBasedOnSource,
  markdownToHtml
} from "../../utils/chatbot/index.js";

import { getChatStatusAPI } from '../../api/chatbot/api.js'

function ChatController({
  isSendChatLoading,
  isGetChatLoading,
  messages
}) {
  const router = useRouter();
  const [user, setUser] = useSessionStorage("user", "");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState({
    blockId: null,
    index: null,
  }); // Add this state
  const [summaryData, setSummaryData] = useState(null);
  const { docId } = router.query;
  const [firstLetter, setFirstLetter] = useState("");
  const [usernameExtracted, setUsernameExtracted] = useState("");
  const [isDownloadDocumentLoading, setIsDownloadDocumentLoading] = useState(false);
  const streamingResponse = useChatInfoStore((state) => state.streamingResponse);
  const [responseStatus, setResponseStatus] = useState("");

  useEffect(() => {
    if (user) {
      setFirstLetter(firstLetterCapitalized(user.email));
      setUsernameExtracted(extractUsername(user.email));
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (isSendChatLoading) {
      //when you send a message
      intervalId = setInterval(async () => {
        if (chatId) {
          let chatStatus = await getChatStatusAPI(chatId);
          setResponseStatus(chatStatus);
        }
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSendChatLoading]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  async function getDownloadDocument(id) {
    if (!id) return;

    setIsDownloadDocumentLoading(true);
    try {
      const response = await getDownloadDocumentAPI(id);

      const url = response.data.url;
      window.open(url, "_blank");

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsDownloadDocumentLoading(false);
    }
  }

  async function summarizeDocumentClick(blockId, fileId, index) {

    setSummaryLoading(true);
    setSummaryData("");

    // Check if the clicked block is already expanded
    if (expandedBlock.blockId === blockId) {
      setExpandedBlock({ blockId: null, index: null }); // Collapse the expanded block
    } else {
      setExpandedBlock({ blockId: blockId, index: index }); // Set the clicked block as the expanded block

      const summary = (await getSummaryAPI(id)).message;
      setSummaryData(summary);
    }

    setSummaryLoading(false);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="w-full">
        <div
          className={
            messages.length == 0 && !docId ? "w-full mb-0" : " w-full "
          }
        >
          {messages.length == 0 && !isGetChatLoading && !docId ? (
            <div className="flex justify-center items-center font-bold text-9xl mt-20 text-[#cccfef8c]">
              <FaRegComments />
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div className="p-6"></div>
              <div className="border-t border-gray-300"></div>
              <div className="justify-center">
                {messages?.map((item, blockId) => {
                  let displayMessage = item.message;

                  return item.sender == "human" ? (
                    <div key={blockId}>
                      <div className="m-auto max-w-3xl p-5">
                        <div className="bg-white flex">
                          <div className="bg-green-800 text-md w-7 h-7 aspect-1 rounded-full  text-white flex items-center justify-center">
                            {firstLetter}
                          </div>

                          <div className="ml-5">
                            <div className="text-black-800 truncate  font-bold">
                              You
                            </div>
                            {displayMessage}
                            <div>
                              <time className="text-xs opacity-50">
                                {formatDate(item.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={blockId}>
                      <div className="m-auto max-w-3xl p-5">
                        <div className="flex">
                          <div className="text-white">
                            <PiBrainDuotone className="text-3xl fill-current bg-blue-600 rounded-full p-1" />
                          </div>
                          <div className="ml-5 w-full">
                            <div className="text-black-800 truncate  font-bold">
                              CPAL
                            </div>
                            <div
                              style={{ whiteSpace: "pre-line" }}
                              dangerouslySetInnerHTML={{
                                __html: markdownToHtml(item.message),
                              }}
                            ></div>

                            {item.sender === "ai" &&
                            (item.source === "Document_QA_System" ||
                              item.source === "Document_Display") ? (
                              <div className="bg-white p-2 rounded-md my-2">
                                <div className="">
                                  {renderBasedOnSource(item.source)}
                                </div>
                                <div className="flex text-xs mt-2 items-center w-full">
                                  <table className="min-w-full divide-y divide-gray-200 outline outline-1 outline-gray-200 rounded-md">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2">Filename</th>
                                        <th className="px-4 py-2 ">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.relevant_files &&
                                        item.relevant_files.map(
                                          (item, index) => (
                                            <React.Fragment key={index}>
                                              <tr key={index}>
                                                <td className="px-4 py-2">
                                                  {item.file_name}
                                                </td>
                                                <td className="flex px-4 py-2 items-center justify-center">
                                                  <button
                                                    disabled={isDownloadDocumentLoading}
                                                    onClick={() =>
                                                      getDownloadDocument(
                                                        item.file_id
                                                      )
                                                    }
                                                    className="relative transform transition-transform hover:scale-105 active:scale-95 px-2"
                                                  >
                                                    <div className="relative group">
                                                      <PiDownloadSimpleDuotone />
                                                    </div>
                                                  </button>
                                                  <button
                                                    disabled={summaryLoading}
                                                    onClick={() =>
                                                      summarizeDocumentClick(
                                                        blockId,
                                                        item.file_id,
                                                        index
                                                      )
                                                    }
                                                    className="px-2"
                                                  >
                                                    <div className="relative group">
                                                      <PiQueueDuotone />
                                                    </div>
                                                  </button>
                                                </td>
                                              </tr>
                                              {expandedBlock.blockId ===
                                                blockId &&
                                                expandedBlock.index ===
                                                  index && (
                                                  <tr>
                                                    <td
                                                      colSpan="2"
                                                      className="px-4 py-2"
                                                    >
                                                      {/* Display the summary data here */}
                                                      {summaryData}
                                                    </td>
                                                  </tr>
                                                )}
                                            </React.Fragment>
                                          )
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : item.sender === "ai" &&
                              (item.source === "ChatGPT" ||
                                item.source === "Google_Search") ? (
                              <>
                                <div className="">
                                  {renderBasedOnSource(item.source)}
                                </div>

                                <div className="flex text-xs items-center">
                                  {(item.relevant_files &&
                                    item.relevant_files.length > 0) ||
                                  (item.relevant_files &&
                                    item.relevant_files.length > 0) ? (
                                    <span className="text-sm font-bold mr-2">
                                      Learn more:
                                    </span>
                                  ) : null}
                                  <div className="flex flex-wrap items-center">
                                    {item.relevant_files &&
                                      item.relevant_files.length > 0 &&
                                      item.relevant_files.map((data, index) => (
                                        <button
                                          key={index}
                                          className="relative transform transition-transform px-1 mr-1 max-w-[130px]"
                                          disabled={isDownloadDocumentLoading}
                                          onClick={() => {
                                            getDownloadDocument(data.file_id);
                                          }}
                                        >
                                          <div className="relative group text-xs bg-blue-500 px-2 py-1 rounded-lg text-white truncate max-w-[130px] hover:max-w-full">
                                            {data.file_name}
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              null
                            )}
                            <div>
                              <time className="text-xs opacity-50">
                                {formatDate(item.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className=" border-gray-300"></div>
              </div>
            </div>
          )}
          <div>
            {isSendChatLoading ? (
              <div className="">
                <div className="m-auto max-w-3xl">
                  <div className=" p-5 flex ">
                    <div className="text-white">
                      <PiBrainDuotone className="text-3xl fill-current bg-orange-600 rounded-full p-1" />
                    </div>
                    <div
                      className="chat-bubble chat-bubble-primary ml-5"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      <div>
                        <div className="max-width-[150px] mb-2">
                          {renderBasedOnResponseStatus(responseStatus)}
                        </div>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: markdownToHtml(streamingResponse),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              null
            )}
          </div>
        </div>
        <div className="bottom-0"ref={messagesEndRef} />
      </div>
    </>
  );
}

export default ChatController;
