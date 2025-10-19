export class TaskDetailDTO {
    id: number;
    title: string;
    status: string;

    skills: { id: number; name: string }[];
    developer: { id: number; name: string } | null;

    parentTask: { id: number; title: string; status: string } | null;
    subtasks: TaskDetailDTO[];

    createdAt: Date;
    updatedAt: Date;
}
