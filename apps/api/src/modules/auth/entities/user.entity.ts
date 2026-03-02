import {
  Entity,
  Column,
  Unique,
  Index,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../shared/models/base-model';
import { Credentials } from './credentials.entity';
import { RefreshTokens } from './refresh-tokens.entity';

@Entity()
@Unique(['email'])
export class User extends BaseModel {
  @Column({ length: 255 })
  @Index({ where: 'deleted_at IS NULL' })
  email: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @OneToOne(() => Credentials, (credentials) => credentials.user, {
    cascade: true,
  })
  credentials: Credentials;

  @OneToMany(() => RefreshTokens, (refreshTokens) => refreshTokens.user, {
    cascade: true,
  })
  refreshTokens: RefreshTokens[];
}
