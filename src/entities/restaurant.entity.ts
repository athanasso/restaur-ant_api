import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from '../entities/review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('float')
  averageRating: number;

  @OneToMany(() => Review, review => review.restaurant)
  reviews: Review[];
}
