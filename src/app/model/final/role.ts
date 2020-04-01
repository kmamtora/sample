import { images } from './image';

export class role {
    id: string;
    name: string; // TODO: ADDED BY KARAN
    cardinality: string;
    min_cores: number;
    min_memory: number;
    anti_affinity_group_id: boolean;
    image: images;
}