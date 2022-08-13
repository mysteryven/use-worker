import { useEffect, useRef, useCallback } from "react";

const PROMISE_RESOLVE = 'resolve'
const PROMISE_REJECT = 'reject'


export default function useWorker<T, R>(createWorker: () => Worker) {
    const createWorkerRef = useRef<() => Worker>(createWorker);
    const promiseRef = useRef({
        [PROMISE_RESOLVE]: (value: T) => { },
        [PROMISE_REJECT]: (error: Error | ErrorEvent) => { }
    })

    useEffect(() => {
        createWorkerRef.current = createWorker;
    })

    const callWorker = useCallback((...args: any) => {

    }, [])

    const workerRunner = useCallback(() => {
        const worker = createWorkerRef.current();

        worker.addEventListener('message', ({ data }) => {
            promiseRef.current[PROMISE_RESOLVE](data)
        })

        worker.addEventListener("error", (error) => {
            promiseRef.current[PROMISE_REJECT](error)
        })

        return callWorker 
    }, [])

    return workerRunner
}