import exportWorker from '../src/exportWorker'

function sleep(n: number): Promise<number> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(n)
        }, n)
    }) 

}

const a = exportWorker(sleep)

export default a