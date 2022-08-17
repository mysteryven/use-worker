# use-worker-like-request

[![npm version](https://badgen.net/npm/v/use-worker-like-request)](https://npm.im/use-worker-like-request) 
[![npm downloads](https://badgen.net/npm/dm/use-worker-like-request)](https://npm.im/use-worker-like-request)

[online demo](https://stackblitz.com/edit/vitejs-vite-pzvfnq?embed=1&file=src/App.tsx)

> Pay attention: Not use it now, I had trouble with vitest to test web worker, when it solved, I will add tests to this library, and add some features.

## Install

```bash
pnpm i use-worker-like-request
```

## Usage

```typescript
import { exportWorker } from "use-worker-like-request";

function fibonacci(n: number): number {
    if (n === 1) {
        return 1
    }

    if (n === 2) {
        return 2
    }

    return fibonacci(n - 1) + fibonacci(n - 2)
}

export default exportWorker(fibonacci);
```

```typescript
import React from 'react'
import { useState } from 'react'
import useWorker from 'use-worker-like-request'
import reactLogo from './assets/react.svg'
import './App.css'
import fibonacci from './fibonacci'

const createWorker = () => new Worker(new URL('./fibonacci', import.meta.url), {
  type: 'module'
})

function App() {
  const [count, setCount] = useState(0)

  const {workerRunner, workerController} = useWorker<typeof fibonacci>(createWorker)

  async function handleClick() {
    console.log(await workerRunner(10))
  }

  return (
    <div className="App">
      <div>hello world</div>
      <button onClick={handleClick}>compute</button>
    </div>
  )
}

export default App
```

`useWorker` accept second parameter, it can auto terminate when your worker finished (success or fail).

```typescript
const {
    workerRunner, 
    workerController
} = useWorker<typeof fibonacci>(createWorker, {autoTerminate: true})
```

And you can manual terminate:

```typescript
workerController.killWorker()
```

You can show worker status by reading `workerController.workerStatus`, Its value will be one of :

```typescript
export enum WORKER_STATUS {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
```

