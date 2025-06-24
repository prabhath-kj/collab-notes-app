import { z } from 'zod'
import { UserSignInSchema, UserSignUpSchema } from '../validator'
 

// Auth
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserSignUp = z.infer<typeof UserSignUpSchema>



