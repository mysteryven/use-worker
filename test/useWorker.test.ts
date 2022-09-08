import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import fibonacci from './fibonacci.worker'
import sleep from './sleep.worker'
import useWorker, { WORKER_STATUS } from '../src/useWorker'

describe('useWorker', () => {
    let createWorker: () => Worker

    beforeEach(() => {
        createWorker = () => {
            return new Worker(new URL('./fibonacci.worker', import.meta.url), {
                type: 'module'
            })
        }

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })


    it('should be defined', () => {
        expect(useWorker).toBeDefined()
    })

    it('should post message to web worker', async () => {
        const { result } = renderHook(() => useWorker<typeof fibonacci>(createWorker))
        const value = await result.current.workerRunner(5)
        expect(value).toStrictEqual(8)
    })

    it('should be running when workerRunner not resolved', () => {
        const { result } = renderHook(() => useWorker<typeof fibonacci>(createWorker))
        expect(result.current.workerController.workerStatus).toBe(WORKER_STATUS.PENDING)
        return new Promise((resolve) => {
            result.current.workerRunner(5).then(resolve)
            expect(result.current.workerController.workerStatus).toBe(WORKER_STATUS.RUNNING)
        })
    })

    it('should be success when workerRunner has resolved', async () => {
        const { result } = renderHook(() => useWorker<typeof fibonacci>(createWorker))
        await result.current.workerRunner(5)
        expect(result.current.workerController.workerStatus).toBe(WORKER_STATUS.SUCCESS)
    })
})