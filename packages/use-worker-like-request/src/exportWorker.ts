export function exportWorker(fn: Function) {
    self.onmessage = function({data}) {
        const result = fn(data)

        self.postMessage(result)
    }
}