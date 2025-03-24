declare namespace utools {
  interface ShowOpenDialogOptions {
    title?: string
    defaultPath?: string
    buttonLabel?: string
    filters?: Array<{ name: string; extensions: string[] }>
    properties?: Array<
      | 'openFile'
      | 'openDirectory'
      | 'multiSelections'
      | 'showHiddenFiles'
      | 'createDirectory'
      | 'promptToCreate'
      | 'noResolveAliases'
      | 'treatPackageAsDirectory'
    >
  }

  interface ShowSaveDialogOptions {
    title?: string
    defaultPath?: string
    buttonLabel?: string
    filters?: Array<{ name: string; extensions: string[] }>
  }

  interface DbDoc {
    _id: string
    _rev?: string
    [key: string]: any
  }

  interface DB {
    put: (doc: DbDoc) => DbDoc
    get: (id: string) => DbDoc | null
    remove: (doc: string | DbDoc) => boolean
    allDocs: (key?: string) => DbDoc[]
    postAttachment: (docId: string, attachment: string, buffer: Buffer, type: string) => boolean
    getAttachment: (docId: string, attachment: string) => Buffer | boolean
    removeAttachment: (docId: string, attachment: string) => boolean
  }

  function showOpenDialog(options: ShowOpenDialogOptions): Promise<string[] | undefined>
  function showSaveDialog(options: ShowSaveDialogOptions): Promise<string | undefined>
  
  const db: DB

  interface DBStorage {
    getItem(key: string): any
    setItem(key: string, value: any): void
    removeItem(key: string): void
  }

  const dbStorage: DBStorage
}

declare interface Window {
  exports: {
    importPlayersFromFile(path: string): string[]
  }
}

interface Window {
  exports: {
    importPlayersFromFile: (filePath: string) => any
    exportGroupingResult: (result: any, filePath: string) => boolean
    saveGroupingHistory: (history: any[]) => boolean
    getGroupingHistory: () => any[]
  }
} 