import {Router} from 'express';
import authenticationService from './auth.service.ts';
import validationMiddleware from '../../middlewares/validation.middleware.ts';
import AuthValidation from './auth.validation.ts';


const authRouter: Router = Router();

authRouter.post('/signup', validationMiddleware(AuthValidation.signup), authenticationService.signup);
authRouter.post('/login', authenticationService.login);


export default authRouter;