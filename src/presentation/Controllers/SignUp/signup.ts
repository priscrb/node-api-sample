import { MissingParamError, InvalidParamError } from '../../Errors'
import { badRequest, serverError, ok } from '../../Helpers/http-helpers'
import { HttpResponse } from '../../protocols'
import { Controller, HttpRequest, EmailValidator, AddAccount } from './signUp.protocols'

export class SignUpController implements Controller{
  private readonly EmailValidator: EmailValidator
  private readonly addAccount: AddAccount

  constructor (EmailValidator: EmailValidator, addAccount: AddAccount){
    this.EmailValidator = EmailValidator
    this.addAccount = addAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredField = ['name', 'email', 'password', 'passwordConfirmation']

      for (const field of requiredField){
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body
      if (password !== passwordConfirmation){
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }
      const isValid = this.EmailValidator.isValid(email)

      if (!isValid){
        return badRequest(new InvalidParamError('email'))
      }
      const account = await this.addAccount.add({
        name, email, password
      })
      return ok(account)
    } catch (error) {
      return serverError()
    }
  }
}
