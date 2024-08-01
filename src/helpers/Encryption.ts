import * as CryptoJS from 'crypto-js'

/**
 *
 * !
 * !!
 * !!!
 *
 * NOTE: if you do any change in this file/logic,
 *  dont forget to change it in obsidian app file as well
 */

const secretKey = '!7iCQt*7(sLE$JW9'
// const algorithm = 'aes-128-cbc'
// const key = crypto.scryptSync(secretKey, 'salt', 16)

const encrypt = (text: string, version = 'v1') => {
  // const iv = crypto.randomBytes(16)
  // const cipher = crypto.createCipheriv(algorithm, key, iv)
  // let encrypted = cipher.update(text, 'utf8', 'base64')
  // encrypted += cipher.final('base64')
  // const encryptedText = iv.toString('base64') + ':' + encrypted

  const encryptedText = CryptoJS.AES.encrypt(text, secretKey).toString()
  // console.log('Encrypted Text:', encryptedText)
  return `${version}:${encryptedText}`
}

const decrypt = (encryptedText: string) => {
  const [version, text] = encryptedText.split(':')
  // console.log('version', version)
  if (version !== 'v1') {
    throw new Error('Invalid version')
  }
  // const ivBuffer = Buffer.from(ivBase64, 'base64')
  // const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer)
  // let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
  // decrypted += decipher.final('utf8')
  const decryptedBytes = CryptoJS.AES.decrypt(text, secretKey)
  const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8)
  // console.log('Decrypted Text:', decrypted)
  return decrypted
}

export const Encryption = () => {
  return { encrypt, decrypt }
}
