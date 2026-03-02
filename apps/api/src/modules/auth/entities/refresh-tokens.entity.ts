import { BaseModel } from 'src/modules/shared/models/base-model';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokens extends BaseModel {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'token_hash', type: 'text', unique: true })
  @Index('idx_refresh_tokens_token_hash')
  tokenHash: string;

  @Column({ name: 'jti', type: 'uuid', unique: true })
  @Index('idx_refresh_tokens_jti')
  jti: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
