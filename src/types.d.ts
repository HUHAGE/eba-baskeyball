export interface Player {
  id: number
  name: string
}

export interface Group {
  id: number
  name: string
  members: Player[]
}

export interface GroupingHistory {
  id: number
  date: string
  groups: Group[]
}

interface Window {
  exports: {
    importPlayersFromFile: (filePath: string) => any
    exportGroupingResult: (data: any, filePath: string) => boolean
    saveGroupingHistory: (history: GroupingHistory[]) => boolean
    getGroupingHistory: () => GroupingHistory[]
  }
}

interface UTools {
  db: {
    put: (doc: any) => void
    get: (id: string) => any
  }
  showOpenDialog: (options: any) => string[] | undefined
  showSaveDialog: (options: any) => string | undefined
  readFileSync: (filePath: string, encoding: string) => string
  writeFileSync: (filePath: string, content: string) => void
}

declare global {
  const utools: UTools
  interface Window {
    exports: {
      importPlayersFromFile: (filePath: string) => any
      exportGroupingResult: (data: any, filePath: string) => boolean
      saveGroupingHistory: (history: GroupingHistory[]) => boolean
      getGroupingHistory: () => GroupingHistory[]
    }
  }
}

export {} 