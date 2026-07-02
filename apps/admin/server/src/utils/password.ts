// 密码哈希与校验（bcryptjs）
import bcrypt from 'bcryptjs';

const COST = 10;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, COST);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

// 为 seed 提供同步生成 hash 的能力
export function generateSeedHash(plain: string): string {
  return hashPassword(plain);
}
