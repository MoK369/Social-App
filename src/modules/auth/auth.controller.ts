import {Router} from 'express';
import authenticationService from './auth.service.ts';


const authRouter: Router = Router();

authRouter.post('/signup', authenticationService.signup);
authRouter.post('/login', authenticationService.login);


export default authRouter;