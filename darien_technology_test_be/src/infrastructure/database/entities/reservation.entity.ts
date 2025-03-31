import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEntity } from './space.entity';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  spaceId: number;

  @ManyToOne(() => SpaceEntity)
  @JoinColumn({ name: 'spaceId' })
  space: SpaceEntity;

  @Column()
  userEmail: string;

  @Column({ type: 'date' })
  reservationDate: Date;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
