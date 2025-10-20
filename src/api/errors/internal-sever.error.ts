import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { CustomError } from './custom-error';

export class InternalServerError extends CustomError {
    constructor(message: string = 'Internal server error.', details?: any) {
        super(
            message,
            StatusCodes.INTERNAL_SERVER_ERROR,
            getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
            details,
        );
    }
}
