import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('skill')
export class Skill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
}