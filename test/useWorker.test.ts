import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import useWorker, { WORKER_STATUS } from '../src/useWorker'

describe('useWorker', () => {
    let createWorker: () => Worker

    beforeEach(() => {

        createWorker = () => {
            return new Worker(new URL('./fibonacci.worker', import.meta.url), {
                type: 'module'
            })
        }
    })

    it('should be defined', () => {
        expect(useWorker).toBeDefined()
    })

    it('should post message to web worker', async () => {
        const { result } = renderHook(() => useWorker(createWorker))
        const value = await result.current.workerRunner(5)
        expect(value).toStrictEqual(8)
    })


    it('should post message to web worker2', async () => {
        const { result } = renderHook(() => useWorker(createWorker))
        const value = await result.current.workerRunner(5)
        expect(value).toStrictEqual(8)
    })
})