import bcrypt from 'bcrypt'
import { BcryptAdapter } from './bcryptAdapter'

const salt = 12

jest.mock('bcrypt', () => ({
  async hash (): Promise<string>{
    return await new Promise(resolve => resolve('hash'))
  }
}))

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('BcryptAdapter', () => {
  test('Should call bcrypt with correct values', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.encrypt('any_value')
    expect(hashSpy).toHaveBeenLastCalledWith('any_value', salt)
  })

  test('Should return a hashe when successfull', async () => {
    const sut = makeSut()
    const hash = await sut.encrypt('any_value')
    expect(hash).toBe('hash')
  })

  test('Should throw if bcrypt throws', async () => {
    const sut = makeSut()
    jest.spyOn(bcrypt, 'hash').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.encrypt('any_value')
    await expect(promise).rejects.toThrow()
  })
})
