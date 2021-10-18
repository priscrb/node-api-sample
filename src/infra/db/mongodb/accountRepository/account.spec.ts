
import { MongoHelper } from '../Helpers/mongodb-helpers'
import { AccountMongoRepository } from './account'

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    const url = 'mongodb://localhost:27017/jest'
    await MongoHelper.connect(url)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    const accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  const makeSUT = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }

  test('should return an account on sucess', async () => {
    const sut = makeSUT()
    const account = await sut.add({
      name: 'valid_name',
      password: 'valid_password',
      email: 'valid_email'
    })

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('valid_name')
    expect(account.email).toBe('valid_email')
    expect(account.password).toBe('valid_password')
  })
})
