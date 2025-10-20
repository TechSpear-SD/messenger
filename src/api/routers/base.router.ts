import { Router } from 'express';

const baseRouter = Router();

baseRouter.use('/health', (req, res) => {});

export default baseRouter;
