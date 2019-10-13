import { ArgumentParser } from '../core/BasePresentedCommand'

export const weatherLocationParser: ArgumentParser = ({ content }) => ({
  keyword: content.substring(content.indexOf(' ') + 1)
})
