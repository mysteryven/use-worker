import { WORKER_STATUS } from './useWorker'

export default function exportWorker<T extends (...args: any) => any>(fn: T) {
    self.onmessage = async function ({ data }) {
        try {
            const r = fn(data)
            if (r && r[Symbol.asyncIterator]) {
                for await (const i of r) (self.postMessage)([WORKER_STATUS.SUCCESS, i])
            } else if (r && r[Symbol.iterator]) {
                for (const i of r) (self.postMessage)([WORKER_STATUS.SUCCESS, i])
            } else {
                (self.postMessage)([WORKER_STATUS.SUCCESS, await r])
            }
        } catch (e) {
            self.postMessage([WORKER_STATUS.ERROR, e])
        }
    }

    return fn
}