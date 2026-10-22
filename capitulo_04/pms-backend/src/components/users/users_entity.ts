import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Roles } from '../roles/roles_entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  user_id!: string;

  @Column({ length: 60, nullable: false })
  name!: string;

  @Column({ length: 100, nullable: false, unique: true })
  email!: string;

  @Column({ length: 255, nullable: false })
  password!: string;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
