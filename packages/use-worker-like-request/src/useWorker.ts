import { useEffect, useRef, useCallback } from "react";

export default function useWorker<T, R>(createWorker: () => Worker) {
    const createWorkerRef = useRef<() => Worker>(createWorker);

    useEffect(() => {
        createWorkerRef.current = createWorker;
    })


    const workerRunner = useCallback(() => {
        const worker = createWorkerRef.current();

        return new Promise((resolve, reject) => {
            worker.addEventListener('message', ({ data }) => {
                resolve(data)
            })

            worker.addEventListener("error", (error) => {
                reject(error)
            })
        })
    }, [])


    return workerRunner
}