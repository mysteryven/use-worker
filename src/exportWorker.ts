import { WORKER_STATUS } from './useWorker'

export default function exportWorker<T extends (...args: any) => any>(fn: T) {
    self.onmessage = async function ({ data }) {
        try {
            (self.postMessage)([WORKER_STATUS.SUCCESS, await fn(...data)])
        } catch (e) {
            self.postMessage([WORKER_STATUS.ERROR, e])
        }
    }

    return fn
}