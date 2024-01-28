import { Request, Response, NextFunction } from 'express';
import { getChannelMessages, getChannels, postMessage } from '../../src/controllers/channelController';

describe('Channel Controller', () => {
    describe('getChannels', () => {
        it('should return all channel names', () => {
            const req = {} as Request;
            const res = { json: jest.fn() } as unknown as Response;

            getChannels(req, res);

            expect(res.json).toHaveBeenCalledWith(['general', 'random']);
        });
    });

    describe('getChannelMessages', () => {
        it('should return messages for a valid channel', () => {
            const req = { params: { channel: 'general' } } as unknown as Request;
            const res = { json: jest.fn() } as unknown as Response;
            const next = jest.fn() as NextFunction;

            getChannelMessages(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error for an invalid channel', () => {
            const req = { params: { channel: 'nonexistent' } } as unknown as Request;
            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            getChannelMessages(req, res, next);

            expect(next).toHaveBeenCalledWith({ status: 404, message: 'Channel not found' });
        });
    });

    describe('postMessage', () => {
        it('should add a message to a valid channel', () => {
            const req = {
                params: { channel: 'general' },
                body: { text: 'New message' },
            } as unknown as Request;
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const next = jest.fn() as NextFunction;

            postMessage(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Message added');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error for an invalid channel', () => {
            const req = {
                params: { channel: 'nonexistent' },
                body: { text: 'New message' },
            } as unknown as Request;
            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            postMessage(req, res, next);

            expect(next).toHaveBeenCalledWith({ status: 404, message: 'Channel not found' });
        });
    });
});
