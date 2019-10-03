// Golang Style Try-Catch
export async function tryCatch <T> (promise: Promise<T>): Promise<[Error?, T?]> {
  try {
    return [undefined, await promise]
  } catch (err) {
    return [err]
  }
}
