import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import useWorker, { exportWorker } from 'use-worker-like-request'
import fibonacci from './fibonacci'

const createWorker = () => new Worker(new URL('./fibonacci', import.meta.url), {
  type: 'module'
})

function App() {
  const [count, setCount] = useState(0)

  const fab = useWorker(createWorker)


  function handleClick() {
    fab()
  }

  return (
    <div className="App">
      <div>hello world</div> 
      <button onClick={handleClick}>compute</button>
    </div>
  )
}

export default App
