
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../Errors'
import { EmailValidator, AccountModel, AddAccount, AddAccountModel } from './signUp.protocols'

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator{
    isValid (email: string): boolean{
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount{
    async add (account: AddAccountModel): Promise<AccountModel>{
      const FakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
      return await new Promise(resolve => resolve(FakeAccount))
    }
  }
  return new AddAccountStub()
}

interface SutTypes{
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return {
    sut, emailValidatorStub, addAccountStub
  }
}

describe('Signup Controller', () => {
  test('Should return codeStatus 400 when no name is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        email: 'Qual@meial.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('Should return codeStatus 400 when no email is not provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'Any Name',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return codeStatus 400 when no password is not provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'any@email.com',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return codeStatus 400 when no passwordConfirmation is not provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'any@email.com',
        password: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return codeStatus 400 an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'invalid@email.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return codeStatus 400 if password confirmation fails', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'invalid@email.com',
        password: '123456',
        passwordConfirmation: 'invalid_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'any_email@email.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    await sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@meial.com')
  })

  test('Should return  500 an invalid emailValidator throws a Error', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'invalid@email.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return  500 iff addAccount throws a Error', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'invalid@meial.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'Any Name',
        email: 'any_email@meial.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'Any Name',
      email: 'any_email@meial.com',
      password: '123456'
    })
  })

  test('Should return codeStatus 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'email_valid@mail.com',
        password: '123456',
        passwordConfirmation: '123456'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    })
  })
})
