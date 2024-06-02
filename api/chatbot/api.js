import request from '../request'

export const getSourceStatusAPI = async (chatId) => {
  const response = await request.get(`/api/chatbot/getSourceStatus?chat_id=${chatId}`);
  return response.data.source;
}

export const getChatStatusAPI = async (chatId) => {
  const response = await request.get(`/api/chatbot/getChatStatus?chat_id=${chatId}`);
  return response.data.chatStatus;
}

export const getDisplayRelevantFileAPI = async (body) => {
  const response = await request.post(`/api/chatbot/getDisplayRelevantFile`, body);
  return response;
}

export const getRelevantFileAPI = async (body) => {
  const response = await request.post(`/api/chatbot/getRelevantFile`, body);
  return response;
}

export const getChatMessagesAPI = async (chatId) => {
  const response = await request.get(`/api/chatbot/getChatMessage?chat_id=${chatId}`);
  return response.data;
}

export const postCreateNewChatAPI = async (body) => {
  const response = await request.post(`/api/chatbot/postCreateNewChat`, body);
  return response.data;
}

export const getChatTitleAPI = async (id) => {
  const response = await request.post(`/api/chatbot/getChatTitle`, { chat_id: id });
  return response.data;
}

export const getClearChatHistoryAPI = async () => {
  const response = await request.get(`/api/chatbot/getClearChatHistory`);
  return response;
}

export const getDownloadDocumentAPI = async (id) => {
  const response = await request.post(`/api/upload/getDownloadDocument`,{ selectedId: id });
  return response;
}

export const getSummaryAPI = async (id) => {
  const response = await request.get(`/api/chatbot/getSummary?selectedId=${id}`);
  return response.data;
}


export const postDeleteChatAPI = async (id) => {
  const response = await request.post(`/api/chatbot/postDeleteChat`, { chat_id: id });
  return response.data;
}

export const getChatListAPI = async () => {
  const response = await request.get(`/api/chatbot/getChatList`);
  return response.data;
}
