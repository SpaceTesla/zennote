import { DbService } from './db.service';
import { User, RegisterInput, LoginInput, AuthToken, UserId } from '../types/auth';
import { generateUUID } from '../utils/uuid';
import { toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';
import { Env } from '../types/env';

export class AuthService {
  constructor(
    private db: DbService,
    private jwtSecret: string
  ) {}

  async hashPassword(password: string): Promise<string> {
    // Use PBKDF2 for password hashing (more secure than SHA-256)
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
    
    // Store as salt:hash
    return `${saltHex}:${hashHex}`;
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) {
      // Legacy support for old SHA-256 hashes
      return this.verifyPasswordLegacy(password, storedHash);
    }

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return computedHash === hashHex;
  }

  private async verifyPasswordLegacy(password: string, hash: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return passwordHash === hash;
  }

  async generateToken(userId: UserId, email: string): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload: AuthToken = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    };

    const base64Header = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const base64Payload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const signature = await this.signToken(
      `${base64Header}.${base64Payload}`
    );
    const base64Signature = btoa(signature)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${base64Header}.${base64Payload}.${base64Signature}`;
  }

  private async signToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.jwtSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(token)
    );
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async verifyToken(token: string): Promise<AuthToken | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const expectedSignature = await this.signToken(`${header}.${payload}`);
      const base64Signature = btoa(expectedSignature)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (signature !== base64Signature) return null;

      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as AuthToken;
      
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }

      return decoded;
    } catch {
      return null;
    }
  }

  async registerUser(input: RegisterInput): Promise<User> {
    // Check if user exists
    const existing = await this.db.queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [input.email]
    );

    if (existing) {
      throw createError(
        ErrorCode.CONFLICT,
        'User with this email already exists',
        409
      );
    }

    const userId = toUserId(generateUUID());
    const passwordHash = await this.hashPassword(input.password);
    const now = new Date().toISOString();

    // Create user
    await this.db.execute(
      'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [userId, input.email, passwordHash, now, now]
    );

    // Create default profile
    await this.db.execute(
      'INSERT INTO user_profiles (user_id, display_name, bio, avatar_url, website, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, null, null, null, null, null, now, now]
    );

    return {
      id: userId,
      email: input.email,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    };
  }

  async loginUser(input: LoginInput): Promise<User> {
    const user = await this.db.queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [input.email]
    );

    if (!user) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Invalid email or password',
        401
      );
    }

    const isValid = await this.verifyPassword(input.password, user.password_hash);
    if (!isValid) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Invalid email or password',
        401
      );
    }

    return user;
  }

  async getUserById(userId: UserId): Promise<User | null> {
    return await this.db.queryOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
  }
}

