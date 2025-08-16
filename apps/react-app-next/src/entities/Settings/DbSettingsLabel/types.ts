export interface DbConnectionStatus {
    connected: boolean,
    loading: boolean,
    error: boolean | null | string
}
