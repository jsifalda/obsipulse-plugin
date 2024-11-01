// import { Encryption } from 'src/helpers/Encryption.ts'
const { Encryption } = require('../src/helpers/Encryption.ts')

/**
 * RULES:
 * - key must be 32 characters long
 * - key must be unique (check if it exists in the database)
 *  */

const key = Encryption().encrypt(
  JSON.stringify({ key: '51HJu20w8iQRNbW72Y8GzaaecrcP06', userId: 'ww9g20HHJJa003nw' }),
)
console.log({ key, l: key.length })
const testKey = Encryption().decrypt(key)
console.log({ testKey })
