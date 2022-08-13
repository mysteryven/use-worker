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
    autoTerminate: false
}

export default function useWorker<R extends (...args: any) => any>(
    createWorker: () => Worker,
    options: { autoTerminate?: boolean } = DEFAULT_OPTIONS
) {
    const createWorkerRef = useRef<CreateWorker>(createWorker)
    const [workerStatus, _setWorkerStatus] = useState<WORKER_STATUS>(WORKER_STATUS.PENDING)
    const workerRef = useRef<Worker>()
    const isRunningRef = useRef<boolean>(false)
    const promiseRef = useRef({
        [PROMISE_RESOLVE]: (value: ReturnType<R>) => { },
        [PROMISE_REJECT]: (error: Error | ErrorEvent) => { }
    })

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
        const worker = createWorkerRef.current() as Worker
        workerRef.current = worker

        worker.onmessage = ({ data }) => {
            if (data[0] === WORKER_STATUS.SUCCESS) {
                promiseRef.current[PROMISE_RESOLVE](data)
                onWorkEnd(WORKER_STATUS.SUCCESS)
            } else {
                promiseRef.current[PROMISE_REJECT](data)
                onWorkEnd(WORKER_STATUS.ERROR)
            }
        }

        worker.onerror = (error) => {
            promiseRef.current[PROMISE_REJECT](error)
            onWorkEnd(WORKER_STATUS.ERROR)
        }
    }

    // @ts-ignore
    function onWorkEnd(workStatus: WORKER_STATUS) {
        setWorkStatus(workStatus)

        if (options.autoTerminate) {
            workerRef.current?.terminate()
            workerRef.current = undefined
        }
    }

    const workerRunner = useCallback((...fnArgs: Parameters<R>) => {
        if (isRunningRef.current) {
            console.warn('only one worker can be running at a time')
            return Promise.reject()
        }

        generateWorker()
        setWorkStatus(WORKER_STATUS.RUNNING)

        return callWorker(...fnArgs)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const workerController = {
        workerStatus
    }

    return { workerRunner, workerController }
}