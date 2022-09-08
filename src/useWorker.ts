import { useEffect, useRef, useCallback, useState } from 'react'

const PROMISE_RESOLVE = 'resolve'
const PROMISE_REJECT = 'reject'

export enum WORKER_STATUS {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    TIME_OUT = 'TIME_OUT',
}

type CreateWorker = () => Worker

const DEFAULT_OPTIONS = {
    autoTerminate: false,
}


export default function useWorker<R extends (...args: any) => any>(
    createWorker?: () => Worker,
    options: { autoTerminate?: boolean, timeout?: number } = DEFAULT_OPTIONS
) {
    const createWorkerRef = useRef<CreateWorker | undefined>(createWorker)
    const [workerStatus, _setWorkerStatus] = useState<WORKER_STATUS>(WORKER_STATUS.PENDING)
    const workerRef = useRef<Worker>()
    const isRunningRef = useRef<boolean>(false)
    const promiseRef = useRef({
        [PROMISE_RESOLVE]: (value: ReturnType<R>) => { },
        [PROMISE_REJECT]: (error: Error | ErrorEvent) => { }
    })
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const setWorkStatus = useCallback((status: WORKER_STATUS) => {
        isRunningRef.current = status === WORKER_STATUS.RUNNING
        _setWorkerStatus(status)
    }, [])

    const callWorker = useCallback((...args: Parameters<R>) => {
        return new Promise((resolve, reject) => {
            promiseRef.current = {
                [PROMISE_RESOLVE]: resolve,
                [PROMISE_REJECT]: reject
            }

            workerRef.current?.postMessage(args)
        })
    }, [])

    useEffect(() => {
        createWorkerRef.current = createWorker
    })

    function generateWorker() {
        if (!createWorkerRef.current) {
            return
        }

        const worker = createWorkerRef.current() as Worker
        workerRef.current = worker

        if (options.timeout && options.timeout > 0) {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            timerRef.current = setTimeout(() => {
                promiseRef.current[PROMISE_REJECT](new Error(`the worker expect finished in ${options.timeout}ms`))
                onWorkEnd(WORKER_STATUS.TIME_OUT)
            }, options.timeout)
        }

        worker.onmessage = ({ data }) => {
            if (workerStatus === WORKER_STATUS.TIME_OUT) {
                return
            }
            if (data[0] === WORKER_STATUS.SUCCESS) {
                promiseRef.current[PROMISE_RESOLVE](data[1])
                onWorkEnd(WORKER_STATUS.SUCCESS)
            } else {
                promiseRef.current[PROMISE_REJECT](data[1])
                onWorkEnd(WORKER_STATUS.ERROR)
            }
        }

        worker.onerror = (error) => {
            if (workerStatus === WORKER_STATUS.TIME_OUT) {
                return
            }

            promiseRef.current[PROMISE_REJECT](error)
            onWorkEnd(WORKER_STATUS.ERROR)
        }
    }

    // @ts-ignore
    function onWorkEnd(workStatus: WORKER_STATUS) {
        setWorkStatus(workStatus)

        if (options.autoTerminate) {
            killWorker()
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    function killWorker() {
        workerRef.current?.terminate()
        workerRef.current = undefined
        promiseRef.current = {
            [PROMISE_RESOLVE]: (value: ReturnType<R>) => { },
            [PROMISE_REJECT]: (error: Error | ErrorEvent) => { }
        }

        setWorkStatus(WORKER_STATUS.PENDING)
    }

    const workerRunner = useCallback((...fnArgs: Parameters<R>) => {
        if (isRunningRef.current) {
            console.warn('only one worker can be running at a time')
            return Promise.reject()
        }

        if (!createWorkerRef.current) {
            return Promise.reject()
        }

        generateWorker()
        setWorkStatus(WORKER_STATUS.RUNNING)
        return callWorker(...fnArgs) as ReturnType<R> extends Promise<infer K> ? Promise<K> : Promise<ReturnType<R>>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const workerController = {
        workerStatus,
        killWorker
    }

    return { workerRunner, workerController }
}