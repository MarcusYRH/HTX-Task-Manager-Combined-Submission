import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Skill} from "./Skill";

@Entity('developer')
export class Developer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    /**
     * Many-to-Many relationship between Developer and Skill
     * A developer can have multiple skills, and a skill can belong to multiple developers
     */
    @ManyToMany(() => Skill)
    @JoinTable({
        name: 'developer_skills',
        joinColumn: { name: 'developer_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' }
    })
    skills: Skill[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
}