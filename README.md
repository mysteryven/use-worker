# use-worker-async

[![npm version](https://badgen.net/npm/v/use-worker-async)](https://npm.im/use-worker-async) 
[![npm downloads](https://badgen.net/npm/dm/use-worker-async)](https://npm.im/use-worker-async)

[online demo](https://stackblitz.com/edit/vitejs-vite-pzvfnq?embed=1&file=src/App.tsx)

## Install

```bash
pnpm i use-worker-async
```

## Usage

```typescript
import { exportWorker } from "use-worker-async";

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
import useWorker from 'use-worker-async'
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

## Preview

```bash
pnpm example
```
