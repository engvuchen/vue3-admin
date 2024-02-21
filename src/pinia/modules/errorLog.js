
import { defineStore } from 'pinia'

export const useErrorlog = defineStore('errorLog', {
  state: () => ({
    logs: [],
  }),
  actions: {
    addErrorLog(log) {
      // 可以根据需要将错误上报给服务器
      // ....code.......

      this.logs.push(log)
    },
    clearErrorLog() {
      this.logs.splice(0)
    },
  },
})
