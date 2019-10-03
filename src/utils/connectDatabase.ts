import mongoose from 'mongoose'
import { BOT_CONFIG } from '../configs/IConfigurations'

export function connectDatabase () {
  return mongoose.connect(BOT_CONFIG.MONGODB_ADDRESS, {
    useNewUrlParser: true
  })
}
