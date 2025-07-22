import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['userId', 'type'])
@Index(['userId', 'categoryId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: process.env.NODE_ENV === 'production' ? 'enum' : 'varchar',
    enum: process.env.NODE_ENV === 'production' ? TransactionType : undefined,
  })
  type: TransactionType;

  @Column({ nullable: true })
  tags?: string;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  category?: Category;

  @Column({ nullable: true })
  categoryId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}