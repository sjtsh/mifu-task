export interface FunctionResult<T> {
    failed: boolean
    data?: T
    error?: any
}
