import { TagProps } from '@/components';

export const VoteValuesTypes = {
    days: 'days',
    weeks: 'weeks',
    boolean: 'boolean',
} as const;

export type VoteValuesType = typeof VoteValuesTypes[keyof typeof VoteValuesTypes];

export const VoteValues: Record<VoteValuesType, number[]> = {
    [VoteValuesTypes.days]: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    [VoteValuesTypes.weeks]: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    [VoteValuesTypes.boolean]: [0, 1],
};

export const tagTypesByVoteType: Record<VoteValuesType, TagProps['type']> = {
    [VoteValuesTypes.days]: 'info',
    [VoteValuesTypes.weeks]: 'warning',
    [VoteValuesTypes.boolean]: 'danger',
};
