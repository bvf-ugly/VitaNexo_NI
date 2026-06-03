import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vitanexo'
  try {
    await mongoose.connect(uri)
    console.log(`✅  MongoDB conectado → ${uri}`)
  } catch (err) {
    console.error('❌  MongoDB error:', err.message)
    process.exit(1)
  }
}
