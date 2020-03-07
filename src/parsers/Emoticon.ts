import { ArgumentParser } from '../core/BasePresentedCommand'

export const emoticonNameParser: ArgumentParser = ({ content }) =>
  ({ name: content?.split(' ')[1] ?? '' })

export const emoticonUrlParser: ArgumentParser = ({ content }) => {
  const [_, name, url] = content?.split(' ')
  return { name, url }
}
