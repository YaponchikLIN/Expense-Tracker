import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('categories')
@Index(['name', 'user'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: '#6366f1' })
  color: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}