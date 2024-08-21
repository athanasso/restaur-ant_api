import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  rating: number;

  @Column()
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Restaurant, restaurant => restaurant.reviews)
  restaurant: Restaurant;

  @ManyToOne(() => User, user => user.reviews)
  user: User;
}
