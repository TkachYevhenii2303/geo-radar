import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../shared/models/base-model';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity()
export class Credentials extends BaseModel {
  @Column({ name: 'password_hash', type: 'text' })
  @Exclude()
  passwordHash: string;

  @OneToOne(() => User, (user) => user.credentials)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
