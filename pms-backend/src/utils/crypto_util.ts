import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET = process.env.CRYPTO_SECRET || 'pms-secret-key';

function getKey(): Buffer {
  return crypto.scryptSync(SECRET, 'pms-salt', 32);
}

export const cryptoUtil = {
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  },

  decrypt(payload: string): string {
    const [ivHex, dataHex] = payload.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  }
};
