import { Router } from 'express';
import authenticationService from "./auth.service.js";
const authRouter = Router();
authRouter.post('/signup', authenticationService.signup);
authRouter.post('/login', authenticationService.login);
export default authRouter;
