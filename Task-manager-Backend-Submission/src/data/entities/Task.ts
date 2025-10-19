import {Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Developer} from "./Developer";
import {Skill} from "./Skill";

@Entity('task')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    title: string;

    @Column({ type: 'varchar', length: 50 })
    status: string;

    @ManyToOne(() => Developer, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'developer_id' })
    developer: Developer | null;

    @Column({ type: 'integer', nullable: true, name: 'parent_task_id' })
    parentTaskId: number | null;

    @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parent_task_id' })
    parentTask: Task | null;

    @OneToMany(() => Task, (task) => task.parentTask)
    subtasks: Task[];

    @ManyToMany(() => Skill)
    @JoinTable({
        name: 'task_skills',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' }
    })
    skills: Skill[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
}