import { OperatorFunction, from } from 'rxjs'
import { flatMap } from 'rxjs/operators'

// flatMap but with Promise. not Observable
export function flatPromiseMap<T, O> (
  fn: (prev: T) => Promise<O>
): OperatorFunction<T, O> {
  return flatMap(prev => from(fn(prev)))
}
