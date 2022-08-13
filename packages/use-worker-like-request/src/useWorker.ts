import { useEffect, useRef, useCallback } from 'react'

const PROMISE_RESOLVE = 'resolve'
const PROMISE_REJECT = 'reject'

type CreateWorker = () => Worker

export default function useWorker<R extends (...args: any) => any>(createWorker: () => Worker) {
    const createWorkerRef = useRef<CreateWorker>(createWorker)
    const workerRef = useRef<Worker>()
    const isRunningRef = useRef<boolean>(false)

    const promiseRef = useRef({
        [PROMISE_RESOLVE]: (value: ReturnType<R>) => { },
        [PROMISE_REJECT]: (error: Error | ErrorEvent) => { }
    })

    useEffect(() => {
        createWorkerRef.current = createWorker
    })

    const callWorker = useCallback((...args: Parameters<R>) => {
        return new Promise((resolve, reject) => {
            promiseRef.current = {
                [PROMISE_RESOLVE]: resolve,
                [PROMISE_REJECT]: reject
            }

            workerRef.current?.postMessage(args)
        }) 
    }, [])

    function generateWorker() {
        const worker = createWorkerRef.current() as Worker

        workerRef.current = worker

        worker.addEventListener('message', ({ data }) => {
            promiseRef.current[PROMISE_RESOLVE](data)
        })

        worker.addEventListener('error', (error) => {
            promiseRef.current[PROMISE_REJECT](error)
        })
    }

    const workerRunner = useCallback((...fnArgs: Parameters<R>) => {
        if (isRunningRef.current) {
            console.warn('only one worker can be running at a time')
            return Promise.reject()
        }

        generateWorker()
        isRunningRef.current = true

        return callWorker(...fnArgs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return workerRunner
}