import { Entity, Column, PrimaryGeneratedColumn, OneToMany, AfterLoad } from 'typeorm';
import { Review } from '../entities/review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', default: 0 })
  averageRating: number;

  @OneToMany(() => Review, review => review.restaurant)
  reviews: Review[];

  @AfterLoad()
  calculateAverageRating() {
    if (this.reviews && this.reviews.length > 0) {
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      this.averageRating = sum / this.reviews.length;
    } else {
      this.averageRating = 0;
    }
  }
}
