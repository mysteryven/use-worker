import { exportWorker, WORKER_STATUS } from "../../src"

export default function sum(a: number, b: number) {
    return a + b
}

exportWorker(sum)
