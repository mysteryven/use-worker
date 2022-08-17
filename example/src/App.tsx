import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import useWorker from '../../src/index'

import fibonacci from './fibonacci'
import sum from './sum.work'
import { WORKER_STATUS } from '../../src/useWorker'

const createWorker = () => new Worker(new URL('./fibonacci', import.meta.url), {
  type: 'module'
})

// two parameters showcase
// const createWorker2 = () => new Worker(new URL('./sum.work.ts', import.meta.url), {
//   type: 'module'
// })

function App() {
  const [count, setCount] = useState(0)
  const [num, setNum] = useState(0)

  const { workerRunner, workerController } = useWorker<typeof fibonacci>(createWorker, { autoTerminate: true })
  // const { workerRunner: workerRunner } = useWorker<typeof sum>(createWorker2, { autoTerminate: true })

  async function handleClick() {
    const ret = await workerRunner(42)
    // const ret = await workerRunner1(42, 0)
    setNum(ret)
  }

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleClick} disabled={workerController.workerStatus === WORKER_STATUS.RUNNING}>
          {workerController.workerStatus === WORKER_STATUS.RUNNING ? 'compute...' : 'compute in web worker'}
        </button>
        <p>
          result: {num}
        </p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => (count + 1))}>
          setCount in main thread
        </button>
        <p>
          result: {count}
        </p>
      </div>
    </div>
  )
}

export default App
