import { Router } from 'express';

const baseRouter = Router();

baseRouter.use('/health', (req, res) => {
    res.status(200).send({ status: 'OK' });
});

export default baseRouter;
