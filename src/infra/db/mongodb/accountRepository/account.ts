import { AddAccountRepository } from './../../../../data/protocols/addAccountRepository'
import { AddAccountModel } from '../../../../domain/usecases/addAccount'
import { AccountModel } from '../../../../domain/models/account'
import { MongoHelper } from '../Helpers/mongodb-helpers'

export class AccountMongoRepository implements AddAccountRepository{
  async add (accountData: AddAccountModel): Promise<AccountModel>{
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(
      accountData
    )
    return MongoHelper.map(result.ops[0])
  }
}
