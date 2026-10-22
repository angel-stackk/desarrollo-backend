import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Users } from '../users/users_entity';
import { Tasks } from '../tasks/tasks_entity';

@Entity()
export class Projects {
  @PrimaryGeneratedColumn('uuid')
  project_id!: string;

  @Column({ length: 60, nullable: false, unique: true })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column({ length: 30, default: 'Planning' })
  status!: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'owner_id' })
  owner!: Users;

  @Column('text', { array: true, default: '{}' })
  user_ids!: string[];

  @OneToMany(() => Tasks, (task) => task.project)
  tasks!: Tasks[];

  @Column({ type: 'timestamp', nullable: true })
  start_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
