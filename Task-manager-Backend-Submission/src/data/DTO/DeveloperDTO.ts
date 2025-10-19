export class DeveloperDTO {
    id: number;
    name: string;
    skills: { id: number; name: string }[];
    createdAt: Date;
    updatedAt: Date;
}
