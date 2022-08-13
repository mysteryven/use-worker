export function exportWorker<T extends (...args: any) => any>(fn: T) {
    self.onmessage = function({data}) {
        const result = fn(...data)

        self.postMessage(result)
    }

    return fn
}