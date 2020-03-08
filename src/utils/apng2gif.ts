// CAUTION: Install APNG2GIF First.
// ex. sudo apt install apng2gif
// Reference: https://github.com/suchipi/node-apng2gif
import { spawn, StdioOptions } from 'child_process'

export interface TransformArguments {
  transparencyThreshold?: number
  backgroundColor?: string
}

function parseArgs (
  inPath: string,
  outPath: string | null = null,
  options: TransformArguments = {}
) {
  const args = [inPath]

  if (outPath !== null) {
    args.push(outPath)
  }
  if (options.transparencyThreshold) {
    args.push('-t')
    args.push(`${options.transparencyThreshold}`)
  }
  if (options.backgroundColor) {
    args.push('-b')
    args.push(options.backgroundColor)
  }

  return args
}

const defaultOptions = {
  stdio: 'ignore' as StdioOptions,
  windowsHide: true
}

export default function apng2gif (
  inPath: string,
  outPath: string,
  options: TransformArguments
) {
  const args = parseArgs(inPath, outPath, options)

  return new Promise((resolve, reject) => {
    const child = spawn(
      'apng2gif',
      args,
      Object.assign({}, defaultOptions, options)
    )

    child.on('error', err => {
      reject(err)
    })

    child.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Subprocess failed: ${code}`))
      }
    })
  })
}
