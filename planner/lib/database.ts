"use client"

// Simulazione di un database interno condiviso
export interface DatabaseTable {
  id: string
  data: any
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface DatabaseSchema {
  users: DatabaseTable[]
  vacations: DatabaseTable[]
  vacation_days: DatabaseTable[]
  expenses: DatabaseTable[]
  notes: DatabaseTable[]
  sync_log: DatabaseTable[]
}

class InternalDatabase {
  private dbKey = "vacation_planner_db"
  private lockKey = "vacation_planner_db_lock"
  private listeners: Set<() => void> = new Set()
  private isInitialized = false

  constructor() {
    this.initializeDatabase()
    this.setupStorageListener()
  }

  private initializeDatabase() {
    if (this.isInitialized) return

    const existingDb = localStorage.getItem(this.dbKey)
    if (!existingDb) {
      const initialDb: DatabaseSchema = {
        users: [],
        vacations: [],
        vacation_days: [],
        expenses: [],
        notes: [],
        sync_log: [],
      }
      this.saveDatabase(initialDb)
    }
    this.isInitialized = true
  }

  private setupStorageListener() {
    let debounceTimeout: NodeJS.Timeout

    const debouncedNotify = () => {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        this.notifyListeners()
      }, 100)
    }

    window.addEventListener("storage", (e) => {
      if (e.key === this.dbKey) {
        debouncedNotify()
      }
    })

