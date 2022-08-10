import { useState, useEffect } from "react";

interface Opts<T> {
    manual: boolean;
    input?: T
}

interface WorkerResultState<T, S> {
    data: T,
    run:  S extends true ? () => void : never,
}

export default function useWorker<T, R>(worker: Worker, shouldManual: boolean)  {
    const [data, setData] = useState<T>();

    function run() {
        if (!shouldManual) {
            return
        }
    }

    useEffect(() => {
        worker.addEventListener('message', (e) => {
            console.log(e.data);
        })
        worker.addEventListener('error', (e) => {
            console.log(e)
        })
        worker.addEventListener('messageerror', (e) => {
            console.log(e)
        })

        return () => {
            worker.terminate();
        }
    }, [worker])

    return {
        data,
    }
}