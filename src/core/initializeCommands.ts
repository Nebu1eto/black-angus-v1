import fs, { Stats } from 'fs'
import util from 'util'
import path from 'path'

const lstat = util.promisify(fs.lstat)
const readdir = util.promisify(fs.readdir)

// import every commands
export async function initializeCommands (folder: string = path.join(__dirname, '../commands')) {
  const files: Array<[string, Stats]> = (await Promise.all((await readdir(folder)).map(async file => {
    const fullPath = path.join(folder, file)
    return [fullPath, await lstat(fullPath)]
  }))) as Array<[string, Stats]>

  const imports = files
    .filter(
      ([file, info]) => info.isFile() && ['.ts', '.js'].includes(path.extname(file))
    )

  for (const [module] of imports) {
    require(module)
  }

  // recursive in directories
  await Promise.all(files
    .filter(([_, info]) => info.isDirectory())
    .map(([file, _]) => initializeCommands(file)))
}
