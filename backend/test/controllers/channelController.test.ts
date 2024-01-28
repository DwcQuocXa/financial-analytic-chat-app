import { Request, Response } from 'express';
import { channels, getChannels } from '../../src/controllers/channelController';

describe('Channel Controller', () => {
    beforeEach(() => {
        channels.splice(0, channels.length, { name: 'general', messages: [] }, { name: 'random', messages: [] });
    });

    describe('getChannels', () => {
        it('should return a list of channel names', () => {
            const req = {} as Request;
            const jsonMock = jest.fn();
            const res = {
                json: jsonMock
            } as unknown as Response;

            getChannels(req, res);

            expect(jsonMock).toHaveBeenCalledWith(['general', 'random']);
        });
    });

});
