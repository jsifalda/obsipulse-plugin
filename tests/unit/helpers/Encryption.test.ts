import { describe, it, expect } from 'vitest'
import { Encryption } from '@/src/helpers/Encryption'

describe('Encryption', () => {
  const encryption = Encryption()

  describe('encrypt/decrypt roundtrip', () => {
    it('should encrypt and decrypt simple text', () => {
      const original = 'hello world'
      const encrypted = encryption.encrypt(original)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(original)
    })

    it('should encrypt and decrypt JSON data', () => {
      const original = JSON.stringify({ userId: 'user123', key: 'secret' })
      const encrypted = encryption.encrypt(original)
      const decrypted = encryption.decrypt(encrypted)

      expect(JSON.parse(decrypted)).toEqual({ userId: 'user123', key: 'secret' })
    })

    it('should handle empty string', () => {
      const original = ''
      const encrypted = encryption.encrypt(original)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(original)
    })

    it('should handle special characters', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = encryption.encrypt(original)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(original)
    })

    it('should handle unicode characters', () => {
      const original = '你好世界 🌍 مرحبا'
      const encrypted = encryption.encrypt(original)
      const decrypted = encryption.decrypt(encrypted)

      expect(decrypted).toBe(original)
    })
  })

  describe('encrypt', () => {
    it('should prefix with version', () => {
      const encrypted = encryption.encrypt('test')
      expect(encrypted.startsWith('v1:')).toBe(true)
    })

    it('should produce different ciphertext from plaintext', () => {
      const text = 'my secret message'
      const encrypted = encryption.encrypt(text)

      expect(encrypted).not.toContain(text)
    })
  })

  describe('decrypt', () => {
    it('should throw on invalid version', () => {
      expect(() => encryption.decrypt('v2:somedata')).toThrow('Invalid version')
    })

    it('should throw on missing version separator', () => {
      expect(() => encryption.decrypt('invalidformat')).toThrow()
    })
  })
})
