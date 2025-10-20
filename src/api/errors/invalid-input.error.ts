import { CustomError } from './custom-error';

import { ValidationType } from '../dto/validation-type';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export class InvalidInputError extends CustomError {
    constructor(validationType: ValidationType, details?: any) {
        super(
            'Invalid input provided.',
            StatusCodes.BAD_REQUEST,
            getReasonPhrase(StatusCodes.BAD_REQUEST),
            { validationType, ...details },
        );
    }
}
