export class TaskListItemDTO {
    id: number;
    title: string;
    status: string;

    skills: { id: number; name: string }[];
    developer: { id: number; name: string } | null;

    parentTaskId: number | null;
    subtaskCount: number;

    createdAt: Date;
    updatedAt: Date;
}
