import { httpService } from './HttpService';

interface AutoCompleteRequest {
    storyId: number;
    roomId: number;
}

interface AutoCompleteResponse {
    autoCompleted: boolean;
    reason?: string;
}

export const storiesService = {
    async checkAutoComplete(storyId: number, roomId: number): Promise<AutoCompleteResponse | null> {
        const { data, error } = await httpService.post<AutoCompleteResponse, AutoCompleteRequest>(
            '/api/stories/auto-complete',
            { storyId, roomId }
        );

        if (error) {
            console.error('Auto-complete check failed:', error);
            return null;
        }

        return data;
    },
};