    // Listener per eventi personalizzati (stesso tab)
    window.addEventListener("database-update", debouncedNotify)
  }

  private async acquireLock(): Promise<boolean> {
    const lockTimeout = 2000 // Ridotto a 2 secondi
    const lockStart = Date.now()

    while (Date.now() - lockStart < lockTimeout) {
      const existingLock = localStorage.getItem(this.lockKey)
      if (!existingLock || Date.now() - Number.parseInt(existingLock) > 5000) {
        localStorage.setItem(this.lockKey, Date.now().toString())
        return true
      }
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    return false
  }

  private releaseLock() {
    localStorage.removeItem(this.lockKey)
  }

  private getDatabase(): DatabaseSchema {
    const db = localStorage.getItem(this.dbKey)
    if (!db) {
      throw new Error("Database non trovato")
    }
    return JSON.parse(db)
  }

  private saveDatabase(db: DatabaseSchema) {
    localStorage.setItem(this.dbKey, JSON.stringify(db))

    // Notifica altri tab/finestre (debounced)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("database-update"))
    }, 10)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (error) {
        console.error("Errore nel listener del database:", error)
      }
    })
  }

  // Metodi pubblici per gestire i dati

  async insert<T>(table: keyof DatabaseSchema, data: T, userId: string): Promise<string> {
    if (!(await this.acquireLock())) {
      throw new Error("Impossibile acquisire il lock del database")
    }

    try {
      const db = this.getDatabase()
      const id = `${table}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      const record: DatabaseTable = {
        id,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
      }

      db[table].push(record)
      this.saveDatabase(db)

      // Log della sync (ridotto)
      this.logSync("INSERT", table, id, userId)

      return id
    } finally {
      this.releaseLock()
    }
  }

  async update<T>(table: keyof DatabaseSchema, id: string, data: Partial<T>, userId: string): Promise<boolean> {
    if (!(await this.acquireLock())) {
      throw new Error("Impossibile acquisire il lock del database")
    }

    try {
      const db = this.getDatabase()
      const recordIndex = db[table].findIndex((record) => record.id === id)

      if (recordIndex === -1) {
        return false
      }

      db[table][recordIndex] = {
        ...db[table][recordIndex],
        data: { ...db[table][recordIndex].data, ...data },
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }

      this.saveDatabase(db)

      // Log della sync (ridotto)
      this.logSync("UPDATE", table, id, userId)

      return true
    } finally {
      this.releaseLock()
    }
  }

  async delete(table: keyof DatabaseSchema, id: string, userId: string): Promise<boolean> {
    if (!(await this.acquireLock())) {
      throw new Error("Impossibile acquisire il lock del database")
    }

    try {
      const db = this.getDatabase()
      const initialLength = db[table].length
      db[table] = db[table].filter((record) => record.id !== id)

      if (db[table].length < initialLength) {
        this.saveDatabase(db)

        // Log della sync (ridotto)
        this.logSync("DELETE", table, id, userId)

        return true
      }
      return false
    } finally {
      this.releaseLock()
    }
  }

  async findAll<T>(table: keyof DatabaseSchema): Promise<DatabaseTable[]> {
    const db = this.getDatabase()
    return db[table] || []
  }

  async findById<T>(table: keyof DatabaseSchema, id: string): Promise<DatabaseTable | null> {
    const db = this.getDatabase()
    return db[table].find((record) => record.id === id) || null
  }

  async findWhere<T>(
    table: keyof DatabaseSchema,
    predicate: (record: DatabaseTable) => boolean,
  ): Promise<DatabaseTable[]> {
    const db = this.getDatabase()
    return db[table].filter(predicate)
  }

  private logSync(operation: string, table: string, recordId: string, userId: string) {
    try {
      const db = this.getDatabase()
      const logEntry: DatabaseTable = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        data: {
          operation,
          table,
          recordId,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
      }

      db.sync_log.push(logEntry)

      // Mantieni solo gli ultimi 50 log (ridotto)
      if (db.sync_log.length > 50) {
        db.sync_log = db.sync_log.slice(-50)
      }

      this.saveDatabase(db)
    } catch (error) {
      // Rimuovi il log dell'errore per evitare spam
    }
  }

  // Metodi per la migrazione dai dati esistenti
  async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      // Migra utenti
      const existingUsers = localStorage.getItem("users")
      if (existingUsers) {
        const users = JSON.parse(existingUsers)
        for (const user of users) {
          await this.insert("users", user, userId)
        }
        localStorage.removeItem("users")
      }

      // Migra vacanze
      const existingVacations = localStorage.getItem("vacations")
      if (existingVacations) {
        const vacations = JSON.parse(existingVacations)
        for (const vacation of vacations) {
          await this.insert("vacations", vacation, userId)

          // Migra dati correlati alla vacanza
          const days = localStorage.getItem(`vacationDays_${vacation.id}`)
          if (days) {
            const daysData = JSON.parse(days)
            for (const day of daysData) {
              await this.insert("vacation_days", { ...day, vacationId: vacation.id }, userId)
            }
            localStorage.removeItem(`vacationDays_${vacation.id}`)
          }

          const expenses = localStorage.getItem(`expenses_${vacation.id}`)
          if (expenses) {
            const expensesData = JSON.parse(expenses)
            for (const expense of expensesData) {
              await this.insert("expenses", { ...expense, vacationId: vacation.id }, userId)
            }
            localStorage.removeItem(`expenses_${vacation.id}`)
          }

          const notes = localStorage.getItem(`vacationNotes_${vacation.id}`)
          if (notes) {
            const notesData = JSON.parse(notes)
            for (const note of notesData) {
              await this.insert("notes", { ...note, vacationId: vacation.id }, userId)
            }
            localStorage.removeItem(`vacationNotes_${vacation.id}`)
          }
        }
        localStorage.removeItem("vacations")
      }
    } catch (error) {
      console.error("Errore durante la migrazione:", error)
      throw error
    }
  }

  // Metodi per l'esportazione e importazione
  async exportDatabase(): Promise<any> {
    const db = this.getDatabase()
    return {
      ...db,
      exportedAt: new Date().toISOString(),
      version: "3.0",
    }
  }

  async importDatabase(importedDb: any, userId: string): Promise<void> {
    if (!(await this.acquireLock())) {
      throw new Error("Impossibile acquisire il lock del database")
    }

    try {
      // Pulisci il database esistente
      const cleanDb: DatabaseSchema = {
        users: [],
        vacations: [],
        vacation_days: [],
        expenses: [],
        notes: [],
        sync_log: [],
      }

      // Importa i dati
      if (importedDb.users) cleanDb.users = importedDb.users
      if (importedDb.vacations) cleanDb.vacations = importedDb.vacations
      if (importedDb.vacation_days) cleanDb.vacation_days = importedDb.vacation_days
      if (importedDb.expenses) cleanDb.expenses = importedDb.expenses
      if (importedDb.notes) cleanDb.notes = importedDb.notes

      this.saveDatabase(cleanDb)

      // Log dell'importazione
      this.logSync("IMPORT", "database", "full", userId)
    } finally {
      this.releaseLock()
    }
  }

  // Listener per cambiamenti del database
  onDatabaseChange(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Metodi di utilità
  async getSyncLog(): Promise<DatabaseTable[]> {
    const db = this.getDatabase()
    return db.sync_log.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async clearDatabase(): Promise<void> {
    if (!(await this.acquireLock())) {
      throw new Error("Impossibile acquisire il lock del database")
    }

    try {
      const cleanDb: DatabaseSchema = {
        users: [],
        vacations: [],
        vacation_days: [],
        expenses: [],
        notes: [],
        sync_log: [],
      }
      this.saveDatabase(cleanDb)
    } finally {
      this.releaseLock()
    }
  }
}

// Singleton instance
export const db = new InternalDatabase()
