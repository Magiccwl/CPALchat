

import { create } from 'zustand'

const useChatInfoStore = create((set, get) => ({
  chatArray: [],
  setChatArray: (newChatArray) => set({ chatArray: newChatArray }),
  addChatArray: (newChat) => set((state) => ({ chatArray: [...state.chatArray, newChat] })),
  popChatArray: () => set((state) => ({ chatArray: state.chatArray.slice(0, -1) })),

  currentChatId: null,
  setCurrentChatId: (id) => set({ currentChatId: id }),
  getCurrentChatId: () => get().currentChatId,

  streamingResponse: '',
  setStreamingResponse: (response) => set({ streamingResponse: response }),
}));

export default useChatInfoStore;
